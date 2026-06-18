# Human-specific loss of TTLL10 polyglycylation as a candidate suppressor of an X–Y conflict in the male germline

*A self-contained synthesis of hypotheses, cell-biological background, evidence, logic, gaps, and proposed experiments. Inline citations are reference-style links resolving to full citations and URLs under §7.*

---

## 0. Status and provenance note

This document keeps three tiers of information distinct:

1. **Published evidence** — cited inline with reference-style links to full citations + URLs (§7). These are real papers located and read during the analysis, with bibliographic details verified against the sources.
2. **Unpublished collaborator data** — flagged **[Collaborator, unpubl.]**. Personal-communication results (archaic genotypes; zebrafish knockouts; human and primate single-cell/single-nucleus transcriptomics). Not independently verifiable here; preliminary.
3. **Hypotheses and inference** — labelled as such. The central proposals are novel; no published work demonstrates a polyglycylation-dependent meiotic-drive system.

"Polyglycylation" denotes addition of polyglycine side chains to tubulin (and certain non-tubulin substrates), not glycosylation.

---

## 1. Summary

The elongating tubulin polyglycylase **TTLL10** is enzymatically inactivated in modern humans but active in other mammals examined, including mouse and rhesus macaque ([Rogowski 2009][rogowski2009]). Polyglycylation concentrates on axonemes (cilia, sperm flagella) and tunes microtubule-based transport: recent biochemistry shows it enhances kinesin-2 while suppressing kinesin-1 ([Mullick 2026][mullick2026]). The male germline is a syncytium in which haploid spermatids share gene products through intercellular bridges, normally equalising X- and Y-bearing cells ([Braun 1989][braun1989]); microtubule- and motor-dependent transport moves ribonucleoprotein cargoes across these bridges ([Ventelä 2003][ventela2003]), with the testis kinesin-2 **KIF17b** carrying CREM-regulated mRNAs and chromatoid-body components ([Chennathukuzhi 2003][chenna2003]; [Kotaja 2006][kotaja2006]). Critically, *retention* of products in the syncytium (escape from sharing) is a demonstrated route to non-Mendelian transmission ([Véron 2009][veron2009]; [Bhutani 2021][bhutani2021]).

The central hypothesis: **functional polyglycylation participates in a sex-linked genomic-conflict system in the male germline, and its human-specific loss was an adaptive suppression of that conflict.** Two non-exclusive mechanistic models are developed — (i) polyglycylation gates *selective, directional* transport across the bridges connecting X- and Y-bearing spermatids (a rectifier whose loss restores symmetric sharing); and (ii) differential sex-chromosome repeat content reshapes the autosomal 3-D genome asymmetrically via a heterochromatin sink. A validated mammalian precedent for postmeiotic X–Y conflict exists (the *Slx/Slxl1* vs *Sly* system; [Cocquet 2009][cocquet2009]; [Cocquet 2012][cocquet2012]), which acts through **differential sperm motility** ([Rathje 2019][rathje2019]); and a validated precedent for a Y-chromosome heterochromatin sink reshaping genome-wide chromatin exists in *Drosophila* ([Lemos 2008][lemos2008]; [Lemos 2010][lemos2010]; [Brown 2020][brown2020]). Preliminary collaborator data — archaic functionality of TTLL10, a maternally-rescuable paternal zebrafish phenotype, and 27 X-linked transcripts that escape syncytial equalisation in human spermatids — are consistent with the framework but do not yet test it.

---

## 2. Cell-biological background

### 2.1 Tubulin polyglycylation and the TTLL enzymes

Glycylation and glutamylation add side chains to glutamates in the disordered C-terminal tails (CTTs) of α/β-tubulin. Glycylases are members of the tubulin-tyrosine-ligase-like (TTLL) family: **TTLL3 and TTLL8 are initiases** (first, branch-point glycine) and **TTLL10 is the elongase** ([Rogowski 2009][rogowski2009]). TTLL10 is substrate-dependent — it requires pre-existing monoglycines for high-affinity microtubule binding, elongates only from them, is stimulated by glutamylation, and is self-limiting as chains grow ([Cummings 2024][cummings2024]). Because glycylation and glutamylation compete for the same CTT glutamates, glycylation also acts indirectly by neutralising the charge that glutamylation-readers respond to.

