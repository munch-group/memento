Report on X-linked genes related to hybrid-incomp. interacting with the autosomal genes found in this paper: Ancient Out-of-Africa Mitochondrial DNA Variants Associate with Distinct Mitochondrial Gene Expression Patterns

## Overview

This document summarizes the evidence supporting 13 protein-protein interactions identified from STRING analysis between autosomal mitochondrial/RNA-processing query genes (**MRPS7**, **GRSF1**, **PNPT1**, **PTCD1**) and X-linked genes. For each interaction, the molecular functions of both partners, the type of supporting evidence, and the connection to mitochondrial biology are described.

**HEMK1** was the original gene of interest because it sits in the chr3 region, but that does not show any confident interactions

---

## 1. MRPS7 – EIF1AX (Combined score: 0.888)

**Evidence type:** Experimental (0.581), Coexpression (0.656), Textmining (0.240)

**MRPS7** encodes a 12S rRNA-binding subunit of the 28S small mitochondrial ribosomal subunit. It is essential for mitoribosome assembly and mitochondrial translation of the 13 OXPHOS subunits encoded by mtDNA. Loss-of-function mutations cause combined OXPHOS deficiency-34, presenting with sensorineural deafness, hepatic/renal failure, and lactic acidemia (Menezes et al., 2015, *Hum Mol Genet*).

**EIF1AX** encodes eukaryotic translation initiation factor 1A (X-linked), a core component of the 43S pre-initiation complex in cytoplasmic translation. It facilitates mRNA scanning and AUG start codon recognition, and interacts with eIF5B for 60S subunit joining. Its polar structure (basic N-terminus, acidic C-terminus) may allow it to bridge initiation factors or the ribosome.

**Mitochondrial connection:** This is the highest-scoring interaction in the dataset. The strong experimental evidence (0.581) indicates direct or co-complex physical interaction. Both proteins are ribosomal components — MRPS7 in mitochondrial translation, EIF1AX in cytoplasmic translation. The interaction likely reflects coordination between the two translation systems. Since all mitoribosomal proteins are nuclear-encoded and translated cytoplasmically, EIF1AX-dependent cytoplasmic translation directly supplies the mitoribosome assembly pathway. Disruption of either system impairs cellular proteostasis and energy metabolism.

---

## 2. GRSF1 – RPS6KA3 (Combined score: 0.629)

**Evidence type:** Experimental (0.626), Textmining (0.041)

**GRSF1** (G-rich RNA sequence binding factor 1) is a mitochondrial matrix RNA-binding protein that localizes to mitochondrial RNA granules (MRGs). It binds nascent mitochondrial RNA, interacts with the RNase P complex, and is required for processing of both tRNA-flanked and non-canonical mtRNA precursors. GRSF1 preferentially binds ND6 mRNA and the lncRNAs for cytb and ND5 from the light strand. Depletion causes abnormal mtRNA stability, defective ribosome assembly, and impaired mitochondrial protein synthesis (Jourdain et al., 2013, *Cell Metabolism*; Antonicka et al., 2013, *Cell Reports*).

**RPS6KA3** (RSK2) is an X-linked serine/threonine kinase in the MAPK/ERK signaling pathway. It contains dual kinase domains and phosphorylates substrates including CREB, histone H3, and SOS1. Mutations cause Coffin-Lowry syndrome (intellectual disability, skeletal abnormalities). Recent work in *Drosophila* shows that loss of the RSK ortholog S6kII causes mitochondrial dysfunction, fragmentation, and cell death. RSKs act as negative regulators of ERK, and loss of RSK function leads to sustained ERK activation, which disrupts mitochondrial dynamics via phosphorylation of DRP1 and MFN1 (PMC12403519, 2025, *J Cell Science*).

