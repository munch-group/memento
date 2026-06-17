# Human-specific loss of TTLL10 polyglycylation as a candidate suppressor of an X–Y conflict in the male germline

*A self-contained synthesis of hypotheses, cell-biological background, evidence, logic, gaps, and proposed experiments.*

---

## 0. Status and provenance note

This document assembles three tiers of information, kept deliberately distinct:

1. **Published evidence** — cited inline in (Author, Year) form, with a reference list in §7. These citations were located and read during the analysis that produced this document. They are real papers, but volume/page details for a minority are reconstructed and flagged "[verify]"; confirm against the originals before any formal use.
2. **Unpublished collaborator data** — flagged inline as **[Collaborator, unpubl.]**. These are personal-communication results (archaic genotypes; zebrafish knockouts; human and primate single-cell/single-nucleus transcriptomics). They are not independently verifiable here and should be treated as preliminary.
3. **Hypotheses and inference** — clearly labelled as such. The central proposals are novel and speculative; no published work demonstrates a polyglycylation-dependent meiotic-drive system.

Throughout, "polyglycylation" denotes the addition of polyglycine side chains to the C-terminal tails of tubulin (and certain non-tubulin substrates), not glycosylation.

---

## 1. Summary

The elongating tubulin polyglycylase **TTLL10** is enzymatically inactivated in modern humans but active in other mammals examined, including mouse and rhesus macaque (Rogowski et al., 2009). Polyglycylation is concentrated on axonemes (cilia and sperm flagella) and regulates microtubule-based transport and stability; recent biochemistry shows it differentially tunes motor proteins, enhancing kinesin-2 while suppressing kinesin-1 (Mullick et al., 2026, preprint). The male germline is a syncytium in which haploid spermatids share gene products through intercellular bridges, normally equalising X- and Y-bearing cells (Braun et al., 1989); microtubule- and motor-dependent transport moves RNA-protein cargoes across these bridges (Ventelä et al., 2003), with the testis kinesin-2 KIF17b carrying CREM-regulated mRNAs and chromatoid-body components (Chennathukuzhi et al., 2003; Kotaja et al., 2006).

The central hypothesis is that **functional polyglycylation participates in a genomic-conflict system in the male germline, and that its human-specific loss was an adaptive suppression of that conflict.** Two non-exclusive mechanistic models are developed: (i) polyglycylation gates *selective, directional* transport across the bridges connecting X- and Y-bearing spermatids, acting as a rectifier whose loss restores symmetric sharing; and (ii) differential sex-chromosome repeat content reshapes the autosomal 3-D genome asymmetrically via a heterochromatin-sink mechanism. A validated mammalian precedent for postmeiotic X–Y conflict exists (the *Slx/Slxl1* vs *Sly* system; Cocquet et al., 2009, 2012), as does a validated precedent for a Y-chromosome heterochromatin sink reshaping genome-wide chromatin (Drosophila; Lemos et al., 2008, 2010; Brown et al., 2020). Preliminary collaborator data — archaic functionality of TTLL10, a maternally-rescuable paternal zebrafish phenotype, and a discrete set of 27 X-linked transcripts that escape syncytial equalisation in human spermatids — are consistent with the framework but do not yet test it.

---

## 2. Cell-biological background

### 2.1 Tubulin polyglycylation and the TTLL enzymes

Glycylation and glutamylation add amino-acid side chains to glutamate residues in the intrinsically disordered C-terminal tails (CTTs) of α/β-tubulin, on the microtubule outer surface. Glycylases belong to the tubulin-tyrosine-ligase-like (TTLL) family. In mammals, **TTLL3 and TTLL8 are initiases** (adding the first, branch-point glycine) and **TTLL10 is the elongase** that extends polyglycine chains (Rogowski et al., 2009). TTLL10 is mechanistically dependent on its substrates: it requires pre-existing monoglycines to bind microtubules with high affinity and elongates only from them, its activity is stimulated by tubulin glutamylation and is self-limiting as chains grow (Roll-Mecak lab, 2024 preprint). Because glycylation and glutamylation compete for the *same* CTT glutamates, glycylation also acts indirectly by neutralising the negative charge that glutamylation-reading proteins respond to.

