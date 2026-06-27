**Date:** Monday, June 29, 2026

**Time:** 10:20 – 12:20

**Location:** Pjerrot

---

## Beyond the Constant: Structural, Life-History, and Environmental Drivers of Germline Mutation Rate Variation

**Presenter:** Markus Pfenninger, Senckenberg Biodiversität und Klima Forschungszentrum

**Abstract:**

The germline mutation rate (μ) is the fundamental fuel for evolution. Integrating data from multiple mutation accumulation experiments in the midge Chironomus riparius, we reveal that mutation processes are structured by complex interactions between genomic architecture, life-history trade-offs, and environmental stress. At the intra-genomic level, we identify proximity to coding regions as the dominant predictor of mutation density, demonstrating that genes are effectively shielded while repetitive elements remain exposed. Temporally, we disentangle the U-shaped relationship between temperature and μ by demonstrating a fundamental trade-off between developmental speed and replication fidelity. While rapid development compromises DNA replication accuracy (the speed-fidelity trade-off), prolonged generation times lead to time-dependent mutation accumulation (the generation length hypothesis); notably, the species’ mean generation time coincides with the mutational minimum, suggesting that selection for replication accuracy helps shape life-history evolution. Furthermore, we provide evidence for the local adaptation of these thermal reaction norms, with populations from variable climates exhibiting plastic responses while those from stable environments show canalized rates. Finally, we show that anthropogenic stressors, such as complex urban sediment mixtures, can amplify μ by 50% and alter mutational spectra, mimicking signatures of specific chemical mutagens like Benzo[a]Pyrene. Together, these findings underscore that mutation rate variation is a highly labile trait driven by both intrinsic architecture and extrinsic pressures, and consequently, evolutionary models must integrate this heterogeneity to avoid biased inferences of demographic history and selective constraint. 

---

## Trinucleotide genome composition reflects context-dependent mutation spectra in plants

**Presenter:** Ziyue Gao, University of Pennsylvania

**Abstract:**

Genome nucleotide composition is shaped by the interplay of mutation, recombination, drift, and selection. While GC-biased gene conversion (gBGC) drives intra-genome variation in GC content, it cannot fully explain the variation in multi-nucleotide composition observed across genomic regions or among species. Building on our previous observation of a strong correlation between CpG mutation rate and CpG content across 108 eukaryotes, we hypothesize that the multi-nucleotide composition of neutral genomic regions reflects the combined effects of gBGC and context-dependent mutation spectra.<br /><br />By modeling the stationary trinucleotide composition under a given mutation spectrum using a discrete-time Markov chain, we found a significant correlation between the ratio of reciprocal trinucleotide mutation rates and their corresponding equilibrium abundance. This relationship is supported by the observed trinucleotide frequencies of reference genomes and mutation spectra inferred from genome-wide polymorphisms in multiple plant species, though gBGC weakens the correlation. Crucially, this relationship holds not only across trinucleotide pairs within a genome but also across species for the same trinucleotide pair.<br /><br />Analyzing the trinucleotide frequencies in putatively neutral intergenic regions of 60 plant genomes, we uncovered remarkable inter-species variation, indicating differences in the underlying mutation spectra. Treating pairwise trinucleotide ratios as quantitative traits, we performed phylogenetic regression against DNA repair and methylation genes, thereby identifying candidate mutation modifiers in plants. Overall, this study demonstrates a strong connection between genome multi-nucleotide composition and context-dependent mutation spectrum, suggesting that a single reference genome can inform mutational patterns, even in species lacking polymorphism or direct mutation data.

---

## Transcription, Replication, and Recombination Shape Local Mutation and Sequence Variation at Human TSSs

**Presenter:** Fanny Pouyet, Université Paris-Saclay

**Abstract:**

