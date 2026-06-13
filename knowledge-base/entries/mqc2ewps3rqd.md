I'll search for current literature on the genes involved in X chromosome inactivation.Let me search for the molecular machinery reviews specifically, since the silencing factors are what you'll want anchored.Let me get the most authoritative comprehensive mechanistic review to anchor the full factor list.There are two things "genes involved in somatic XCI" can mean, so I'll flag the distinction and give you the one that's almost certainly what you want (the *machinery* — the trans-acting and cis-acting factors that establish and maintain silencing), with a pointer to the other (the catalogue of which X-linked genes are subject to vs. escape inactivation).

The best single anchor for the machinery is Loda, A., Collombet, S. & Heard, E. "Gene regulation in time and space during X-chromosome inactivation." Nat Rev Mol Cell Biol 23, 231–249 (2022), supplemented by Augui, Nora & Heard (Nat Rev Genet 12, 429–442, 2011) for the X-inactivation centre, and the SPEN/silencing-factor primary literature for effector detail.

## The XCI machinery (trans- and cis-acting factors)

**Master regulatory ncRNAs and Xic cis-elements**
- **XIST** — the 17-kb lncRNA trigger and master regulator; coats the future Xi in cis. XIST is the trigger and master regulator of XCI.
- **TSIX** — antisense repressor of Xist (robust in mouse; vestigial in human).
- **JPX**, **FTX** — positive cis/trans regulators of Xist expression.
- **TSX**, **XITE**, **LINX**, **DXPas34** — additional Xic regulatory elements (mouse).
- **RepA / A-repeat** — the 5′ Xist element required for silencing (the SPEN-binding module).
- **XACT** — human-specific lncRNA associated with the active X in pluripotent cells.

**Dosage-dependent activators / Xist transcriptional regulators**
- **RLIM / RNF12** — dosage-dependent E3 ligase activating Xist.
- **YY1** — tethers Xist RNA to the Xi nucleation site.
- **CTCF** — boundary/architecture and Tsix regulation.
- Pluripotency repressors of Xist: **REX1/ZFP42**, **POU5F1/OCT4**, **NANOG**, **SOX2**, **PRDM14**, **TFCP2L1**.

**XIST RNA-binding silencing effectors** (these are the core "doers")
- **SPEN/SHARP (SMRT/HDAC-associated)** — the critical A-repeat–binding silencing factor. SPEN bridges the non-coding RNA Xist to transcription machinery, histone deacetylases and chromatin remodelling factors to initiate X-chromosome inactivation, and SPEN is essential for initiating gene silencing on the X chromosome in preimplantation mouse embryos and in embryonic stem cells.
- **RBM15 / RBM15B** and **WTAP** (with **METTL3/METTL14**) — the m6A methyltransferase complex. SPEN and RBM15, both RBPs containing a SPOC domain, and WTAP, a subunit of the m6A RNA methyltransferase complex were the top hits in the silencing screens.
- **hnRNPU / SAF-A**, **hnRNPK**, **CIZ1**, **PTBP1**, **MATR3**, **CELF1** — Xist localization/anchoring to the chromosome territory and nuclear matrix.
- **LBR (lamin B receptor)** — recruits the Xi to the nuclear lamina to enable silencing.

**Corepressors recruited downstream of SPEN**
- **NCoR/SMRT (NCOR1, NCOR2)** and **HDAC3** — deacetylation of active marks.
- **NuRD complex** — CHD4, HDAC1/2, MTA1/2/3, MBD3, GATAD2A/B.

**Polycomb system**
- **PRC1** (RING1A/RING1, RING1B/RNF2, PCGF3/5, RYBP) — deposits **H2AK119ub1**; hnRNPK links Xist to PRC1.
- **PRC2** (EZH2, EED, SUZ12, RBBP4/7) — deposits **H3K27me3**, with **JARID2** as cofactor.

**Maintenance, DNA methylation, and chromatin architecture**
- **SMCHD1** — late-recruited, required for silencing a subset of genes and CpG-island methylation. SmcHD1 recruitment to Xi is dependent on establishment of PRC1-mediated H2AK119ub1, and SmcHD1 contributes to establishment of silencing at a specific subset of genes during Xist-mediated chromosome silencing in a differentiation-dependent manner.
- **DNMT1** (and DNMT3 family) — maintenance methylation of Xi promoter CpG islands.
- **macroH2A (MACROH2A1/H2AFY, MACROH2A2)** — late-accumulating repressive histone variant.
- **ATRX**, **cohesin**, **DXZ4** (megadomain boundary macrosatellite), **FIRRE** — 3D reorganization of the Xi.

A useful framing from the review: these act in temporally distinct waves — the 17 kb lncRNA Xist spreads in cis along the future Xi and recruits different proteins involved in gene silencing... Active histone marks are removed and repressive histone marks are instigated, catalyzed by polycomb group complexes and other protein complexes... Finally, in the maintenance phase, the inactive state of the Xi is epigenetically propagated across cell divisions.

## The other reading — the catalogue of inactivated vs. escape genes

If instead you wanted the list of which X-linked genes are *subject to* XCI (silenced) versus escape it, the canonical references are Balaton, Cotton & Brown (2015, *Biol Sex Differ*), which assigned a consensus XCI status [to] 639 genes, including 78% of protein-coding genes expressed outside of the testes, and Tukiainen et al. (2017, *Nature*, "Landscape of X chromosome inactivation across human tissues"). Roughly more than 20% of X-linked genes examined to date continuing to be expressed from the otherwise inactive chromosome.

Want me to pull the Balaton/Tukiainen consensus tables into a structured file (e.g. a tidy TSV of gene × XCI-status), or expand the machinery list into an annotated table with the key primary citation and assigned function per factor?