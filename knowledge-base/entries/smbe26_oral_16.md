**Date:** Monday, June 29, 2026

**Time:** 10:20 – 12:20

**Location:** Lumbye (lower level)

---

## Predicting interaction partners and generating protein sequences using protein language models

**Presenter:** Anne-Florence Bitbol, EPFL

**Abstract:**

Protein language models trained on multiple sequence alignments of homologous proteins successfully capture coevolution between amino acids in structural contact: this is one of the ingredients of the success of AlphaFold. These models also capture phylogenetic relationships between sequences. We have used such models, especially MSA Transformer, to generate new protein sequences from given protein families, and to predict which proteins interact among the members of two protein families. <br />Despite their successes, a drawback of models based on multiple sequence alignments is that sequence alignment can be imperfect. Thus, we developed ProtMamba, a homology-aware but alignment-free protein language model, which is able to generate new protein sequences from given protein families. <br />Beyond the amino-acid scale, coevolution also exists between genes that in a genome. To capture it, we trained ProteomeLM on complete proteomes spanning the tree of life. This model allows quick and precise scans of whole protein interaction networks. Such models open perspectives for studying the evolution of proteins and of protein-protein interactions.

---

## Molecular evolutionary analyses with protein foundation models from deep learning

**Presenter:** Sudhir Kumar, Temple University

**Abstract:**

Protein foundation models are large transformer-based neural networks trained on millions of natural protein sequences using self-supervised learning. Unlike standard molecular evolutionary models, which rely on explicit amino acid substitution matrices and assumptions of site independence, these deep learning models capture high-dimensional, context-dependent residue dependencies without requiring phylogenies, likelihood-based statistical frameworks, or even multiple sequence alignments! <br /><br />In this talk, I review growing evidence that protein foundation models can reveal residue–residue dependencies, recover evolutionary constraints, predict pathogenic variants, and reconstruct sequence relationships. I suggest that analyses using protein foundation models can be tantamount to applying neutral evolutionary principles, despite the absence of explicit substitution models or phylogenetic trees. For example, residue-level probability landscapes derived from single protein sequences accurately diagnose pathogenic missense variants, track population allele frequencies, and correlate with evolutionary rates inferred from multispecies phylogenies.<br /><br />I discuss why inferences from protein foundation models may differ from those of traditional phylogenetic analyses, and how these differences can be biologically interesting rather than simply contradictory. I conclude by arguing that continued development and evaluation of protein foundation models have the potential to advance molecular evolution from phenomenological modeling of primary sequence differences to more mechanistically rich models of residue dependencies in proteins.<br />

---

## Combining agentic AI with open infrastructure for reproducible analyses

**Presenter:** Anton Nekrutenko, Penn State

**Abstract:**

Here, we introduce BRC-Analytics.org, a platform that combines agentic AI with authoritative data sources and community-curated workflows on freely accessible public infrastructure. BRC-Analytics integrates NCBI Datasets, UCSC Genome Browser annotations, and EBI ENA sequence archives with Galaxy-based workflows for quality control, read mapping, variant calling, transcriptomics, and functional annotation. The platform runs on ACCESS-CI infrastructure, requiring no local installations or funding. Agentic AI tools invoke Galaxy's native analysis functions via API, ensuring every analytical step appears in Galaxy's history with full parameter capture. To demonstrate this approach, we re-analyzed published *Candida auris* datasets encompassing transcriptomic and large-scale surveillance data. However, we show that AI-generated analyses require rigorous validation. In one case, a scientific-sounding AI-proposed method for mapping genes across genome versions yielded an exceptionally high prediction rate but proved only 1% accurate when validated against NCBI mappings—illustrating both the power and the essential safeguards needed when deploying agentic AI in pathogen research. BRC-Analytics provides data-to-publication functionality where agentic AI operates within a framework that enforces transparency, making advanced pathogen genomics accessible to any researcher regardless of computational expertise.<br />

---

## Adaptive Phylogenetic Tree Search via Machine Learning-Based Parameter Selection

**Presenter:** Ella Baumer, Tel Aviv University

**Abstract:**

Phylogenetic tree reconstruction from genomic data is NP-hard, with search spaces growing factorially with the number of species. Current methods rely on heuristic search strategies. Each strategy uses a fixed set of search options to navigate the tree space, e.g., either defining neighbors according to either the nearest-neighboring interchange (NNI) or subtree pruning and regrafting (SPR) method. These search options were optimized to work well on average on benchmark datasets. However, they disregard dataset-specific characteristics, and they remain constant and predetermined along the entire course of the search progress. <br />Optimal search strategies inherently depend on context. Different alignments favor different configurations, and the optimal approach changes as the search progresses - for example, when a tree is already near-optimal, evaluating large-radius moves wastes computation, whereas broader exploration is beneficial early in the search.<br />Thus, we aim to develop a machine learning framework for phylogenetic tree reconstruction that allows search options to vary among datasets and within search stages, making it adaptive. Utilizing Deep Neural Networks, we predict optimal search parameters specific to each dataset and current state. Our preliminary results suggest that adaptive policies outperform static baselines that apply the single most frequently optimal configuration. <br />This research aims to lay the groundwork for next-generation phylogenetic software where tree reconstruction strategy adapts dynamically to each dataset and search stage.