Transcription start sites (TSSs) of human genes are characterized by elevated GC-content, a pattern observed for decades, but the mechanisms shaping this local nucleotide landscape remain poorly understood. Why do TSSs accumulate GC, and how is this affected by local mutation rate biases? To address this, we analyzed population-scale polymorphism data and de novo mutations from parent-offspring trios, mapping mutations at single-nucleotide resolution around TSSs. We discovered that mutation rates peak sharply at TSSs, particularly at highly transcribed genes in the germline [Qiu et al., 2025]. Similar patterns are seen for long noncoding RNAs and RNA polymerase II pause sites. Comparing observed nucleotide composition with expectations from mutation alone, we highlight the contribution of GC-biased gene conversion (gBGC), a recombination-linked process that affects which mutations persist in shaping local GC-content. Forward simulations indicate that the combination of local mutation biases and gBGC, rather than selection, explains the nucleotide patterns at gene starts. At the level of individual genes, an XGBoost-based analysis identifies three classes with distinct GC-content, mutation rates, and genomic features. Genes with high GC-content often carry origins of replication and CpG islands, and experience elevated mutation rates, likely due to conflicts between transcription and replication machinery. Genes lacking these features show lower mutation rates and GC-content. Together, these findings suggest that the familiar GC peak at TSSs emerges from the interplay and conflicts of transcription, replication, and recombination. We provide a mechanistic explanation for a long-observed genomic feature and show how local mutation landscapes shape human gene evolution.

---

## Beyond Molecular Error: Developmental Selection Biases Germline Mutation Rates

**Presenter:** Paco Majic, Embl Heidelberg

**Abstract:**

Mutations are the ultimate source of heritable variation in populations, and their rates shape both the tempo and direction of evolutionary adaptation. The generational mutation rate is typically understood to reflect underlying molecular processes, including DNA replication fidelity, damage, and repair, as well as organismal life-history traits such as body size and generation time. However, an important and largely overlooked dimension is the developmental context in which new mutations arise and the functional consequences they exert at the cellular level when they first occur.<br />Here, I present experimental results from Drosophila melanogaster demonstrating that selection operating within organisms can substantially bias observed mutation-rate variation. Specifically, mutations arising during development may be subject to cell-lineage selection before contributing to the germline, thereby confounding inferences about the underlying causes of mutation-rate variability. Using controlled experimental designs, we show that germline cell-lineage selection can lead to systematic biases in mutation-rate estimates. Both the magnitude and direction of this bias depend on species-specific features, including developmental architecture, life-history traits, and genomic context.<br />Our findings indicate that mutation rates cannot be interpreted solely as products of molecular mutational processes. Instead, they emerge from interactions between molecular mutation rates, organismal development, life history, and the fitness effects of mutations expressed at the cellular level. These results have important implications for the interpretation of comparative mutation-rate studies and for understanding how mutation rates evolve. More broadly, they highlight the need to integrate developmental and cellular selection processes into evolutionary models of mutation.<br />

---

## A Statistical Framework for Mutation Model Inference of Tandem Repeat Variants via the Ancestral Recombination Graph

**Presenter:** Sebastián Iturbe, University Of Oregon

**Abstract:**

Short tandem repeats (STRs), or microsatellites, are repetitive sequences that make up approximately 3% of the human genome. More than 10,000 STR variants are known to influence gene expression and account for 10–15% of its heritability. Modern long-read sequencing technologies now enable us to determine STR genotypes with higher accuracy and investigate their role in complex traits. However, understanding the evolutionary and mutational behavior of STRs is essential to characterize their impact on different phenotypes. To this end, inferring the mutation model that governs STR variation is critical. This task is particularly complicated by the fact that the mutational dynamics vary substantially across loci. To solve this problem we created Tandem Repeat Ancestral recombination graph Mutational Analysis (TRAMA), a tool that infers the mutational process of each STR locus individually. For each STR, TRAMA uses information from the local Ancestral Recombination Graph (ARG), which encodes the complete local genealogical history of the samples. TRAMA uses a novel maximum-likelihood approach conditioning on the local ARG information to infer the most probable STR mutation model and its parameters per locus from observed variation in a set of samples. We demonstrate the method's accuracy through extensive simulations showing that it can infer the known mutational model acting on each loci along with the parameters that explain its evolutionary history across a wide range of scenarios. We further apply TRAMA to data from the Human Pangenome Reference Consortium - Phase 2. This work offers a path toward modeling STR mutational processes more accurately.