TTLL10 also has a **non-tubulin substrate**: it polyglycylates **nucleosome assembly protein 1 (NAP1)**, a ~60-kDa histone chaperone accumulating in elongating spermatids, at C-terminal Glu359/360 ([Ikegami 2008][ikegami2008]). This places TTLL10 at the spermatid chromatin-remodelling step (histone-to-protamine transition), not only at the flagellum.

### 2.2 The human-specific loss of TTLL10

Human TTLL10 is transcribed but catalytically dead: two substitutions in the conserved core TTL domain inactivate it, and reverting *both* (not either alone) restores activity, so each lesion is independently sufficient ([Rogowski 2009][rogowski2009]). Mouse and rhesus TTLL10 are active; the inactivating mutations are absent from great-ape genomes, indicating a **human-specific loss** ([Rogowski 2009][rogowski2009]). Functionally, human sperm lack the long polyglycine chains seen in mouse and rhesus sperm and are shifted to monoglycylation — i.e., humans retain initiation (TTLL3/8) but lost **chain elongation** ([Rogowski 2009][rogowski2009]). One inactivating site is polymorphic with different African/European frequencies ([Rogowski 2009][rogowski2009]); §5 explains why this is most likely neutral variation on an already-inactivated background.

> **[Collaborator, unpubl.]** Neanderthal and Denisovan TTLL10 are reportedly *functional*, dating the inactivation to the modern-human lineage (<~600 kya). The most selection-relevant fact in the dossier, and checkable from archaic genomes.

### 2.3 The spermatid syncytium and haploid-product sharing

Haploid spermatids remain connected by **intercellular cytoplasmic bridges**, so products of genes present in only half the spermatids (notably sex-linked genes) are shared, rendering genetically haploid spermatids **phenotypically diploid** ([Braun 1989][braun1989]). This sharing is the principal natural suppressor of post-meiotic drive — unless a product (or its effect) is restricted to its cell of origin (*cis*). That escape route is not hypothetical: the *t*-complex responder *Tcr* (and its wild-type allele *Smok1*) is post-meiotically expressed and **retained in the haploid sperm that made it**, producing phenotypic differences between sibling sperm and non-Mendelian transmission ([Véron 2009][veron2009]); single-cell work shows **widespread haploid-biased gene expression** that enables sperm-level selection ([Bhutani 2021][bhutani2021]).

### 2.4 Microtubule-based transport across the bridges

Bridge transport is real, selective, and motor-driven: microtubule inhibitors abolish organelle movement through the bridges and disassemble the chromatoid body, only ~28% of granules entering a bridge cross into the neighbour, and granule speed drops during passage — the bridge is a selective filter, not a free pore ([Ventelä 2003][ventela2003]). The **chromatoid body** (carrying piRNA/Argonaute machinery and mRNAs) shuttles between spermatids in a microtubule-dependent way ([Ventelä 2003][ventela2003]; [Kotaja 2006][kotaja2006]). The relevant motor, the testis kinesin-2 **KIF17b**, is the motor component of a TB-RBP/Translin ribonucleoprotein complex transporting specific CREM-regulated mRNAs ([Chennathukuzhi 2003][chenna2003]); it concentrates in the chromatoid body and interacts with the PIWI protein MIWI, enabling microtubule-dependent chromatoid-body mobility ([Kotaja 2006][kotaja2006]). KIF17b also shuttles the coactivator ACT, but that function is microtubule-independent and PKA-mediated ([Macho 2002][macho2002]; [Kotaja 2005][kotaja2005]) — so it is *not* a candidate for glycylation gating. Kinesin-2 is thus central to haploid mRNA transport — the channel through which X- and Y-bearing spermatids would have to share transcripts to remain equivalent.

### 2.5 Glycylation and motor selectivity

In vitro reconstitution with defined glycylated tubulin shows **glycylation enhances kinesin-2 motility and reduces kinesin-1 motility/binding**, with kinesin-2 velocity rising with glycylation level, and suppresses the severing/depolymerising activities of spastin and MCAK; the authors note the only prior evidence of glycylation regulating motors was control of axonemal dyneins in sperm and antagonism of katanin ([Mullick 2026][mullick2026]). The mechanism is electrostatic (neutral glycines neutralise the CTT charge kinesin-1 depends on). Because KIF17b is a kinesin-2, polyglycylation is predicted to *favour* KIF17b-dependent cargo movement.

