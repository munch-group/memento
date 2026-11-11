# PABPC1L2A — gene, protein, mechanism, interaction partners, and the spermatogenesis question

*Compiled from primary database records (NCBI/MyGene, Ensembl, UniProt, InterPro, QuickGO, GTEx v8, Human Protein Atlas 25.1, IntAct, STRING v12) and PubMed/Europe PMC literature retrieval. All values below were pulled programmatically; sources are listed at the end.*

---

## 1. Bottom line

PABPC1L2A is one of two identical copies of an intronless, X-linked poly(A)-binding protein gene. The protein it encodes is a **genuine poly(A)-binding protein with only the first two RRMs of PABPC1** and none of the C-terminal machinery (linker, RRM3/4, MLLE/PABC) that couples canonical PABP to the translation apparatus. The only dedicated functional study of this gene product identifies it as a **brain protein — "neural PABP" (neuPABP) — that binds poly(A) but *cannot* bind eIF4G, is excluded from polysomes, and is proposed to act as a translational repressor** rather than an activator.

For spermatogenesis specifically: there is **no published functional study**. What exists is expression evidence — human testis single-cell RNA-seq places PABPC1L2A squarely in **late spermatids** (HPA "cell type enriched", 180.9 nCPM, assigned to the spermiogenesis-maturation cluster) — which makes a post-meiotic role plausible and testable, but at present unproven. The section below separates this evidence from the much better-supported neural biology.

---

## 2. Gene identity and genomic context

| Property | PABPC1L2A | PABPC1L2B |
|---|---|---|
| Entrez ID | 340529 | 645974 |
| Ensembl gene | ENSG00000186288 | ENSG00000184388 |
| Alias | RBM32A | RBM32B |
| Locus (GRCh38) | chrX:73,077,276–73,079,512, minus strand | chrX:73,002,939–73,006,106, plus strand |
| Cytoband | Xq13.2 | Xq13.2 |
| Transcript | ENST00000373519, **single exon** | ENST00000373521, **single exon** |
| CDS / protein | 603 nt / 200 aa | 603 nt / 200 aa |
| UniProt | Q5JQF8 (PAP1M_HUMAN) — **one accession covers both genes** | Q5JQF8 |

The two genes form a **two-copy ampliconic (inverted-duplicate) pair ~71 kb apart on Xq13.2**. Aligning the two Ensembl CDS sequences gives **100% nucleotide identity over all 603 nt**, and the encoded 200-aa proteins are identical (22,799 Da) — consistent with the published description of the locus as a two-copy ampliconic gene whose copies are intronless and >99% identical. UniProt therefore merges them into a single reviewed entry.

Three consequences follow from this architecture, and they matter for every expression or variant statement about this gene:

1. **Short-read RNA-seq cannot reliably apportion reads between the two copies.** GTEx, HPA and scRNA-seq values for PABPC1L2A vs PABPC1L2B are multi-mapping-dependent; the *pair* is the safe unit of interpretation.
2. **The locus is a known inverted-repeat/inversion region** — PABPC1L2A appears in population surveys of inverted-repeat-mediated human polymorphic inversions.
3. **Intronless + X-linked + truncated ORF** is the classic signature that led NCBI to annotate the mouse ortholog as a putative pseudogene — an annotation the 2023 functional work argues against.

Mouse carries the same arrangement: *Pabpc1l2a* (Entrez 245545) and *Pabpc1l2b* (Entrez 668382), both on chromosome X.

---

## 3. Protein architecture

InterPro on Q5JQF8 (200 aa) returns exactly five entries, all RRM-related:

| Entry | Description | Residues |
|---|---|---|
| IPR000504 (PF00076, SM00360, PS50102) | RNA recognition motif, ×2 | 2–80 and 90–166 |
| IPR034364 (cd12378) | **PABP RRM1** | 3–82 |
| IPR045305 (cd12379) | **PABP RRM2** | 88–163 |
| IPR012677 | α-β plait nucleotide-binding superfamily | 1–83, 84–174 |
| IPR035979 | RNA-binding domain superfamily | 3–168 |

So the protein is **RRM1–RRM2 of PABPC1 and nothing else**: no proline-rich linker, no RRM3/RRM4, and critically **no MLLE (PABC) domain**. UniProt flags this directly, noting the protein may not be functional because it lacks the PABC domain implicated in mRNA stability and translational control — a caution that the 2023 experimental work supersedes in part (the protein is real and binds poly(A)) and confirms in part (it has lost the canonical effector couplings).

