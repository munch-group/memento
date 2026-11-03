
*Report compiled 3 November 2026 from a literature check (PubMed, bioRxiv, web); updated the same day after reading the full text of [Mullick et al. 2026][mullick2026].*

## Question

Is there a gene whose product's action would be nullified if tubulin (poly)glycylation ceased — i.e. a dedicated *reader* of glycylated tubulin, analogous to spastin or katanin for polyglutamylation?

## Short answer

No glycylation-specific binding domain or reader has been identified. The strongest dependencies are:

1. **Outer-arm dyneins (ODAs)** — motility defects on loss of glycylation are ODA-dependent, but the effect is interpreted as charge neutralisation of the β-tubulin C-terminal tail rather than specific recognition ([Kubo, Sasaki & Oda 2024][kubo2024]; [Gadadhar et al. 2021][gadadhar2021]; [Alvarez Viar et al. 2024][alvarezviar2024]).
2. **Ciliary kinesin-2 (OSM-3)** — in vitro, glycylation raises OSM-3 gliding velocity ~1.4-fold over brain (glutamylated) microtubules and ~2.85-fold over unmodified ones, with a graded response to the glycylation fraction ([Mullick et al. 2026][mullick2026]). Preprint; the motor tested is *C. elegans* OSM-3, not mammalian KIF3A/B.
3. **TTLL10** — the polyglycylase itself requires pre-existing monoglycylation for high-affinity microtubule binding and chain elongation ([Cummings et al. 2025][cummings2025]). Circular as a "reader", but a strict dependency.

## Background: writers and erasers

- Glycylation is initiated by TTLL3 and TTLL8; TTLL10 elongates polyglycine chains. TTLL8 glycylates both α- and β-tubulin, whereas TTLL3 prefers β-tubulin ([Cummings et al. 2025][cummings2025]; [Mullick et al. 2026][mullick2026]).
- Human TTLL10 is reported to be catalytically inactive, so human tubulin is largely monoglycylated. Primary source is Rogowski et al. 2009, *Cell* 137:1076–1087 `[verify — not checked in this session]`.
- No deglycylase has been firmly identified `[verify]`.
- Glycylation and polyglutamylation compete for the same glutamate residues on the C-terminal tails, so loss of glycylation raises glutamylation and vice versa ([Mercey et al. 2024][mercey2024]; [Mullick et al. 2026][mullick2026]).
- Glycylation and glutamylation also occur on >100 non-tubulin substrates, identified by SILAC proteomics ([Dey et al. 2026][dey2026]).

## Evidence by candidate

### Axonemal dyneins

- Mouse *Ttll3⁻/⁻ Ttll8⁻/⁻* sperm show aberrant flagellar beat and male subfertility; cryo-ET shows the 96-nm repeat is intact but ODA and IDA powerstroke conformations are altered ([Gadadhar et al. 2021][gadadhar2021]).
- In *Chlamydomonas*, a *ttll3* mutant lacks glycylation entirely and swims more slowly. Combining it with dynein-arm mutants shows the sliding-velocity defect only appears when ODAs are present; in ODA-less axonemes glycylation loss has no effect. Glycylation is confined to outer-doublet (not central-pair) microtubules ([Kubo, Sasaki & Oda 2024][kubo2024]).
- Immuno-cryo-ET and expansion microscopy show glycylation and polyglutamylation form mutually exclusive, protofilament-specific nanopatterns that align with axonemal dyneins and nexin–dynein regulatory complexes respectively ([Alvarez Viar et al. 2024][alvarezviar2024]).
- Coarse-grained MD suggests polyglutamylation, not glycylation, inhibits dynein-2 landing on the B-tubule ([Kubo & Bui 2023][kubobui2023]).

### Kinesins and MAPs in vitro (preprint)

**Design.** [Mullick et al. 2026][mullick2026] purified three tubulins: goat brain (heavily glutamylated), unmodified tubulin from Lenti-X 293T cells (low glutamylation and glycylation), and glycylated tubulin from Lenti-X cells stably expressing mCherry-TTLL3 (glycylation predominantly on β-tubulin, some on α). Mixtures of brain and glycylated tubulin gave 50 % and 70 % glycylated microtubules with reciprocally reduced glutamylation. Motors/MAPs: human kinesin-1 K560 (KIF5B motor domain), *C. elegans* kinesin-2 Osm3ΔH2, *P. falciparum* MCAK (kinesin-13), and mouse spastin. All assays were TIRF-based, three biological replicates, Kruskal–Wallis with Dunn's correction.

**Kinesin-2 (OSM-3) — positive dependency.**

| Microtubule | Median gliding velocity (nm s⁻¹) |
|---|---|
| Unmodified | 177 |
| Brain (glutamylated) | 364 |
| Glycylated | 506 |

Gradient series (separate experiment): brain 257 → 50 % glycylated 234 (n.s., p = 0.089) → 70 % 396 → fully glycylated 579 nm s⁻¹. Binding of OSM-3 to glycylated and brain microtubules was similar, and lower to unmodified ones. The authors propose that glycylation, like glutamylation, overcomes the inhibitory effect of α-tubulin tyrosination on OSM-3.