### 2.6 Postmeiotic sex-chromosome biology and the *Slx/Sly* precedent

After meiotic sex chromosome inactivation, the sex chromosomes remain largely repressed in round spermatids (postmeiotic sex chromatin, PMSC); a subset of (often amplified) genes escape and are expressed postmeiotically. The validated mammalian X–Y conflict is the mouse **Slx/Slxl1 (X) vs Sly (Y)** system: multicopy genes (~50–100 copies each) with antagonistic effects on sex-chromosome expression in spermatids via PMSC, whose imbalance distorts offspring sex ratio and impairs fertility ([Cocquet 2009][cocquet2009]; [Cocquet 2012][cocquet2012]). SLY drives the epigenetic repression of postmeiotic sex chromatin, silencing X- and Y-linked spermatid genes including its own X homologs *Slx/Slxl1* ([Cocquet 2009][cocquet2009]); SLY1 itself interacts with the histone acetyltransferase KAT5/TIP60 ([Reynard 2009][reynard2009]). Decisively, the drive is executed through **differential sperm motility**: in Yq-deleted males the sex-ratio skew is due to relatively greater motility of X-bearing sperm, with more severe morphological distortion of Y-bearing sperm ([Rathje 2019][rathje2019]). This establishes both that the syncytium is leaky enough for X/Y phenotypic divergence and that the flagellum is the effector.

### 2.7 The heterochromatin-sink model

In *Drosophila*, the gene-poor, repeat-rich Y influences expression of hundreds–thousands of autosomal and X-linked genes ("Y-linked regulatory variation", YRV) ([Lemos 2008][lemos2008]; [Lemos 2010][lemos2010]). The favoured mechanism is a **heterochromatin sink**: the Y's repetitive DNA sequesters limiting heterochromatin components (HP1, H3K9 methyltransferases), redistributing them genome-wide, dose-dependently on the amount of Y heterochromatin ([Brown 2020][brown2020]). This is consistent with classic position-effect-variegation genetics (adding heterochromatin suppresses silencing elsewhere; HP1 dosage tunes silencing) ([Elgin & Reuter 2013][elgin2013]; [Brown 2020][brown2020]). A meta-analysis of YRV studies concluded that Y-linked variation modifies how the genome is distributed across chromatin compartments ([Sackton & Hartl 2013][sackton2013]); whether this extends to the context-restricted genes of spermatogenesis is, to my knowledge, untested.

---

## 3. The hypotheses

**H1 — Adaptive loss.** The human-specific inactivation of TTLL10 was positively selected because eliminating long-chain polyglycylation short-circuited a pathway co-opted by a sex-linked drive system. The relevant change is loss of *elongation* (chain length), not of glycylation per se.

**H2 — Bridge rectifier.** Polyglycylation gates selective, directional transport of specific cargoes across the bridges connecting X- and Y-bearing spermatids (via differential effects on kinesin-2/KIF17b vs kinesin-1 and axonemal dynein). Long-chain glycylation sharpens this rectifier; TTLL10 loss flattens the chain-length range and de-rectifies the bridge toward symmetric sharing.

**H3 — The cis-restricted asymmetric factor.** A rectifier amplifies but cannot create asymmetry; a symmetry-breaker must remain restricted to its chromosome of origin. Candidate classes (§4.3): ampliconic postmeiotically-expressed sex-linked families; chromatin modifiers/readers acting on sex chromatin; RNA-binding/anchoring factors; perinuclear/nuclear-anchored proteins; and the chromosome's own heterochromatin.

**H4 — Heterochromatin-sink / compartment asymmetry.** Differential repeat content between X- and Y-bearing nuclei differentially sequesters limiting heterochromatin factors, shifting autosomal A/B-compartment borders and asymmetrically derepressing border-proximal genes. Because DNA cannot cross the bridge and factor competition is intranuclear, this generates a *cis* asymmetry the syncytium cannot equalise.

**H5 — Post-fertilisation modification/rescue arm.** Independently of intra-testicular drive, TTLL10/NAP1-dependent processing may impose a paternal-chromatin state requiring matching maternal factors post-fertilisation — a modification/rescue (toxin–antidote-like) architecture.