---

## Are Triallelic SNPs generated by trans-lesion synthesis?

**Presenter:** Caitlin Price, University Of Kent

**Abstract:**

It has been shown that sites with 3 SNP alleles segregating in the human population are about twice as common as expected. It has been suggested that these might be due to a process, such as trans-lesion synthesis (TLS), that can generate two alternate mutations within the germline of a single individual. To investigate this, we conducted a comprehensive search of the literature for cases in which siblings and parents had been sequenced and de novo mutations discovered. Out of 333 siblings across 36 species, we found 3 cases in which siblings had different mutations at the same site. This is far more than would be expected by chance. However, they are sufficiently rare to suggest that they are either chronically underreported or that TLS is not the cause of triallelic SNPs. To investigate further we used Y-chromosome data from the 1000 Genomes Project. We test whether triallelic SNPs are over-represented and whether many of these originate within a single bifurcation of the tree as we would expect if mutations in a single individual cause triallelic sites.

---

## Germline mutation rate variation and its consequences for speciation in a cichlid adaptive radiation

**Presenter:** Daniela Souza-Costa, University Of Basel

**Abstract:**

De novo mutations are the ultimate source of genetic diversity and can strongly influence evolutionary dynamics and biodiversity. Although germline mutation rates vary by an order of magnitude among vertebrates, their consequences for genetic diversity and speciation have been challenging to study. African cichlid fishes offer an exceptional system to address this challenge: extraordinary phenotypic and genomic diversity, with species richness and genetic diversity unevenly distributed across their adaptive radiation. Here, we leverage parent-offspring sequencing data from 21 families representing 19 Lake Tanganyika cichlid species to estimate germline mutation rates across a wide range of species abundance. We find substantial mutation rate variation among closely related species spanning a 14-fold range with a mean rate of 3.0 × 10⁻⁹ mutations per site per generation. We also detect shared mutations among siblings, evidence for mutation clustering, and shifts in the mutation spectrum. Mutation rates show a positive association with genetic diversity, suggesting that mutation rate heterogeneity may contribute to patterns of biodiversity. However, mutation rate variation alone does not fully account for the observed diversity as life-history traits, ecological factors, and long-term population size likely play major roles. Together, our results demonstrate that mutation rate variation shapes biodiversity patterns in adaptive radiations and should be incorporated into population genetic and speciation models.

---

## Heritability of germline mutagenesis in 40 large three- and four-generation pedigrees

**Presenter:** Alexis Garretson, The University of Utah

**Abstract:**

Germline mutations are the basis for genetic disease and underlie all heritable phenotypic variation on which evolution can act. Estimating the mutation rate, or the expected number of de novo mutations (DNMs) per site, genome, and generation, is therefore critical for modeling disease burden and selection. In the human germline, few studies have identified specific genetic loci that commonly affect mutation rate or measured its heritability. <br />Here, we present the first phase of the Gametes Through Generations (GTG) project, comprised of new WGS of >1000 individuals from 40 CEPH/Utah pedigrees. With a median of eight (generation three) and four (generation four) children, we are able to measure germline mutations in hundreds of individuals, eliminate false positives, and assign mutations to a parent-of-origin. With large family sizes, we observe substantially greater power to detect nonzero heritability than with trios, and can estimate repeatability. Repeatability provides an upper bound on heritability and has never been calculated for mutation rates. We observe low repeatability of 0.15 and 0.51 for maternal and paternal mutation rates, respectively. Thus, detecting nonzero maternal mutation-rate heritability may be impossible in trio- or family studies.<br />Accordingly, initial results show low-to-zero heritability for both maternal and paternal mutation rates. While preliminary, these findings indicate that GTG provides novel resolution critical for accurately estimating the heritability of germline mutagenesis and, as we will present, related genomic traits. The sequencing of these pedigrees has broad implications for both molecular evolution and genomic medicine, helping quantify an individual’s unique risk for mutational burden.