**Kinesin-1 (KIF5B) — negative dependency.** Gliding velocity fell from 270 (unmodified) and 184 (brain) to 103 nm s⁻¹ on glycylated microtubules (~2.6- and ~1.7-fold reductions); K560 failed to bind glycylated microtubules below 56 nmol while still binding brain and unmodified ones. Interpreted as loss of electrostatic interaction with the β-tubulin tail; the authors note KIF5B is not known to enter cilia.

**MCAK (KIF2C) — inhibited.** Median depolymerisation rate 0.08 µm min⁻¹ on glycylated vs 0.22 (unmodified) and 0.33 (brain) µm min⁻¹ (~2.75- and ~4-fold lower). Gradient: 0.41 → 0.26 → 0.20 → 0.10 µm min⁻¹ for brain, 50 %, 70 % and fully glycylated. Depolymerisation of glycylated microtubules was mostly confined to one end.

**Spastin — inhibited.** Extent of severing at 300 s: 62 % (brain), 31 % (unmodified), 22 % (glycylated). Severing rate: 1.23, 1.02 and 0.61 events µm⁻¹ min⁻¹ respectively. Gradient: 1.3 → 0.87 → 0.63 → 0.49 events µm⁻¹ min⁻¹. Consistent with earlier findings that glycylation antagonises glutamylation for katanin (Szczesna et al. 2022, *Dev Cell* 57:2497, cited by Mullick et al.; `[verify — not independently checked]`).

**Stated limitations.** TTLL3-only (β-tubulin-biased) glycylation; mixture stoichiometries may not match real axonemes; the HEK-derived tubulins are predominantly tyrosinated; OSM-3 is a nematode motor.

### Photoreceptor cilium

In *Ccp5⁻/⁻* and *Ccp1⁻/⁻* mice, hyperglutamylation disrupts outer-segment architecture, with reduced glycylation, reduced IFT proteins and reduced RPGR — illustrating the indirect route by which glutamylation/glycylation balance affects ciliary cargo ([Mercey et al. 2024][mercey2024]).

## Interpretation

The gene products whose activity changes most when glycylation ceases are the ODA heavy chains (DNAH family) in vivo and, in vitro, the anterograde IFT kinesin-2 (OSM-3; by extension KIF3A/KIF3B/KAP3 and KIF17 in mammals, though these were not tested). Neither has been shown to bind glycine chains directly; the best-supported mechanism is modulation of C-terminal-tail charge and the reciprocal fall in glutamylation, which then alters the known glutamylation-sensitive proteins (kinesin-1, MCAK, spastin, katanin, dyneins). In the Mullick data the OSM-3 effect is the only one that is positive and graded with glycylation fraction, which makes kinesin-2 the strongest current candidate for a protein whose ciliary function would be impaired by loss of glycylation — but the ~2-fold velocity change is a modulation, not an on/off switch, and in vivo IFT in glycylation-deficient cilia has not been measured. A true glycylation reader remains unidentified.

## References

[alvarezviar2024]: https://doi.org/10.1016/j.cub.2024.08.021 "Alvarez Viar G, Klena N, Martino F, Nievergelt AP, Bolognini D, Capasso P, Pigino G. Protofilament-specific nanopatterns of tubulin post-translational modifications regulate the mechanics of ciliary beating. Curr Biol. 2024;34(19):4464-4475.e9."
[cummings2025]: https://doi.org/10.1101/2024.03.31.587457 "Cummings SW, Li Y, Spector JO, Kim C, Roll-Mecak A. The TTLL10 polyglycylase is stimulated by tubulin glutamylation and inhibited by polyglycylation. bioRxiv. 2025 (preprint, v2 posted 4 Aug 2025)."
[dey2026]: https://doi.org/10.1242/jcs.264734 "Dey S, Mullick S, Henriot V, Poojary M, Dingli F, Loew D, Janke C, Gadadhar S. SILAC-based discovery of a broad range of proteins that can be posttranslationally glutamylated or glycylated. J Cell Sci. 2026;139(11)."
[gadadhar2021]: https://doi.org/10.1126/science.abd4914 "Gadadhar S et al. Tubulin glycylation controls axonemal dynein activity, flagellar beat, and male fertility. Science. 2021;371:eabd4914."
[kubo2024]: https://doi.org/10.1091/mbc.E24-04-0154 "Kubo T, Sasaki R, Oda T. Tubulin glycylation controls ciliary motility through modulation of outer-arm dyneins. Mol Biol Cell. 2024;35(7):ar90."
[kubobui2023]: https://doi.org/10.1038/s41598-023-28026-z "Kubo S, Bui KH. Regulatory mechanisms of the dynein-2 motility by post-translational modification revealed by MD simulation. Sci Rep. 2023;13(1):1477."
[mercey2024]: https://doi.org/10.1038/s44318-024-00284-1 "Mercey O, Gadadhar S, Magiera MM, Lebrun L, Kostic C, Moulin A, Arsenijevic Y, Janke C, Guichard P, Hamel V. Glutamylation imbalance impairs the molecular architecture of the photoreceptor cilium. EMBO J. 2024;43(24):6679-6704."
[mullick2026]: https://doi.org/10.64898/2026.03.26.714406 "Mullick S, Suresh Kumar C, Dey S, Koushik PB, Ganie R, Mahanty S, Sirajuddin M, Gadadhar S. Tubulin glycylation regulates microtubule-protein interactions that are key for ciliary stability and trafficking. bioRxiv. 2026 (preprint v1, posted 30 Mar 2026)."