---

## 4. Evidence and inferential logic

### 4.1 The organising problem: cis-restriction in a syncytium

Every model must solve the problem created by sharing ([Braun 1989][braun1989]): diffusible products equalise across bridges, suppressing drive unless an asymmetry is *cis*-restricted. This is the spine of the logic, and it is solved in nature: the *t*-responder is retained cell-autonomously and drives non-Mendelian transmission ([Véron 2009][veron2009]), and haploid-biased expression is genome-wide ([Bhutani 2021][bhutani2021]).

- **H2 (rectifier)** makes the *transport step* selective: the bridge is already a ~28%-efficient filter ([Ventelä 2003][ventela2003]), and glycylation can bias which motor/cargo/direction operates ([Mullick 2026][mullick2026]). But it requires H3.
- **H3 (cis factor)** supplies the symmetry-breaker; most candidate gene products are partly diffusible and vulnerable to sharing — except those retained like *Tcr* ([Véron 2009][veron2009]).
- **H4 (sink)** is the strongest answer: the asymmetry generator is the chromosome's own DNA (unshareable), and factor competition is *intranuclear* (each nucleus is separate), so the effect is nucleus-autonomous regardless of cytoplasmic sharing. Its vulnerability is kinetic (§5).

### 4.2 Published support, by component

- TTLL10 is human-specifically inactivated, losing chain elongation while retaining monoglycylation ([Rogowski 2009][rogowski2009]).
- TTLL10 acts on chromatin via NAP1 in elongating spermatids ([Ikegami 2008][ikegami2008]).
- Glycylation enhances kinesin-2, suppresses kinesin-1 and severing ([Mullick 2026][mullick2026]); elongation enzymology is self-limiting and glutamylation-stimulated ([Cummings 2024][cummings2024]).
- Spermatids share products through bridges (the drive suppressor) ([Braun 1989][braun1989]), but retention enables drive ([Véron 2009][veron2009]; [Bhutani 2021][bhutani2021]).
- Bridge transport is microtubule/motor-dependent and selective ([Ventelä 2003][ventela2003]).
- KIF17b (kinesin-2) carries CREM-regulated mRNAs (TB-RBP) and chromatoid-body/MIWI cargo, framed around X/Y mRNA sharing ([Chennathukuzhi 2003][chenna2003]; [Kotaja 2006][kotaja2006]).
- Postmeiotic X–Y conflict exists ([Cocquet 2009][cocquet2009]; [Cocquet 2012][cocquet2012]), and acts through differential sperm motility ([Rathje 2019][rathje2019]).
- A Y-chromosome heterochromatin sink reshapes genome-wide chromatin, dose-dependently ([Lemos 2008][lemos2008]; [Lemos 2010][lemos2010]; [Brown 2020][brown2020]; [Elgin & Reuter 2013][elgin2013]).
- An X-linked flagellar gene in the candidate set (AKAP4) is the most abundant fibrous-sheath protein, transcribed only postmeiotically, processed from a pro-protein, and essential for motility (knockout abolishes progressive motility without reducing sperm number) ([Miki 2002][miki2002]).

### 4.3 Candidate cis factors (H3), ranked by escape from sharing

1. **Ampliconic postmeiotically-expressed multicopy families** (validated template *Slx/Sly*; [Cocquet 2009][cocquet2009]; [Cocquet 2012][cocquet2012]). Human/primate examples: Y — RBMY, DAZ, CDY, TSPY, BPY2, PRY, HSFY; X — cancer-testis amplicons (MAGE, GAGE, SSX, SPANX, CT45/47, XAGE, NXF2).
2. **Chromatin modifiers/readers on sex chromatin** (intrinsically cis; overlaps H4). Standout: **CDY** (Y, chromodomain + histone-acetyltransferase activity at the histone-to-protamine step).
3. **RNA-binding/anchoring factors** (best fit to H2 cargo logic): RBMY, DAZ (Y); NXF2 (X) — an RBP nucleating a local RNP keeps an mRNA from equilibrating across the bridge, as for retained *Tcr* transcripts ([Véron 2009][veron2009]).
4. **Perinuclear/nuclear-anchored proteins**: SPANX (X).
5. **The chromosome's own heterochromatin/satellite DNA** (H4): non-genic, automatically cis; the human Yq12 block and its haplogroup-differential content are the natural quantitative variable.

