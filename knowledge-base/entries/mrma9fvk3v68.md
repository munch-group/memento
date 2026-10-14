## Phasic TODO

- When the svgd progress bar clears at the end, it also removes any warnings from the cell output. Make it only remove its own output.

- There is something wrong with `svgd.plot_ci(true_theta=true_theta)`. It "jumps" for seemingly no reason. Could also point to an issue with the way the HDI and HDR is computed. Also, the line plotted by `plot_ci` should be the MAP estimate not the estimate mean. Also `plot_ci` should issue a UserWarning if the number of particles is too low to meaningfully represent the interval. 
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
