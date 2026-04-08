Three of the 13 autosomal genes associated with MT expression in L and non-L haplogroup MT have INDRA support for form complexes with X-linked genes. 

| Gene pair | INDRA type | Belief | Evidence | PMIDs |
|:------|:-----------|:--------|:----------|:-------|
| GRSF1 -- **RPS6KA3** | Complex | 0.82 | 3 (BioGRID) | 32707033, 31678930, 35271311 |
| GRSF1 -- **HSD17B10** | Complex | 0.80 | 4 (3 BioGRID + 1 REACH) | 32877691, 23473034, 29395067 |
| PTCD1 -- **RBMX** | Complex | 0.82 | 3 | 26186194, 28514442, 33961781 |

The remaining 10 pairs returned zero INDRA statements. All genes individually exist in INDRA DB with other interaction partners, so the null results are genuine absences rather than lookup failures. However, STRING supports interactions of additional six genes:

- MRPS7 -- **EIF1AX**: (STRING 0.888) Highest STRING score in the dataset, driven by experimental (0.581) and coexpression (0.656) channels. Zero INDRA statements. The co-translation coordination argument is biologically reasonable but the framing as a direct interaction is unsupported by curated databases.
- PNPT1 -- **LAS1L**: (STRING 0.410) Only pair with STRING database evidence (0.360). Zero INDRA statements. The parallel ribosome biogenesis coordination argument is sound.
- PNPT1 -- **DKC1**: (STRING 0.579) Coexpression (0.411) and textmining (0.268) driven. Zero INDRA statements. Indirect link through parallel ribosome production in different compartments.
- GRSF1 -- **DDX3X**: (STRING 0.510) Primarily textmining (0.490). Zero INDRA statements despite both genes having large individual statement sets (~700 and ~3000 respectively). The mitochondrial connection narrative is speculative.
- PNPT1 -- **DDX3X**: (STRING 0.506) Mixed experimental (0.230) and coexpression (0.303). Zero INDRA statements. The innate immunity link (PNPT1 RNA release -> DDX3X/MAVS) is an interesting hypothesis but unverified.
- MRPS7 -- **UBQLN2**: (STRING 0.448) Experimental (0.302) and coexpression (0.200). Zero INDRA statements. The mitochondrial protein quality control argument is plausible but generic.