# Talks to watch

- S11 The evolution of recombination landscapes
- S09 New frontiers in sex evolution: evolutionary patterns and innovations
- S07 From Trees to Graphs: Methodological Advances and Innovative Applications of Graphs in Evolutionary Analysis
- S19 Causes and consequences of mutation rate variation
- S10 Learning from Evolution: AI Models for Genomic Function

---

## Exploring Tree Space: Exact Transition Kernels and Proposal Efficiency in Bayesian Phylogenetics

**Presenter:** John Huelsenbeck, University Of California, Berkeley

**Abstract:**

Bayesian phylogenetic inference relies on Markov chain Monte Carlo (MCMC) to approximate posterior probabilities of trees. The efficiency of an MCMC analysis depends critically on the proposal mechanisms used to explore tree space. In phylogenetics, proposals must modify not only tree topology but also branch lengths, because these parameters are strongly coupled through the likelihood function. As a consequence, promising topological proposals are often rejected because they are accompanied by unfavorable branch-length values.<br /><br />We investigate an alternative framework based on the profile likelihood, in which branch lengths are replaced by their maximum-likelihood estimates rather than being integrated over a prior distribution. This approach isolates the effects of topological proposals from those of branch-length proposals and provides a simplified setting for studying MCMC behavior in tree space.<br /><br />For small phylogenetic problems under simple substitution models, the exact posterior distribution over all tree topologies can be computed without resorting to MCMC. This allows us to evaluate the performance of different tree-perturbation strategies against known posterior probabilities and to quantify their ability to discover and traverse high-probability regions of tree space. In addition, because the complete state space is known, the transition kernel of the Markov chain can be calculated explicitly. This enables the application of analytical tools from Markov chain theory to characterize mixing behavior, identify bottlenecks and metastable regions, and compare the effectiveness of alternative tree-rearrangement operators.<br /><br />Our results provide new insight into the relationship between tree-space geometry, proposal design, and MCMC performance, with implications for the development of more efficient algorithms for Bayesian phylogenetic inference.

### Notes
- branch Likelihood vs branch prior
- Tree topology space
- Proposal distribution using neighbors of neighbors
- If second eigenval of transition matrix is the spectral gap quatifying mixing behaviour, maybe I can use it to 

---

Evolutionary history of two X chromosome meiotic drivers and polymorphic Y chromosomes in Drosophila affinis
Presenter: Anjali Gupta, University Of Kansas

Abstract:

Meiotic drivers are selfish genetic elements that bias gametogenesis to enhance their own transmission, cheating Mendelian segregation. When located on a sex chromosome, such drivers can skew progeny sex ratios, create a female-biased population and diminish average population fitness. In Drosophila affinis, two distinct X-linked meiotic drivers segregate at ~10% frequency in wild populations and are associated with diagnostic chromosomal inversions. The X chromosome of D. affinis is a neo-sex chromosome formed by the fusion of the ancestral X with a former autosome, placing ~40% of the genome under the potential influence of meiotic drive. Using whole-genome sequencing of wild-caught males with and without meiotic drive, we show that inversion polymorphisms linked to meiotic drive suppress recombination across the entire neo-X, leading to long-term divergence between the three X haplotypes (two driving and one non-driving).
D. affinis also harbors extensive Y chromosome polymorphism, including multiple morphologically distinct Y variants and fertile XO males. The two drivers differ in their resistance profiles in XO males, and resistance may trade off among Y morphs. Consistent with this, we find that polymorphic Y chromosomes are highly differentiated from one another, including genic content. Together, these analyses leverage a rare natural system with two distinct X-linked drivers and polymorphic Y chromosomes to test how meiotic drive shapes recombination, genomic divergence, and fitness across a newly formed sex chromosome.

Notes
D. afinis
Woods hole and Lincoln inversions/drivers
chrX W, L and standard haplotypes seperate in PCA
short, medium, and large Y chromosome haplotypes segretagete
XO males are sterile or 100% female offspring

---

## Fatal entanglement: how a DNA satellite causes reproductive isolation in Drosophila

**Presenter:** Mia Levine, University Of Pennsylvania

**Abstract:**

A fundamental driver of biological diversification is the evolution of reproductive barriers between species. Instability and mis-regulation of repetitive DNA underlie numerous post-zygotic reproductive barriers, yet the molecular mechanisms are unknown. A long-studied genetic incompatibility between Drosophila melanogaster and D. simulans arises from mis-segregation of the D. melanogaster-specific 359bp DNA satellite in hybrid embryos. Here we report that the D. simulans version of the essential enzyme Topoisomerase II/Top2 causes this lethal incompatibility. Combining interspecies gene swaps with cell biology and genetics revealed that D. simulans-specific adaptive divergence of Top2 DNA-interacting domains prevents the resolution of 359bp-induced topological stress. Our findings demonstrate that species-specific DNA satellite topology requires species-specific molecular machinery and that even vital housekeeping genes can underlie reproductive isolation between closely related species.