### 4.4 Collaborator (unpublished) data and bearing

> **[Collaborator, unpubl.] Archaic functionality.** Loss is recent, modern-human-specific. *Bearing:* strengthens H1; datable from ancient DNA.

> **[Collaborator, unpubl.] Zebrafish knockouts.** Male-KO × WT-female reduces fertilisation; male-KO × KO-female is worse → paternal defect (?DNA damage) partially rescued by a maternal functional copy. *Bearing:* supports **H5** (modification/rescue architecture), routing to the NAP1/chromatin branch ([Ikegami 2008][ikegami2008]). *Caveat:* zebrafish lack heteromorphic sex chromosomes, so this tests a paternal-chromatin/fertility axis, **not** H2; and it shows TTLL10 is fertility-beneficial, so the human loss requires a benefit (conflict suppression) exceeding a fertility cost.

> **[Collaborator, unpubl.] Human spermatid scRNA (cytoplasmic).** With X/Y classification valid and non-circular, **27 of ~750 X-expressed genes show higher cytoplasmic mRNA in X-bearing than Y-bearing cells**; the other ~720 equalise. The 27 are functionally enriched for the flagellar/transport apparatus (AKAP4, CFAP47, RPGR, OCRL, OFD1, DYNLT3, MAP7D3) plus chromatin (HMGB3), RNA-handling (DDX3X, UPF3B, NCBP2L, FTSJ1) and ampliconic CT genes (SPANXN5, VCX2). *Bearing:* the key result. Passive leaky sharing predicts graded X-bias across all postmeiotic X genes; instead the bulk equalise and only 27 escape — selective non-sharing of a functionally coherent module, as H2 predicts (rectified KIF17b/TB-RBP cargo). Because a Y-bearing cell has no X template, the X-vs-Y difference is *entirely* a measure of how little of a transcript crosses the bridge — a transport readout. The clean, X-specific 27-gene shape argues *against* a diffuse autosome-wide sink as the proximal cause of *this* signal (though the sink could act separately/upstream). This sits alongside published precedent that retention enables drive ([Véron 2009][veron2009]) and that haploid-biased expression is widespread ([Bhutani 2021][bhutani2021]).

> **[Collaborator, unpubl.] Primate data, nuclear mRNA only.** *Caveat:* the human "27" is a **cytoplasmic** sharing phenomenon; the nucleus is never shared, so **nuclear** mRNA reports transcription/retention and shows X>Y for essentially all postmeiotic X genes regardless of sharing. The compartments are not directly comparable, and the cross-species TTLL10 test needs **cytoplasmic/whole-cell** data from a TTLL10-active primate (missing). Primate nuclear data is still useful for (a) confirming the 27 are transcribed in other primates, and (b) — paired with a **human nuclear** fraction — discriminating cytoplasmic transport-gating (H2) from nuclear detention (glycylation-independent; would decouple H1 from this phenotype).

### 4.5 How the pieces fit (one falsifiable storyline)

A *cis* asymmetry source (H3/H4 — most robustly the heterochromatin content itself) sets a per-nucleus difference between X- and Y-bearing spermatids. A polyglycylation-tuned bridge rectifier (H2) converts/amplifies it into asymmetric delivery of a cargo module — plausibly KIF17b/TB-RBP mRNAs including stored, late-translated flagellar transcripts such as AKAP4 ([Chennathukuzhi 2003][chenna2003]; [Miki 2002][miki2002]) — surfacing as the documented drive readout, differential sperm motility ([Rathje 2019][rathje2019]). Human loss of the elongase ([Rogowski 2009][rogowski2009]) caps the rectifier's gain and is the candidate adaptive suppressor (H1). A parallel NAP1/chromatin arm ([Ikegami 2008][ikegami2008]) may impose a maternally-rescued paternal modification (H5), as the zebrafish phenotype suggests.

---

## 5. Gaps, caveats, alternatives

