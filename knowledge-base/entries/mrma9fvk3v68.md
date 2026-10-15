## Phasic TODO

1. **Collapse.** Most particles merge into a cluster far narrower than
   the bandwidth. While the bandwidth is set by the spread-out particles
   (~1e-2), the kernel's repulsion between cluster members is roughly
   (distance / bandwidth²), i.e. ~1e-7 / 1e-4 = 1e-3: too weak to hold
   them apart against the score's pull. This is the same variance
   collapse recorded as the under-dispersion defect in
   `b3-budget-vs-defect-findings.md` §1, here caught in the act.

- new convergence test: the MAP should be in the 30% HDI. It could be a user diagnostic which HDI band the MAP is in. 

- Now that most code is in C++, is there a good way to still have the hover-tooltips for function arguments work in vscode?
- Rewrite `svgd.analyze_trace()` to use the code in svgd_tests.py in the tutorial notebooks folder.

Flesh out the phasic-popgen repo

make sure discrete graphs are faster with svgd as they should be

maybe turn the xont reward transformed graph into a joint graph so i can use the faster sojourn time path rather than the cont approx path with granularity

- Correspondence between exact joint prob and its continuous approximation that allows time-inhom
- Prove why the sticky-trick produces the exact joint prob in the limit
- If possible, test update ipv and new time-inhom inference in some kind of non-jax flexible model.
- Finish tests

## Figure out the impact of reward_limit and maybe (tot_reward_limit)

Is it normalized correctly? 

Is it ok to just remove observations not covered by joint prob table?

It is probably the rare multi mutation events that are most informative, since these are the only ones linking numbers of mutations (tree height) to the distribution of different kinds/tons (epoch population sizes)

Cont joint prob is not increasing monotonically with time

multi-feature svgd overestimates by 10%
