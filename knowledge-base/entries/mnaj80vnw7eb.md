**Joint prob / along sequence**

- I can truncate the joint prob so I only consider the the last mill years and put the last bins without much power into the trash states.
- If we had trees we would have perfect knowledge, and assuming an SMC, all information would be Markov, but since we only have tons, maybe there is something go gain by including also non-adjacent tons with some maximum distance. But that would present some problems with using data multiple times that would need to be addressed.
- Use topologies as hidden states and make a TRAILS-like IM HMM model
- I cannot use single base-pair transitions because then the model will “loose its memory” once into a stretch of 0-0 ton pairs. I need to either
- If I group marginal trees in hidden states, then the process is only Markov if all trees in a group has the same probability of turning into a tree in another group.
- That might be the case if I group trees by topology. It think it would also be the case if hidden states group trees by which pair coalesce last.
- Not all the information is in the ton-pairs (because we don’t model whether a 3-ton is part of a neighboring 4-ton or not). But most of it is.
- Posterior estimates thought: Assuming a fixed waiting time, can I treat the Ptd as a HMM and use Nbest to find the most likely labelling of time points.
- Maybe I could even do a two-locus two-seq model and consider neigboring trees and include 1, 2, and 3 recombinations in the state space
- Maybe it makes most sense to just sample recombination points and then treat SNPs between recombinations as part of the same tree and pairs of SNPs seperated by R recombination points as seperated by R recmobination events - with R in {1, 2, 3, 4, 5} or something sensible. If I “know” two trees, can I compute the number of recombination events separating two trees?
- pymc-extras/notebooks/Making a Custom Statespace Model.ipynb at main · pymc-devs/pymc-extras [https://github.com/pymc-devs/pymc-extras/blob/main/notebooks/Making a Custom Statespace Model.ipynb](https://github.com/pymc-devs/pymc-extras/blob/main/notebooks/Making%20a%20Custom%20Statespace%20Model.ipynb)
- pymc-experimental now includes state spaces models! - News - PyMC Discourse https://discourse.pymc.io/t/pymc-experimental-now-includes-state-spaces-models/12773
- SMC’ SFS inference with rolling branch level heights.
Make the rolling background state be total branch length (draft for sampling branch levels as random walk is in `phase-type-distributions/notebooks/smc-prime-tree-levels.py`).
- 
- That would not require two-locus ARG joint probs, but would require modelling of allele frequencies like for selection.
- The two conditional joint probabilities are computed using different state spaces:
No “non-diamond” recombination events allowed: Count recombination events like you do for each ton. Record if a coalescent event closes a “diamond loop”, in which case we reduce the nr of recombination events by 1. Redirect all edges leading to states with more than one recombination event to trash states.
At least one “non-diamond” recombination event happens: .Like above, but allowing only states with at least one recombination event to transition to absorbing.
- https://www.biorxiv.org/content/10.1101/2024.03.24.586479v1.full.pdf