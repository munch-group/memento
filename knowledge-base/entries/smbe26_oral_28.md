| | |
|---|---|
| **Date** | Tuesday, June 30, 2026 |
| **Time** | 10:20 – 12:20 |
| **Location** | Akvariet 4+5 |

---

## Evolution of immunity across domains of life

**Presenter:** Aude Bernheim, *Institut Pasteur*

**Abstract:** Immune mechanisms exist across the tree of life in such a wide diversity that the immune mechanisms of bacteria (antiphage systems) were considered unrelated to immunity of eukaryotes. However, recent discoveries unveiled hundreds of novel antiphage systems. Among this diversity of novel bacterial immune mechanisms, it emerged that a subset of antiphage defense systems are conserved in eukaryotes and are major actors of diverse immune pathways, leading us to revisit this paradigm. I will discuss the evolutionnary dynamics of immunity across domains of life and how the conservation of immune modules in bacteria, plants and animals can lead to discoveries in bacteria and eukaryotes.

---

## Genomic constraints shape the evolution of alternative routes to drug resistance in prokaryotes

**Presenter:** Chris Creevey, *Queen's University Belfast*

**Abstract:** Antimicrobial resistance (AMR) can be viewed as an accumulative process where pathogens collect resistance genes until achieving multidrug resistance (MDR). This model assumes all resistance mechanisms are compatible and predicts inexorable progression toward pan-resistance. We challenge this model through integrated pangenomic and machine learning analysis of 9,584 Escherichia coli and 7,057 Pseudomonas aeruginosa genomes. <br />We have discovered that bacterial genomes operate under strict grammatical rules that prohibit certain gene combinations. In E. coli, we identify eight mutually exclusive evolutionary routes to MDR. These are gene combinations that confer the same resistance phenotype but cannot coexist within a single genome. Remarkably, 33 gene pairs exhibit the opposite interaction patterns between species: combinations that cooperate in E. coli interfere with each other in P. aeruginosa, demonstrating that genomic context, not gene content alone, determines resistance phenotypes. This context-dependency explains a fundamental paradox: why 106 antimicrobial resistance genes present in >95% of strains (including 43 targeting multiple drug classes) fail to confer universal resistance. Using 55 decision tree models, we show these grammatical constraints accurately predict resistance phenotypes where simple gene presence-absence fails. <br />These findings reveal that bacteria cannot escape these evolutionary constraints even under intense antibiotic selection, suggesting therapeutic strategies to force pathogens toward evolutionary dead ends. The species-specific nature of these constraints necessitates precision approaches to resistance prediction and treatment, moving beyond universal markers to genome-grammar-aware diagnostics. Our work establishes that resistance evolution, rather than being an open-ended accumulation process, follows constrained trajectories that can be predicted and potentially exploited therapeutically.

---

## Dissecting the factors underlying sequence evolution by disentangled representation learning

**Presenter:** Zhengting Zou, *Institute of Zoology, Chinese Academy of Sciences*

**Abstract:** The evolution of molecular sequences is driven by many factors, such as neutral evolution following phylogenetic history and natural selection for different functions or properties of a molecule. Dissecting the impact of these factors on sequences is a fundamental task in molecular evolution, providing us with insights into sequence evolution principles and the potential for modulating sequence properties toward specific functional goals. While conventional methods can detect site-level signatures of specific factors such as positive selection in sequence alignments, attributing more complex patterns to such factors is challenging. Here we propose a deep learning framework Deep Disentanglement Of Protein Sequences (DDOPS). Focusing on the PBP and MBL protein superfamilies with convergent evolution of β-lactamase activity, we constructed and trained a disentangled representation learning model. Consequently, different representation blocks were disentangled, being able to predict only the corresponding factors, such as superfamily assignment (phylogeny) or β-lactamase activity (function). In interpretation analyses, the function block reassuringly showed high attention on a loop structure essential for TEM-1 β-lactamase activity. Furthermore, the autoregressive decoder in the framework enabled sequence generation conditioned on specific combinations of factor states. Combining the phylogeny block of PBP and the function block from MBL β-lactamase, the model generated new proteins with high sequence and structure similarities to PBP β-lactamases. Most of these generated proteins also showed expected activity in antibiotic resistance assays. In summary, the DDOPS framework is able to disentangle and reconstruct complex sequence patterns driven by specific evolutionary factors.

