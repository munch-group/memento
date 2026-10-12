
Notebooks for you:
- parametrization.ipynb, cell 23: this one now raises. Drop the reserved slot ([rate] instead of [rate, 0]) and have the callback return nr_lineages.
- joint-probability.ipynb cell 3, and time-inhomogeneous.ipynb cell 32: give the coalescent rates as lists.
- popgen/coalescent-derived.ipynb (cells 8 and 26) and popgen/old-moran-coalescent-derived.ipynb (cells 19 and 37): both call joint_prob_graph() on a discretized graph. These cells have never been run, and by my reading of the code they already failed before this branch.

Left open, recorded in the plan:
- Supporting constant edges in discrete and joint-probability graphs, rather than refusing them, would need a C change.
- A few other APIs that take a per-state rate don't follow the new rules yet: the legacy _discretize_inplace, the C++ discretize(), joint_prob_graph()'s mutation_rate, and the already-broken reward_rates_callback.

About the issues left open: which discretize function have you changed if not the  C++ discretize()? What do you mean by "joint_prob_graph()'s mutation_rate". And why do you refer to reward_rates_callback as already broken?

What is the computation path of expectation() when called on a discretized graph (with graph.is_discrete = True), and why are the unit rewards for aux vertices held by graph.rewards not the default rewards?

**Later add discrete=True to expectation to make it use the aux graph.rewards as default rewards**

How widening work when the graph is built with an indexer?

retire Graph._discretize_inplace() ?