1. **No precedent for glycylation-dependent drive.** The strongest non-adaptive null for H1 is relaxed constraint; the two-hit inactivation is compatible with it.
2. **The polymorphic site is probably uninformative for selection.** Because either lesion alone inactivates ([Rogowski 2009][rogowski2009]), a segregating second site likely sits on a dead background and varies by drift. The decisive question is which lesion fixed first and whether any *doubly-ancestral, functional* TTLL10 haplotype still segregates.
3. **mRNA ≠ protein ≠ function.** Spermatozoa are largely translationally quiescent and store transcripts for the oocyte; the motility apparatus assembles earlier from shared pools. The mitigating logic is that genes transcribed while bridges are open but translated/assembled after individualisation (e.g., pro-AKAP4) ([Miki 2002][miki2002]) can convert a retained-mRNA asymmetry into a phenotype — as the cis-action of *Tcr/Smok* in late spermatids illustrates ([Véron 2009][veron2009]) — but this must be shown.
4. **Timing/compartment of the 27-gene signal** must be resolved: round spermatids (potentially functional) vs late spermatozoa (footprint).
5. **The sink's kinetic vulnerability (H4).** Nucleus-autonomy requires factor sequestration to be "sticky" relative to inter-nuclear exchange; fast re-equilibration of the shared pool would shift both siblings equally and erase the asymmetry. Modellable.
6. **Human is TTLL10-null yet shows 27 escapees.** If the rectifier were strictly elongation-dependent, humans should be weaker than a TTLL10-active species. Persistence implies monoglycylation (TTLL3/8) suffices, the escape is glycylation-independent, or 27 is a de-rectified residual. Only cytoplasmic primate data can adjudicate.
7. **H5 vs H2 are different conflict stages** (post-fertilisation vs intra-testicular) and should not be conflated; zebrafish cannot test H2.
8. **Assignment/normalisation.** Cross-species or autosomal extensions need independent (Y-linked/genotype-based) cell assignment and control of snRNA gene-length/nascent biases when comparing nuclear vs cytoplasmic sets.
9. **Gene annotations** for the candidate list are of variable strength; only AKAP4 is anchored to a knockout here ([Miki 2002][miki2002]).

---

## 6. Proposed experiments (prioritised)

**Tier 1 — reanalysis / cheap additions**

1. **Human nuclear fraction** paired with existing cytoplasmic data: per-gene nuclear-vs-cytoplasmic asymmetry isolates *sharing* from *transcription*; validates the 27 and reveals cytoplasmic (H2) vs nuclear-detention escape.
2. **27-vs-720 feature comparison**: 3′UTR/TB-RBP-Translin motifs and chromatoid-body/TB-RBP cargo overlap ([Chennathukuzhi 2003][chenna2003]; [Kotaja 2006][kotaja2006]); formal flagellar-enrichment test; expression-level/pseudotime matching to exclude kinetics; localisation; genomic clustering.
3. **Archaic genotyping** of the two inactivating sites to date the loss, fix lesion order, and test for a surviving doubly-ancestral haplotype.
4. **Selection scan** at TTLL10 (1p36.33) for the fixed lesion (diversity / ancient-DNA trajectory), controlling for the subtelomeric, high-recombination context.
5. **Stage assignment** of the 27-gene asymmetry along pseudotime (functional vs relic).

**Tier 2 — new sequencing**

6. **Whole-cell/cytoplasmic scRNA from a TTLL10-active primate** (keystone): does the elongase-intact species show a broader/sharper X-escapee set than the human 27? Tests H1+H2.
7. **Sorted/single-cell Hi-C on X- vs Y-bearing round spermatids** (H4): predict weaker autosomal B-compartments / shifted A/B borders in Y-bearing cells. The challenge is X/Y assignment, not the Hi-C.
8. **Autosomal X-cell-vs-Y-cell contrast**, border-stratified, in existing data: a near-null argues the sink contributes little here; enrichment of derepressed border-proximal autosomal genes in Y-bearing cells supports H4.

**Tier 3 — mechanism / functional**

9. **Glycylation localisation in spermatids** (polyG vs TAP952) to manchette/bridge/chromatoid-body microtubules — the make-or-break premise for H2.
10. **Transport assay under glycylase perturbation** (TTLL3/8/10) measuring bridge-crossing of candidate cargoes.
11. **Zebrafish phenotyping to localise the H5 defect**: sperm-aster/centriolar microtubules vs γH2AX/protamine ratios; what the maternal rescue acts on.
12. **Quantitative sink modelling**: is the Yq12 satellite binding-site count sufficient to deplete nuclear HP1/SUV39H pools in the sticky-kinetics regime of §5(5)?
13. **Transmission/sex-ratio test** if a segregating functional/ancestral allele is found.