TTLL10 additionally has a **non-tubulin substrate**: it polyglycylates **nucleosome assembly protein 1 (NAP1)**, a ~60-kDa histone chaperone that accumulates in elongating spermatids, at C-terminal Glu359/360 (Ikegami et al., 2008). This places TTLL10 activity at the spermatid chromatin-remodelling step (histone-to-protamine transition), not only at the flagellum.

### 2.2 The human-specific loss of TTLL10

Human TTLL10 is transcribed but catalytically dead. Two substitutions in the conserved core TTL domain inactivate it; reverting *both* to the residues found in mouse and rhesus restores polyglycylase activity, whereas reverting either alone does not — so each lesion is independently sufficient for inactivation (Rogowski et al., 2009). Mouse and rhesus TTLL10 are active; the inactivating mutations were not found in great-ape genomes, indicating a **human-specific loss** (Rogowski et al., 2009). Functionally, human sperm lack the long polyglycine chains detected by polyG antibodies in mouse and rhesus sperm and are shifted toward monoglycylation (TAP952 reactivity); i.e., humans retain initiation (TTLL3/8) but have lost **chain elongation** (Rogowski et al., 2009). One inactivating site is reported polymorphic, with markedly different frequencies between sub-Saharan African and European samples (Rogowski et al., 2009) — see §5 for why this is most likely neutral variation on an already-inactivated background.

> **[Collaborator, unpubl.]** Neanderthal and Denisovan TTLL10 are reportedly *functional*, dating the inactivation to the modern-human lineage (post-split, <~600 kya). This is the single most selection-relevant fact in the dossier and is independently checkable from archaic genomes.

### 2.3 The spermatid syncytium and haploid-product sharing

After the meiotic divisions, haploid spermatids remain connected by stable **intercellular cytoplasmic bridges**, forming a syncytium. The classic consequence is that products of genes present in only half the spermatids (notably sex-linked genes) are shared between neighbours, rendering genetically haploid spermatids **phenotypically diploid** (Braun et al., 1989). This sharing is the principal natural suppressor of post-meiotic drive: a transmission-distorting product made from one sex chromosome is shared to siblings carrying the other, erasing the asymmetry — unless the product (or its effect) is restricted to the cell of origin (*cis*-restricted).

### 2.4 Microtubule-based transport across the bridges

Bridge transport is real, selective, and motor-driven. Time-lapse imaging of rat spermatids showed organelle and granule traffic through the bridges that is abolished by microtubule inhibitors (which also disassemble the chromatoid body); only ~28% of granules entering a bridge were transported into the neighbouring cell, and their speed dropped during passage — i.e., the bridge is already a selective filter, not a free-diffusion pore (Ventelä et al., 2003). The **chromatoid body** (a germ-granule carrying piRNA/Argonaute machinery and mRNAs) shuttles between spermatids in a microtubule-dependent manner (Ventelä et al., 2003; Kotaja et al., 2006).

The relevant motor is the testis kinesin-2 **KIF17b**. It is the motor component of a TB-RBP/Translin ribonucleoprotein complex that transports specific CREM-regulated mRNAs in postmeiotic germ cells (Chennathukuzhi et al., 2003); it concentrates in the chromatoid body and interacts with the PIWI protein MIWI, providing a route for microtubule-dependent chromatoid-body mobility (Kotaja et al., 2006). KIF17b also shuttles the CREM coactivator ACT between nucleus and cytoplasm — but that particular function is microtubule-independent and PKA-mediated (Macho et al., 2002; Kotaja et al., 2005), so it is *not* a candidate for glycylation gating. Notably, the TB-RBP mRNA-transport work was framed explicitly around the need to share mRNAs between X- and Y-bearing spermatids to maintain phenotypic equivalence (Chennathukuzhi et al., 2003).

### 2.5 Glycylation and motor selectivity