**An annotation caveat worth knowing:** in mouse, the AUG-predicted ORF (229 aa) does not match the observed protein (~48 kDa). Mass spectrometry of immunoprecipitated endogenous protein recovered peptides within the annotated 5′ UTR, in frame, and the real protein is **GUG-initiated and 312 aa**, carrying a 24-residue N-terminal domain of unknown function composed almost exclusively of valine, glutamate and alanine — reported to be conserved in human, mouse and rat. The human UniProt entry (200 aa, AUG-initiated) therefore likely **under-annotates the true human N-terminus**. The human C-terminus (…EREAERGAWARQSTSADVKDFEEDTDEEATLR) contains the unique sequence used to raise the mouse-specific antibody in that study (ERGAWARQSTSADFKDFD) and is not shared with other PABPCs — useful if you need a paralog-discriminating epitope or peptide for MS.

---

## 4. Molecular function and mechanism

Everything in this section comes from Sharma *et al.*, *Genes & Development* 2023 (PMID 37704377, doi:10.1101/gad.350597.123), which named the protein **neuPABP**, working primarily in mouse:

- **It is a bona fide poly(A)-binding protein.** RNAcompete *in vitro* selection returned **AAAAAA** as the consensus motif. EMSA against ³²P-oligo(A) gave a **Kd ≈ 50 nM — the same as PABPC1**. A secondary shift indicated that **two neuPABP molecules can occupy 25 adenosines**, versus one PABPC1 molecule (expected, given its halved RRM count).
- **It is cytoplasmic**, like PABPC1, by nuclear/cytoplasmic fractionation of adult cortex.
- **It has lost the activating couplings of canonical PABP.** Co-IP from HeLa cells: V5-PABPC1 pulled down both eIF4G and PAIP2; neuPABP pulled down **neither**. Loss of PAIP2 binding is expected (PAIP2 docks on the MLLE domain, which neuPABP lacks); loss of **eIF4G** binding is not, because neuPABP retains RRM2, the domain PABPC1 uses to contact eIF4G. Recombinant pull-downs confirmed the absence of a direct contact — i.e. this is an evolved loss, not a domain deletion artifact.
- **Functional consequence:** neuPABP fails to stimulate translation *in vitro* and may repress it.
- **It is not on translating ribosomes.** In polysome gradients from P9 cortex, PABPC1 distributes throughout including heavy polysomes; neuPABP sediments in the **free-RNP fractions** with a trace in 40S fractions.
- **RNA partners (RIP-seq, adult mouse hippocampus, n = 3):** the single most enriched RNA is **BC1**, the neuron-specific non-coding RNA that carries an internal A-rich stretch and is itself a translational repressor; beyond BC1, the bound set is **enriched for mRNAs encoding ribosomal and mitochondrial proteins**, and these mRNAs are translationally dormant.
- **Localisation in neurons:** protein appears postnatally and rises with neuronal maturation/synaptogenesis; it partitions into the **PSD-95-enriched postsynaptic density fraction** (unlike PABPC1, which splits evenly between PSD and non-PSD), consistent with independent human synaptosome/PSD proteomics.

**Mechanistic model:** neuPABP occupies poly(A) tails of a selected mRNA pool but, lacking eIF4G and MLLE contacts, **cannot close the mRNA loop or recruit initiation factors** — functioning as a "dead-end" or masking PABP that holds transcripts in a dormant, repressed state, plausibly at the synapse where local translation is gated. This is the opposite of the classical PABPC1 translation-stimulatory role.

---

## 5. Interaction partners

**RNA partners (experimentally supported):** poly(A) (direct, Kd ≈ 50 nM); **BC1 ncRNA** (top RIP-seq target, validated); mRNAs for ribosomal and mitochondrial proteins.

**Protein partners — experimentally tested and negative:** **eIF4G** (no co-IP, no direct binding) and **PAIP2** (no co-IP). These negatives are the mechanistically informative results.

**Protein partners reported in IntAct** — all five records are low-specificity `association` calls from large-scale co-IP/AP-MS screens, none validated for this protein:

| Partner | Method | Source |
|---|---|---|
| LCMV **L** protein | anti-tag co-IP | PLoS Pathog 2017, PMID 29261807, doi:10.1371/journal.ppat.1006758 |
| **BMI1**, **RYBP** | anti-bait co-IP | NAR Cancer 2021, PMID 34316702, doi:10.1093/narcan/zcab009 |
| **CACNA1C** | anti-bait co-IP | iScience 2023, PMID 37207277, doi:10.1016/j.isci.2023.106701 |

