
> The human Y chromosome is among the most structurally dynamic chromosomes in the human genome, yet much of its diversity remains unresolved because of extensive palindromes, ampliconic gene families, satellite-rich heterochromatin and large segmental duplications. What remained unclear was how these diverse forms of variation fit together across the full chromosome, how often similar structures recur in different lineages, and which aspects of organization remain constrained despite rapid sequence turnover. Here, we generated and analyzed 142 nearly complete human Y chromosome assemblies from 17 major haplogroups spanning approximately 180,000 years of evolution, creating a population-scale resource for studying Y chromosome biology and diversity. These assemblies show that structural change on the Y chromosome is recurrent but constrained, even in its most repetitive regions. In the fertility-associated azoospermia factor c (AZFc) region, recurrent inversions, deletions, and complex rearrangements generate a limited repertoire of structural haplotypes. Multicopy ampliconic gene families follow distinct evolutionary paths: DAZ paralogues differ in structural constraint, RBMY evolves within a modular array, and TSPY copy number varies mainly through local expansion and contraction. The centromere and Yq12 heterochromatin vary greatly in size but retain a stable higher-order organization, including a single hypomethylated centromeric core and conserved Yq12 repeat composition and orientation. Methylation across palindromic and ampliconic regions is likewise structured by repeat class, copy order and local architecture. Together, these results provide a population-scale resource for the human Y chromosome and show that its rapid structural evolution is repeatedly funneled into a limited set of architectural outcomes.

Vasilij's journal club on the paper:

- - R type have different lengths
- Some ampliconic deletions tolerated depending on Y chrom background
- DAZ amplicon: selective constraint on DAZ1 and DAZ2 counts
- DYZ1/DYZ2 repeat ratios is conserved to more or less 1.

Two things before the answer — one is a naming slip worth catching, because it changes what the result means.

