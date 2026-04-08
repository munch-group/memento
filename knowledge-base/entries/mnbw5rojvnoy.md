Like it is possible to model the Brownian motion of a phenotype along the branches of given tree, it should also be possible to do that conditional on the Coalescent process. I.e. how the phenotype evolves along the branches if it is not allowed to change the coalescence process.

In the coalescent with labelled lineages, I can track one or more phenotypes as additional properties. When I would otherwise add a coalescence transition, I now only do so if the phenotype properties of the two lineages are identical or just sufficiently similar. Otherwise I route the transition to trash. The graph the standard coalescent but additional edges to two trash states. States must be rewarded to retain the standard coalescent. If $V'$ is the subset of vertices $V$ for which only properties independent of coalescent rate differ, $t(v_j)$ is the total outgoing rate and $d(v_j)$ is the total rate to trash, then rewards must be $\mathbf{r}=\{r_1,r_2 \cdots,r_{|V|}\}$ where

$$
r_i = \frac{1}{n} \sum_j \frac{t(v_j)}{ t(v_j) + d(v_j)}
$$

We can then compute the posterior ancestral phenotype of each possible ancestral node by scaling expected_sojourn_time to sum to one.

This should also work if some or all states state have both coalescent and trash transitions weighted by their relative probability. In this case I could use a kernel for weighting the the two outcomes based on phenotype similarity and train the kernel parameters