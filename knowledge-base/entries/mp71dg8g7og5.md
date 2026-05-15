### Where else the same technique could apply (future work, NOT in this plan)

The technique — "make the model's FFI-batched function shape-polymorphic + register a `jax.experimental.custom_batching.custom_vmap` rule so vmap-over-particles fuses with the internal batch into one fat FFI call" — applies wherever a model has BOTH an inner batch dimension AND outer vmap-over-particles. Findings from the audit:

| Model builder | Current status | Technique would help? | Estimated size |
|---|---|---|---|
| `pmf_from_graph` (line 4165) | Already vmaps natively; FFI accepts 1D theta + JAX expand_dims rule | No — no inner batch | — |
| `pmf_and_moments_from_graph` (line 6434) | Already vmaps natively | No — no inner batch | — |
| `pmf_from_graph_joint_index` (line 6779) | Already vmaps natively | No — no inner batch | — |
| `pmf_and_moments_from_graph_multivariate` (line 6959) | **Has Python feature-loop** at lines 7081-7132 calling 1D model `n_features` times per gradient | **YES, high benefit.** Same fusion trick — stack particle × feature into one `(P*F, theta_dim)` FFI call. | ~80-100 lines |
| `_daisy_chain_svgd_model` **WITHOUT** exposure (lines 5027-5039) | Uses `jsp.daisy_chain_joint_probs` (line 8707) which wraps its own `custom_vjp` (line 8873). Single 1D FFI call per particle, but `custom_vjp` without a vmap rule means vmap loops the FD backward per-particle. | **YES, medium benefit.** The forward already accepts 1D theta and vmap_method="expand_dims", so the forward batches under vmap. But the FD backward (line 8873) likely loops per-particle just like the exposure path does today. Adding `custom_vmap` to `daisy_chain_joint_probs`'s custom_vjp would fuse the FD backward across particles. | ~40-60 lines |

**Important:** The "no-exposure daisy-chain" case is the path the user hits whenever they call `svgd(epoch_starts=[...])` without `exposure`. If their workload spends time there, the same `custom_vmap` retrofit would help. **But that's outside the scope of this plan** — this plan only addresses the per-obs exposure path. If wall-time evidence shows the no-exposure path is also a bottleneck after this plan ships, a follow-up plan can apply the same pattern to `daisy_chain_joint_probs`.

There are **6 other `custom_vjp` sites** in `src/phasic/__init__.py` (at lines 4316, 4434, 4790, 6401, 6717, 6895) — most are in multi-step model wrappers. Each one is a candidate audit target for "does vmap fuse, or does it loop?" Don't preemptively retrofit them; let perf measurements drive which ones get the treatment.