**Mitochondrial connection:** The high experimental score (0.626) indicates a direct physical interaction. This links mitochondrial RNA processing (GRSF1) to MAPK-ERK signaling that controls mitochondrial dynamics (RPS6KA3). The interaction may represent a signaling axis where RSK2-mediated phosphorylation modulates GRSF1 activity or localization, coordinating mitochondrial gene expression with cellular growth signals. Both proteins are relevant to neuronal function (RSK2 in synaptic plasticity, GRSF1 in mitochondrial energy metabolism), suggesting tissue-specific functional coupling.

---

## 3. GRSF1 – HSD17B10 (Combined score: 0.612)

**Evidence type:** Experimental (0.503), Textmining (0.246)

**HSD17B10** (also MRPP2/SDR5C1) is a dual-function X-linked protein: (1) a short-chain dehydrogenase/reductase for fatty acid and steroid metabolism (including neurosteroid allopregnanolone homeostasis), and (2) an essential subunit of the mitochondrial RNase P complex. As MRPP2, it forms a subcomplex with TRMT10C (MRPP1) that binds conserved mt-tRNA elements (including the anticodon loop) and catalyzes N1-methylation at guanine-9 or adenine-9. This subcomplex then recruits the endonuclease PRORP (MRPP3) for 5'-end cleavage of mt-tRNAs. Mutations cause HSD10 disease with progressive neurodegeneration, and elevated levels are found in Alzheimer's disease brains (He et al., 2018, *Int J Mol Sci*; Oerum et al., 2022, *Nature Struct Mol Biol*).

**Mitochondrial connection: DIRECT FUNCTIONAL LINK.** This is one of the most biologically compelling interactions in the dataset. Both GRSF1 and HSD17B10/MRPP2 are core mitochondrial RNA processing factors that co-localize in mitochondrial RNA granules (MRGs). GRSF1 interacts with the RNase P complex (of which HSD17B10 is a subunit) in MRGs where nascent mtRNA transcripts are processed. GRSF1 handles mRNA/lncRNA processing and ribosome loading, while HSD17B10 processes tRNA 5'-ends. Together they coordinate the excision of tRNAs from polycistronic transcripts — the critical first step of mitochondrial gene expression.

---

## 4. PNPT1 – DKC1 (Combined score: 0.579)

**Evidence type:** Coexpression (0.411), Textmining (0.268)

**PNPT1** (polynucleotide phosphorylase, hPNPase) localizes to the mitochondrial intermembrane space and has multiple functions: (1) imports nuclear-encoded RNAs (5S rRNA, MRP RNA, RNase P RNA) into mitochondria, (2) degrades mtRNA as part of the SUV3-PNPase degradosome, (3) participates in mitochondrial RNA surveillance and poly(A)-mediated decay. Mutations cause combined OXPHOS deficiency, Leigh syndrome, hearing loss, and Aicardi-Goutières-like syndrome.

**DKC1** (Dyskerin) is an X-linked nucleolar pseudouridine synthase, a core component of H/ACA small nucleolar ribonucleoproteins (snoRNPs) responsible for rRNA pseudouridylation — essential for ribosome biogenesis and translational fidelity. DKC1 is also a component of the telomerase complex (binding hTR/TERC), required for telomere maintenance. Mutations cause X-linked dyskeratosis congenita, a ribosomopathy/telomeropathy. DKC1 depletion causes ribosomal biogenesis impairment, oxidative stress, and p53 pathway activation.

**Mitochondrial connection:** Both proteins are essential for ribosome production in their respective compartments — PNPT1 for mitochondrial ribosomes (via RNA import and mtRNA processing), DKC1 for cytoplasmic ribosomes (via rRNA modification). The strong coexpression (0.411) reflects coordinated regulation of mitochondrial and cytoplasmic translational capacity. Since all mitoribosomal proteins are translated by cytoplasmic ribosomes (which require DKC1 for their biogenesis), DKC1 dysfunction indirectly impairs mitochondrial function. Both proteins, when disrupted, trigger p53 activation through nucleolar/mitochondrial stress pathways.