The CACNA1C hit is the most interesting of the three, since it comes from brain cell-type-specific interactome mapping and is consistent with the neuronal/PSD localisation — but it remains a single screen-level association.

**STRING v12 (confidence ≥ 400) — treat as predictions, not data.** The ten neighbours returned are PAIP1 (0.954), PABPN1 (0.887), EIF4G1 (0.838), EIF4E (0.771), EIF4A1/EIF4A2 (0.727), ATXN2 (0.634), PAN2 (0.608), TNRC6A (0.608), EIF3A (0.537). Inspecting the evidence channels, **every edge is carried by text-mining and homology-transferred (interologue) scores; none has direct experimental evidence for PABPC1L2A itself.** The network is essentially "what PABPC1 interacts with," projected onto this paralog — and the two highest-profile predictions, **EIF4G1 and the PAIP axis, are precisely the interactions that have been experimentally disproven** for this protein. This is a useful cautionary example of homology-based interactome transfer failing for a diverged paralog.

**GO annotations (QuickGO, 11 total):** entirely IEA/IBA (inferred from InterPro or phylogeny) — poly(A) binding, RNA binding, mRNA 3′-UTR binding, post-transcriptional regulation of gene expression, nucleus, cytosol, cytoplasmic stress granule, ribonucleoprotein complex. The single non-inferred annotation is **extracellular exosome (HDA, PMID 23533145, doi:10.1002/pmic.201200561)**, a mass-spectrometry-cataloguing result. In other words, the GO record contains **no experimental functional annotation** and has not caught up with the 2023 literature.

---

## 6. Expression

**Bulk tissue, GTEx v8 (median TPM, top tissues):**

| Tissue | Median TPM |
|---|---|
| Brain – cerebellar hemisphere | 8.53 |
| Brain – cerebellum | 7.25 |
| Brain – frontal cortex (BA9) | 7.10 |
| Brain – hypothalamus | 6.25 |
| Brain – cortex | 4.08 |
| Brain – anterior cingulate (BA24) | 3.54 |
| Brain – nucleus accumbens | 3.29 |
| Brain – spinal cord (C1) | 2.31 |
| **Testis** | **2.10** |
| Pituitary | 1.86 |
| Prostate | 1.45 |

Brain regions occupy the top eight positions; testis is ninth.

**Human Protein Atlas 25.1 (PABPC1L2A):** RNA **tissue enriched — brain, 10.5 nTPM**; tissue expression cluster *"Brain – synaptic signal transduction"*; brain expression cluster *"Neurons – mixed function"*; protein-level tissue specificity *"tissue enriched — cerebral cortex"*. Protein-level evidence is listed by neXtProt as evidence at protein level.

**Single-cell (HPA):** PABPC1L2A is **"cell type enriched"** with its specific signal in **late spermatids, 180.9 nCPM**, assigned to single-cell cluster *"73: Late spermatids – spermiogenesis: maturation"*; the tissue cell-type enrichment list reads *"Testis – late spermatids"* (alongside adrenal medulla, colon enteroendocrine, minor salivary gland, prostate glandular cells). The identical paralog **PABPC1L2B** is called *"cell type enhanced"* with a neuron-weighted profile (brain excitatory 5.2, inhibitory 5.3, other brain neurons 8.4 nCPM) plus **early primary spermatocytes 1.9 nCPM**.

Note the apparent tension — bulk brain-enriched, single-cell late-spermatid-enriched. Both can be true: bulk brain tissue is overwhelmingly neuronal while testis bulk averages a highly heterogeneous tissue in which only late spermatids express the gene, and the per-cell nCPM in spermatids is high. But given 100% CDS identity between the two copies, **the split of signal between 2A and 2B in any short-read dataset should be regarded as an artifact of read assignment**, and the pair treated jointly.

---

## 7. Spermatogenesis: what is actually supported

**What the data support**

