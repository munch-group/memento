
*Compiled 3 November 2026. Narrow scope: evidence bearing on whether cargo can be actively and selectively routed across germline intercellular bridges, as opposed to passively retained or freely shared. Replaces the broader spermatid-transport survey.*

## Summary

No directed or genotype-selective transport across bridges has been demonstrated. What exists is: one live-imaging study showing that crossing happens, is motor-dependent and is inefficient; a large body of genomic work inferring that sharing is incomplete; and no mechanism connecting the two. The most parsimonious explanation of incomplete sharing — subcellular retention near the nucleus of origin — requires no bridge-level machinery at all, and would have to be excluded before any active-sorting model is worth pursuing. One structural fact works against active transport specifically: mature stable bridges appear to lack a microtubule track through the lumen.

## 1. Direct evidence on bridge crossing

The only live-imaging account is rat early spermatids ([Ventelä, Toppari & Parvinen 2003][ventela2003]; recapitulated in [Parvinen 2005][parvinen2005]):

- Golgi-derived granules (~0.5 µm) move continuously through bridges; the haploid-specific product TRA54 was followed from one spermatid's Golgi into a neighbour's acrosome system.
- The chromatoid body itself was seen inside a bridge and moving between cells, in both directions.
- Granule velocity *falls* during bridge passage, and only ~28 % of granules entering a bridge complete the crossing.
- Nocodazole and vincristine abolished all organelle movement through bridges; cytochalasin D did not affect chromatoid body movement.

`[verify — a single study, rat, 2003; I have not seen it replicated or extended with modern imaging]`

**What this does and does not show.** It establishes that crossing is active and cytoskeleton-dependent, and that passage is a bottleneck rather than free mixing. It does not address selectivity: the reported bidirectionality of chromatoid body movement is the opposite of a directional bias, and no cargo was shown to cross preferentially one way or to fail selectively. Mitochondria are not among the cargoes reported as crossing. `[verify — worth checking the original figures; absence of mention is not absence of observation]`

## 2. The structural constraint: no track through the lumen

Reviews of stable intercellular bridges state that a defining feature of the mature bridge, as opposed to the midbody it derives from, is the **absence of microtubule spindle bundles in the lumen** ([Greenbaum, Iwamori et al., CSH Perspectives][cshp]; [Haglund et al.][haglund]). Mammalian germline bridges are actin-rich; *Drosophila* male ring canals are septin-rich (Peanut, Septin 1, Septin 2) and lose actin and myosin II from the mature bridge ([Commun Biol 2026][commbiol2026]). A recent *Hydra* study reports microtubules within ring canals — both spindle-remnant bundles traversing the nascent lumen and a disc-shaped population — and explicitly frames this as *previously unrecognised*, which underlines that it is not the bilaterian norm ([Mol Biol Evol 2025][hydra]).

This sits awkwardly with the Ventelä result that microtubule poisons block crossing. The reconciliation is presumably that microtubule tracks deliver cargo *to* the bridge and collect it on the far side, with the lumen itself crossed by some other means — but I know of no study that has resolved this, and it is the single most important structural question for any active-transport model. If there is no continuous track and no polarity across the bridge, then a motor cannot read direction there, and whatever selectivity exists must be imposed on either side, not within.

## 3. Inferred selectivity: incomplete sharing

All claims of selective sharing are inferences from outcome, not observations of transport.

- Single-cell RNA-seq across four mammalian species found widespread **genoinformative expression**: allelic bias in haploid spermatids correlating with the cell's own genotype, implying incomplete sharing. Partial sharing is the common case; these genes ("GIMs") show signatures of selective sweeps consistent with sperm-level selection ([Bhattacharya et al. 2021][bhattacharya]; [preprint][bhattacharyapre]).
- The extreme case is the mouse *t* haplotype, where *Tcr* products are post-meiotically expressed and essentially unshared, producing motility differences between carrier and non-carrier sperm.
- Phenotypic corroboration: sperm subpopulations within one *Astyanax* male differ in allelic content at two loci ([BMC Biol 2018][astyanax]); human within-ejaculate fractions show genomic divergence ([bioRxiv 2024][humanhaploid]).
- Bridge ablation confirms bridges matter functionally — *Tex14* hypomorphs derepress LINE and LTR elements and phenotype severity scales with bridge depletion ([Nat Commun 2025][ncomms2025]) — but says nothing about per-cargo selectivity.

## 4. Retention versus transport

Where the incomplete-sharing literature proposes a mechanism, it is **subcellular localisation**: transcripts anchored by RNA-binding proteins near their nucleus of origin never reach the bridge. This is retention, and it accounts for the data without any bridge-level sorting. It also predicts that the determinant of sharing is a property of the cargo's anchoring, not of the bridge — consistent with the observation that GIM identity is evolutionarily conserved, i.e. the feature conferring poor sharing is slow-evolving and intrinsic to the gene product.