Glycylation is largely axoneme-restricted, but where present it tunes motors. In a recent in-vitro reconstitution using defined glycylated tubulin, **glycylation enhanced kinesin-2 motility and reduced kinesin-1 motility and binding**, with kinesin-2 velocity rising monotonically with glycylation level — interpreted as favouring intraflagellar transport (Mullick et al., 2026, preprint). The same study reports glycylation suppresses the microtubule-severing/depolymerising activities of spastin and MCAK, and notes that the only prior evidence of glycylation regulating motors was control of axonemal dyneins in sperm and antagonism of katanin (Mullick et al., 2026, preprint). The mechanistic interpretation is electrostatic: neutral glycines neutralise the CTT negative charge that kinesin-1 depends on, while kinesin-2 benefits from reduced electrostatic drag. Because KIF17b is a kinesin-2, the prediction is that polyglycylation would *favour* KIF17b-dependent cargo movement.

### 2.6 Postmeiotic sex-chromosome biology and the *Slx/Sly* precedent

The sex chromosomes are transcriptionally silenced during meiosis (meiotic sex chromosome inactivation) and remain largely repressed in round spermatids as postmeiotic sex chromatin (PMSC); a subset of (often amplified) genes escape this repression and are expressed postmeiotically. The validated mammalian case of postmeiotic X–Y conflict is the mouse **Slx/Slxl1 (X) versus Sly (Y)** system: these multicopy genes (≈50–100 copies each) have antagonistic effects on sex-chromosome gene expression in spermatids via PMSC, and perturbing their balance distorts the offspring sex ratio and impairs fertility (Cocquet et al., 2009, 2012). SLY maintains repressive marks (H3K9me3, CBX1) on PMSC and interacts with the chromatin modifier KAT5/TIP60 (Cocquet et al., 2009). Critically, this drive is executed through **differential sperm motility** between X- and Y-bearing sperm (Kruger et al., 2019 [verify]) — establishing both that the syncytium is leaky enough for X/Y phenotypic divergence and that the flagellum is the effector.

### 2.7 The heterochromatin-sink model

In Drosophila, the gene-poor, repeat-rich Y chromosome influences expression of hundreds–thousands of autosomal and X-linked genes ("Y-linked regulatory variation"; Lemos et al., 2008, 2010). The favoured mechanism is a **heterochromatin sink**: the Y's repetitive DNA sequesters limiting heterochromatin components (e.g., HP1, H3K9 methyltransferases), redistributing them genome-wide (Brown et al., 2020). The effect is dose-dependent on the amount of Y-derived heterochromatin, and consistent with classic position-effect-variegation genetics in which adding heterochromatin suppresses silencing elsewhere and HP1 dosage tunes silencing (Dimitri & Pisano, 1989; Gatti & Pimpinelli, 1992; Elgin & Reuter, 2013; Brown et al., 2020). The compartment corollary — that the Y modifies how the genome is partitioned across chromatin compartments, with the strongest effects on genes expressed in limited contexts such as spermatogenesis — has been stated explicitly as an untested prediction (Drosophila Y meta-analysis, GBE 2013 [verify]).

---

## 3. The hypotheses

**H1 — Adaptive loss.** The human-specific inactivation of TTLL10 was positively selected because eliminating long-chain polyglycylation short-circuited a pathway co-opted by a sex-linked transmission-distortion (drive) system. The relevant change is loss of *elongation* (chain length), not of glycylation per se.

**H2 — Bridge rectifier.** Polyglycylation gates selective, directional transport of specific cargoes across the intercellular bridges connecting X- and Y-bearing spermatids (via its differential effect on kinesin-2/KIF17b vs kinesin-1 and axonemal dynein). Long-chain glycylation sharpens this rectifier; loss of TTLL10 flattens the chain-length dynamic range and de-rectifies the bridge toward symmetric sharing.

**H3 — The cis-restricted asymmetric factor.** For any rectifier to generate drive, a symmetry-breaking factor must remain restricted to its chromosome of origin. Candidate classes (§4.3): ampliconic postmeiotically-expressed sex-linked gene families; chromatin modifiers/readers acting on sex chromatin; RNA-binding/transcript-anchoring factors; perinuclear/nuclear-anchored proteins; and the chromosome's own heterochromatin.

