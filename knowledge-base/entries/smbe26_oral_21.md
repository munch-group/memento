**Date:** Tuesday, June 30, 2026

**Time:** 10:20 – 12:20

**Location:** Pjerrot

---

## Disentangling Ghost and Reciprocal Introgression in Four-Taxon Genomic Datasets

**Presenter:** Evan Forsythe, Oregon State University

**Abstract:**

Hybridization and introgression generate reticulate evolutionary histories that challenge traditional tree-based models of diversification. Although four-taxon tests and related summary statistics are widely used to detect introgression, they implicitly assume simple, unidirectional gene flow among sampled lineages, limiting their ability to resolve more complex genealogical processes. Here, we examine two cryptic forms of introgression—ghost lineage introgression and reciprocal introgression—that systematically bias inference under tree-based frameworks and motivate the need for richer graphical models of evolution.<br /><br />First, we introduce ghostbuster, a statistical approach that distinguishes introgression involving sampled lineages from introgression originating in unsampled (ghost) lineages using patterns of sequence divergence. Coalescent simulations show that ghostbuster accurately identifies ghost lineage introgression across a wide range of demographic and introgression scenarios, with reduced power only when divergence events are tightly spaced. Applying this framework to genomic data from Brassicaceae reveals that a previously inferred introgression event is more parsimoniously explained by ghost lineage introgression, revising evolutionary interpretations in this important plant family.<br /><br />Second, we investigate reciprocal introgression, in which alleles are exchanged simultaneously in both directions at a single locus. Using theoretical expectations and coalescent simulations, we show that reciprocal introgression generates phylogenetic signals opposite to those expected under unidirectional gene flow, diluting true introgression signals and even producing spurious support for introgression events that never occurred.<br /><br />Together, these results demonstrate how heterogeneous genealogies produced by complex introgression processes undermine single-tree representations of evolutionary history and highlight the importance of graph-based models for accurately capturing reticulate evolution across genomes.

---

## Exploring Tree Space: Exact Transition Kernels and Proposal Efficiency in Bayesian Phylogenetics

**Presenter:** John Huelsenbeck, University Of California, Berkeley

**Abstract:**

Bayesian phylogenetic inference relies on Markov chain Monte Carlo (MCMC) to approximate posterior probabilities of trees. The efficiency of an MCMC analysis depends critically on the proposal mechanisms used to explore tree space. In phylogenetics, proposals must modify not only tree topology but also branch lengths, because these parameters are strongly coupled through the likelihood function. As a consequence, promising topological proposals are often rejected because they are accompanied by unfavorable branch-length values.<br /><br />We investigate an alternative framework based on the profile likelihood, in which branch lengths are replaced by their maximum-likelihood estimates rather than being integrated over a prior distribution. This approach isolates the effects of topological proposals from those of branch-length proposals and provides a simplified setting for studying MCMC behavior in tree space.<br /><br />For small phylogenetic problems under simple substitution models, the exact posterior distribution over all tree topologies can be computed without resorting to MCMC. This allows us to evaluate the performance of different tree-perturbation strategies against known posterior probabilities and to quantify their ability to discover and traverse high-probability regions of tree space. In addition, because the complete state space is known, the transition kernel of the Markov chain can be calculated explicitly. This enables the application of analytical tools from Markov chain theory to characterize mixing behavior, identify bottlenecks and metastable regions, and compare the effectiveness of alternative tree-rearrangement operators.<br /><br />Our results provide new insight into the relationship between tree-space geometry, proposal design, and MCMC performance, with implications for the development of more efficient algorithms for Bayesian phylogenetic inference.

---

## Detecting balancing selection using ancestral recombination graphs 

**Presenter:** Debora Brandt, University College London

**Abstract:**

Balancing selection maintains polymorphism within populations and, by definition, contributes to genetic variance in fitness. Identifying its genomic targets is therefore central to understanding the genetic basis of evolutionarily relevant phenotypic variation. Genome-wide scans can detect balancing selection through its signature of excess polymorphism at linked sites; however, existing methods are generally conservative and likely miss many biologically relevant targets. Here, we show that leveraging ancestral recombination graphs (ARGs) substantially improves power to detect balancing selection relative to current state-of-the-art approaches. We evaluate several ARG-based summary statistics, some of which have higher power than existing methods for the scenarios we simulated. Applying this framework to ARGs inferred from human genomic data identified candidates with properties that strongly suggest that they are true targets of balancing selection, rather than the consequence of complex demographic processes. We identify well known-targets of balancing selection as well as novel candidate targets. More broadly, our results demonstrate that ARG-based approaches provide a powerful framework for detecting balancing selection, with great promise for non-model species, where traditional methods (largely developed with a focus on humans) may be especially underpowered. 