---

## 5. GRSF1 – DDX3X (Combined score: 0.510)

**Evidence type:** Textmining (0.490), Experimental (0.071)

**DDX3X** is an X-linked DEAD-box ATP-dependent RNA helicase involved in virtually every step of RNA metabolism: transcription regulation, translation initiation (unwinding structured 5'UTRs), alternative splicing, mRNA stability, and stress granule formation. It also functions as a pattern recognition receptor in innate immunity, engaging the mitochondrial antiviral signaling protein MAVS on the mitochondrial outer membrane to activate IFN-β transcription. DDX3X regulates mitochondrial dynamics via CDK1-DRP1 signaling and fatty acid oxidation. It escapes X-inactivation, so females have two active copies.

**Mitochondrial connection:** DDX3X has multiple direct mitochondrial connections: it interacts with MAVS on the mitochondrial outer membrane for antiviral innate immunity, it regulates mitochondrial dynamics (fission/fusion) via DRP1 phosphorylation, and it controls mitochondrial metabolism. The textmining-supported interaction with GRSF1 (a mitochondrial RNA processor) likely reflects coordinated RNA metabolism: DDX3X may regulate the cytoplasmic translation of nuclear-encoded mitochondrial proteins that GRSF1 processes after import, or both may participate in stress response pathways that affect RNA handling in both cellular compartments.

---

## 6. PNPT1 – DDX3X (Combined score: 0.506)

**Evidence type:** Experimental (0.230), Coexpression (0.303), Textmining (0.141)

**Mitochondrial connection:** Both PNPT1 and DDX3X are RNA-processing enzymes with mitochondrial functions. PNPT1 imports RNAs into mitochondria and degrades mtRNA. DDX3X is an RNA helicase with MAVS interaction on the mitochondrial outer membrane and roles in regulating mitochondrial dynamics. The combined experimental (0.230) and coexpression (0.303) evidence suggests physical proximity or co-regulation. Potential functional link: coordination of cytoplasmic RNA metabolism (DDX3X helicase activity) with mitochondrial RNA import/degradation (PNPT1), or shared roles in innate immune/stress response pathways where mitochondrial RNA release triggers inflammatory signaling (PNPT1 releases RNA upon mitochondrial stress → DDX3X/MAVS activates interferon response).

---

## 7. MRPS7 – KCND1 (Combined score: 0.503)

**Evidence type:** Experimental (0.289), Coexpression (0.295), Textmining (0.089)

**KCND1** (Kv4.1) encodes a voltage-gated potassium channel subunit involved in neuronal A-type potassium currents and repolarization.

**Mitochondrial connection: INDIRECT.** MRPS7 is a core mitoribosomal protein; KCND1 is a neuronal ion channel. The experimental and coexpression evidence suggests they physically interact or are co-regulated in neuronal tissue. High-energy neurons require robust mitochondrial OXPHOS for maintaining membrane potential and ion gradients. The interaction may reflect: (1) shared co-expression in neurons where mitochondrial function and ion channel activity are tightly coupled, (2) possible regulation of mitochondrial membrane potential by Kv4 family channels (some K+ channels are found on mitochondrial membranes), or (3) co-regulation in neurodegenerative contexts where both mitochondrial dysfunction and ion channel dysregulation co-occur.

---

## 8. PTCD1 – RBMX (Combined score: 0.500)

**Evidence type:** Experimental (0.461), Textmining (0.102)

**PTCD1** (pentatricopeptide repeat domain 1) is a mitochondrial matrix RNA-binding protein. It is one of seven mammalian mitochondrial PPR proteins. PTCD1 binds 16S rRNA and leucine tRNAs and their precursors, and is essential for 16S rRNA stability, pseudouridylation, and correct biogenesis of the mitochondrial large ribosomal subunit. PTCD1 also interacts with ELAC2 (RNase Z) for tRNA 3'-end processing. Knockout causes severe cardiomyopathy and premature death in mice. PTCD1 loss impairs mitoribosome biogenesis and activates retrograde mTOR signaling. PTCD1 coding variants are associated with Alzheimer's disease risk (Perks et al., 2018, *Cell Reports*; Fleck et al., 2019, *J Neurosci*).

**RBMX** (RNA-binding motif protein, X-linked) is a nuclear/cytoplasmic RNA-binding protein involved in pre-mRNA splicing, mRNA stability, and transcription regulation.

**Mitochondrial connection:** The strong experimental evidence (0.461) suggests direct physical interaction between PTCD1 and RBMX. PTCD1 processes mitochondrial RNA; RBMX regulates nuclear RNA splicing. RBMX may regulate splicing of PTCD1 or other nuclear-encoded mitochondrial genes, creating a regulatory axis where nuclear RNA processing (RBMX) controls the supply of mitochondrial RNA processing factors (PTCD1). Both proteins share RNA-binding motifs, suggesting potential for shared RNA substrates or regulatory interactions at the mitochondrial–nuclear interface.

---

## 9. MRPS7 – NSDHL (Combined score: 0.485)

**Evidence type:** Experimental (0.402), Textmining (0.102), Coexpression (0.118)

**NSDHL** (NAD(P)-dependent steroid dehydrogenase-like) is an endoplasmic reticulum enzyme in the cholesterol biosynthesis pathway, catalyzing steps in post-squalene cholesterol synthesis. Mutations cause CHILD syndrome and CK syndrome.

**Mitochondrial connection: INDIRECT but potentially significant.** The experimental score (0.402) suggests physical interaction. Mitochondria and ER are physically connected through mitochondria-associated ER membranes (MAMs), where cholesterol and lipid metabolism are coordinated with mitochondrial OXPHOS. NSDHL's role in steroid synthesis may be coordinated with mitochondrial function through: (1) cholesterol/steroid precursor shuttling at MAM contact sites, (2) shared metabolic regulation of the steroid synthesis pathway (which also involves mitochondrial enzymes like CYP11A1), or (3) co-regulation in tissues with high metabolic demands where both OXPHOS and steroidogenesis are active.

---

## 10. MRPS7 – SLC35A2 (Combined score: 0.478)

**Evidence type:** Textmining (0.471)

**SLC35A2** encodes a Golgi UDP-galactose transporter essential for protein glycosylation. Mutations cause congenital disorder of glycosylation type IIm.

**Mitochondrial connection: INDIRECT.** The interaction is primarily supported by textmining. Both proteins function in organellar biology — MRPS7 in mitochondria, SLC35A2 in the Golgi. Connection may reflect: (1) coordinated quality control of glycosylated mitochondrial membrane proteins, (2) shared regulation in cellular growth/proliferation pathways, or (3) co-mention in multi-omics or multi-organelle disease studies.

---

## 11. MRPS7 – UBQLN2 (Combined score: 0.448)

**Evidence type:** Experimental (0.302), Textmining (0.091), Coexpression (0.200)

**UBQLN2** (Ubiquilin-2) is a ubiquitin-like protein involved in protein quality control, linking the ubiquitin-proteasome system with protein degradation. It shuttles ubiquitinated substrates to the proteasome. Mutations cause X-linked ALS/FTD (amyotrophic lateral sclerosis/frontotemporal dementia).

**Mitochondrial connection:** The experimental evidence (0.302) suggests physical interaction. UBQLN2 participates in mitochondrial protein quality control — mitochondrial outer membrane proteins are degraded via the ubiquitin-proteasome system, and ubiquilins facilitate this process. MRPS7, as a mitoribosomal protein, must be imported into mitochondria; misfolded or excess copies may be targeted for proteasomal degradation via UBQLN2. In ALS/FTD (UBQLN2 mutations) and mitochondrial diseases (MRPS7 mutations), both protein quality control and mitochondrial dysfunction co-occur, suggesting functional cross-talk.

---

## 12. MRPS7 – KDM5C (Combined score: 0.437)

**Evidence type:** Textmining (0.138), Coexpression (0.361), Experimental (0.060)

**KDM5C** (lysine demethylase 5C, also JARID1C/SMCX) is an X-linked histone H3K4 demethylase involved in chromatin regulation and transcriptional repression. Mutations cause X-linked intellectual disability (Claes-Jensen type).

**Mitochondrial connection: EPIGENETIC REGULATION.** The strong coexpression (0.361) suggests coordinated regulation. KDM5C may regulate transcription of nuclear-encoded mitochondrial genes, including MRPS7 itself, through H3K4 demethylation at their promoters. Chromatin state modulates the expression of hundreds of nuclear genes encoding mitochondrial proteins. Disruption of this epigenetic regulation (KDM5C mutations → intellectual disability) may partially reflect downstream effects on mitochondrial gene expression and energy metabolism in neurons.

---

## 13. PNPT1 – LAS1L (Combined score: 0.410)

**Evidence type:** Database (0.360), Coexpression (0.116)

**LAS1L** is an X-linked nucleolar endonuclease, a component of the LAS1L–Nol9 complex (with PELP1, TEX10, WDR18, SENP3) required for ITS2 (internal transcribed spacer 2) processing and 28S rRNA maturation — essential for 60S ribosomal subunit biogenesis. Depletion causes loss of 60S subunits, p53-dependent G1 arrest, and cell death (Castle et al., 2012, *J Cell Biol*). LAS1L function requires USP36-mediated SUMOylation at K565 for ITS2 processing (Li et al., 2024, *Cancer Res Commun*).

**Mitochondrial connection: RIBOSOME BIOGENESIS COORDINATION.** This is the only interaction with curated database evidence (0.360), indicating it is documented in pathway databases. PNPT1 is critical for mitochondrial ribosome function (imports RNAs, processes mtRNA); LAS1L is essential for cytoplasmic 60S ribosome biogenesis. The interaction reflects parallel regulation of the two cellular translation systems. Since mitoribosomal proteins require cytoplasmic 60S ribosomes for their own synthesis, LAS1L dysfunction would indirectly impair mitoribosome biogenesis. Both proteins, when disrupted, trigger nucleolar/mitochondrial stress responses converging on p53 activation. This represents a key regulatory node where cytoplasmic and mitochondrial translational capacity are coordinated.

---

## Summary of Functional Themes

| Theme | Interaction Pairs | Strength |
| --- | --- | --- |
| **Direct mitochondrial RNA processing** | GRSF1–HSD17B10 | Strongest — both co-localize in MRGs and participate in RNase P-mediated tRNA maturation |
| **Ribosome biogenesis coordination** | PNPT1–LAS1L, PNPT1–DKC1 | Parallel regulation of mitochondrial and cytoplasmic ribosome production |
| **Translation machinery** | MRPS7–EIF1AX | Mitochondrial and cytoplasmic ribosomal components — highest combined score (0.888) |
| **RNA metabolism** | PTCD1–RBMX, PNPT1–DDX3X, GRSF1–DDX3X | Cross-compartment RNA processing and regulation |
| **Signaling to mitochondria** | GRSF1–RPS6KA3 | MAPK/ERK pathway controlling mitochondrial dynamics linked to mtRNA processing |
| **Protein quality control** | MRPS7–UBQLN2 | Proteasomal degradation of mitochondrial proteins |
| **Epigenetic regulation** | MRPS7–KDM5C | Chromatin-mediated control of nuclear-encoded mitochondrial gene expression |
| **Metabolic coordination** | MRPS7–NSDHL | ER-mitochondria lipid/steroid metabolism at MAM contact sites |
| **Neuronal co-regulation** | MRPS7–KCND1 | Ion channel activity coupled to mitochondrial energy metabolism |
| **Organellar coordination** | MRPS7–SLC35A2, PNPT1–LAS1L | Multi-organelle functional integration |

## Evidence Type Summary

| Evidence Type | Interactions |
| --- | --- |
| **Strong experimental (>0.4)** | MRPS7–EIF1AX (0.581), GRSF1–RPS6KA3 (0.626), GRSF1–HSD17B10 (0.503), PTCD1–RBMX (0.461), MRPS7–NSDHL (0.402) |
| **Moderate experimental (0.2–0.4)** | MRPS7–UBQLN2 (0.302), MRPS7–KCND1 (0.289), PNPT1–DDX3X (0.230) |
| **Coexpression** | PNPT1–DKC1 (0.411), MRPS7–KDM5C (0.361), PNPT1–DDX3X (0.303), MRPS7–KCND1 (0.295) |
| **Database curated** | PNPT1–LAS1L (0.360) — unique |
| **Textmining** | GRSF1–DDX3X (0.490), MRPS7–SLC35A2 (0.471), PNPT1–DKC1 (0.268) |

## Key Biological Insight

The strongest mitochondrial connection is **GRSF1–HSD17B10**: both are core components of mitochondrial RNA processing machinery, physically co-localize in mitochondrial RNA granules, and directly participate in RNase P-mediated tRNA maturation. This represents a bona fide mitochondrial protein complex interaction with direct functional significance for the "tRNA punctuation model" of mitochondrial transcript processing.

The highest-scoring interaction overall is **MRPS7–EIF1AX** (0.888), reflecting the fundamental biological coupling between cytoplasmic and mitochondrial translation systems — cytoplasmic ribosomes (requiring EIF1AX) translate the nuclear-encoded components of mitoribosomes (including MRPS7).


| # | Query Gene | X-linked Gene | List(s) | Combined Score | Experimental | Textmining | Coexpression | Database | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | MRPS7 | EIF1AX | Hum-nean | 0.888 | 0.581 | 0.240 | 0.656 | 0.000 | High |
| 2 | GRSF1 | RPS6KA3 | Hum-nean | 0.629 | 0.626 | 0.041 | 0.049 | 0.000 | Medium |
| 3 | GRSF1 | HSD17B10 | pure hamadryas | 0.612 | 0.503 | 0.246 | 0.049 | 0.000 | Medium |
| 4 | PNPT1 | DKC1 | hybridDEG | 0.579 | 0.000 | 0.268 | 0.411 | 0.000 | Medium |
| 5 | GRSF1 | DDX3X | cDEG | 0.510 | 0.071 | 0.490 | 0.049 | 0.000 | Medium |
| 6 | PNPT1 | DDX3X | cDEG | 0.506 | 0.230 | 0.141 | 0.303 | 0.000 | Medium |
| 7 | MRPS7 | KCND1 | pure hamadryas | 0.503 | 0.289 | 0.089 | 0.295 | 0.000 | Medium |
| 8 | PTCD1 | RBMX | hybridDEG | 0.500 | 0.461 | 0.102 | 0.049 | 0.000 | Medium |
| 9 | MRPS7 | NSDHL | hybridDEG | 0.485 | 0.402 | 0.102 | 0.118 | 0.000 | Medium |
| 10 | MRPS7 | SLC35A2 | pure hamadryas | 0.478 | 0.000 | 0.471 | 0.055 | 0.000 | Medium |
| 11 | MRPS7 | UBQLN2 | pure hamadryas | 0.448 | 0.302 | 0.091 | 0.200 | 0.000 | Medium |
| 12 | MRPS7 | KDM5C | pure hamadryas | 0.437 | 0.060 | 0.138 | 0.361 | 0.000 | Medium |
| 13 | PNPT1 | LAS1L | hybridDEG | 0.410 | 0.000 | 0.000 | 0.116 | 0.360 | Medium |