**H4 — Heterochromatin-sink / compartment asymmetry.** Differential repeat content between X- and Y-bearing spermatid nuclei differentially sequesters limiting heterochromatin factors, shifting autosomal A/B-compartment borders and asymmetrically derepressing border-proximal genes. Because DNA cannot cross the bridge and factor competition is intranuclear, this generates a *cis* asymmetry that the syncytium cannot equalise.

**H5 — Post-fertilisation modification/rescue arm.** Independently of intra-testicular drive, TTLL10/NAP1-dependent processing imposes a paternal-chromatin state that requires matching maternal factors post-fertilisation — a modification/rescue (toxin–antidote-like) architecture analogous to cytoplasmic incompatibility.

---

## 4. Evidence and inferential logic

### 4.1 The organising problem: cis-restriction in a syncytium

Every version of the model must solve the same problem created by Braun et al. (1989): diffusible products equalise across bridges, so drive is suppressed unless an asymmetry is *cis*-restricted. This is the spine of the logic and the criterion against which each hypothesis is judged.

- **H2 (bridge rectifier)** addresses it by making the *transport step itself* selective: the bridge is already a ~28%-efficient filter (Ventelä et al., 2003), and glycylation can bias which motor (hence which cargo, hence which direction) operates (Mullick et al., 2026). But a rectifier amplifies asymmetry; it does not create it — so H2 still requires H3.
- **H3 (cis factor)** supplies the symmetry-breaker, but most candidate gene products are at least partly diffusible and therefore vulnerable to sharing.
- **H4 (sink)** is the strongest answer to the cis-restriction problem: the asymmetry generator is the chromosome's own DNA (unshareable), and competition for limiting factors is *intranuclear* (each spermatid nucleus is separate), so the effect is nucleus-autonomous regardless of cytoplasmic sharing. Its key vulnerability is kinetic (see §5).

### 4.2 Published support, by component

- *TTLL10 is human-specifically inactivated, losing chain elongation while retaining monoglycylation* — Rogowski et al. (2009).
- *TTLL10 acts on chromatin via NAP1 in elongating spermatids* — Ikegami et al. (2008).
- *Glycylation differentially regulates kinesin-2 (up) vs kinesin-1 (down) and suppresses severing* — Mullick et al. (2026, preprint); enzymology of elongation in Roll-Mecak lab (2024 preprint).
- *Spermatids share products through bridges; sharing is the drive suppressor* — Braun et al. (1989).
- *Bridge transport is microtubule/motor-dependent and selective* — Ventelä et al. (2003).
- *KIF17b (kinesin-2) carries CREM-regulated mRNAs (TB-RBP) and chromatoid-body/MIWI cargo, in the context of X/Y mRNA sharing* — Chennathukuzhi et al. (2003); Kotaja et al. (2006).
- *Postmeiotic X–Y conflict exists and acts through differential sperm motility* — Cocquet et al. (2009, 2012); Kruger et al. (2019 [verify]).
- *A Y-chromosome heterochromatin sink can reshape genome-wide chromatin, dose-dependently* — Lemos et al. (2008, 2010); Brown et al. (2020); Elgin & Reuter (2013).
- *An X-linked flagellar gene in the candidate set is essential for motility and is a stored/late-processed transcript* — AKAP4: transcribed only postmeiotically, the most abundant fibrous-sheath protein, knockout abolishes progressive motility without reducing sperm number, and protein appears as a pro-AKAP4 precursor processed during flagellar assembly (Miki et al., 2002).

### 4.3 Candidate cis factors (H3), ranked by how well they escape sharing

1. **Ampliconic postmeiotically-expressed multicopy families** (validated template: *Slx/Sly*; Cocquet et al., 2009, 2012). Human/primate examples: Y — RBMY, DAZ, CDY, TSPY, BPY2, PRY, HSFY; X — cancer-testis amplicons (MAGE, GAGE, SSX, SPANX, CT45/47, XAGE, NXF2).
2. **Chromatin modifiers/readers on sex chromatin** (intrinsically cis; overlaps H4). Standout: **CDY** (Y, chromodomain + histone-acetyltransferase activity at the histone-to-protamine step).
3. **RNA-binding/anchoring factors** (best fit to H2 cargo logic): RBMY, DAZ (Y); NXF2 (X). An RBP nucleating a local RNP keeps an mRNA from equilibrating across the bridge.
4. **Perinuclear/nuclear-anchored proteins**: SPANX (X).
5. **The chromosome's own heterochromatin/satellite DNA** (H4): non-genic, automatically cis; the human Yq12 satellite block is the obvious knob, and its haplogroup-differential content is a natural quantitative variable.