---

## Likelihood-free inference of phylogenetic tree posterior distributions

**Presenter:** Luc Blassel, Sorbonne Université

**Abstract:**

Phylogenetic inference, the task of reconstructing how related sequences evolved from common ancestors, is a central objective in evolutionary genomics. The current state-of-the-art methods exploit probabilistic models of sequence evolution along phylogenetic trees, by searching for the tree maximizing the likelihood of observed sequences, or by estimating the posterior of the tree given the sequences in a Bayesian framework. Both approaches typically require to compute likelihoods, which is only feasible under simplifying assumptions such as independence of the evolution at the different positions of the sequence, and even then remains a costly operation. Here we present the first likelihood-free inference method for posterior distributions over phylogenies. It exploits a novel expressive encoding for pairs of sequences, and a parameterized probability distribution factorized over a succession of subtree merges. The resulting network provides well-calibrated estimates of the posterior distribution leading to more accurate tree topologies than existing methods, even under models amenable to likelihood computation. We further show that its edge against likelihood-based methods dramatically increases under models of sequence evolution with intractable likelihoods

---

## Molecular phylogenetics directly from deep learning protein foundation models

**Presenter:** Rohan Alibutud, Temple University

**Abstract:**

Protein foundation models (pFMs), also known as protein language models, are large neural networks trained on hundreds of millions of protein sequences, commonly implemented using the transformer architecture. pFMs are becoming a focal point for studies in evolutionary inference, leveraging extracted information about species relationships for myriad applications. In this context, we raise a fundamental question relevant to this symposium: What is the distribution of evolutionary information captured by different layers of the network for a given protein sequence alignment? We analyzed signals of species phylogeny across the layers of two state-of-the-art pFMs: MSA Transformer, trained on multiple sequence alignments (MSAs), and ESM-2, trained on unaligned sequences. We developed methods to convert transformer attention matrices, which quantify how strongly each sequence or residue position influences others in the dataset, into pairwise evolutionary distances. These distances were then used to construct neighbor-joining trees without relying on any explicit models of sequence evolution. Our findings indicate that phylogenetic information is uniformly distributed across the layers of MSA Transformer, while ESM-2 tends to concentrate learned species relationships in its earlier layers. Surprisingly, the species phylogenies generated by ESM-2 are often more accurate than those derived from MSA Transformer, even though MSAs are not used in ESM-2's pretraining or tree reconstruction. We will discuss possible reasons for this intriguing result. Additionally, we will compare the performance of classical phylogenetic methods with pFM-based phylogenetics to evaluate the advantages and limitations of deep learning models in reconstructing evolutionary histories.<br />

---

## plAIgue: An Artificial Intelligence Framework for Detecting Microbial Species in Ancient Human DNA

**Presenter:** Annabel Perry, Harvard University

**Abstract:**

We introduce an artificial intelligence (AI) model, plAIgue, which accurately assigns a probability of whether an ancient human DNA sample came from a person who died while infected with a microbial species. Detecting pathogens which circulated in the blood of ancient humans has emerged as a new window to understand diseases which afflicted our species in bygone eras and to study pathogen-host co-evolution. Existing methods to detect pathogens in ancient skeletal remains, however, require a series of ad hoc filters and do not quantify detection uncertainty. We propose plAIgue to overcome these limitations. We evaluated plAIgue’s ability to detect the Black Death pathogen (Yersinia pestis) in DNA sequencing data from ~200 ancient humans. Depending on data curation stringency, plAIgue achieved 87-97% accuracy, 0.36-0.05 binary cross entropy loss, 1.0 sensitivity, and 0.95 specificity in our validation set. A state-of-the-art screening tool, the MEGAN ALignment Tool (MALT) followed by Heuristic Operations for Pathogen Screening (HOPS), achieves 0.27-1.0 sensitivity, and 0.47-1.0 specificity (depending on the HOPs step to which we compared) on the same dataset. These results suggest that plAIgue has the potential to perform as well or better than the gold standard method in a fraction of the time, with less human labor, and with quantification of detection uncertainty. Interpretability analyses show plAIgue uses variables and genomic regions indicative of Y. pestis infection when diagnosing true positives. We will generalize our method to other pathogens. Finally, analysis of more than 20,000 ancient individuals provides an opportunity to benchmark our model's capabilities.