**The ~1 ratio in this paper is DYZ1:DYZ2, not DAZ1:DAZ2.** DAZ1–DAZ4 are the four protein-coding paralogues in AZFc (palindromes P1/P2), and the paper says nothing about a conserved DAZ1:DAZ2 ratio — it reports the opposite kind of finding there, that the four paralogues differ markedly in structural constraint (*DAZ1* is stable at three RRMs in 92/94 copies, *DAZ2* is stable at one RRM in 95/96, while *DAZ3*/*DAZ4* are recurrently swapped by reciprocal inversion). The 1:1 result is about the two satellite repeat families in the Yq12 heterochromatic block: DYZ1 (HSat3A, ~3.5 kb unit) and DYZ2 (HSat1B, ~2.4 kb unit), line 454: **mean DYZ1:DYZ2 repeat unit ratio = 1.004** across 84 QC-passing Yq12 assemblies whose total length spans 10.3–53.1 Mb, a >5-fold range.

## Why the ratio stays at 1

The paper reports the observation but doesn't spell out the mechanism. The mechanism is, I think, sitting right there in the two correlations they report, and it doesn't require selection on the ratio at all.

Yq12 is a *periodic heteropolymer*: DYZ1 and DYZ2 arrays alternate along the block (this was already the picture in Hallast et al. 2023, where Yq12 was described as "alternating repeat arrays that show extensive variation in the number, size and distribution, but retain a 1:1 copy-number ratio"). The new paper then pins down which knob actually turns when Yq12 changes size:

- total Yq12 length vs. **average array size**: Spearman ρ = −0.084, p = 0.48 (nothing)
- total Yq12 length vs. **total array number**: ρ = 0.78, p = 3.26 × 10⁻¹⁶

So Yq12 grows and shrinks by gaining and losing *whole arrays*, not by expanding the arrays it has. And in an alternating A-B-A-B array, the natural mutational unit is one full period — one DYZ1 array *plus* one DYZ2 array.

The reason follows from how unequal crossover has to work here. To misalign, sister chromatids need homology at the misaligned point, and the homology in Yq12 is DYZ1-to-DYZ1 and DYZ2-to-DYZ2. If DYZ1 array *n* misaligns with DYZ1 array *n+k*, the crossover necessarily duplicates (or deletes) *k* DYZ1 arrays **and** the *k* intervening DYZ2 arrays. Register shifts are quantised in whole periods, so every event moves both counts by the same amount. The ratio is conserved automatically, as an arithmetic consequence of the substrate's periodicity — nothing needs to be monitoring it.

Three details in the paper are consistent with this and hard to explain otherwise:

**The arithmetic closes.** 55 arrays × 160 units ≈ 8,800 units; split evenly, 4,400 × 3.5 kb + 4,400 × 2.4 kb ≈ 26 Mb, against an observed mean Yq12 of 27.1 Mb. The alternating-blocks-in-equal-numbers model reproduces the observed sizes without a fudge factor.

**Orientation is conserved too** — 96.2% of repeat units antisense. Unequal crossover between directly-oriented homologous units preserves orientation; the ratio and the orientation are conserved by the same mechanism, which is why they co-occur.

**The ratio is in *units*, not base pairs.** Because DYZ1 units are ~1.46× longer, a 1:1 unit ratio means DYZ1 occupies ~1.5× more DNA than DYZ2. So whatever is conserved is a *count*, not an amount of DNA or a compositional balance — exactly what a period-quantised copy mechanism gives you, and not what you'd expect from a chromatin- or nuclear-organisation constraint operating on bulk composition.

## Why I'd resist a selective explanation

Yq12 is genetically inert; complete Yq12 deletions are compatible with normal fertility and the block varies 5-fold in length across the samples here with no phenotype attached. It's difficult to construct a fitness argument for why 8,800 units should be split 4,400/4,400 rather than 5,000/3,800. The paper's own Discussion frames the euchromatic constraints as *both* mutational bias and selective filtering, but for Yq12 it retreats to the weaker claim — "repeated remodeling within stable architectural boundaries" — which I read as them declining to invoke selection here. I think that's right, and the stronger statement is available: this is mutational bias with no selection required.

## The check I'd want to run

The reported 1.004 is a **mean across assemblies**, and the mean of an unbiased random walk is 1 regardless of how tightly the ratio is held in any individual. The distinguishing statistic is in Suppl. Table 23a:

1. **Per-sample scatter.** If individual ratios sit in 0.98–1.02, something is holding them; if they range 0.75–1.35 around a mean of 1.004, the period-quantised model fully explains it and there's nothing further to find.
2. **Array counts per assembly.** The model predicts *n*(DYZ1 arrays) = *n*(DYZ2 arrays) ± 1 in essentially every sample. That's a hard prediction and a single counterexample with a run of two same-type arrays would falsify strict alternation.
3. **Variance scaling.** Within-array register shifts (misalignment by a few units inside one DYZ1 array) *do* perturb the ratio, and are presumably what generates the array-size variance (mean 160, median 129 — right-skewed). If those are the only ratio-perturbing events, scatter in the ratio should decline roughly as 1/√(array number), so short Yq12s should be measurably noisier than long ones. That's testable in the existing table and would separate "quantised copying" from "quantised copying plus something else."

The de novo data give independent support that the exchange machinery is live: 49/53 DNMs across six father–son transmissions mapped to Yq12, and 6/35 SNV events were consistent with gene conversion rather than isolated substitution — so intra-array homologous exchange is happening at an appreciable rate in single generations.

Sources: [Hallast et al. 2026 preprint (uploaded PDF)](https://doi.org/10.64898/2026.06.03.729890); [Hallast et al. 2023, *Nature* — Assembly of 43 human Y chromosomes](https://www.nature.com/articles/s41586-023-06425-6); [Rhie et al. 2023 — The complete sequence of a human Y chromosome](https://pubmed.ncbi.nlm.nih.gov/37612512/)



Short answer: much less than you'd want, and almost none of it from direct side-by-side measurement on Yq12 itself. What exists is mostly inference from the two parent satellite families profiled on *other* chromosomes, plus a handful of genuinely Y-specific results — and those results happen to be lopsided, with DYZ1 reasonably well studied and DYZ2 nearly a blank.

## Why you'd expect them to differ at all

The compositional asymmetry is stark, and it's the basis for everything below. From the T2T-Y paper, DYZ2 (HSat1B) is a ~2.5 kb unit built from **three** parts: an ancient AluY subunit (~20% diverged from AluY consensus, apparently derived from AluY elements in PAR1), an **extremely AT-rich region (>85% AT)**, and a more GC-rich region. DYZ1 (HSat3) is a Y-specific HSat3 subfamily occurring as ~3.6 kb nested tandem repeats of the GGAAT-family pentamer.

So these aren't two flavours of the same thing. One is a pentamer-based simple satellite; the other is a chimera containing thousands of degenerate Alu copies bolted to an AT-rich spacer. Different CpG density, different motif content, different predicted minor-groove chemistry.

## DYZ1 / HSat3 — what's actually known

**HSF1 binds it directly, and Yq12 is a primary target in male cells.** [Chromosoma 2021](https://link.springer.com/article/10.1007/s00412-021-00751-2) found four perfect heat shock elements on a 3,564 bp genomic SATIII sequence within Yq12 — note that 3,564 bp is essentially the DYZ1 unit length, so this is DYZ1, not a neighbouring sequence. On heat shock, HSF1 nucleates a functional nuclear stress body on the Y: SATIII ncRNA is transcribed from the Y locus and SRSF1 splicing factors form foci colocalising with HSF1. Normal male fibroblasts targeted chr9 and Y about equally, while some male cancer lines (HT1080, H460) preferentially targeted Y. This is the classic [stress-induced satIII transcription](https://pubmed.ncbi.nlm.nih.gov/14699086/) system, and Yq12 is a full participant.

**It's a transcription factor binding platform, and the Y-specific subfamily has its own signature.** The Altemose lab's [HSat3 preprint](https://pubmed.ncbi.nlm.nih.gov/39484556/) is the most directly relevant thing in the literature. HSat3 arrays encode megabase-scale TF binding platforms — TEAD and NFAT families most enriched, with CUX1, IRF3, PRDM15 and NFATc1-3 validated by imaging. Critically for you, they subdivide HSat3 into A1–A6 and B1–B5, and the **Y-specific subfamily HSat3A6 — which is DYZ1 — shows its own distinct motif enrichments: BCL11B, CDX4, ETV5-FOXO1, HOXD9**. HSF1 ranks only 15th in their motif enrichment, so stress response is one axis among many.

And the direct contrast you asked about: **HSat1 is not enriched for TEAD motifs**. That's the one explicit statement in the literature that these two families recruit different factor sets, and it comes from that paper.

## DYZ2 / HSat1B — largely a gap

There is no equivalent factor-binding survey. What can be said:

- The **AT-rich core is CpG-poor**, so CpG methylation is barely an available regulatory axis across most of a DYZ2 unit, whereas the embedded AluY subunit is CpG-bearing. That predicts a striking *within-unit* methylation sawtooth in DYZ2 and a flatter profile in DYZ1. As far as I can tell nobody has published this. (Inference, not measurement.)
- >85% AT tracts are the canonical substrate for **AT-hook and minor-groove binders** (HMGA family, SATB1-type base-unpairing-region binders) and are compositionally typical of lamina-associated domains. Plausible, untested on Yq12.
- The transcription evidence for HSat1 is for **HSat1A**, not 1B ([BMC Biology 2023](https://link.springer.com/article/10.1186/s12915-023-01521-5)), so extrapolating to DYZ2 is a real stretch.
- The one Y-specific functional claim is old and narrow: a [Yq12-derived ncRNA generating a testis-specific chimeric CDC2L2 transcript](https://genome.cshlp.org/content/17/4/433) (Genome Research 2007).

Both are presumably constitutive heterochromatin in the ordinary sense — H3K9me3, HP1, CpG-methylated — and the HSat3 paper states this for HSat3 explicitly. But "both are H3K9me3-marked" is compatible with quite different factor occupancy on top, which is exactly what the TEAD result shows.

## Why the gap exists, and why it's closeable now

Everything upstream of 2023 was blocked by the absence of Y from CHM13 and by unmappability — you cannot assign a ChIP read to DYZ1 versus DYZ2 without a resolved assembly of *that individual's* Yq12. That constraint is gone. Long-read methods that read chromatin directly on single molecules (DiMeLo-seq and relatives) plus a personal Y assembly would settle DYZ1-vs-DYZ2 occupancy in one experiment, and nobody appears to have run it on Yq12.

Worth flagging in the paper you sent me: they have ONT methylation calls across **134 assemblies** and they spent that data on palindromes and ampliconic genes. The methylation analysis is stratified by sequence class, palindrome arm, copy order and inversion status — but there is no DYZ1-versus-DYZ2 comparison anywhere, despite Yq12 being the compartment they otherwise make the most of. The data to produce the first population-scale DYZ1/DYZ2 methylation contrast are already sitting in that dataset.


## The connection back to your ratio question

If DYZ1 and DYZ2 do recruit distinguishable factor sets, then the alternating architecture is not cosmetic — a 27 Mb Yq12 with ~55 arrays is a periodic alternation of two chromatin flavours on a ~500 kb wavelength, repeated ~27 times. That reframes the 1:1 ratio: under the pure period-quantised-NAHR model I gave you last time, the ratio is a passive by-product. But if the two satellites carry different factor loads, an organism with a skewed ratio would have a genuinely different titration of TEAD/NFAT/HSF1-class factors, and there'd be something for selection to see.

That's the version of the chromatin-sink hypothesis worth testing here — the idea that a large heterochromatic Y titrates silencing factors away from the rest of the genome, developed mostly in *Drosophila* ([Francisco & Lemos 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4105431/); [Brown et al. MBE 2020](https://academic.oup.com/mbe/article/37/10/2808/5811572)). Humans have a natural experiment nobody has properly exploited: **Yq12 varying 10.3–53.1 Mb across otherwise comparable individuals**, now with matched assemblies and methylomes. Whether genome-wide H3K9me3 or autosomal expression tracks Yq12 size — and whether it tracks total size or DYZ1 content specifically — is answerable with this cohort and would discriminate the passive and selected models cleanly.

Sources: [Rhie et al. 2023, complete human Y](https://www.biorxiv.org/content/10.1101/2022.12.01.518724v2.full) · [Altemose lab, HSat3 TF binding platforms](https://pubmed.ncbi.nlm.nih.gov/39484556/) · [Chromosoma 2021, HSF1 targets chrY pericentric heterochromatin](https://link.springer.com/article/10.1007/s00412-021-00751-2) · [Jolly et al. 2004, stress-induced satIII transcription](https://pubmed.ncbi.nlm.nih.gov/14699086/) · [HSat1A pericentromeric transcription, BMC Biology 2023](https://link.springer.com/article/10.1186/s12915-023-01521-5) · [Yq12 ncRNA / CDC2L2, Genome Research 2007](https://genome.cshlp.org/content/17/4/433) · [Francisco & Lemos 2014, chromatin sinks](https://pmc.ncbi.nlm.nih.gov/articles/PMC4105431/) · [Brown et al. 2020, Drosophila Y and genome-wide heterochromatin](https://academic.oup.com/mbe/article/37/10/2808/5811572)