### 4.4 Collaborator (unpublished) data and how each bears on the model

> **[Collaborator, unpubl.] Archaic functionality.** Neanderthal/Denisovan TTLL10 functional → the loss is recent and modern-human-specific. *Bearing:* strengthens H1 (recent lineage-specific loss of a conserved gene is the canonical adaptive-loss setup); makes the loss datable from ancient DNA.

> **[Collaborator, unpubl.] Zebrafish knockouts.** Male-KO × WT-female reduces successful fertilisation; male-KO × female-KO is more severe — implying a paternal defect (?DNA damage) partially rescued by a functional maternal copy. *Bearing:* supports **H5**; the structure (paternal modification, maternal rescue) matches a modification/rescue toxin–antidote architecture, and routes mechanistically to the NAP1/chromatin branch (Ikegami et al., 2008). *Caveat:* zebrafish lack heteromorphic sex chromosomes, so this tests a general paternal-chromatin/fertility axis, **not** the X–Y bridge mechanism of H2; the two are distinct conflict stages that happen to share the enzyme. Also note this shows TTLL10 is *beneficial* for fertility — so the human loss requires a benefit (conflict suppression) exceeding a direct fertility cost.

> **[Collaborator, unpubl.] Human spermatid single-cell transcriptomics.** With X/Y cell classification assumed valid and non-circular, **27 of ~750 X-expressed genes show higher cytoplasmic mRNA in X-bearing than Y-bearing cells**; the remaining ~720 are equalised. The 27 are X-linked and functionally enriched for the flagellar/axonemal/transport apparatus (e.g., AKAP4, CFAP47, RPGR, OCRL, OFD1, DYNLT3, MAP7D3) plus chromatin (HMGB3), RNA-handling (DDX3X, UPF3B, NCBP2L, FTSJ1) and ampliconic CT genes (SPANXN5, VCX2). *Bearing:* this is the key result. Under passive leaky sharing, all postmeiotic X genes should show graded X-bias; instead the bulk equalise and only 27 escape. Selective non-sharing of a functionally coherent (motility) module is exactly what H2 predicts (rectified KIF17b/TB-RBP cargo). Because a Y-bearing cell has no X template, the X-vs-Y difference is *entirely a measure of how little of that transcript crosses the bridge* — i.e., a transport/sharing readout, pointing at H2 rather than transcription. The clean, X-specific, 27-gene shape argues *against* a diffuse autosome-wide sink as the proximal cause of *this* signal (the sink would be broad and autosomal), though the sink could operate separately/upstream.

> **[Collaborator, unpubl.] Primate data, nuclear mRNA only.** *Bearing/caveat:* the human "27" is a **cytoplasmic** sharing phenomenon; the nucleus is never shared, so **nuclear** mRNA measures transcription/nuclear-retention and shows X>Y asymmetry for essentially all postmeiotic X genes regardless of sharing. The compartments are therefore not directly comparable, and the cross-species TTLL10 test (does an intact elongase sharpen the rectifier?) **requires cytoplasmic/whole-cell data from a TTLL10-active primate**, which is currently missing. The primate nuclear data is still useful for (a) confirming the 27 are in the postmeiotic transcriptional repertoire of other primates, and (b) — paired with a **human nuclear** fraction — discriminating whether escape is cytoplasmic (transport-gated; H2) or via nuclear detention (glycylation-independent; would decouple H1 from this phenotype).

### 4.5 How the pieces fit (one coherent, falsifiable storyline)