1. **Post-meiotic, late-spermatid expression in human testis** (HPA single-cell: cell-type enriched, 180.9 nCPM, spermiogenesis-maturation cluster), with the paralog showing a weaker early-primary-spermatocyte signal. This is the strongest spermatogenesis-specific evidence available for this gene.
2. **Detectable bulk testis expression** in GTEx (2.1 TPM median).
3. **Family precedent is strong.** The PABPC family repeatedly deploys gamete- and stage-restricted paralogs: **PABPC3 (tPABP)** is testis-specific and expressed in round spermatids; **PABPC1L (ePABP)** is the oocyte/early-embryo PABP required for female fertility in mouse; **PABPC5** is ovary-associated. Spermiogenesis is a period of global transcriptional shutdown in which mRNAs transcribed in round spermatids are stored translationally silent in RNP particles and activated later by cytoplasmic polyadenylation — i.e. **exactly the biology a poly(A)-binding, eIF4G-incompetent, repression-associated PABP would serve**.
4. **The genomic signature fits.** Multicopy, ampliconic, intronless X-linked genes are characteristically expressed post-meiotically in spermatids, where much of the X is otherwise repressed by meiotic sex-chromosome inactivation and its post-meiotic continuation. PABPC1L2A/B match this class on every structural criterion.

**What the data do not support**

- **No knockout, knockdown, or fertility phenotype** has been reported for Pabpc1l2a/b in any species.
- **No testis protein-level detection.** The only antibody-based survey detected protein **exclusively in neural tissues** among the mouse tissues assayed; the tissue panel contents are not recoverable from the article text retrieved, so whether testis was included cannot be confirmed from the text alone.
- **No spermatid RNA targets, no localisation to the chromatoid body or other spermatid RNP granules, no partner protein** has been described in a germ-cell context.
- **No human infertility association.** A PubMed title/abstract search on the symbol returns **zero** records; Europe PMC full-text returns ~30, essentially all incidental appearances in omics supplementary tables (ceRNA networks, RBP signatures, methylation screens) with no functional content.

**A reasonable working hypothesis**, explicitly labelled as hypothesis: PABPC1L2A/B is a stage-restricted PABP that, in late spermatids as in neurons, coats the poly(A) tails of stored mRNAs and — being unable to recruit eIF4G — **keeps them translationally dormant until the appropriate point in spermiogenesis**. The protein would be performing the same molecular trick in two cell types that share the same problem: transcriptionally silent cells that must hold mRNAs in reserve and release them locally and on cue.

**Experiments that would settle it**

1. Paralog-aware re-quantification of human and mouse testis scRNA-seq, counting the 2A+2B pair jointly and reporting multi-mapping explicitly; stage the signal across spermatogonia → spermatocytes → round → elongating spermatids.
2. Immunostaining/Western of mouse testis using the published C-terminal peptide antibody, with a testis lane explicitly included and a germ-cell-stage fractionation.
3. If protein is present: RIP-seq from purified spermatids, and co-sedimentation with polysomes vs free RNPs — the exact assays used in brain — to test whether the dormancy mechanism transfers.
4. *Pabpc1l2a/b* double knockout (both copies must be removed; they are identical) with fertility, sperm count/morphology, and spermatid translatome readouts.

---

## 8. What similarity to neuPABP actually buys us

The only functional evidence for this protein is mouse work. Four sequence/structure analyses were run to test how far it transfers to human, and whether the "pseudogene" and "200-aa" annotations survive scrutiny. All alignments are Needleman–Wunsch/Smith–Waterman with BLOSUM62 (gap −11/−1) on Ensembl-derived sequences; contacts are measured on PDB **4F02** (2.0 Å; human PABPC1 RRM1–2 + A₁₁ + eIF4G1 peptide).

### 8.1 The human protein is 94% identical to the characterised mouse protein

| Comparison | Identity |
|---|---|
| Human PABPC1L2A vs **mouse neuPABP** (Pabpc1l2a) | **94.0%** (187/199 aligned columns) |
| Human PABPC1L2A vs human PABPC1 | 80.1% (196 cols) |
| Human PABPC1L2A vs human PABPC4 | 76.6% |
| Human PABPC1L2A vs human PABPC3 (tPABP) | 73.3% |
| Human PABPC1L2A vs human PABPC1L (ePABP) | 71.4% |
| Human PABPC1L2A vs human PABPC5 | 60.0% |

Mouse *Pabpc1l2a* and *Pabpc1l2b* encode identical 229-aa proteins, mirroring the human duplication. At 94% identity across the entire shared region, **the human protein is the same protein**, and the mouse biochemistry (poly(A) binding at Kd ≈ 50 nM, no eIF4G, no PAIP2, free-RNP sedimentation) should be assumed to hold in human unless shown otherwise. Note also that its closest human relative is **PABPC1, not the testis paralog PABPC3** — PABPC1L2 is not a diverged copy of tPABP, so any spermatid role it has is a convergent deployment, not inheritance from a germline PABP.

