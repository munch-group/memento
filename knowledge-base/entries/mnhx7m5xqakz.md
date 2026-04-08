https://docs.google.com/document/d/1lCuJVdYamS9F1KNl7Y3GzbChirkenxEuxEB-YzSkyaM/edit?tab=t.0

- Where are ASD variants expressed?
- Do ASD variants show chromatin interactions with genes of interest?
    - Can look at Betascan2 scores, singleton density scores, tajimas D and FST for ASD variants
- It is also possible that the selective pressures differ across sexes
- Do the surrounding regions of ASD variants show evidence of selection?
- Can ARG-GWAS approaches be used to detect more XWAS ASD variants?
- Is the ASD heritability enriched across certain genes or gene sets hypothesised to be meiotic drivers?
- Are ASD variants enriched in certain genes/ gene sets/ tissues hypothesised to be meiotic drivers (i.e. spermatogenesis genes, XCI escapers, copy number genes, chromatin compartment genes)?
- Does XCI model choice make a difference?

![male.png](attachment:d336ef74-a775-4946-bf89-43b14129342f:male.png)

![female.png](attachment:eabd071f-1ed5-49be-997b-4833d8429e60:female.png)

Fisher test using spermatid genes as background and see if neuron/sfari genes is enriched for selection

Is autosomal control of even transmission due to many small-effect segregating variants?

**Xbrain**

GEnetic basis of autism

- 70-80 heritable
- only 20% with genetic cause
- Spark database 300,000
- 5392 probands with self reported 239 phenotypes
- Mixture modeling
- replicating in an inpendent cohort
- four latent classes across seven groups of phenotypes

**Note**

Snakemake to GWF for Shannon https://github.com/PalamaraLab/arg-needle-scripts/blob/main/arg_needle_lib/arg_mlma/Snakefile

Use PCs on Y SNPs as separate stratification coefficients

IDEA:

Maybe regress male against female effect sizes and use rolling regression to find the weighting of 01 and 02 male encoding that gives the best regression (makes males and females most similar)

**INBOX**