---

## A New Technique for Ultra-Fast Maximum Likelihood That Gives Exact Phylogenetic Gradients for Free

**Presenter:** Jason A.P. de Koning, University of Calgary

**Abstract:**

Phylogenetic likelihood computations scale poorly with model complexity and data size, creating tension between biological realism and computational tractability. The fastest and most widely used approaches in maximum-likelihood phylogenetics require O(N³) matrix operations per branch for each free parameter (where N is the number of states in the model). For expectation-maximization (EM), this cost arises in computing sufficient statistics; for Quasi-Newton (QN) methods, in differentiating transition probability matrices along each branch to compute the phylogenetic gradient.<br />Here, we show how this dependency on the number of free parameters can be eliminated for both EM and QN with a single exact technique. Our approach, which we call the "inside-out likelihood sandwich," inverts the classical branch-specific likelihood construction by aggregating endpoint-conditioned expectations before integrating, rather than computing each parameter's contribution separately. The resulting E-step requires only O(N³) computations per branch, regardless of the number of free parameters--a substantial reduction from the previous best-case scaling of O(N³) per branch per parameter. Remarkably, this reorganization also allows the exact gradient to be obtained essentially for free, requiring only readout of precomputed quantities without costly matrix–matrix operations.<br />This work generalizes previous path-augmented likelihood methods for phylogenetic MCMC without approximation, eliminating a longstanding bottleneck that penalized attempts to fit more realistic evolutionary models. We demonstrate that implementations of the core techniques scale well to large phylogenomic datasets, reducing analyses that previously required hours to seconds. A Git repository with code and Jupyter notebooks demonstrating the core techniques will be made available alongside this presentation.<br />

---

## HOGPROP: transferring functional annotation and reconstructing ancestral function

**Presenter:** Irene Julca, Aarhus University

**Abstract:**

The evolutionary history of gene families is shaped by complex processes, including gene duplication and loss, which challenge classical tree-based functional inference. While phylogenetic trees provide a powerful framework for modelling ancestry, the propagation of functional information across large, heterogeneous gene families requires models that can integrate multiple evolutionary relationships across diverse datasets. Here, we present HOGPROP, a scalable, phylogeny-aware framework for functional annotation transfer and ancestral function reconstruction based on Hierarchical Orthologous Groups (HOGs). HOGs represent gene family evolution as nested evolutionary units across speciation and duplication events, naturally forming a directed acyclic graph rather than a single tree. HOGPROP leverages this structure to propagate functional information across extant genes and ancestral nodes while explicitly accounting for orthology, paralogy, and evolutionary distance. The method integrates multiple layers of evidence within a unified scoring framework that enables probabilistic functional transfer and reconstruction of ancestral functional states. Using a dataset of more than 2,000 genomes spanning the tree of life, we demonstrate the utility of HOGPROP for functional inference in understudied species and for ancestral Gene Ontology enrichment analyses, illustrating how graph-based representations of gene family evolution enable robust and interpretable inference across deep evolutionary time.

---

## Representing massive-scale phylogenetic uncertainty with phylogenetic networks

**Presenter:** Bui Quang Minh, Australian National University

**Abstract:**

Phylogenetics has a central role in evolutionary biology and genomic epidemiology. Assessing phylogenetic uncertainty is therefore crucial and the methods that do this, such as those derived from Felsenstein’s bootstrap, are among the most widely used in modern science. However, these methods require enormous computational capacity, and are unsuitable for large datasets. Furthermore, most of these methods emerge from a focus on the membership of clades (groupings of taxa), which makes their results difficult to interpret in many contexts, including genomic epidemiology. Here we propose subtree pruning and regrafting-based tree assessment (SPRTA), an efficient and interpretable approach to assess confidence in phylogenetic trees. SPRTA shifts the paradigm of phylogenetic support measurement from evaluating the confidence in clades to evolution histories and phylogenetic placement—for example, assessing whether a lineage evolved from another considered lineage. In addition to being more easily interpretable, SPRTA is also highly scalable, and can be used to represent large numbers of alternative evolutionary histories as embedded within a concise phylogenetic network. We use SPRTA to investigate the uncertainty in SARS-CoV-2 evoution as inferred from more than two million genomes.

