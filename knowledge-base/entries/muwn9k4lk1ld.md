This is a pure NCCL hang, not a real model mismatch. Here's what the log says:

**What happened.** NCCL init completed on all four ranks, then the very first collective (`SeqNum=1`, an ALLGATHER of 1 element — DDP's `_verify_param_shape_across_processes`) never returned. After the 2 h default `ddp_timeout` the watchdog killed it. The "Rank X has 154 params, while rank Y has 0 params" message is a red herring: every rank reports *itself* as 154 and the others as 0 because the gather buffer was never filled. All four tracebacks are at the same line, so no rank was stuck elsewhere — they all entered the collective and NCCL just didn't move data.

**Likely cause.** All connections were set up as `P2P/CUMEM` between GPUs on different PCIe roots (bus IDs 61, 82, e1, e2, no NVLink/NVLS). A first-collective hang with that topology is the classic signature of PCIe peer-to-peer being advertised but not actually working on the node (ACS/IOMMU on the PCIe switches, or the cuMem-based P2P path misbehaving with a driver/NCCL combination — here NCCL 2.21.5/CUDA 12.4 on driver 13.x).

**Things to try, in order of cheapness:**

1. `export NCCL_P2P_DISABLE=1` — forces traffic through host memory (shared memory transport). Slower, but if it runs, the P2P path is the problem. On a single node with PCIe-only GPUs the penalty is usually modest.
2. If that works and you want P2P back, try `NCCL_CUMEM_ENABLE=0` instead, which keeps P2P but avoids the cuMem allocator path.
3. Alternatively `NCCL_P2P_LEVEL=PIX` or `PHB` to only allow P2P within the same PCIe switch/host bridge.
4. Ask the cluster admins whether ACS is enabled on gn-1002's PCIe switches — that's the usual root cause and is fixable on their side.
5. Confirm quickly with `python -m torch.distributed.run --nproc_per_node=4` on a 10-line script doing a single `dist.all_reduce` — faster than resubmitting the training job.

**Two hygiene fixes regardless:**

- Set `ddp_timeout=600` (or similar) in `TrainingArguments` so a hang costs 10 minutes of GPU allocation rather than two hours.
- Set `TORCH_NCCL_TRACE_BUFFER_SIZE=2000` and keep `NCCL_DEBUG=INFO` so the next failure gives a flight-recorder dump pinpointing which rank/transport stalled.

Minor: the log is also showing repeated `...skipping...` sections and the same header four times — looks like it's a `less` view of a file that was appended to by several resubmissions, so make sure you're reading the right attempt when re-running.


-----

Thanks — the clean log confirms the same picture, with nothing new that changes the diagnosis. The only addition is the torchrun tail: rank 3 died first with SIGABRT (`exitcode -6`, from the `terminate called after throwing c10::DistBackendError`), and the elastic agent then SIGTERMed the other three. That's just the watchdog shutdown sequence, not a separate failure.

So the story stands:

- NCCL communicator init finished cleanly on all four GPUs (`Init COMPLETE` × 4, all rings and trees connected via `P2P/CUMEM`).
- The very first collective, `SeqNum=1` ALLGATHER with 1 element in / 4 out — DDP's parameter-count sanity check — never completed on any rank (`last completed work: -1`).
- After exactly 2 h it was killed; the "154 vs 0 params" messages are just the unfilled receive buffers being read after the timeout.

Everything points at the P2P/CUMEM transport between GPUs on four separate PCIe roots (bus 61, 82, e1, e2) not actually moving data on gn-1002. The recommendations from before apply unchanged:

1. First retry with `NCCL_P2P_DISABLE=1`. If it trains, the hardware P2P path is the culprit.
2. If that works, try `NCCL_CUMEM_ENABLE=0` instead to see whether plain P2P is fine and only the cuMem path is broken.
3. Report to the cluster admins that PCIe P2P hangs on gn-1002 — likely ACS/IOMMU — and ask if other GPU nodes behave the same.
4. Add `ddp_timeout=600` to `TrainingArguments` and set `TORCH_NCCL_TRACE_BUFFER_SIZE=2000` so the next attempt fails fast and leaves a flight-recorder trace.

A 30-second `torchrun --nproc_per_node=4` script doing a single `dist.all_reduce` on each of the variants above will settle it without burning another 4-GPU allocation on the full training job.