A *cis* asymmetry source (H3/H4 — most robustly the heterochromatin content itself) sets a per-nucleus difference between X- and Y-bearing spermatids. A polyglycylation-tuned bridge rectifier (H2) converts/amplifies this into asymmetric delivery of a specific cargo module — plausibly KIF17b/TB-RBP mRNAs including stored, late-translated flagellar transcripts such as AKAP4 (Chennathukuzhi et al., 2003; Miki et al., 2002) — which surfaces as the documented drive readout, differential sperm motility (Kruger et al., 2019 [verify]). The human-specific loss of the elongase (Rogowski et al., 2009) caps the rectifier's gain and is therefore the candidate adaptive suppressor (H1). A parallel NAP1/chromatin arm (Ikegami et al., 2008) may impose a paternal-effect modification rescued maternally (H5), consistent with the zebrafish phenotype.

---

## 5. Gaps, caveats, and alternative explanations

1. **No precedent for glycylation-dependent drive.** The framework is novel; the strongest non-adaptive null for H1 is simple relaxed constraint (humans needing less long-chain glycylation), and the two-hit inactivation structure is compatible with that null.
2. **The polymorphic site is probably uninformative for selection.** Because either inactivating lesion alone is sufficient (Rogowski et al., 2009), a segregating second site most likely sits on an already-dead background and varies by drift/demography, not selection. The decisive question is which lesion fixed first and whether any *doubly-ancestral, functional* TTLL10 haplotype still segregates (testable; would be remarkable if true).
3. **mRNA ≠ protein ≠ function.** Spermatozoa are largely translationally quiescent and store transcripts for the oocyte; the motility apparatus is assembled earlier from shared pools. A transcript asymmetry could be a relic rather than a cause. The mitigating logic is that genes transcribed while bridges are open but translated/assembled after individualisation (e.g., pro-AKAP4; Miki et al., 2002) can convert a retained-mRNA asymmetry into a phenotype — but this must be shown, not assumed.
4. **Timing/compartment of the 27-gene signal** must be resolved: round spermatids (bridges intact, potentially functional) vs late spermatozoa (bridges severed, a footprint).
5. **The sink's kinetic vulnerability (H4).** Nucleus-autonomy requires factor sequestration on satellite DNA to be "sticky" relative to inter-nuclear exchange through shared cytoplasm; if free factor re-equilibrates quickly, a large sink in the Y nucleus could deplete the shared pool and shift compartments in *both* siblings, erasing the asymmetry. This is a quantitative, modellable constraint.
6. **Human is TTLL10-null yet shows 27 escapees.** If the rectifier were strictly elongation-dependent, humans should show a *weaker* effect than a TTLL10-active species. Persistence implies either monoglycylation (TTLL3/8, intact in humans) suffices, or the escape is glycylation-independent, or 27 is a de-rectified residual of a larger ancestral set. Only cytoplasmic primate data can adjudicate.
7. **H5 vs H2 are different conflict stages** (post-fertilisation vs intra-testicular) and should not be conflated; the zebrafish system cannot test H2.
8. **Classification and assignment.** Although X/Y classification is taken as valid here, any cross-species or autosomal extension must use independent (Y-linked or genotype-based) cell assignment, and snRNA gene-length/nascent biases must be controlled when comparing nuclear to cytoplasmic sets.
9. **Gene-level annotations** for the candidate list (subcellular localisation, storage/translation timing) are drawn from standard sources and individual studies of variable strength; only AKAP4 is anchored to a knockout here (Miki et al., 2002).

---

## 6. Proposed experiments (prioritised by leverage-per-effort)

**Tier 1 — reanalysis / data already in hand or cheap to add**