### Notes:
- Interspecies mouse hybrids have perturbed repetitive DNA
- Has to do with chromosome clusters
 - centromeres? CENHAPs?
- Fly cross has sterile males and no females (dies in early emprios) 359bp repeat region on chromosome X
- Topoisomerase II (Topw) (model is that topII help dis-entangle chromosomes and that the repeat is cocupled to species specifc versions of Top2)
- Adding only 359 to the other species make the females sterile
- 359bp repeat region induces entanglement that is rescued by the Top2 from the species that has it.
- Only important in early emprionic devellopment because cell cycle speed is high
- Top2 domains that contact DNA evolve adaptively
- **Maybe the 359 was initially an X driver?**
- She thinks Top2 is/was the driver
- Toplogical structures 
- Apparently Top2 is under selection in mammals( or primates) too. **Sounds like autosomal compensation**
- **Poster B 373**
- **The big question is why males are infertile. That would provide hints about why 359 was fixed in the first place**
- The human TOP2 (DNA topoisomerase II) gene does not have "top two orthologs"; rather, humans possess two distinct paralogs: TOP2A and TOP2B

---

## Dissecting the genetic basis of the Paris SR meiotic drive system in Drosophila simulans

**Presenter:** Cécile Courret, Cnrs

**Abstract:**

In Drosophila simulans, X-linked meiotic drivers disrupt Y-chromosome segregation during male meiosis, producing a strongly female-biased sex ratio. This segregation distortion is caused by two X-linked elements acting together. The first is a dysfunctional allele of HP1D2, a young and rapidly evolving member of the heterochromatin protein 1 family. HP1D2 originated from a duplication of HP1D/Rhino and accumulates on the heterochromatic Y chromosome in spermatogonia. The second driver maps within a tandem duplication (DPSR) encompassing six genes and a junction region. Preliminary evidence indicates that the driver embedded within DPSR corresponds to Trf2. Trf2 produces two main protein isoforms: a long and a short form. Within the DPSR, the distal copy (Trf2d) appears wild type, while the proximal copy (Trf2p) is 5′-truncated and may therefore encode a truncated version of the long isoform. We designed four shRNAs to target both Trf2 copies and their isoforms. Preliminary RNAi experiments show that knockdown of the truncated long isoform from Trf2p restores a balanced sex ratio, supporting the hypothesis that Trf2p is the DPSR-embedded driver. We propose that Trf2p produces a dominant-negative Trf2 isoform that competes with the functional Trf2d product. Notably, in D. melanogaster, Trf2 interacts with Rhino to regulate transposable elements through the transcription of heterochromatic small RNA source loci. This suggests that HP1D2SR, together with Trf2p, mis-regulate Y heterochromatin, thereby causing Y nondisjunction during meiosis II. The Paris SR system constitutes an ideal model to investigate the regulation of heterochromatin during spermatogenesis and how its mis-regulation leads to meiotic failure. 

### Notes
- Two X linked genes required to act as drivers HD1D2, and DP
- Need DP (six gene) duplication AND HD1D2 (disfunctional)
- HD1D2 expressed before meiosis
- The functionsl for HD1D2 (non driver) targets the heterochrom on Y (The driver version does not)
- The DP duplication
  - Trf2 (the second copy is truncated and cannot produce the genes longest isoform) The intermediate isoform (acrive in bboth copies)
- Trf2 targets satelites on Y that differs on Y sensive and resistant Y chromosomes
- Y controls its Trf2 sensitivity through satelite content..
- Nondisjunction of the Y chromatid during melosis Il
- The 1st driver is a dysfunctional allele of the heterochromatin protein HD1D2 
- The 2na driver is a Trf2, involved in the piRNA production
- Satellite abundance is associate to the resistance ability of the Y chromosome
- GP6 is the human ortholog of HD1D2, TERF2 is the human ortholog of Trf2


![Screenshot 2026-06-29 at 12.10.47.png](images/mqz283zm02za_Screenshot_2026-06-29_at_12.10.47.png)

![Screenshot 2026-06-29 at 12.12.06.png](images/mqz28f15suhj_Screenshot_2026-06-29_at_12.12.06.png)

![Screenshot 2026-06-29 at 12.12.58.png](images/mqz28ni1xqws_Screenshot_2026-06-29_at_12.12.58.png)