---

## Mapping bacterial capsule diversity using protein structural homology

**Presenter:** Teodora Mateeva, *1, 2*

**Abstract:** Many bacteria have an extracellular structure positioned outside of the peptidoglycan cell envelope, commonly referred to as a capsule. Bacterial capsules can have a varying composition, ranging from polysaccharides, polypeptides, combinations of polysaccharides and polypeptides, poly-γ-D-glutamic acid, hyaluronic acid and others. Capsules are synthesized in both Gram-positive and Gram-negative bacteria, and have a different composition based on the synthesis pathway used by the species and can differ significantly based on the serotype. Due to the importance of the capsule as a virulence factor, it has gained a lot of attention in the field of vaccination, however, little is known about the capsule diversity across the whole of the bacterial kingdoms, particularly in non-pathogenic species.  <br /><br />In this work, we have undertaken a large-scale analysis of proteins participating in the different capsule-synthesis pathways, and more specifically their three-dimensional structure, which often confers more about the function than the sequence. We were able to quantify the structural diversity of the same protein across serotypes of the same species. Using model organisms participating in different synthesis pathways, starting with Streptococcus pneumoniae, which represents the Wzx-Wzy pathway in Gram-positive bacteria, we used machine learning and physics-based methods to search for structural homologs across the whole of the known species space. Applying our own structural homolog pipeline, we were able to identify a large number of capsule-producing species and order them by their structural similarity to the capsule-essential wzx flippase and wzy polymerase in Streptococcus pneumoniae. 

---

##  Deciphering and forecasting viral evolution via AI-augmented molecular evolution

**Presenter:** Jian Lu, *School Of Life Sciences, Peking University*

**Abstract:** Throughout human history, our evolution has been closely shaped by interactions with pathogenic microorganisms. Evolutionary biology provides essential frameworks to understand pathogen emergence, transmission, and adaptation. Leveraging genomic data and evolutionary analyses, we have investigated the molecular evolutionary dynamics underlying pathogen evolution, including the SARS-CoV-2 pandemic. By integrating molecular evolution methods with artificial intelligence (AI), we have developed predictive models capable of forecasting pathogen evolutionary trends. In this talk, I will illustrate how AI-augmented evolutionary approaches enable early identification of key adaptive changes in pathogens, improve the accuracy of outbreak predictions, and help guide public health responses to emerging infectious threats.

---

## Genomic Language Models for DNA sequence Analysis

**Presenter:** Keith Crandall, *George Washington University*

**Abstract:** Understanding evolutionary variation in genomic sequences through the lens of language modeling has the potential to revolutionize biological research. Afterall, DNA is a unique biological language. However, standard Large Language Models have limited applicability to DNA sequences. To maximize the utility of language modeling in genomics, we must develop novel tokenization strategies and model architecture adapted to diverse genomic features across evolutionary timescales. We investigated key elements in genomic language modeling (gLM), including tokenization, pretraining datasets, fine-tuning approaches, pooling methods, and domain adaptation, and applied the language models to diverse genomic data. We gathered two evolutionarily distinct pretraining datasets: one consisting of 19,551 reference genomes, including over 18,000 prokaryotic genomes (115B nucleotides) and the remainder eukaryotic genomes, and another more balanced dataset with 1,354 genomes, including 1,166 prokaryotic and 188 eukaryotic reference genomes (180B nucleotides). We trained five byte-pair encoding tokenizers and pretrained 52 gLMs, systematically comparing different architectures, hyperparameters, and classification heads. We introduce seqLens, a family of models based on disentangled attention with relative positional encoding, which outperforms relatively similar-sized models in 13 of 19 benchmarking phenotypic predictions. We further explore continual pretraining, domain adaptation, and parameter-efficient fine-tuning methods to assess trade-offs between computational efficiency and accuracy. Our findings demonstrate that relevant pretraining data significantly boost performance, alternative pooling techniques can enhance classification, tokenizers with larger vocabulary sizes negatively impact generalization, and gLMs are capable of understanding evolutionary relationships. These insights provide a foundation for optimizing gLMs for identifying diverse evolutionary genomic features and improving genome annotations.