1. **Human nuclear fraction**, paired with the existing human cytoplasmic data. Per-gene nuclear-vs-cytoplasmic asymmetry isolates *sharing* from *transcription*: the 27 should retain near-nuclear asymmetry in cytoplasm (unshared) while the 720 collapse. This both validates the 27 as a sharing phenomenon and reveals whether escape is cytoplasmic (H2) or nuclear-detention (decouples H1).
2. **27-vs-720 feature comparison** (same chromosome, same cells): 3′UTR/TB-RBP-Translin motifs and overlap with chromatoid-body/TB-RBP cargo (Chennathukuzhi et al., 2003; Kotaja et al., 2006); formal test of flagellar enrichment against the 720 background; expression-level and pseudotime-onset matching to exclude the kinetic confound; localisation signals; genomic clustering.
3. **Archaic genotyping** of the two TTLL10 inactivating sites in Neanderthal/Denisovan genomes to date the loss and determine lesion order; check whether any doubly-ancestral haplotype segregates in extant humans (esp. sub-Saharan Africa).
4. **Selection scan** at TTLL10 (1p36.33) for the fixed inactivating lesion (reduced diversity / ancient-DNA time-series trajectory), controlling for the subtelomeric, high-recombination context.
5. **Stage assignment** of the 27-gene asymmetry along pseudotime (round vs elongating/individualised), to separate functional from relic.

**Tier 2 — new sequencing**

6. **Whole-cell / cytoplasmic scRNA from a TTLL10-active primate** (the keystone): does the elongase-intact species show a broader/sharper X-escapee set than the human 27? Direct test of H1+H2.
7. **Sorted or single-cell Hi-C on X- vs Y-bearing round spermatids** to test H4: prediction of weaker autosomal B-compartments / outward-shifted A/B borders in Y-bearing cells. The challenge is X/Y assignment, not the Hi-C.
8. **Autosomal X-cell-vs-Y-cell contrast**, border-stratified, in the existing data: a near-null argues the sink contributes little in this tissue; enrichment of derepressed border-proximal autosomal genes in Y-bearing cells supports H4.

**Tier 3 — mechanism / functional**

9. **Glycylation localisation in spermatids** (polyG vs TAP952) to manchette, bridge region, and chromatoid-body-associated microtubules — the make-or-break premise for H2 (are the relevant transport tracks glycylated at all?).
10. **Transport assay under glycylase perturbation** (TTLL3/8/10) measuring bridge-crossing of candidate cargoes (chromatoid-body granules; AKAP4 mRNP).
11. **Zebrafish phenotyping to localise the H5 defect**: sperm-aster/centriolar microtubule integrity vs γH2AX/protamine-ratio (paternal DNA-damage), and whether maternal rescue acts on sperm-derived microtubules or chromatin.
12. **Quantitative sink modelling**: is the human Yq12 satellite binding-site count sufficient to measurably deplete nuclear HP1/SUV39H pools at spermatid concentrations, in the sticky-kinetics regime required by §5(5)?
13. **Transmission/sex-ratio test** if a segregating functional/ancestral allele is found (offspring-sex-ratio or TDT-style analysis).

**Connection to the broader programme:** experiment 7/8 (germline A/B-compartment asymmetry under differential Y heterochromatin) is the same mechanistic engine proposed for haplogroup I-vs-R effects on autosomal compartment structure in neurons; overlapping border-class loci across germline and brain would be a strong cross-tissue signature.

---

## 7. References

*(Inline-cited works. Items marked [verify] have bibliographic details reconstructed during analysis and should be confirmed.)*

