This is a literature and resource question, so let me research it properly. Loading web tools.

I've got what I need. Here's the picture.

## Has anyone done this?

**Not the thing you're describing.** I found no published resource that annotates human CTCF sites with inverted-allele frequencies, and nothing that tracks CTCF inversion status across primates. The nearest neighbours each stop one step short:

- [Giner-Delgado et al., 2019](https://www.nature.com/articles/s41467-019-12173-x) did the functional-impact analysis for 45 common inversions — expression effects, selection signatures — but framed around genes, not CTCF or 3D architecture.
- [Mol Biol Evol, 2026](https://academic.oup.com/mbe/article/43/7/msag167/8726212) is the closest thing to your primate arm: BPNet-predicted CTCF sites in human, chimp, gorilla, orangutan and macaque, with 11,543 five-way-conserved sites (~50% of predicted human sites), conserved sites clustering at TAD boundaries under stronger constraint. It considers only point substitutions — **no structural variation at all**.
- [Porubsky et al., 2020](https://www.nature.com/articles/s41588-020-0646-x) mapped 1,069 great ape inversions and found 23 regions that recurrently toggled orientation over 15 Myr, plus an excess of differentially expressed genes near breakpoints of >100 kb inversions — gene-level, not CTCF-level.
- The analysis you're proposing has essentially been done *in stickleback* ([PubMed, 2025](https://pubmed.ncbi.nlm.nih.gov/40448401/)), where 3D genome structure was shown to constrain inversion breakpoints.

Supporting pieces exist: rearrangement breakpoints are enriched at TAD boundaries and depleted within TADs, loop anchors carry an excess of SV breakpoints ([Genome Biology, 2018](https://link.springer.com/article/10.1186/s13059-018-1483-4)), and 14% of human TAD boundaries are ultraconserved across eight mammals while 15% are human-specific ([Nat Commun, 2023](https://www.nature.com/articles/s41467-023-43841-8)). So the ingredients are on the shelf and nobody has cooked this particular dish.

## Human inversions with population frequencies

| Resource | Content | Frequencies? | Notes |
|---|---|---|---|
| [Porubsky et al., 2022](https://www.cell.com/cell/fulltext/S0092-8674(22)00464-0) (Cell) | 729 inversions, 41 genomes, Strand-seq + long reads | yes | **The reference callset.** ~11.6 Mb inverted per genome (0.39% haploid). ~85% of <2 kb events are L1 twin-priming artefacts of retrotransposition — exclude them |
| [Porubsky et al., 2022](https://www.biorxiv.org/content/10.1101/2022.10.06.511148v1.full) (T2T) | 296 balanced inversions on T2T-CHM13 | yes | +21% sensitivity vs GRCh38; ENA `PRJEB54100` |
| [Giner-Delgado et al., 2019](https://www.nature.com/articles/s41467-019-12173-x) | 45 common inversions, 0.1–415 kb | yes, experimentally validated | Gold-standard genotypes; the ones with real frequency data |
| [bioRxiv, 2025](https://www.biorxiv.org/content/10.1101/2025.05.27.656315v1.full) (Cáceres lab) | 155 inversions, 54 individuals, ONT ultra-long | **yes, MAF 0.01–0.49** | 78.1% widespread across populations; all flanked by inverted repeats up to 190 kb; `GeONTIpe` genotyper |
| [Schloissnig et al., 2025](https://www.nature.com/articles/s41586-025-09290-7) (HGSVC3) | 1,019 ONT genomes, 26 populations | allele counts | 1,849 inversion calls but only 491 dotplot-confirmed; 1,047 are L1 5′-end inversions. Most are rare (AC<10) |
| [InvFEST](https://invfest.uab.cat/) | 1,092 candidates from 34 studies | curated, heterogeneous | Best cross-reference index; the NAR paper is 2014, so treat as a lookup, not a callset |
| [gnomAD-SV v4](https://gnomad.broadinstitute.org/news/2023-11-v4-structural-variants) | 63,046 short-read genomes | yes, large N | ~9,133 inversion-containing sites. 7.0% FDR *after* excluding the most repetitive 9.7% of the genome; 85.8% long-read support |

## Short reads or long reads?

**Short reads are not adequate for discovery.** A November 2025 benchmark ([bioRxiv](https://www.biorxiv.org/content/10.1101/2025.11.28.691176v1.full)) puts hard numbers on it — at 30× on HG002:

| | recall |
|---|---|
| GRIDSS2 (Illumina) | 0.12 |
| Manta (Illumina) | 0.17 |
| Severus (PacBio + VACmap) | 0.79 |
| Sniffles2 (PacBio + VACmap) | 0.71 |
| short-read, *complex* inversions | <0.10 |
| long-read, *complex* inversions | 0.50–0.68 |

Two further splits matter for you. Repeat context: Severus recalls 0.61 in regions with short flanking repeats but **0.23 where flanking repeats exceed 5 kb** — and NAHR-mediated inversions are *by definition* the ones flanked by long inverted repeats. Zygosity: heterozygotes are much harder (Sniffles2 ONT: 0.19 het vs 0.54 hom).

This is the crux for your project. The inversions worth studying — common, recurrent, SD-flanked, sitting in the CTCF/TAD-boundary-rich regions where rearrangement breakpoints concentrate — are precisely the ones short reads miss. Strand-seq remains the only technology that detects inversions irrespective of flanking repeat length, which is why it dominates the Porubsky callsets; `InvertypeR` ([BMC Genomics, 2021](https://bmcgenomics.biomedcentral.com/articles/10.1186/s12864-021-07892-9)) cut Mendelian discordance from 6.3% to 0.5%.

**But you don't need to do discovery.** The practical route is discovery from published long-read/Strand-seq callsets, then *genotyping* into large short-read cohorts. Two options:
- `scoreInvHap` ([Ruiz-Arenas et al., 2019](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1008203)) — ~20 inversions reliably callable from SNP data.
- Imputation ([bioRxiv, 2026](https://www.biorxiv.org/content/10.64898/2026.01.23.701363v1.full), Cáceres lab): IMPUTE5/Minimac4 accurately impute **46.8–75.5%** of 52 tag-SNP-poor inversions from 1000G WGS, dropping to 40.4–59.5% from a GSA array. Critically, **21/45 recurrent inversions impute poorly** — see below.

T2T is *not* required, but a T2T-quality reference helps: the CHM13 remap recovered 21% more inversions than GRCh38.

## Four design traps

**1. "Inverted CTCF site" is three different things.** A site strictly *interior* to an inversion keeps its sequence and local binding intact — what flips is its motif orientation relative to the chromosome, so convergent pairs spanning the breakpoint become divergent. That's the loop-extrusion-relevant class and it's the big one. A site *at* the breakpoint may be disrupted, duplicated, or unmappable. A site *outside* is untouched in sequence but may lose its looping partner. These need separate columns, not one flag.

**2. Recurrence breaks the frequency concept.** Most NAHR-mediated inversions have toggled orientation repeatedly and independently — they are not tagged by SNPs and have no clean allele genealogy. "Inverted-allele frequency" is well defined as an *orientation* frequency but not as a haplotype frequency, and those are exactly the ones that won't impute. Carry a `recurrent` flag from the outset.

**3. Ascertainment bias runs against you.** Inversions with good frequency data are the easy ones (unique-sequence flanked, non-recurrent); CTCF-dense TAD boundaries are enriched for exactly the SD-rich contexts where detection fails. Any enrichment statistic needs a matched-background null.

**4. Coordinates.** Your table is hg38; the best inversion sets are increasingly CHM13-native, and liftover fails hardest at inversion breakpoints inside SDs. Keep hg38 primary, use the CHM13↔GRCh38 alignments, and flag ambiguous sites rather than dropping them silently.

For scale: 0.39% of a haploid genome inverted implies roughly **1,300 of your 337,104 sites inside an inversion in any one individual** — the population union will be several-fold larger, but this is a modest-N analysis, so the constitutive subset (`n_experiments >= 100`) is the right foreground.

## The primate arm

The useful realisation: **you don't need an inversion caller.** With the six T2T ape assemblies ([Yoo et al., 2025](https://www.nature.com/articles/s41586-025-08816-3) — chimp, bonobo, gorilla, both orangutans, siamang; assemblies at [marbl/Primates](https://github.com/marbl/Primates)), the inversion status of a CTCF site *is* the orientation of the syntenic block containing it, read directly off a whole-genome alignment. Polarise with siamang/macaque as outgroups to infer ancestral state and count flips, then cross-reference the 23 recurrently toggling regions of [Porubsky et al., 2020](https://www.nature.com/articles/s41588-020-0646-x) and the nested-inversion/breakpoint-reuse map from macaque Strand-seq ([Genome Research, 2020](https://genome.cshlp.org/content/30/11/1680)).

One caution that will shape the result: CTCF binding turnover is a far larger effect than inversion — only ~50% of human sites are conserved five-way, and retrotransposon waves drive continual repeat-mediated dispersal of new sites ([Schmidt et al., 2012](https://pubmed.ncbi.nlm.nih.gov/22244452/)). Unless you condition on the conserved core, turnover will swamp any inversion signal. Real primate ChIP-seq exists for LCLs from seven primates ([Genome Biology, 2013](https://link.springer.com/article/10.1186/gb-2013-14-12-r148)) if you want measured rather than predicted binding.

---

Two things follow naturally, and I'd suggest starting with the first: add the `motif_strand` column to the site table (without orientation, "inverted CTCF site" has no meaning), then intersect against the Porubsky 2022 Strand-seq callset plus the 45 experimentally genotyped common inversions, which is where the trustworthy frequencies are. Say the word and I'll build it.

I can also publish this brief as a shareable reference page if it's going to your group.

**Sources:** [Porubsky et al., 2022 (Cell)](https://www.cell.com/cell/fulltext/S0092-8674(22)00464-0) · [Porubsky et al., 2022 (T2T preprint)](https://www.biorxiv.org/content/10.1101/2022.10.06.511148v1.full) · [Porubsky et al., 2020 (Nat Genet)](https://www.nature.com/articles/s41588-020-0646-x) · [Porubsky et al., 2020 (Genome Res)](https://genome.cshlp.org/content/30/11/1680) · [Giner-Delgado et al., 2019](https://www.nature.com/articles/s41467-019-12173-x) · [Martínez-Fundichely et al., 2014 (InvFEST)](https://academic.oup.com/nar/article/42/D1/D1027/1051693) · [InvFEST database](https://invfest.uab.cat/) · [Schloissnig et al., 2025](https://www.nature.com/articles/s41586-025-09290-7) · [Ultra-long-read inversions preprint, 2025](https://www.biorxiv.org/content/10.1101/2025.05.27.656315v1.full) · [Inversion imputation preprint, 2026](https://www.biorxiv.org/content/10.64898/2026.01.23.701363v1.full) · [Inversion benchmark preprint, 2025](https://www.biorxiv.org/content/10.1101/2025.11.28.691176v1.full) · [gnomAD-SV v4](https://gnomad.broadinstitute.org/news/2023-11-v4-structural-variants) · [Ruiz-Arenas et al., 2019 (scoreInvHap)](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1008203) · [InvertypeR, 2021](https://bmcgenomics.biomedcentral.com/articles/10.1186/s12864-021-07892-9) · [Yoo et al., 2025 (ape T2T)](https://www.nature.com/articles/s41586-025-08816-3) · [marbl/Primates](https://github.com/marbl/Primates) · [CTCF evolution, Mol Biol Evol 2026](https://academic.oup.com/mbe/article/43/7/msag167/8726212) · [CTCF/YY1 in seven primates, Genome Biol 2013](https://link.springer.com/article/10.1186/gb-2013-14-12-r148) · [Schmidt et al., 2012](https://pubmed.ncbi.nlm.nih.gov/22244452/) · [TAD boundary evolution, Nat Commun 2023](https://www.nature.com/articles/s41467-023-43841-8) · [Loop anchors and genome instability, Genome Biol 2018](https://link.springer.com/article/10.1186/s13059-018-1483-4) · [3D genome constrains inversion breakpoints (stickleback), 2025](https://pubmed.ncbi.nlm.nih.gov/40448401/) · [Common SVs and 3D chromatin, BMC Genomics 2020](https://bmcgenomics.biomedcentral.com/articles/10.1186/s12864-020-6516-1) · [Inversions and brain morphology, Cell Rep 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10508191/)