### 8.2 The eIF4G surface is selectively eroded while the poly(A) surface is intact

On 4F02, 14 PABPC1 residues lie within 4.5 Å of the eIF4G peptide and 43 within 4.5 Å of poly(A). Mapping both sets through the alignment:

| Protein | eIF4G interface conserved | poly(A) interface conserved |
|---|---|---|
| **PABPC1L2A (human)** | **10/14 (71%)** | **40/43 (93%)** |
| **neuPABP (mouse)** | **9/14 (64%)** | **40/43 (93%)** |
| PABPC3 / tPABP | 13/14 (93%) | 39/43 (91%) |
| PABPC4 | 14/14 (100%) | 43/43 (100%) |
| PABPC1L / ePABP | 12/14 (86%) | 39/43 (91%) |
| PABPC5 | 9/14 (64%) | 34/43 (79%) |

This is the most informative result in the comparison. The erosion is **specific to the eIF4G interface and specific to this paralog**: the other translation-competent PABPCs retain 86–100% of the eIF4G contact set, while PABPC1L2 retains 64–71% — and it does so while holding the poly(A) surface at 93%, which is exactly what one expects of a protein whose measured poly(A) affinity equals PABPC1's. PABPC5, the other outlier, degrades *both* surfaces; PABPC1L2 degrades only one. Independent of any experiment, the structure says: still a poly(A) binder, no longer an eIF4G partner.

The four substituted eIF4G contacts are **T118I, K157V, L162F, D165Y** (PABPC1 numbering), three of them clustered in the 157–165 segment of RRM2. Human and mouse carry **identical substitutions at three of the four**, and at position 157 both replace the lysine with a small hydrophobic (V in human, A in mouse) — i.e. the same charge loss. The loss of eIF4G binding is therefore an **ancestral, shared property of the PABPC1L2 lineage**, not a mouse peculiarity: the mouse co-IP result can be carried over to human with reasonable confidence.

### 8.3 The gene is under strong purifying selection — it is not a pseudogene

Pairwise Nei–Gojobori dN/dS, human vs mouse, over the codon-aligned ORF:

| Pair | Codons | dN | dS | **dN/dS** |
|---|---|---|---|---|
| **PABPC1L2 (human vs mouse)** | 200 | 0.0284 | 0.3551 | **0.080** |
| PABPC1 (human vs mouse), control | 636 | 0.0020 | 0.2413 | 0.008 |

A pseudogene drifting neutrally would approach dN/dS ≈ 1. At **0.080**, PABPC1L2 is under strong purifying selection — ~12× less constrained than PABPC1, as expected for a tissue-restricted paralog, but unambiguously protein-coding. This is a quantitative version of the argument made in the 2023 paper and it contradicts the legacy NCBI "putative pseudogene" annotation of the mouse gene.

### 8.4 The human locus retains the in-frame, A/V/E-rich N-terminal extension

In mouse, the real protein is GUG-initiated with an N-terminal low-complexity domain that mass spectrometry places inside the annotated 5′ UTR. In human, the Ensembl 5′ UTR of ENST00000373519 (126 nt) is **in frame with the ORF and free of stop codons**, contributing 42 residues (`ADADADAKVAAEVAAEVAAAAAAADADADETLGDCEGNPDFQ`; A+V+E = 20 of the first 24). Walking further into genomic sequence upstream (the gene is intronless, so the genomic sequence is contiguous with the transcript), the reading frame stays open for **at least 308 codons with no in-frame stop**, is 46% Ala+Val+Glu, and contains numerous in-frame GTG codons that could serve as the GUG initiator.

**Caveat, stated plainly:** an Ala/Val/Glu/Asp-rich region is encoded by GCN/GTN/GAR/GAY codons, all of which begin with G and therefore *cannot* generate a stop codon in that frame. A long open frame here is partly a composition artifact and is **not by itself evidence of translation**. What is meaningful is the match in character — in-frame, immediately 5′ of the annotated start, and of the same unusual A/V/E composition as the mouse extension validated by MS. The conclusion is that the human UniProt entry (200 aa, AUG-initiated) very likely under-annotates the N-terminus, and that anyone cloning, tagging, or raising antibodies against the human protein should not assume the 200-aa form is complete.

### 8.5 What this does and does not say about spermatogenesis