---

## 
A random forest classifier to retrieve Insertion Sequences carrying antibiotic resistance genes from wastewater samples. 

**Presenter:** Alice Ledda, *UKHSA*

**Abstract:** Horizontal Gene Transfer (HGT) of antimicrobial resistance (AMR) genes constitutes a key problem for public health as, thanks to it, such genes can spread rapidly among different bacterial hosts, making it very difficult to tackle such outbreaks.  <br />Insertion sequences (IS) are the minimal HGT units responsible for moving AMR genes among different bacterial hosts based just on their physical proximity. <br />One of the most frequent environments where this physical proximity is achieved is wastewater processing plants. In fact, wastewater processing plants are likely hotspots of AMR genes dissemination through HGT. <br />Understanding the dynamics of mobile genetic elements and, in particular, of ISs, in wastewater processing plants might help to shed light on how AMR genes are spread and provide possible ways of preventing this from happening.  <br />In this talk we will present a random forest IS classifier and its application to retrieve highly represented ISs in wastewater samples. <br />Using data from “The transposon registry” we will identify the most relevant features that enable a thorough identification of the ISs. These features cover gene content, order, physical characteristics and evolutionary features. We will use these features in a random forest classifier and show its accuracy on test data. <br />We will then apply the classifier on a wastewater metagenomic dataset collected in Wales (Knight et al 2024). 

---

## StrataBionn: a neural network supervised classification method for microbial communities

**Presenter:** Omar Cornejo, *University of California Santa Cruz*

**Abstract:** The accurate classification of microbial communities is essential for clinical diagnostics and ecological monitoring; however, the high dimensionality and inherent sparsity of microbiome data often limit the efficacy of traditional linear models. Here, we present a supervised artificial neural network (ANN) classifier specifically designed for the robust categorization of microbial profiles.<br />We evaluated the performance of this method using two distinct datasets: vaginal and oral microbial communities. When compared to traditional nearest centroid classification algorithms, our ANN-based approach demonstrated a significant performance gain, with an increase of 11.0% to 13.3% across all evaluated metrics, including accuracy, recall, precision, and F1-score. We also provide a measure of uncertainty, an empirical estimate of the probability of assignment to communities to facilitate any post-assignment filters.<br />Beyond predictive power, we address the "black box" challenge often associated with deep learning by implementing a feature attribution framework. We implemented a perturbation algorithm and visualization tool to identify key species that disproportionally contributes to changes in performance in the assignment to communities. This allows users to identify the specific taxonomic or functional features that drive the classification, providing biological insights and increasing trust in the model's outputs. We show that our tool provides increased performance and also offers interpretability of the results, which are important features that will allow researchers to translate complex microbial community differences into a better understanding of the species delimitations of communities.<br />

---

## LLM Reveals: Viruses Copy Synonymous Cell-Type Specific Patterns of Human Coding DNA

**Presenter:** Noam Segal, *Technion - Israel Institute Of Technology*

**Abstract:** The extent to which synonymous codons are evolutionarily optimised–and the overlapping signals driving their selection–remains incompletely understood. Here, we investigate codon usage in human genes, its variation across tissues, and how these patterns are mirrored in human-adapted viruses. To this end, we trained a large language model (LLM) to predict codons from amino acid sequences while conditioning on transcript expression across 54 human tissues. The model dramatically outperformed frequency-based baselines, especially on proteins longer than 100 amino acids, suggesting the influence of broader constraints such as co-translational folding. Its advantage tracked GC content across human and viral genes, driven by the elevated use of rare codons in low-GC transcripts. Further analyses revealed that viruses tend to use codon patterns resembling those of their infected tissues. Strikingly, viruses displayed a consistent preference for codon patterns characteristic of cultured cell types and of tissues showing infection-related expression profiles–suggesting reciprocal adaptation between viral codon usage and the host cellular environment. These findings reveal unexpected complexity in codon usage and highlight the potential of LLMs to support codon optimisation, de-optimisation, and translationally informed sequence design.

---