**Connection to the broader programme:** experiments 7/8 (germline A/B-compartment asymmetry under differential Y heterochromatin) use the same engine proposed for haplogroup I-vs-R effects on autosomal compartments in neurons; overlapping border-class loci across germline and brain would be a strong cross-tissue signature.

---

## 7. References

[rogowski2009]: https://www.cell.com/fulltext/S0092-8674(09)00577-7 "Rogowski K, Juge F, van Dijk J, Wloga D, Strub J-M, Levilliers N, Thomas D, Bré M-H, Van Dorsselaer A, Gaertig J, Janke C (2009). Evolutionary divergence of enzymatic mechanisms for posttranslational polyglycylation. Cell 137:1076–1087."

[ikegami2008]: https://febs.onlinelibrary.wiley.com/doi/abs/10.1016/j.febslet.2008.02.079 "Ikegami K, Horigome D, Mukai M, Livnat I, MacGregor GR, Setou M (2008). TTLL10 is a protein polyglycylase that can modify nucleosome assembly protein 1. FEBS Lett 582:1129–1134."

[cummings2024]: https://www.biorxiv.org/content/10.1101/2024.03.31.587457v1 "Cummings SW, Li Y, Spector JO, Kim C, Roll-Mecak A (2024). The TTLL10 polyglycylase is stimulated by tubulin glutamylation and inhibited by polyglycylation. bioRxiv 2024.03.31.587457 (eLife reviewed preprint 98040). doi:10.1101/2024.03.31.587457."

[mullick2026]: https://www.biorxiv.org/content/10.64898/2026.03.26.714406v1.full "Mullick S, Suresh Kumar C, Dey S, Koushik PB, Ganie R, Mahanty S, Sirajuddin M, Gadadhar S (2026). Tubulin glycylation regulates microtubule-protein interactions that are key for ciliary stability and trafficking. bioRxiv 2026.03.26.714406. doi:10.64898/2026.03.26.714406."

[braun1989]: https://www.nature.com/articles/337373a0 "Braun RE, Behringer RR, Peschon JJ, Brinster RL, Palmiter RD (1989). Genetically haploid spermatids are phenotypically diploid. Nature 337:373–376."

[veron2009]: https://genesdev.cshlp.org/content/23/23/2705 "Véron N, Bauer H, Weiße AY, Lüder G, Werber M, Herrmann BG (2009). Retention of gene products in syncytial spermatids promotes non-Mendelian inheritance as revealed by the t complex responder. Genes Dev 23:2705–2710."

[bhutani2021]: https://www.science.org/doi/10.1126/science.abb1723 "Bhutani K, Stansifer K, Ticau S, Bojic L, Villani A-C, Slisz J, Cremers CM, Roy C, Donovan J, Fiske B, Friedman RC (2021). Widespread haploid-biased gene expression enables sperm-level natural selection. Science 371:eabb1723. doi:10.1126/science.abb1723."

[ventela2003]: https://www.molbiolcell.org/doi/10.1091/mbc.e02-10-0647 "Ventelä S, Toppari J, Parvinen M (2003). Intercellular organelle traffic through cytoplasmic bridges in early spermatids of the rat: mechanisms of haploid gene product sharing. Mol Biol Cell 14:2768–2780."

[chenna2003]: https://www.pnas.org/doi/10.1073/pnas.2536695100 "Chennathukuzhi V, Morales CR, El-Alfy M, Hecht NB (2003). The kinesin KIF17b and RNA-binding protein TB-RBP transport specific CREM-regulated mRNAs in male germ cells. Proc Natl Acad Sci USA 100:15566–15571."

[kotaja2006]: https://journals.biologists.com/jcs/article/119/13/2819/28936/ "Kotaja N, Lin H, Parvinen M, Sassone-Corsi P (2006). Interplay of PIWI/Argonaute protein MIWI and kinesin KIF17b in chromatoid bodies of male germ cells. J Cell Sci 119:2819–2825."