**It transfers the mechanism, not the tissue.** Protein sequence determines what the protein does once made; promoter and chromatin determine where it is made. The 94% identity and the shared interface erosion mean that **if** PABPC1L2A protein is present in late spermatids (as the HPA single-cell RNA data suggest), it should behave there as it does in neurons: coat poly(A) tails with PABPC1-like affinity, fail to recruit eIF4G, and sit on untranslated messages. That is a precise, falsifiable prediction, and it happens to be the exact molecular activity spermiogenesis requires — round/late spermatids transcribe their mRNAs early, store them translationally silent in RNPs, and release them after transcription has ceased.

**It does not tell us the protein is there.** Nothing in the sequence comparison speaks to testis expression, and the one antibody survey detected protein only in neural tissue among the mouse tissues assayed. The similarity argument raises the prior on a storage function in spermatids; it does not substitute for a testis Western blot or germ-cell RIP-seq.

---

## 9. What the rest of the family says about specificity — and what PABPC1L2A's poly(A) surface predicts

### 9.1 How PABPs achieve specificity: two mechanisms, neither available to PABPC1L2A

Poly(A) binding is not a selectivity mechanism — every mRNA has a tail. Across the family, target selectivity comes from two features located **outside** the poly(A)-reading module:

1. **RRM3–RRM4.** In PABPC1, RRM1/RRM2 preferentially bind poly(A) while **RRM3/RRM4 bind poly(A) and A/U-rich sequences equally well**. This second module is how family members pick mRNA classes. **PABPC4** impacts a subset of erythroid mRNAs through a high-value **AU-rich motif in their 3′ UTRs**, and that motif enhances PABPC4's association with mRNAs carrying **critically shortened poly(A) tails**, apparently protecting them from decay; depleting PABPC4 blocks terminal erythroid maturation (Mol Cell Biol 2014, PMID 24469397, doi:10.1128/MCB.01683-13). **ePABP/PABPC1L** was likewise identified as a protein that **binds AU-rich sequences and prevents poly(A) shortening** (Mol Cell Biol 2005, PMID 15713657, doi:10.1128/MCB.25.5.2060-2071.2005), and it protects stored mRNAs from deadenylation during oogenesis, spermatogenesis and early embryogenesis (Mol Reprod Dev 2019, PMID 31408254, doi:10.1002/mrd.23253).
2. **The MLLE/PABC domain**, which recruits PAIP1/PAIP2, eRF3, PAN3 and CCR4–NOT adaptors — i.e. decides what *happens* to the bound message.

**PABPC1L2A has neither.** It is RRM1–RRM2 and nothing else. The two mechanisms by which every other cytoplasmic PABP selects its mRNA class and its downstream effect are both deleted. Whatever selectivity this protein has must come from somewhere else — the unique N-terminal A/V/E-rich extension (the one feature no other PABPC possesses), partner proteins, or simple steric fit.

For orientation, the rest of the family and the classes they act on:

| Protein | Binding beyond poly(A) | mRNA class / context |
|---|---|---|
| PABPC1 | RRM3/4 bind A/U-rich; ~**27-nt periodic footprint** along the tail; blocks CAF1 but activates CCR4 (Mol Cell 2018, PMID 29932901, doi:10.1016/j.molcel.2018.05.009) | bulk cytoplasmic mRNA; sets deadenylation periodicity |
| PABPC3 / tPABP | 631 aa, 92.5% identical to PABP1 (Nucleic Acids Res 2001, PMID 11328870, doi:10.1093/nar/29.9.1872) | primate testis-specific; stored spermatid mRNAs |
| PABPC4 / iPABP | AU-rich 3′UTR motif; prefers short tails | erythroid differentiation mRNAs |
| PABPC1L / ePABP | AU-rich; anti-deadenylation | maternal/germline stored mRNAs |
| PABPC5 | 382 aa, four RRMs, 60% identical to PABPC4 (Genomics 2001, PMID 11374897, doi:10.1006/geno.2001.6530) | X-linked, poorly characterised |
| PABPN1 | nuclear | drives **hyperadenylation-coupled decay** with PAPα/γ and the exosome (PLoS Genet 2013, PMID 24146636, doi:10.1371/journal.pgen.1003893) |
| **PABPC1L2A / neuPABP** | **nothing beyond RRM1–2** | ribosomal- and mitochondrial-protein mRNAs; BC1 ncRNA |

### 9.2 The poly(A) surface itself: adenine reading is intact