- Braun RE, Behringer RR, Peschon JJ, Brinster RL, Palmiter RD (1989). Genetically haploid spermatids are phenotypically diploid. *Nature* 337:373–376.
- Brown EJ, Nguyen AH, Bachtrog D (2020). The Drosophila Y chromosome affects heterochromatin integrity genome-wide. *Mol Biol Evol* 37:2808–2824. [verify vol/pages]
- Chennathukuzhi V, Morales CR, El-Alfy M, Hecht NB (2003). The kinesin KIF17b and RNA-binding protein TB-RBP transport specific cAMP-responsive element modulator-regulated mRNAs in male germ cells. *Proc Natl Acad Sci USA* 100:15566–15571.
- Cocquet J, Ellis PJI, Yamauchi Y, Mahadevaiah SK, Affara NA, Ward MA, Burgoyne PS (2009). The multicopy gene Sly represses the sex chromosomes in the male mouse germline after meiosis. *PLoS Biol* 7:e1000244.
- Cocquet J, Ellis PJI, Mahadevaiah SK, Affara NA, Vaiman D, Burgoyne PS (2012). A genetic basis for a postmeiotic X versus Y chromosome intragenomic conflict in the mouse. *PLoS Genet* 8:e1002900.
- Dimitri P, Pisano C (1989). Position effect variegation in Drosophila melanogaster: relationship between suppression effect and the amount of Y chromosome. *Genetics* 122:793–800. [verify]
- Elgin SCR, Reuter G (2013). Position-effect variegation, heterochromatin formation, and gene silencing in Drosophila. *Cold Spring Harb Perspect Biol* 5:a017780.
- Gatti M, Pimpinelli S (1992). Functional elements in Drosophila melanogaster heterochromatin. *Annu Rev Genet* 26:239–275. [verify]
- Drosophila Y meta-analysis (2013). Genes regulated by the Y chromosome in D. melanogaster are preferentially localized to repressive chromatin. *Genome Biol Evol* 5:255–. [verify authors/pages]
- Ikegami K, Horigome D, Mukai M, Livnat I, MacGregor GR, Setou M (2008). TTLL10 is a protein polyglycylase that can modify nucleosome assembly protein 1. *FEBS Lett* 582:1129–1134.
- Kotaja N, Macho B, Sassone-Corsi P (2005). Microtubule-independent and protein kinase A-mediated function of kinesin KIF17b controls the intracellular transport of ACT (activator of CREM in testis). *J Biol Chem* 280:31739–31745. [verify vol/pages]
- Kotaja N, Lin H, Parvinen M, Sassone-Corsi P (2006). Interplay of PIWI/Argonaute protein MIWI and kinesin KIF17b in chromatoid bodies of male germ cells. *J Cell Sci* 119:2819–2825. [verify vol/pages]
- Kruger AN et al. (2019). Differential sperm motility mediates the sex ratio drive shaping mouse sex chromosome evolution. *Curr Biol* 29:3823–. [verify authors/pages]
- Lemos B, Araripe LO, Hartl DL (2008). Polymorphic Y chromosomes harbor cryptic variation with manifold functional consequences. *Science* 319:91–93. [verify]
- Lemos B, Branco AT, Hartl DL (2010). Epigenetic effects of polymorphic Y chromosomes modulate chromatin components, immune response, and sexual conflict. *Proc Natl Acad Sci USA* 107:15826–15831. [verify]
- Macho B, Brancorsini S, Fimia GM, Setou M, Hirokawa N, Sassone-Corsi P (2002). CREM-dependent transcription in male germ cells controlled by a kinesin. *Science* 298:2388–2390.
- Miki K, Willis WD, Brown PR, Goulding EH, Fulcher KD, Eddy EM (2002). Targeted disruption of the Akap4 gene causes defects in sperm flagellum and motility. *Dev Biol* 248:331–342.
- Mullick et al. (2026, preprint). Tubulin glycylation differentially regulates kinesin-1 and kinesin-2 [title approximate]. *bioRxiv* doi:10.64898/2026.03.26.714406. [verify title/authors]
- Roll-Mecak lab (2024, preprint). The TTLL10 polyglycylase is stimulated by tubulin glutamylation and inhibited by polyglycylation. *bioRxiv* 2024.03.31.587457 (eLife reviewed preprint 98040). [verify authors]
- Rogowski K, Juge F, van Dijk J, Wloga D, Strub J-M, Levilliers N, Thomas D, Bré M-H, Van Dorsselaer A, Gaertig J, Janke C (2009). Evolutionary divergence of enzymatic mechanisms for posttranslational modification (polyglycylation). *Cell* 137:1076–1087. [verify author order]
- Ventelä S, Toppari J, Parvinen M (2003). Intercellular organelle traffic through cytoplasmic bridges in early spermatids of the rat: mechanisms of haploid gene product sharing. *Mol Biol Cell* 14:2768–2780.

*Foundational topics cited in passing (MSCI/PMSC; intercellular-bridge structure/TEX14; cytoplasmic incompatibility as a mod/resc analogy) are described from standard knowledge and are not individually referenced here; add primary citations (e.g., Turner; Namekawa et al.; Greenbaum et al.; Beckmann/Bordenstein for CI) before formal use.*