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

