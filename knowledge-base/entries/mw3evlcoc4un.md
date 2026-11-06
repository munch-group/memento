
| Gene | Mechanism | Compartment | In spermatids | Autosomal buffer | Verdict |
|---|---|---|---|---|---|
| **CYLC1** | Polycationic lysine-repeat IDP | Perinuclear theca — **structural** | Yes | CYLC2 (chr9) | Real spermatid IDP, wrong job |
| **FMR1** | Gold-standard phospho-tuned IDR LLPS | Cytoplasmic RNP granule | **No** — spermatogonia | FXR1, FXR2 | Right mechanism, wrong gene |
| **AFF2** | Family precedent only | Nuclear speckle | Not reported | AFF1/3/4 | Weak |

**CYLC1** is biophysically the most unusual thing on the X: net charge **+57**, lysine at 22.6% of residues, eight tandem repeats across aa 278–553, essentially all disordered. That makes it a polyelectrolyte rather than a polyampholyte — it coacervates with polyanions rather than self-associating like an RGG scaffold. But its established job is structural: calyx assembly and anchoring the acrosome to the nuclear envelope through an IAM–cylicins–NE sandwich with SPACA1 and FAM209. The genotype series makes the buffering explicit — cylicin-1 deficiency gives sub­fertility, combined deficiency gives infertility. One thing I could check and did: the two infertility variants K324M and K328E both fall inside annotated **repeat 2 (306–342)**, and both remove a lysine, so the lesion looks like a material/assembly defect in the charged array rather than loss of a binding site.

**FMR1** has the best-characterized mechanism of any gene in the screen — phosphorylation exerts bidirectional control over FMRP droplet formation, and residue-level work on FMRP–CAPRIN1 minimal condensates shows Ser/Thr and Tyr phosphorylation patterns tuning phase-separation propensity, subcompartmentalization, deadenylation and translation rates. That is a PTM-tunable material-state switch, and the tuning PTM competes with O-GlcNAc for the same residues. It fails anyway: UniProt places FMRP protein in spermatogonia, and the mouse testis phenotype is Sertoli-driven, via an X-linked miRNA cluster that represses the adjacent *FMR1* in cis.

## The finding that matters most

Chasing FMR1's paralogs turned up the paper this whole project needed: **LLPS of FXR1 drives spermiogenesis by activating translation of stored mRNAs** (PMID 35951695, doi:10.1126/science.abj6647). FXR1 is highly expressed in late spermatids and phase separates to merge mRNP granules with the translation machinery; germline ablation **and a phase-separation-deficient knock-in** both cause defective spermatid development and infertility.

That does two things. Condensate material-state control driving spermatid biology is no longer an extrapolation from neurons and cancer lines — it is demonstrated in the right cells. And the separation-of-function knock-in is exactly the design I proposed for *Ddx3x*, now with precedent that it yields an interpretable germline phenotype.

It also exposes a pattern that cuts against X-linked candidates generally: in three of these four families the member doing the germline condensate job is autosomal (FMR1→FXR1, CYLC1→CYLC2 partially, AFF2→AFF4). That is the expected signature of MSCI moving germline function off the X, and it raises the prior that any X-linked candidate will prove buffered. It is also why DDX3X survives — its post-meiotic expression has no autosomal cover in humans — and why verifying whether mouse *D1Pas1* is germline-expressed is now the most urgent open item, not a footnote.