---

## The multi-species ancestral recombination graph reveals admixture dynamics in a hybrid baboon population

**Presenter:** Iker Rivas-González, Max Planck Institute for Evolutionary Anthropology

**Abstract:**

When populations diverge, they accumulate new, population-specific variation. In hybrids, these variants encounter each other for the first time and can act as reproductive isolating barriers. Current methods for inferring local ancestry cannot distinguish introgressed variants that arose post-split from those that were segregating in a common ancestor, limiting our understanding of reproductive isolation and selection against admixture. Here, we report a new hidden Markov model, iTRAILS, that infers gene trees using the coalescent with recombination, in the presence of both incomplete lineage sorting and gene flow. The resulting gene trees contain information about topology and coalescent times that can be used to time the origin of mutations (pre-split or post-split). We apply iTRAILS to hundreds of admixed genomes from an extensively studied hybrid baboon population in Kenya, aided by four new near–T2T baboon reference assemblies. We show that local ancestry estimates derived from iTRAILS gene trees generate a stronger signature of selection against admixture than other local ancestry inference methods. Further, incorporating coalescent time information from iTRAILS significantly improves predictions about which introgressed fragments will be retained over time. Introgressed genomic fragments tolerated in the hybrid population are enriched for deep coalescences—i.e., variation observed in the ancestral population—and depleted for gene trees with shallow coalescences in the minor parent (i.e., variation that arose in the minor parent post-split). Together, our results show that coalescent approaches can both improve estimates of selection against admixture and help identify regions of the genome that contribute to reproductive isolation.

---

## The application of ancestral recombination graphs to understand the temporal dynamics of hybridization

**Presenter:** Madeline A. Chase, Swiss Ornithological Institute

**Abstract:**

The genome-wide inference of ancestral recombination graphs (ARGs) has become increasingly tractable over recent years. The ready application of ARGs, also to non-model organisms, holds substantial promise for the field of population genomics due to the rich evolutionary signal held within the structure. One major advantage of this approach is the ability to apply analyses not only to genomic windows, but also to time windows, as the genealogies encode the temporal history of variation. In this way, we may better understand how genomic signatures vary when looking backwards in time. Here, we apply ARG-based methods to understand the temporal dynamics of hybridization and divergence. We inferred the ARG from 378 individuals across the Oenanthe hispanica species complex, a group of passerines composed of five lineages that hybridize in multiple regions across their ranges. Using a combination of empirical and simulation-based analyses, we address two main aims. Firstly, we uncover the evolutionary history of convergent coloration phenotypes within the complex. Comparing haplotypes containing variants associated with plumage coloration, we use ARG-based estimates of the time to the most recent common ancestor (TMRCA) to establish in which species a white throat and white mantle phenotype evolved, and that the variation subsequently spread to another species through introgression. Further, we investigate how reproductive isolation has established across the genome over time within a hybrid zone, thus improving our understanding of the formation and maintenance of species boundaries. With these varied analyses, we highlight the exciting potential ARGs hold for population and speciation genomics.

---

## Powerful inference of bacterial evolution from genome-wide genealogies

**Presenter:** Hongjin Wu, Shanghai Institute Of Materia Medica

**Abstract:**

To make sense of the enormous diversity found in prokaryotes, it is first necessary to describe the processes that generated it. A particular challenge has been to account for the combined effects of clonal descent and homologous recombination. Recently, the technology of inferring genetic relationships from sequence data has advanced rapidly but the resulting algorithms have been designed with human genetic data in mind. We developed a software named BacRelate which can infer genome-wide genealogies and the clonal frame from bacterial genome data. BacRelate is adapted from the software Relate (Speidel, et al., 2019) and it differs from Relate in three aspects: 1. It infers clonal frame. 2. It infer local trees in an iterative way which means that it infers local trees twice with taking the clonal frame as a prior when it infers local trees at the second time. 3. We introduced an ancestral allele imputation algorithm based on mapping local mutations to local trees. The resulting genealogical trees can be used, for example to infer the recombination landscape along the genome, natural selection on specific loci, patterns of gene flow between bacterial clades and intrgressions. The wide utility of the method is demonstrated on data from Campylobacter jejuni, Escherichia coli, Streptococcus pneumoniae, Klebsiella pneumoniae and Vibrio parahaemolyticus. By allowing diverse features to be investigated within a single framework, BacRelate provides unprecedented insight into evolutionary processes in bacteria.

---