Resolving the 43 poly(A) contacts in 4F02 by what they touch: **34 residues contact adenine base atoms** (16 in RRM1, 18 in RRM2) and 9 touch only ribose/phosphate. Conservation of the 34 base-readers:

| Protein | Adenine base-readers conserved | Substitutions |
|---|---|---|
| PABPC4 | 34/34 (100%) | none |
| **PABPC1L2A (human)** | **33/34 (97%)** | **M46K** |
| **neuPABP (mouse)** | **33/34 (97%)** | **M46K** |
| PABPC3 / tPABP | 30/34 (88%) | M46L, L52S, K129N, R172Q |
| ePABP | 30/34 (88%) | M46V, K138R, Y140F, R172H |
| PABPC5 | 29/34 (85%) | S12A, M46P, R89P, F142Y, F169Y |

PABPC1L2A has the **second most intact adenine-reading surface in the family** — better preserved than tPABP or ePABP, both of which are accepted poly(A) binders. Its single substitution sits at **position 46, the family's most variable base-reader** (L in tPABP, V in ePABP, P in PABPC5, K here). There is therefore **no structural basis to predict a shift away from adenine**, which is exactly what the RNAcompete result (consensus AAAAAA) and the Kd ≈ 50 nM for oligo(A) show. Note the contrast with section 8.2: the same protein keeps 97% of its base-reading residues while losing 29% of its eIF4G contacts. The surfaces have been under opposite selective regimes.

### 9.3 The informative clue is the footprint, not the chemistry

Since the chemistry of adenine recognition is unchanged, the discriminating variable is **how much tail the protein covers**. The RRM1–2 module crystallises with an 11-mer poly(A), and in 4F02 one PABP molecule contacts **9 of the 11 nucleotides** of a given RNA copy (further contacts in the lattice come from a neighbouring RNA molecule). Full-length PABPC1, by contrast, lays down a **~27-nt periodic footprint**. Consistently, the 2023 EMSA showed **two neuPABP molecules binding A₂₅ where only one PABPC1 fits**.

This generates the most useful prediction available about what PABPC1L2A binds:

- **Short poly(A) tails.** A ~12-nt footprint can stably occupy tails that are too short for full-length PABPC1 — i.e. **deadenylated, stored, translationally silent messages**. This is precisely the niche PABPC4 occupies via a different route (it prefers mRNAs with critically shortened tails).
- **Internal A-tracts, not just 3′ ends.** The one experimentally identified RNA target, **BC1**, carries its A-rich element **internally**, not as a terminal tail. A half-size footprint makes internal A-stretches — too short to hold a 27-nt PABPC1 — accessible. This reframes the protein as a binder of **A-rich elements** rather than of poly(A) tails *per se*, and it is directly testable by comparing binding to A₁₂ vs A₂₅ vs an internal A-tract in a longer transcript.
- **A protective, non-licensing mode.** PABPC1 coating both blocks CAF1 and activates CCR4, setting the periodicity of tail trimming. A PABP that covers half as much and has **no MLLE to recruit CCR4–NOT or PAN3 adaptors** would be predicted to shield a short tail **without licensing further trimming** — a plausible molecular basis for long-term mRNA storage, and a clean biochemical experiment.

### 9.4 One suggestive convergence, flagged as hypothesis

neuPABP's RIP-seq targets — mRNAs for **ribosomal and mitochondrial proteins** — are the classic **5′ TOP mRNA** class. The other poly(A)-binding repressor of that same class is **LARP1**, whose La-module binds TOP motifs and poly(A) **simultaneously**, and which regulates the stability and translation of mRNAs encoding the translation machinery (RNA Biol 2019, PMID 31601159, doi:10.1080/15476286.2019.1669404; the direction of LARP1's effect remains contested — RNA Biol 2020, PMID 32233986, doi:10.1080/15476286.2020.1733787). Two unrelated poly(A)-binding proteins converging on the same mRNA class, both associated with repression, is at minimum a precedent that a poly(A) binder can be class-selective without an AU-rich-reading module. Whether PABPC1L2A cooperates with, competes with, or is independent of LARP1 is untested, and nothing in the current data links them.

### 9.5 Reading this back onto spermatogenesis