[macho2002]: https://pubmed.ncbi.nlm.nih.gov/12493914/ "Macho B, Brancorsini S, Fimia GM, Setou M, Hirokawa N, Sassone-Corsi P (2002). CREM-dependent transcription in male germ cells controlled by a kinesin. Science 298:2388–2390."

[kotaja2005]: https://doi.org/10.1074/jbc.M505971200 "Kotaja N, Macho B, Sassone-Corsi P (2005). Microtubule-independent and PKA-mediated function of kinesin KIF17b controls the intracellular transport of ACT (activator of CREM in testis). J Biol Chem 280:31739–31745. doi:10.1074/jbc.M505971200."

[cocquet2009]: https://doi.org/10.1371/journal.pbio.1000244 "Cocquet J, Ellis PJI, Yamauchi Y, Mahadevaiah SK, Affara NA, Ward MA, Burgoyne PS (2009). The multicopy gene Sly represses the sex chromosomes in the male mouse germline after meiosis. PLoS Biol 7:e1000244."

[cocquet2012]: https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1002900 "Cocquet J, Ellis PJI, Mahadevaiah SK, Affara NA, Vaiman D, Burgoyne PS (2012). A genetic basis for a postmeiotic X versus Y chromosome intragenomic conflict in the mouse. PLoS Genet 8:e1002900."

[reynard2009]: https://academic.oup.com/biolreprod/article/81/2/250/2557679 "Reynard LN, Cocquet J, Burgoyne PS (2009). The multi-copy mouse gene Sycp3-like Y-linked (Sly) encodes an abundant spermatid protein that interacts with a histone acetyltransferase and an acrosomal protein. Biol Reprod 81:250–257. doi:10.1095/biolreprod.108.075382."

[rathje2019]: https://www.cell.com/current-biology/fulltext/S0960-9822(19)31193-5 "Rathje CC, Johnson EEP, Drage D, Patinioti C, Silvestri G, Affara NA, Ialy-Radio C, Cocquet J, Skinner BM, Ellis PJI (2019). Differential sperm motility mediates the sex ratio drive shaping mouse sex chromosome evolution. Curr Biol 29:3692–3698. doi:10.1016/j.cub.2019.09.031."

[lemos2008]: https://www.science.org/doi/10.1126/science.1148861 "Lemos B, Araripe LO, Hartl DL (2008). Polymorphic Y chromosomes harbor cryptic variation with manifold functional consequences. Science 319:91–93. doi:10.1126/science.1148861."

[lemos2010]: https://www.pnas.org/doi/10.1073/pnas.1010383107 "Lemos B, Branco AT, Hartl DL (2010). Epigenetic effects of polymorphic Y chromosomes modulate chromatin components, immune response, and sexual conflict. Proc Natl Acad Sci USA 107:15826–15831."

[brown2020]: https://academic.oup.com/mbe/article/37/10/2808/5811572 "Brown EJ, Nguyen AH, Bachtrog D (2020). The Drosophila Y chromosome affects heterochromatin integrity genome-wide. Mol Biol Evol 37:2808–2824."

[elgin2013]: https://cshperspectives.cshlp.org/content/5/8/a017780.full "Elgin SCR, Reuter G (2013). Position-effect variegation, heterochromatin formation, and gene silencing in Drosophila. Cold Spring Harb Perspect Biol 5:a017780."

[sackton2013]: https://academic.oup.com/gbe/article/5/1/255/732904 "Sackton TB, Hartl DL (2013). Meta-analysis reveals that genes regulated by the Y chromosome in Drosophila melanogaster are preferentially localized to repressive chromatin. Genome Biol Evol 5(1):255."

[miki2002]: https://www.sciencedirect.com/science/article/pii/S0012160602907281 "Miki K, Willis WD, Brown PR, Goulding EH, Fulcher KD, Eddy EM (2002). Targeted disruption of the Akap4 gene causes defects in sperm flagellum and motility. Dev Biol 248:331–342."

*Classic position-effect-variegation primary sources (Dimitri & Pisano 1989, Genetics 122:793–800; Gatti & Pimpinelli 1992, Annu Rev Genet 26:239–275) are covered by the Elgin & Reuter (2013) and Brown et al. (2020) entries above. Foundational topics cited in passing (MSCI/PMSC; intercellular-bridge structure/TEX14; cytoplasmic incompatibility as a mod/resc analogy) should have primary citations added before formal use.*