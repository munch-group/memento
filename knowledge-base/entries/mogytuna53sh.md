## Can I use BFFG for LAI inference?

## Two-locus semi-labeled lineages

Given a 3.ton, what is teh probability of another ton overlapping/including those *same* 3 lineages?

## Phasic utility to read TreeSequences] (id: mnamwsd7nxyj)
I could disable recombinations in the left tree but label a ton and then require all of those lineages to coalesce, after which a single recombination is required. That would allow only one recombination in the left tree, but would allow star recombinations in the right tree. Since all trees are right trees once, it should remain an SCM-prime. The drawback is that I would need to build the model anew for each variant, but I can cache model building too. and most traces should be cached quickly too.

## tsphasic could be a tool to do advanced modelling based on agnostic tree sequences

## With SCC caching I can extend the model in the seq direction almost for free by adding chunks

## What If I compute s for each snp in a treesequence tree. and consider the distribution of s inside this single tree as the DFE. That should account for the DFE since some variants are ancestral and some are derived.  Is it somehow possible to treat the diffeerence between tree as a nuisance variable that can be handled if we know the demographry fromr estimating that globally.

## PSMC: Can I somehow truncate the time states and have all transitions to deeper coalescences go to trash?

## Make use of the fact that the genetic distance between TreeSequence trees is uniform. I.e. All adjacent trees have the same distance, all trees separated by, say five, other trees do to. That means SNPs and in all adjacent trees can be modelled with the same recombination rate in the two-locus model. Same with those in trees with some other offset.

## “pedigree constraint” on an (two-locus) ARG can be represented by “invisble” mutations along the ARG branches with descendants at both loci that must be earned. I.e. you can only go through the model with at least one of each kind of invisible mutation.