Maybe Email Siliang Song and ask for sum stats for Offspring Ratio Distortion that he talked about at SMBE [Google Scholar](https://scholar.google.com/citations?hl=en&user=OUZ899MAAAAJ&view_op=list_works&sortby=pubdate)

[Dynamics of Meiotic Sex Chromosome Inactivation and Pachytene Activation in Mice Spermatogenesis](https://prelights.biologists.com/highlights/dynamics-of-meiotic-sex-chromosome-inactivation-and-pachytene-activation-in-mice-spermatogenesis/)

[Email Albers on applying GEWA on chrX](https://github.com/pkalbers/geva/tree/master)

Can positivfe selection on X be sex-antagonistic selection only? Did Xi evolve to give females two fitness “votes” on genes otherwise under male control due to large benefit in spermatogenesis? Do they really get two votes if Xi is random? Can differential Xi across tissues be explained this way? Are spermatogenesis genes more often Xi?

[Has anyone ever taken Lamictal (lamotrigine) : r/autism](https://www.reddit.com/r/autism/comments/lk4z6x/has_anyone_ever_taken_lamictal_lamotrigine/)

Does lamotrigine connect ASD and epilepsy?

See which genes share GO:0031175 (neuron projection development) and GOs for spermatogenesis

Are ASD genes enriched for Xi genes?

Could NLGN4Y be an example of a gene adapted to drive in spermatogenesis, with detrimental effects in male brain when there is not a functioning NLGN4X to compelsate? It is at least an example of a both an XI escaper and a gametolog

NLGN4Y is related to testis mas in Mikkel’s sex chrom paper

Overlap between neuronal migration, sperm motility, and meiotic spindle

Only miRNA escape MSCI some mRNA post meiotic silencing

- Look for papers about connection between epilepsy and autism emotional regulation drugs
- Questions for Karan Parker - Can I see the STAN code?
    - A known mechanisms mainly biochemical or structural/developental?
    - To what extent can synapsis issues (deficiency in neurotransmitters) be attributed to micotubule transport of tarnsmitters?
    - How fine-grained is it possible to phenotypically autism subtypes?
    - How much can be acribed to purely developmeltal timing?
- Think about Anders Albrachtsens argument that Xi status does not matter and that all loci can be considdered additive
- DeepRVAT and REGENIE
- ARG-needle on Y chromosome GWAS
- Sonic Hedgehog: a morphogen involved in axon guidance: R&D Systems https://www.rndsystems.com/resources/articles/sonic-hedgehog-morphogen-involved-axon-guidance
- Is the X activated and inactivated in each replication and if not, how does synapsis work for an X and an Xi
- Is the missing heritability larger in males than females?
- Make social scores for all individuals in Karen’s colony and array genotype all of them
- Compute the effect on population-averaged polygenic risk score
- Look for allele frequency differences between males and females and see if allele frequencies differ more between sexes on x than on autosomes
- Identify allele frequency changes of SNPs driven by selection
- Could we use random forest on ASD data to classify case and control, and then use the learned SNP interactions to infer non-additive interactions? Maybe females have less ASD because two copies of genes that variably escapes
- Maybe there is much more cis interaction on the X if synteny is much more strongly conserved. Maybe i-LDSC will find higher heritability on X?
- Are Xi genes enriched among sweep candidates?
- Skewed XCI?
- ASD genes affect different mechianisms, it is possible to have multiple Autisms. In that way it may be different to distringuish ASD subtypes if they are in fact combinatons of different condistions with different severity. Ideally we would do NFM on it…
- Compute how much the population polygenic risk score for ASD increased when ECHs rose in frequency
- Make venn figures with overlap between XCI / Matos_common / ECH / gametologs
- Make figure with distributions of p-values for the same subsets
- Plot p-values across the chomosomes somehow labelling the combinations of XCI, common, ECH, gametologs (colors, shape, etc.)
- Do test of Fisher exact test of ASD in nDEG vs NPX genes AFTER removing all 75% EHC region genes (or low-ILS genes) from both sets

**MSCI-Xi hypothesis**

Male meiotic sex-chromosome inactivation (MSCI) (which limits the scope for meiotic drive in spermatogenesis) and somatic X chromosome inactivation (XCI) (which inactivates the extra X in females) most likely evolved from the same highly conserved mechanism of unsynapsed chromatin silencing Hornecker et al. (2007) and thus may still overlap in their control and/or chromatin organization. I hypothesize that meiotic drivers, in addition to other detrimental effects, fuel an inactivation-dosage-conflict between the sexes: If a gene that evolves to escape MSCI in males also then escapes XCI in females (at least in some tissues), the deleterious excess female dosage. The resolution of dosage-compensation will favor females because X spends 2/3 of the time in females and 1/3 of the time in males. Female gene expression will be lowered, in turn leading to dosage deficiency in males (Figure below). Jakob’s MAGMA pilot seems to support the hypothesis’ two predictions:

1. ASD association in males is enriched among genes escaping female XCI.
2. ASD association in females is enriched among gametologs (candidate meiotic driver genes with a homolog on the Y chromosome).

MSCI/Xi-dosage conflict hypothesis

**Supporting observations**

Super-loops established by CTCF binding at the XIST, FIRRE, and DXZ4 loci are crucial to proper X inactivation. However, new results show that DXZ4 is also a speciation gene in cats responsible for infertility in hybrid males through its effect on MSCI. Genes with such dual roles in Xi and MSCI suggest that strong selection for genes to escape MSCI may affect or, in some cases, even determine whether the same genes escape Xi. Drivers at the edges of suppressed heterochromatin domains may be exposed if the X is paired with a Y with a repeat composition draining chromatin-maintaining genes. Drivers may also modify chromatin to control their expression by increasing ampliconic gene copy number or by modifying linked euchromatin-insulating CTFC tandem repeat motifs Giorgetti et al. (2016). See also notes in CTCF.

**Hitchhiking hypothesis**

ASD risk-variants “hitchhike” to a higher frequency with genes under strong selection or sperm function.

Meiotic drive hitchhiking hypothesis

**Pilots**

**Jakob’s MAGMA analysis**

In a pilot study of ASD GWAS iPsych GWAS summary statistics (MAGMA), separately analyzing males and females to avoid confounding sex-specific effects, we find the following positive associations with ASD risk:

- **Xi escape** genes in **males** (p-value: 0.027, beta: 0.03 )
- **Gametologs** in **females** (p-value: 0.026, beta: 0.45)
- **Neuron+spermatid** genes in **males** (p-value: 0.030, beta: 0.14) but not among neuron genes (using neuron and spermatid gene lists form Matos et al. (2021)).

**NB:** non-PAR X genes (NPX) show no association, but when subtracting ECH-genes (NPX-OvHuSw), the association is almost significant (p-value: 0.059) with a beta of 0.17. Does this (nonsensically) suggest that ECH regions are somehow “protective” against ASD?

**GO enrichments**

In a standard GO analysis of neuron+spermatid genes vs all neuron genes (gene lists from Matos et al. (2021)), we find a significant 44% enrichment of “cytosol genes” and “extracellular exosome genes” are twice as frequent in neuron+spermatid as in neuron genes. Chromatin genes are completely absent in neuron+spermatid. These neuron+spermatid cytosol genes are enriched for both xi-escapers (DDX3X, EIF2S3, HUWE1, RAB9A, RPS4X, SYAP1, UBA1) and deltaE genes (DDX3X, EIF1AX, FMR1, GDI1, GRIPAP1, PUDP, RBBP7, SMC1A, SYAP1, TBC1D8B, TMSB4X, UBA1). Among these iPSYCH found TSPAN7 and SLC25A14.

**Doug’s heritability analysis**

Not on the iPSYCH data.

Doug’s quick enrichment analysis

**NB:** In the last plot, Doug also observes that non-ECH genes explain significant unique heritability compared to the full set of genes. I.e. leaving out the 10% of the genome that ECHs represent somehow produces this signal? Mirrors the strange observation in Jakobs MAGMA pilot.

**Ari’s selection scan**

Relate on 1000g populations: CDX CHB CHS ESN FIN GBR GWD IBS JPT KHV LWK MSL PUR TSI YRI. Protein-coding X genes overlapping a SNP with Relate -log10 p-value above 6 (I.e., multiple correction for chrX testing only):

- **Among *brain-expressed* genes, ASD genes are enriched for genes also expressed in spermatids** (p-value: 0.0012). This may just characterize ASD genes as pleiotropic ”motor genes”.
- **Among *all* X genes, positively selected genes are enriched for ASD genes** (p-value: 5.9e-05).
- **Among *brain-expressed* X genes, positively selected genes are enriched for genes expressed in spermatids** (p-value: 0.0019).
- Among *ASD* genes only, positively selected genes are not significantly enriched for genes expressed in spermatids - *although all 9 of them are spermatid expressed*.

Among the identified protein-coding genes, 12 of 23 are associated with either: **ASD (bold)**, *intellectual disability (italics)*, *and/or seizures or speech impairment: (underlined)*, No assocation, Spermatid expression: *ACSL4* *BCOR* ***CASK*** ***CDKL5*** ***CLCN4*** ***FRMPD4*** G6PD GNL3L ***HUWE1*** *IGSF1* ***IL1RAPL1*** *MAGT1* MAMLD1 NYX PASD1 PHKA1 PRKX ***PTCHD1*** RAB33A TMEM164 **TMLHE** ZMYM3 ZNF185.

Identified protein-coding genes: LINC01278 LINC01278 LOC101928359 LOC105377212 LOC112268307 LOC124905191 MIR325HG RAP2C-AS1.

(See also [Gene sets](https://docs.google.com/spreadsheets/d/1JSjSLuto3jqdEnnG7JqzeC_1pUZw76n7XueVAYrUOpk/edit?gid=0#gid=0))

**Shannon’s offspring ratio distortion anaylsis**

Sex differences in allele frequencies for X chromosomal variants may line up with Shannon’s findings[ Wang, Sun, and Paterson (2022)].

PCDH11X, NLGN4X, and PRKX are all spermatid-expressed and relatively recent gametologs (PCDH11X translocated in humans and PRKX, PRKX stratum 5, NLGN4X stratum 4). PCDH11X, NLGN4X are important ASD brain genes. PRKX is under selection and is a Xi copy number modulator. A Cluster of Autism-Associated Variantson X-Linked NLGN4X Functionally Resemble NLGN4Y (Nguyen et al. 2020). Gene Conversion between the X Chromosome and the Male-Specific Region of the Y Chromosome at a Translocation Hotspot (Rosser, Balaresque, and Jobling 2009).

Spatial sexual dimorphism of X and Yhomolog gene expression in the human central nervous system during early male development Johansson et al. (2016). The protocadherin 11X/Y (PCDH11X/Y ) gene pairs determinant of cerebral asymmetry in modern Homo sapiens Priddle and Crow (2013). Xp22.3 deletion gives both mental retardation and infertility. “Xp22.3 interstitial deletion: a recognizable chromosomal abnormality encompassing VCX3A and STS genes in a patient with X-linked ichthyosis and mental retardation”, “Novel interstitial deletion in Xp22.3 in a typical X-linked recessive family with Kallmann syndrome”

This is fun: “Male homosexuality and maternal immune responsivity to the Y-linked protein NLGN4Y” but I think Nguyen, Lehr, and Roche (2020) found that the dysfunction of NLGN4Y did not relate to its interaction with neurexin.

**Shannon plan**

1. Set up git repo on cluster.
2. Learn popgen / Monty’s book
3. Read our chrX papers
4. GWAS on X
5. Stratified LDSC / Doug’s method on gene sets
6. Risk score vs allele frequency (from 1000g)
7. GWAS on X-Y-MT

TODO: Figure status of Y chromosome in iPsych

**Approaches**

**X and Y QC**

- X data quality control: Curate and filter base calling and imputation in iPSYCH chrX data.

**X GWAS**

- GWAS on X with dosage
- How to handle gene-by-gene XCI status in females?
- Plink vs LDAK
- Impact of sex: Include sex and ICD-10 ASD subtypes in PGS regression to evaluate whether different gene sets dominate their ASD risk.

**X-Y-MT GWAS**

- See if X-Y interaction contributes to ASD by assigning cohort individuals to Y haplogroups.
- Pool iPSYCH data with unexploited X chromosome data from the ASD cohorts of PGC and SPARK, to get more Y and MT diversity.
- Assign y-haplotype to each male and use that as in an interaction model to see if it is the interaction between X variants and particular Y haplotypes that generate the ASD phenotype.

**PGS / h2 enrichments**

- LDSC or interaction-LDSC on X.
- Apply MAGMA gene-wise and gene-set analyses (works out of the box on X)
- Dougs method (used for the pilot) to evaluate ASD risk and heritability explained by the following gene properties: XCI escape, MSCI escape, gametolog on Y, evolutionary stratum, chromatin compartment localization, promoter methylation (Mengjun may be interested in contribiuting that for single cells), spermatid vs spermatozoa expression, brain region expression.

**PGS and allele frequencies (hitchhiking)**

- Hitchhiking risk variants: Use RELATE and CLUES software to compute the likelihood ratio of positive selection at each SNP. Then, include this in PGS regressions to evaluate the expected positive correlation between LR and risk-allele frequency. How does risk score relate to frequency on the X compared to autosomes? Are the frequencies higher on X for the same risk?

**Shannon GWAS**

- MENU: Looks like her top SNPs line up with those found using the runstat on baboons!
- At first quick look, it also seems like male SNPs may be Xi escapers and females SNPs may be gametologs/ampliconinic genes

Giorgetti, Luca, Bryan R. Lajoie, Ava C. Carter, Mikael Attia, Ye Zhan, Jin Xu, Chong Jian Chen, et al. 2016. “Structural organization of the inactive X chromosome in the mouse.” *Nature* 535 (7613): 575–79. https://doi.org/10.1038/nature18589.

Hornecker, Jacey L., Paul B. Samollow, Edward S. Robinson, John L. VandeBerg, and John R. McCarrey. 2007. “Meiotic sex chromosome inactivation in the marsupial Monodelphis domestica.” *Genesis* 45 (11): 696–708. https://doi.org/10.1002/dvg.20345.

Johansson, Martin M., Elin Lundin, Xiaoyan Qian, Mohammadreza Mirzazadeh, Jonatan Halvardson, Elisabeth Darj, Lars Feuk, Mats Nilsson, and Elena Jazin. 2016. “Spatial sexual dimorphism of X and Y homolog gene expression in the human central nervous system during early male development.” *Biology of Sex Differences* 7 (1): 5. https://doi.org/10.1186/s13293-015-0056-4.

Matos, Bárbara, Stephen J. Publicover, Luis Filipe C. Castro, Pedro J. Esteves, and Margarida Fardilha. 2021. “Brain and testis: more alike than previously thought?” *Open Biology* 11 (6): 200322. https://doi.org/10.1098/rsob.200322.

Nguyen, Thien A., Alexander W. Lehr, and Katherine W. Roche. 2020. “Neuroligins and Neurodevelopmental Disorders: X-Linked Genetics.” *Frontiers in Synaptic Neuroscience* 12: 33. https://doi.org/10.3389/fnsyn.2020.00033.

Nguyen, Thien A., Kunwei Wu, Saurabh Pandey, Alexander W. Lehr, Yan Li, Michael A. Bemben, John D. Badger, et al. 2020. “A Cluster of Autism-Associated Variants on X-Linked NLGN4X Functionally Resemble NLGN4Y.” *Neuron* 106 (5): 759–768.e7. https://doi.org/10.1016/j.neuron.2020.03.008.

Priddle, Thomas H., and Timothy J. Crow. 2013. “The protocadherin 11X/Y (PCDH11X/Y) gene pair as determinant of cerebral asymmetry in modern Homo sapiens.” *Annals of the New York Academy of Sciences* 1288 (1): 36–47. https://doi.org/10.1111/nyas.12042.

Rosser, Zoë H, Patricia Balaresque, and Mark A Jobling. 2009. “Gene Conversion between the X Chromosome and the Male-Specific Region of the Y Chromosome at a Translocation Hotspot.” *American Journal of Human Genetics* 85 (1): 130–34. https://doi.org/10.1016/j.ajhg.2009.06.009.

Wang, Zhong, Lei Sun, and Andrew D. Paterson. 2022. “Major sex differences in allele frequencies for X chromosomal variants in both the 1000 Genomes Project and gnomAD.” *PLoS Genetics* 18 (5): e1010231. https://doi.org/10.1371/journal.pgen.1010231.