---

## TKF-based models with latent and hierarchical structure are competitive with parameter-heavy neural networks as models of protein sequence evolution

**Presenter:** Annabel Large, University of California, Berkeley

**Speaker Bio:** https://annabellarge.github.io/

**Abstract:**

Most statistical phylogenetic analyses rely on relatively simple continuous-time, finite-state Markov models of point substitution to describe molecular evolution. These models typically assume fixed sequence length, ignore insertions and deletions (indels), and make limited allowance for variation in selection pressures across residues. The simplistic assumptions of these models limit the realism of phylogenetics. We extend the TKF92 model - the canonical hierarchical model combining substitution and multi-residue insertion-deletion (indel) events - by introducing additional nesting and latent states. We compare these TKF92 extensions to two classes of neural seq2seq models. The first class fits site- and sequence-specific TKF92 rate parameters at each alignment column. The second directly predicts descendant sequences and alignments; evolutionary time is provided as an input feature, but a CTMC-based model is not enforced. We evaluate the per-character perplexities of all models on pairwise alignments curated from Pfam. A nested TKF-based model with only 32,000 parameters is highly competitive with neural networks containing tens of millions of parameters, outperforming all but two of the neural architectures tested. Our results indicate that approaches grounded in molecular evolutionary theory may be more parameter-efficient and provide a better fit to real alignments than unconstrained alternatives, supporting the incorporation of CTMC-based model structure within future neural phylogenetic approaches.

---

## Scaling and Representation Learning for Deep Ancestral Sequence Reconstruction 

**Presenter:** Lys Sanz Moreta, University Of Copenhagen

**Abstract:**

Though currently few deep sequence models explicitly represent evolution in a principled manner, deep learning methods are increasingly entering phylogenetics, primarily through variational inference, latent representations, and neural sequence models. These approaches aim to alleviate the computational bottlenecks associated with MCMC methods and to enable wider ranges of models and observations. In [1], we introduced Draupnir, the first deep generative model for ancestral sequence reconstruction. It goes beyond conventional substitution models by modeling evolution in a latent space using a tree-structured Ornstein–Uhlenbeck (OU) process. These latent variables are mapped to observations (protein sequences) via neural decoders. Latent representations of entire sequences relax the assumption of site-independent evolution and enable representing epistasis. We perform stochastic variational inference, which optimizes the evidence lower bound via stochastic gradient ascent, replacing MCMC-based Bayesian inference with approximate but scalable optimization. Draupnir achieves state-of-the-art ASR accuracy, captures coevolutionary structure, and is computationally efficient. We plan to use Draupnir to explore relationships in diverse families of carbohydrate-binding proteins, with novel functions [2]. As we advance development of the model to achieve this, we present progress, including the integration of ESM protein language models into the encoder, mini-batch training that scales to larger data sets, and an analysis of the influence of the OU priors.<br />  <br />    1.Moreta LS et al. Ancestral protein sequence reconstruction using a tree-structured Ornstein-Uhlenbeck variational autoencoder. International Conference on Learning Representations (ICLR), 2022. https://iclr.cc/virtual/2022/poster/6608  <br />    2.Narimatsu, Y. et al. A family of di-glutamate mucin-degrading enzymes that bridges glycan hydrolases and peptidases. Nature Catalysis, 2024. https://www.nature.com/articles/s41929-024-01116-5

---

## Improved Power to Detect Sparse Episodic Positive Selection:
A Protein Language Model-Informed Branch-Site Approach


**Presenter:** Kabita Baral, University Of Calgary

**Abstract:**

Background: Episodic positive selection typically affects only a small fraction of sites (~1%) along specific lineages. However, standard branch-site likelihood ratio tests (BS-LRTs) have mostly been evaluated under dense positive selection (e.g., 20–40% of sites). We simulated fitness shifts at ~1% of sites (5 of 500 codons) using non-equilibrium, time-heterogeneous mutation-selection models, revealing a "power crisis": traditional tests have little power to detect adaptation in biologically realistic regimes, rendering most subtle fitness shifts statistically undetectable.<br /><br />Innovation: We demonstrate that power can be substantially recovered by incorporating site-specific covariates into a mixture-model framework for BS-LRTs. In "oracle" simulations providing full to partial separation of shift from non-shift sites (3–5 of 5 correct), power reached 81% for large fitness-shift effect sizes (high Kullback–Leibler divergence between stationary distributions), compared to <5% via standard methods on the same data. To translate this approach to empirical data, we introduce a pipeline using the ESM-2 protein language model (PLM) to derive informative site-specific covariates by comparing sequence probabilities in foreground versus background clades.<br /><br />Results & Application: Preliminary results using carefully constructed null distributions confirm that PLM-derived scores are significantly enriched at true shift sites, effectively mimicking the partial "oracle" conditions that restored power. We are completing BS-LRT power evaluations using PLM-derived covariates to quantify power gains relative to: a) standard; b) oracle (mixture model) methods; and c) site-specific LRTs. This work bridges protein representation learning with statistical phylogenetics, offering a scalable approach to identify the subtle adaptations that define lineage-specific biology.<br />