An active-sorting model therefore carries the burden of showing something retention cannot explain. Candidate discriminating observations: a cargo that is mobile and reaches the bridge but crosses asymmetrically; sharing that depends on the state of bridge-resident proteins rather than on cargo anchoring; or a cargo whose sharing changes without a change in its localisation.

## 5. What a directed mechanism would require

| Requirement | Status |
|---|---|
| Polarity cue distinguishing the two sides of one bridge | Unknown; bridges are not known to be polarised, and the symmetric actin/septin ring architecture argues against it |
| Continuous track through the lumen with defined polarity | Probably absent in mammals (§2); the key open question |
| Motor or adaptor whose state differs across the boundary | None identified. Diffusible enzymes cannot self-discriminate: any writer shared through the bridge equalises across it |
| Asymmetric capture or anchoring on one side | Not tested; the most plausible of the four, since it needs no polarity in the bridge itself |

The fourth row is where I would put effort. Trapping on one side converts undirected crossing into net accumulation without requiring the bridge to know anything, and it is compatible with both the bidirectional chromatoid body movement and the absence of a luminal track. It also relocates the cis-acting problem to a substrate that is immobilised where it is modified, which is a tractable thing to look for.

## 6. Gaps worth closing first

1. Do mitochondria cross bridges in live early spermatids? If not, any mitochondrial trapping model is moot.
2. Is there a microtubule track through the mammalian bridge lumen, and if so what is its polarity? Modern cryo-ET on isolated TEX14-positive bridges would settle it.
3. Re-examine the ~28 % crossing rate: is failure cargo-specific, or stochastic?
4. Is GIM sharing explained wholly by cargo anchoring, or is there a residual that requires bridge-level sorting?

## References

[astyanax]: https://doi.org/10.1186/s12915-018-0538-z "Unique sperm haplotypes are associated with phenotypically different sperm subpopulations in Astyanax fish. BMC Biol. 2018;16:52. [verify author list]"
[bhattacharya]: https://doi.org/10.1126/science.abb1723 "Bhattacharya S et al. Widespread haploid-biased gene expression enables sperm-level natural selection. Science. 2021;371(6530):eabb1723. [verify author list and issue]"
[bhattacharyapre]: https://doi.org/10.1101/846253 "Widespread haploid-biased gene expression in mammalian spermatogenesis associated with frequent selective sweeps and evolutionary conflict. bioRxiv 846253 (2019)."
[commbiol2026]: https://www.nature.com/articles/s42003-026-10200-4 "The formation and function of intercellular bridges in male germlines. Commun Biol. 2026. [verify authors, volume and DOI]"
[cshp]: https://cshperspectives.cshlp.org/content/3/8/a005850.full "Greenbaum MP, Iwamori T, Buchold GM, Matzuk MM. Germ cell intercellular bridges. Cold Spring Harb Perspect Biol. 2011;3(8):a005850. [verify author list]"
[haglund]: https://doi.org/10.4161/cib.13550 "Haglund K, Nezis IP, Stenmark H. Structure and functions of stable intercellular bridges formed by incomplete cytokinesis during development. Commun Integr Biol. 2011;4(1):1-9. [verify pages]"
[humanhaploid]: https://doi.org/10.1101/2024.10.08.617222 "Within-ejaculate haploid selection reduces disease biomarkers in human sperm. bioRxiv (2024), preprint. [verify authors]"
[hydra]: https://doi.org/10.1093/molbev/msaf248 "Examination of germline and somatic intercellular bridges in Hydra vulgaris reveals insights into the evolutionarily conserved mechanism of intercellular bridge formation. Mol Biol Evol. 2025;42(11):msaf248. [verify authors and DOI]"
[ncomms2025]: https://doi.org/10.1038/s41467-025-56742-9 "Intercellular bridges are essential for transposon repression and meiosis in the male germline. Nat Commun. 2025;16. [verify authors]"
[parvinen2005]: https://doi.org/10.1111/j.1365-2605.2005.00542.x "Parvinen M. The chromatoid body in spermatogenesis. Int J Androl. 2005;28(4):189-201. [verify pages]"
[ventela2003]: https://doi.org/10.1091/mbc.e02-10-0647 "Ventelä S, Toppari J, Parvinen M. Intercellular organelle traffic through cytoplasmic bridges in early spermatids of the rat: mechanisms of haploid gene product sharing. Mol Biol Cell. 2003;14(7):2768-2780. [verify pages]"