Two points sharpen the earlier assessment. First, the **stored spermatid mRNA class** (Prm1, Prm2, Tnp1, Tnp2, Odf1, Smcp, Akap4, Gapdhs and relatives) is held with **shortened poly(A) tails** and re-adenylated on activation — i.e. the substrate that the footprint argument predicts this protein should prefer. Second, a caution on phenotype expectations: **mouse knockouts of the testis-specific PABPCs are fertile.** *Pabpc6* is dispensable for spermatogenesis (Biol Reprod 2024, PMID 38281153, doi:10.1093/biolre/ioae017), and mice lacking **both** PABPC2 and PABPC6 show **normal spermatogenesis and fertility** (J Reprod Dev 2025, PMID 40254460, doi:10.1262/jrd.2025-012), with that work noting that rodents carry two testis-specific PABPCs and primates one (PABPC3), all encoded by **intronless genes that may have diverged independently** — the same structural class as PABPC1L2A/B. Redundancy among intronless PABPC paralogs is the rule in this family, so a null phenotype for a PABPC1L2A/B double knockout would not by itself argue against a spermatid function.

---

## 10. Caveats on the record itself

- UniProt still flags the protein as possibly non-functional on the basis of the missing PABC domain; NCBI annotated the mouse ortholog as a putative pseudogene. Both predate — and are contradicted in their main thrust by — the 2023 demonstration of a real, poly(A)-binding, GUG-initiated protein.
- The human protein length (200 aa) is probably an under-annotation; expect a conserved N-terminal extension by analogy with the validated mouse 312-aa form.
- GO carries no experimental functional annotation for this protein.
- STRING's network for this gene is homology/text-mining-derived and contains at least two experimentally refuted edges.

---

## 11. Sources

**Literature (retrieved via PubMed; DOIs as supplied by the PubMed record):**

- Sharma S, Kajjo S, Harra Z, Hasaj B, Delisle V, Ray D, Gutierrez RL, Carrier I, Kleinman C, Morris Q, Hughes TR, McInnes R, *et al.* "Uncovering a mammalian neural-specific poly(A) binding protein with unique properties." *Genes Dev*, 13 Sep 2023. PMID **37704377**, PMC10546976, doi:**10.1101/gad.350597.123**. — the single functional study of this gene product.
- Iwasaki M *et al.*, "Characterization of host proteins interacting with the lymphocytic choriomeningitis virus L protein." *PLoS Pathog* 2017. PMID 29261807, doi:10.1371/journal.ppat.1006758.
- "Elucidation of the BMI1 interactome identifies novel regulatory roles in glioblastoma." *NAR Cancer* 2021. PMID 34316702, doi:10.1093/narcan/zcab009.
- "Using brain cell-type-specific protein interactomes to interpret neurodevelopmental genetic signals in schizophrenia." *iScience* 2023. PMID 37207277, doi:10.1016/j.isci.2023.106701.
- Proteomic exosome catalogue underlying the one experimental GO annotation: PMID 23533145, doi:10.1002/pmic.201200561.

Literature coverage was assessed with PubMed (`PABPC1L2A`, `PABPC1L2`, `PABPC1L2B`, `RBM32`: **0 title/abstract records** for the symbols themselves) and Europe PMC full-text search (30 records for "PABPC1L2A", 31 for "PABPC1L2B", 3 for "PABPC1L2", 3 for "RBM32"), manually triaged.

**Structure:** PDB **4F02** (Safaee et al.), 2.0 Å, human PABPC1 RRM1–2 in complex with poly(A) and the PABP-binding site of eIF4G1; interface residues computed at a 4.5 Å heavy-atom cutoff with Biopython NeighborSearch.

**Sequence analyses run here:** pairwise protein alignments (BLOSUM62, gap −11/−1, Biopython PairwiseAligner); codon-aligned Nei–Gojobori dN/dS (Biopython `cal_dn_ds`, NG86); in-frame upstream translation of ENST00000373519 plus 800 nt of contiguous genomic sequence (chrX:73,079,513–73,080,312, minus strand).

**Databases:** NCBI Gene / MyGene.info (gene IDs, loci, mouse orthologs); Ensembl REST release-current (transcript structure, CDS and protein sequences for ENST00000373519 / ENST00000373521, pairwise identity computed locally); UniProtKB Q5JQF8 (flat file, entry version 155, 04-Nov-2026); InterPro (domain architecture); QuickGO (11 GO annotations); GTEx v8 (median TPM across 54 tissues); Human Protein Atlas 25.1 (tissue, single-cell, brain, protein-level sections for both paralogs); IntAct (5 interaction records for Q5JQF8); STRING v12.0 (predicted network, confidence ≥ 400, evidence channels inspected).

*Compiled 11 November 2026.*
