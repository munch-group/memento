 
⏺ That's a stronger plan than the Python-emits-PRC route, and you're right that the C side already
  has the structural pieces. Let me work through what would actually need to happen, because the
  asymmetry between "topological elimination ordering" and "true SCC-hierarchical elimination" is
  the load-bearing detail.

  What the C path already has

  Concretely, on the C side today:

  - ptd_strongly_connected_components (phasic.c:1994+) — re-entrant Tarjan's algorithm. Already
  produces a list of ptd_scc_vertex structs, each holding the internal vertices of one SCC.
  - Topological-order elimination. ptd_graph_ex_absorbation_time_comp_graph_parameterized already
  eliminates vertices in an order derived from the SCC condensation, because correct elimination on
   a cyclic graph requires it. So "find SCCs, walk them in topological order" is already baked in.
  - A serialisable replay format (PRC .bin) that is (a) keyed on ptd_graph_content_hash, (b)
  relocatable across processes via offset-based pointer encoding, (c) version-gated.
  - Disk caching of the whole-graph result (Stage A2) — the format and atomicity primitives are
  reusable.

  What it does not have:

  - A notion of a partial PRC artefact — i.e. "this is the symbolic elimination of just SCC X, with
   named external interface vertices, ready to be composed with siblings."
  - A composition operator that takes per-SCC PRCs and stitches them into a whole-graph PRC.
  - A canonical hash function for subgraphs that's stable under the graph's overall vertex
  numbering — currently ptd_graph_content_hash hashes the entire graph.

  That's the gap. It's well-defined, but it's not small.

  The fundamental design question

  There are two ways to interpret "hierarchical decomposition in the C path," and they have very
  different difficulty profiles:

  1. SCC-parallel elimination of one big graph. Decompose, eliminate each SCC in parallel
  (different threads / machines), stitch into one whole-graph PRC, cache that whole-graph PRC keyed
   by the whole-graph hash. The user-visible behaviour is identical to today; the internal
  elimination is parallelised. This buys you wall-clock speedup on a single large graph but no
  cross-graph reuse.
  2. SCC-level reuse across graphs. Cache each SCC's PRC keyed by the SCC's own content hash. Two
  graphs that share an SCC get a cache hit on that SCC even if their overall topology differs. This
   is what hierarchical_trace_cache.py was designed to do, and it's what makes the cache valuable
  for users who build many related models (e.g. coalescent + variations).

  (2) is what you want for the long-term goal you stated in notes.md. (1) is a stepping stone but
  doesn't get you the cross-graph reuse that motivates the work.

  The C side is set up well for (1) and not yet for (2). The blocker on (2) is canonical SCC
  hashing — see below.

  What it would take to do (1): SCC-parallel single-graph elimination

  The shape:

  1. Run ptd_strongly_connected_components on the parameterised graph. (Already exists.)
  2. Build the SCC condensation DAG and topologically order the SCCs. (Already implicit in current
  elimination order.)
  3. For each SCC independently: eliminate its internal vertices, recording PRC commands into a
  per-SCC scratch buffer. Vertices outside the SCC are treated as "external interface" — symbolic
  placeholders that get resolved during stitching.
  4. Stitch: walk SCCs in topological order, splicing per-SCC command sequences into the
  whole-graph PRC, fixing up edge-index references where SCC-internal vertices need to map to
  whole-graph vertex indices.
  5. Cache the whole-graph PRC as today (Stage A2), keyed by ptd_graph_content_hash.

  The tricky parts:

  - Per-SCC elimination must be a self-contained subroutine. Currently
  ptd_graph_ex_absorbation_time_comp_graph_parameterized operates on the whole graph and assumes
  vertex indices are global. You'd need to refactor the inner loop to take a vertex set (the SCC)
  and a vertex-index remapping table. Not conceptually hard, but it's surgery on the most
  numerically delicate part of the codebase.
  - Cross-SCC edges have to be handled correctly during per-SCC elimination. When eliminating an
  SCC's internal vertex with edges to a downstream SCC, the elimination produces bypass edges that
  span SCCs. Those need to be recorded as commands referencing external vertices, and resolved
  during stitching. This is the part where the trace pipeline's "topological-order safe stitching"
  logic in hierarchical_trace_cache.py is genuinely informative — you'd be reimplementing the same
  algorithm in C.
  - Parallelism is opt-in. Don't bake threading into the eliminator. Make it serial-by-default and
  let the caller decide whether to run per-SCC eliminations on a thread pool. OpenMP #pragma omp 
  parallel for over independent SCCs is the natural fit, but only after you have a correct serial
  decomposition.
  - Verification. Same problem as before: you need a test that builds a moderately-complex
  parameterised graph, computes expected_waiting_time via the current monolithic path and via the
  SCC-decomposed path, and asserts agreement to ~1e-12 across many random θ. This test is
  non-negotiable; the elimination is numerically delicate enough that "looks right on small
  examples" is not sufficient.

  Roughly: 2–3 weeks of focused work, mostly on the per-SCC elimination refactor and the stitching
  logic. The cache layer changes are minimal because you're still writing one whole-graph PRC at
  the end.

  What it would take to do (2): SCC-level cross-graph reuse

  This is where the real complexity lives. The blocker is canonical SCC hashing.

  The current ptd_graph_content_hash hashes a graph by walking vertices in their numerical order,
  hashing each vertex's edges (target index, weight or coefficients) in order. That works for a
  whole graph because vertex numbering is part of the graph's identity. It does not work for an SCC
   extracted from a larger graph, because:

  - The same logical SCC embedded in two different graphs will have different vertex numberings.
  - The same SCC has multiple equally-valid numberings even within one graph (any permutation of
  its internal vertices that preserves edges).
  - Hash equality must hold across these renumberings, otherwise the cache never hits.

  So you need a graph isomorphism canonical form for the SCC. This is the hard part. Options:

  - Nauty / bliss-style canonical labelling. Mature, correct, but expensive (worst-case
  exponential), and integrating a third-party canonical-labelling library into the C build is a
  non-trivial engineering decision.
  - Weisfeiler-Leman colour refinement. Polynomial, gives a canonical form for almost all graphs,
  can produce false positives on highly-symmetric graphs (which would manifest as a wrong cache hit
   returning bogus elimination commands — a correctness bug, not a performance bug).
  - Domain-specific canonicalisation. If your graphs have natural state labels (e.g. coalescent
  state vectors), you can canonicalise vertex order by sorting on those labels. This sidesteps the
  isomorphism problem entirely but only works for graphs with structurally-meaningful vertex
  identifiers. Given that phasic graphs are typically built from state-vector callbacks, this is
  plausibly viable.

  Look at hierarchical_trace_cache.py:get_scc_graphs to see what the Python side does — I haven't
  checked, but it almost certainly relies on the natural ordering induced by the state vectors,
  which is the domain-specific approach. If that's true and works for your use cases, you can do
  the same in C.

  The other piece of (2) is SCC-level PRC artefacts. A per-SCC PRC needs to encode:

  - The internal command sequence.
  - A schema for the external interface — i.e. which vertices in this SCC have edges crossing to
  other SCCs, identified by their canonical role rather than by graph-global indices.
  - The stitching protocol for resolving the interface against a host graph at load time.

  This is genuinely a new file format. Don't try to reuse the existing PRC .bin for this — the
  existing format assumes whole-graph context. Design a sibling format (e.g.
  ~/.phasic_cache/scc_prc/<canonical_hash>.bin) and a higher-level "manifest" that says "this
  graph's elimination is composed of SCCs [a, b, c] in this topological order, stitched at these
  interfaces."

  Net: (2) is a 2–3 month project with real algorithmic risk on the canonicalisation question. Not
  impossible, and the payoff for cross-graph SCC reuse is real, but it's a different scale of work
  from (1).

  A pragmatic ordering

  I'd actually do this in three phases:

  Phase 1: SCC-parallel single-graph elimination (option 1). Refactor C eliminator to operate on
  vertex subsets. Wrap with serial SCC iteration. Validate numerically against the monolithic path.
   This phase produces no user-visible behaviour change, just cleaner internal structure. ~2 weeks.

  Phase 2: Parallelise phase 1. Add OpenMP parallelism over independent SCCs in the topological
  condensation. Measure speedup on graphs of various sizes. This is where the wall-clock win on
  single large graphs shows up. ~1 week.

  Phase 3: SCC-level caching (option 2). Add canonical SCC hashing (start with the domain-specific
  state-vector approach if applicable). Define the SCC-PRC format and manifest. Implement load-time
   stitching against a host graph. This is the cross-graph reuse phase. ~2–3 months including
  verification.

  Phase 1 is unambiguously worth doing. Phase 2 is worth doing if Phase 1 reveals that elimination
  is actually wall-clock-dominant for your target graph sizes (you should profile first). Phase 3
  is worth doing only if your workload genuinely has SCC reuse — which is empirically testable:
  instrument the Python trace pipeline to log SCC hash hits across a representative set of your
  models, and see whether the hit rate is high enough to justify the cache.

  One thing the C-native plan buys you that the Python-emits-PRC plan doesn't

  If hierarchical decomposition lives in C, the elimination path stays single-process by default.
  No Python at runtime, no pybind11 callbacks during elimination, no GIL concerns when threading.
  This matters for the cluster/distributed use cases you mentioned in notes.md — running on a SLURM
   worker with no JAX/Python infrastructure becomes possible if the C path is self-contained.

  The Python-emits-PRC plan effectively makes Python a hard dependency of any large-graph
  elimination, which is fine for interactive use but awkward for batch/cluster contexts.

  One thing the Python-emits-PRC plan buys you that the C-native plan doesn't

  JAX-evaluation of the same trace. The Python EliminationTrace is JAX-evaluable; a C-native PRC is
   only C-evaluable. If you ever want gradient-of-elimination as part of an autodiff graph, you
  need the Python representation. Today nothing in phasic exercises that capability, but Phase 5 
  Week 4 in CLAUDE.md mentions JAX FFI gradients as a future direction — and analytic gradients of
  moments would benefit from a JAX-evaluable trace.

  My recommendation

  Do the C-native plan, in the three phases above. The runtime independence from Python is
  genuinely valuable, the existing C infrastructure (Tarjan's, PRC format, content hashing, atomic
  disk cache) is more reusable than I initially gave it credit for, and the per-phase wins are
  concrete and measurable. Phase 1 is a refactor with no user-facing changes — exactly the kind of
  change you can land safely. Phase 2 unlocks parallelism. Phase 3 is the high-value, high-risk
  phase that you commit to only after Phase 1 has revealed whether the SCC structure of your real
  workloads has the reuse properties that make caching worthwhile.

  The single most important thing before starting any of this: profile the elimination on your 
  actual target graph sizes. All of this work is justified only if elimination is genuinely the
  bottleneck. If it turns out that elimination is fast and uniformization-per-SVGD-iteration is
  what's slow, none of this is the right project. CLAUDE.md says elimination on a 500-vertex
  coalescent is ~6ms — that's small enough that if your "large graphs" are in the
  few-thousand-vertex range, you might find that elimination is still tractable monolithically and
  the real cost is elsewhere. Worth measuring before committing.

✻ Brewed for 1m 15s

※ recap: Goal: enable phasic to handle very large parameterised graphs by adding SCC-decomposed, 
  cacheable elimination. Current task: deciding whether to extend the C reward-compute path with 
  hierarchical SCC handling. Next action: profile elimination cost on target graph sizes to confirm
   it's the real bottleneck before committing.