---

## Phylogenetic regression of sequence embeddings reveals genotypic basis of phenotypes

**Presenter:** Zhenqiu Cao, Institute Of Zoology, Chinese Academy Of Sciences

**Abstract:**

One fundamental task in evolutionary biology is to probe the molecular mechanisms underlying the adaptive evolution of functional traits across species, i.e. resolving the genotype-phenotype mapping (GPM) at macroevolution scale. However, such investigation is often challenging due to the high dimensionality of genotype space and the complex, non-linear mapping between sequence and function. Specifically, non-coding elements (NCEs) play pivotal roles in shaping the GPM through regulation of spatiotemporal gene expression. Existing studies on the GPM of NCEs have mostly focused on changes in evolutionary rates, unable to reveal the association between trait states and specific sequence features. Here, we proposed to extract the semantically rich features of NCEs by pre-trained genome language models, and hence detect the GPM by phylogenetic regression of sequence embeddings (PROSE). Taking echolocation in mammalian species as an example, we tested the association between embedding features of promoter-like NCEs and the discrete trait, identifying NCEs and corresponding genes essential for auditory system development. Additionally, multiple candidate genes showed significant differential expression in the cochlea and auditory cortex between echolocating and non-echolocating bats. The candidate NCEs also contain unique motifs associated with transcription factors participating in auditory system development. In a second case study, significant CREs linked to telomere function were found associated with mammalian longevity, a continuous phenotype. In conclusion, PROSE provide a robust framework for resolving the complex GPM between non-coding regions and discrete or continuous phenotypes, demonstrating the power of deep learning in elucidating the molecular basis of adaptive functional evolution.

---

## Machine Learning Reveals Path-Dependent Functional Evolution in Animal Opsins

**Presenter:** Todd Oakley, University of California, Santa Barbara

**Abstract:**

Path-dependent evolution—the idea that historical events constrain future evolutionary trajectories—is thought to play a central role in shaping molecular function, yet it has been difficult to evaluate efficiently and quantitatively in natural systems across deep evolutionary time. Opsins, the light-sensitive proteins underlying animal vision, are a classic system for studying functional evolution, with decades of natural history and experimental work documenting repeated shifts in spectral sensitivity across animal lineages. Previous studies suggest that opsin functional diversity is shaped by historical pathways, yet this idea has been difficult to evaluate systematically across deep evolutionary time. Here, we synthesize decades of functional data into machine-learned genotype–phenotype maps and use these models to examine the structure of opsin functional evolution. Starting from reconstructed vertebrate and arthropod visual opsin ancestors, we simulate forward sequence evolution and use our ML models to infer the functional consequences of simulated evolutionary trajectories. We find that path-dependent evolution plays a central role in shaping opsin spectral diversity: the effects of substitutions depend strongly on prior sequence context, as accessible functional trajectories differ between vertebrate and arthropod visual opsins. Together, these results show that machine learning can formalize and scale functional information to test how path-dependent evolution structures molecular diversity.<br />

---

## Self-organizing map as a new AI algorithm for motif characterization

**Presenter:** Xuhua Xia, University Of Ottawa

**Abstract:**

A self-organizing map (SOM) is an artificial neural network algorithm that can learn from the training data, which conventionally consists of numerical vectors, and perform non-linear clustering, highlighting the relationship in a 1-D, 2-D, or 3-D grid of neurons. It has conventionally been widely used in transcriptomics to identify co-expressed genes as candidates for co-regulated genes. In such applications, SOM is just a more advanced equivalent of principal component analysis, with the advantage of non-linear, topology-preserving dimensionality reduction. However, SOM can also be used to characterize sequence motifs, although it has never been used in this way. Each neuron (node) can be represented by a position weight matrix (PWM). Input strings can be assigned to the winning neuron by PWM scores and modify the state of the winning neuron and its neighboring neurons. I will illustrate the conceptual framework of this novel application and apply SOM to the characterization of 5' and 3' splice sites of yeast introns. This facilitates the understanding of how mutation and spliceosome-imposed selection shape the variation of these sequence motifs.

---