---

## The mutational processes in primate spermatogenesis inferred from HiFi long read sequencing

**Presenter:** Mikkel Heide Schierup, Aarhus University

**Abstract:**

Eighty per cent of de novo mutations passed on from parents to offspring occur in the male germline. We used PacBio HiFi long-read sequencing to identify mutations in testis and sperm samples from nine primate species: human, chimpanzee, bonobo, gorilla, orangutan, gibbon, baboon, macaque, and marmoset. Based on quality scores and auxiliary information, we confidently identify mutations, short indels, and recombination on single reads. We apply a likelihood-based approach to classify sequencing reads to cell type using CpG methylation patterns, enabling testis reads to be classified as germline or somatic. Human sperm samples show the mutation rate, spectrum and paternal age effect expected from trio studies. In other primate sperm samples, we find changes to both the spectrum and the rate, providing insights into the evolution of germline mutations. Approximately 1% of mutations are detected in more than one read, indicating that they occur during early germline development. Testes have more non-synonymous variants than sperm, suggesting natural selection against mutations in the testes. We identify simple crossovers and gene conversions, with gene conversion tract lengths being short (40-100 bp) across species. However, we also observe complex gene conversions across all species. We interpret these as resulting from homologous repair before meiosis, and they typically move several SNVs between haplotypes over 10 kb. By identifying mutations in recombined reads, we observe a mutagenic effect of recombination, with complex gene conversions exhibiting the largest mutagenic effect.<br />

---

## Spontaneous mutation rate and spectrum are modulated by organismal fitness

**Presenter:** Jianzhi Zhang, University of Michigan

**Abstract:**

Understanding the principles governing mutagenesis is important because mutations are a fundamental driver of evolution and a cause of disease.  Although mutation rates and spectra depend on genotype and environment, how these factors interact is unclear.  We address this question using mutation accumulation experiments in 11 budding yeast strains across three environments that produce strong genotype-by-environment interactions in fitness.  Analysis of over 9,000 accumulated mutations reveals that per-generation rates of all mutation types—single-nucleotide variations, small insertions and deletions, segmental duplications and deletions, and chromosome gains and losses—decline with increasing organismal fitness.  Notably, relative mutation rates between strains tend to invert when environmental shifts reverse their relative fitness.  The mutation spectrum is also partially fitness-dependent: higher-fitness strains show a lower transition-to-transversion ratio and a stronger AT mutational bias.  Thus, organismal fitness shapes not only natural selection but also the quantity and composition of mutations available to selection, with broad implications for the molecular clock, adaptive evolution, and genetic load.<br /><br />

---

## Transcription start sites experience a high influx of heritable variants fueled by early development

**Presenter:** Donate Weghorn, Centre For Genomic Regulation (crg)

**Abstract:**

Mutations drive evolution and genetic diversity, with the most consequential mutations occurring in coding exons and regulatory regions. However, the impact of transcription on germline mutagenesis remains poorly understood. Here, we identify a mutational hotspot at transcription start sites (TSSs) in the human germline, spanning several hundred base pairs in both directions. Notably, the hotspot is absent in de novo mutation data. We reconcile this by showing that TSS mutations are significantly enriched with early mosaic variants, many of which are excluded from de novo mutation calls, indicating that the hotspot partly arises during early embryogenesis. We associate the TSS mutational hotspot with divergent transcription, RNA polymerase II stalling, R-loops, and mitotic—but not meiotic—double-strand breaks, suggesting a recombination-independent mechanism distinct from known processes. Our findings are reinforced by mutational signature analysis, which highlights alternative double-strand break repair and transcription-associated mutagenesis. We further show that the TSS hotspot is eroded by negative selection and biased gene conversion. These insights reveal a germline mutational phenomenon with evolutionary and biomedical implications, particularly affecting genes linked to cancer and developmental phenotypes.

---

