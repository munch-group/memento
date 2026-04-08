Like it is possible to model the Brownian motion of a phenotype along the branches of given tree, it should also be possible to do that conditional on the Coalescent process. I.e. how the phenotype evolves along the branches if it is not allowed to change the coalescence process.

In the coalescent with labelled lineages, I can track one or more phenotypes as additional properties. When I would otherwise add a coalescence transition, I now only do so if the phenotype properties of the two lineages are identical or just sufficiently similar. Otherwise I route the transition to trash. I can also use a kernel to weight the the two outcomes based on phenotype similarity and train the kernel parameters. The graph the standard coalescent but additional edges to two trash states. To retain the standard coalescent, rewards must be $\mathbf{r}=\{r_1,r_2 \cdots,r_{|V|\}}$ where

$$
r_i =  (1-\frac{1}{n}\sum_j^n )
$$

$$
[x_j  * ( 1 + \frac{d_j}{x_j })]^{-1}
$$


where $I$ enumerates the $n$ states that have teh same $k$ number of lineages

 can compute the posterior ancestral phenotype of each possible ancestral node by scaling expected_sojourn_time to sum to one.