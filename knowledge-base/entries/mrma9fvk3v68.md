## Phasic TODO

Try the two-locus model and estimate both recombination and coalescence rates. Should also give more power for two-locus models.

Try the two-locus model and estimate both recombination and coalescence rates.


Spikes: Most particles merge into a cluster far narrower than the bandwidth. While the bandwidth is set by the spread-out particles (~1e-2), the kernel's repulsion between cluster members is roughly (distance / bandwidth²), i.e. ~1e-7 / 1e-4 = 1e-3: too weak to hold them apart against the score's pull. 

I seems like learning_rate=AdaptiveStepSize does not really work...

---

❯ what should I do in response to warnings like: "[WARNING] phasic.svgd: svgd_step: clipped 1/100 particle gradient norm(s) exceeding 10000x the healthy batch median (a loss singularity or a diverging particle was encountered) -- inference for those particles is damped, not exact, for this step.
  "

  Searched for 1 pattern, ran 2 shell commands

The warning is a heads-up, not an error. Usually you can ignore it. Act only if it keeps firing, especially late in the run, or if the fit itself looks wrong.

What the warning means (read from src/phasic/svgd.py, around lines 4024-4092):
- At each SVGD step, every particle's gradient length is compared with the median length across the particles whose gradients are finite.
- A particle whose gradient is more than ets its gradient scaled down to that limit. The direction is kept and the step is shortened.
- The message reports how many particles tep. Particles whose gradients came out asNaN or infinite are handled separately: their gradients are set to zero, and that isn't counted in this        message.
- "Damped, not exact" means that particle's move in that one step was shorter than the true gradient asked       for. The other particles are unaffected
                                                                                                               When to ignore it: one particle out of 10the first iterations. Early on theparticles are spread across the prior, and one landing where the likelihood is nearly zero is normal. The clip exists so that one particle doesn't throw was the failure mode it was added for. If the run's final posterior looks sensible, nothing needs doing.                                             
When to act: the warning keeps appearing through the run, especially near the end, or the clipped count groThat means some particles keep landing whff a cliff. Their updates are then dampedevery step and the posterior is no longer exact. Typical causes and remedies, roughly in the order I'd try them:

1. Step size too large early on. A big fi far out. Set a smaller or decayingthem:                                                                                             
1. Step size too large early on. A big first step flings a particle far out. Set a smaller or decaying step-size schedule by hand through the learning_rate argument, which accepts a schedule. This icommon cause.
2. Prior too wide. If the prior allows values many orders of magnitude away from anything plausible, particles start there. Narrow it. (In recovery tests the prior must still exclude the true value, but it need to span ten decades.)
3. A parameter pushed toward zero. With positive_params=True (the default) the parameters go through a positivity transform. A particle near zero can make some observation nearly impossible, so the log-likelihood and its gradient blow uailure recorded in your recovery tests(particles stuck at the 1e-9 lower bound) is this pattern. If the warnings coincide with particles piling up at the lower bound, the problem is the model or prior, not the clip.
4. An observation the model barely allowsero probability under most parameter values produces huge gradients. Check the data for outliers, or for observation types the model can't produce.

To see which particle it is: run with retat the particle values in the iterationswhere the warning fires. One particle sitting far from the cloud means causes 1 or 2; particles hugging zero means cause 3.

---

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
