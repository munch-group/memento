| Set | Genes |
|:---|:---|
| nucl. diff. expr. spermatids |  **CYLC1** **FRMPD3** |
| Escapes Xi | **FGF13** **NHS** **SYAP1** |
| Xi copy nr modul. Xa expr. | FMR1 **SYAP1** **TBC1D8B** |
| Pos. sel. Europeans (Relate) | **NHS** |
| Pos. sel. all reg. incl. PUR | **FRMPD3** **NHS** **RBMX2** |
| HAR proximal genes | ADAMTS9 **FRMPD3** KIAA0930 NUP50 PRICKLE2 **SYAP1** UPK3A | 
| linAR humans | **FGF13** **FRMPD3** **RAI2** |
| linAR orangs | **FGF13** **FRMPD3** **TBC1D8B** |
| Accel. reg. in Simiiformes br. | **FGF13** **FRMPD3** PABPC5 **RAI2** |
| Pos. sel.l primates (codeml) | **CYLC1** PCDH11X **RBMX2** **SYAP1** TGIF2LX TLR8 USP26 |
| circRNA genes| HDX RPS6KA6 |
| Bonobo LoF rel. to human | PDHA1 PRKDC |

This is the right question to pin down, because glycylation behaves quite differently from glutamylation here. Let me check the current literature rather than reconstruct it from memory, since this is exactly where recent reconstitution/IFT work matters.Let me check the sperm-flagellum and IFT angle specifically, plus the glycylation/glutamylation competition.Short answer: yes, but the dependence is real mainly in **cilia/flagella**, where glycylation lives — and there it shows genuine motor selectivity. For the cytoplasmic kinesin-1/dynein-1 cargo transport relevant to your MAPT work, glycylation is largely a non-player. Here's the breakdown.

**Direct motor-selectivity evidence (newest and most relevant)**

A very recent in vitro reconstitution study using unmodified vs custom-glycylated tubulin found that glycylation selectively enhances ciliary kinesin-2 motility while reducing kinesin-1 activity, suggesting a role in promoting efficient intraflagellar transport along axonemal microtubules. Concretely, gliding velocities of glycylated microtubules were slower on kinesin-1 than on kinesin-2, independent of binding affinity. Since kinesin-2 is the anterograde IFT motor, this is exactly a cargo/track-specificity mechanism — glycylation tunes the axonemal surface to favor the IFT machinery. The authors note that before this, the only evidence of glycylation regulating motors/MAPs was its control of axonemal dyneins in sperm and its antagonism to glutamylation in regulating katanin in vitro.

**Axonemal dynein / ciliary beating**

In *Chlamydomonas*, a glycylation-null TTLL3 mutant completely lacks glycylation and swims more slowly than wild-type, and epistasis with dynein mutants showed that glycylation controls flagellar motility by modulating outer-arm dyneins, presumably by neutralizing the negative charges of the glutamate residues at the C-terminus of β-tubulin. That charge-neutralization point is the key mechanistic hook (see below). Interestingly, TTLL3's own axonemal localization is IFT-dependent, so there's a feedback loop between the modification and the transport system that installs it.

**The mechanism — competition with glutamylation**

This is the part that connects to your existing tubulin-code picture. Glycylation and glutamylation are both mono- and poly-branching additions on the same subset of glutamate residues in the C-terminal tail, installed stepwise by TTLL enzymes. So glycylation acts partly by occupying/neutralizing the very glutamates that would otherwise carry the polyglutamyl signal motors and severases respond to. An early Tetrahymena axoneme study already found that polyglycylation and/or polyglutamylation of the β-tubulin C-terminal tail (but not α-tubulin) influences kinesin-1–microtubule binding. The competition is antagonistic, which is why glycylation can blunt glutamylation-driven effects.

**Why it doesn't bear on cytoplasmic transport**

The functional ceiling here is localization: glycylation is primarily found on cilia, and its functional role is not well understood — little is known about binding partners specific to this modification. It's essentially absent from the bulk cytoplasmic/axonal microtubule array, so the kinesin-1/dynein-1 cargo logic you care about for tau is governed by glutamylation and detyrosination, not glycylation. One caveat worth keeping: a fair amount of the motor-specificity data is in vitro reconstitution or coarse-grained MD, so the in vivo cargo-selectivity claims for glycylation are still maturing.

If useful, I can pull the 2026 reconstitution preprint in full — it's the cleanest single-molecule-level dataset on the kinesin-1 vs kinesin-2 split and would be the thing to cite if you want the mechanism nailed down.

> Do that

Pulled the full preprint. It's from Gadadhar's lab (iBRIC-inStem) — Mullick et al., posted March 30, 2026, doi 10.64898/2026.03.26.714406, with Sirajuddin as co-senior author. Here's what's actually in it.

**The system**

They sidestepped the perennial problem that axonemal tubulin is nearly impossible to purify in usable quantities. Instead they made homogeneous tubulin from Lenti-X 293T cells, which carry very low glutamylation and glycylation (their "unmodified" pool), and engineered a stable mCherry-TTLL3 line to generate custom-glycylated tubulin, with brain tubulin as the highly-glutamylated reference. Because TTLL3 preferentially modifies β-tubulin, the glycylated pool is glycylated predominantly on β-tubulin with some on α. They then ran TIRF gliding, binding, depolymerization and severing assays against truncated/dimeric kinesin-1 (human KIF5B, K560), kinesin-2 (*C. elegans* Osm3ΔH2), MCAK (kinesin-13), and spastin.

**The motor split (the headline result)**

The two transport kinesins respond in opposite directions, and it's not just velocity — binding tracks with it:

- **Kinesin-1 (KIF5B):** glycylation slows it. Gliding velocities were ~270 nm/s on unmodified, 184 on brain, and slowest at 103 nm/s on glycylated MTs — about 2.6-fold slower than unmodified and 1.7-fold slower than brain. Binding fell too: K560 bound brain MTs most strongly and lost binding to glycylated MTs in a concentration-dependent way, with anything below 56 nM failing to bind glycylated MTs.
- **Kinesin-2 (Osm3):** glycylation speeds it. Glycylated MTs gave a median velocity of 506 nm/s, ~1.4-fold higher than brain (364) and ~2.85-fold higher than unmodified (177 nm/s). And Osm3 bound brain and glycylated MTs similarly but bound unmodified MTs much less.

The dose-response nails it down: titrating brain+glycylated tubulin to 50%/70% glycylation raised Osm3 velocity monotonically — from 257 nm/s (brain) to 396 (70% glycylated) to 579 nm/s (fully glycylated).

**The stability arm (MAPs)**

Glycylation also makes the lattice resistant to disassembly, which is the proposed reason cilia lengthen/stabilize when glycylation is high:

- **MCAK (depolymerase):** glycylated MTs depolymerized at 0.08 µm/min vs 0.22 (unmodified) and 0.33 (brain) — ~4-fold slower than brain, dose-dependently.
- **Spastin (severing):** extent of severing at 5 min was ~22% for glycylated vs ~31% unmodified and ~62% brain, with severing rate dropping from 1.23 (brain) to 0.61 events µm⁻¹ min⁻¹ on glycylated. This extends to spastin the antagonism previously shown for katanin.

**Mechanism they propose**

It's electrostatic, and it routes through the glutamylation competition you already know. Glycylation and glutamylation occupy the same β-CTT glutamates; adding neutral glycines neutralizes the tail's negative charge. Kinesin-1's processivity depends on positively-charged patches engaging the negatively-charged CTT and on β-tubulin glutamylation, so neutralizing/displacing that charge lowers its binding and velocity. Kinesin-2 reads both α- and β-CTTs and seems to benefit from reduced electrostatic drag; the authors also suggest glycylation, like glutamylation, may relieve the inhibitory effect of α-tubulin tyrosination on Osm3. Net framing: an optimal balance of both glycylation and glutamylation is needed, and combinatorial modification patterns define functional microtubule properties in the axoneme.

**Caveats worth holding onto**

Several, and they matter if you'd cite this:
- It's an unrefereed preprint, and entirely in vitro reconstitution — no axonemes, cells, or IFT trains.
- Motors are truncated constructs (K560; Osm3ΔH2, autoinhibition-relieved), with no cargo adaptors — so "cargo specificity" here is inferred from motor identity, not measured on real cargo complexes.
- The gradient experiment raises glycylation and lowers glutamylation simultaneously, so the two contributions aren't fully separable.
- Glycylation is mostly on β here, whereas native axonemes carry a defined α/β pattern.
- No dynein in this study — the axonemal-dynein link is from their earlier sperm paper (their ref 13).

For your MAPT/transport angle, the clean takeaway is that the one cytoplasmic transport motor tested, kinesin-1, is *impaired* by glycylation — but as the authors note, kinesin-1 does not localize to cilia and is unlikely to ever be exposed to glycylation in vivo. So this reinforces, rather than complicates, the picture that glycylation is a ciliary regulator and your axonal kinesin-1/dynein-1 cargo logic stays governed by glutamylation and detyrosination. The spastin (SPAST) result is the one bit that could matter outside cilia if glycylation ever appears on non-axonemal MTs.

> The reason I am interested in poly-glycylation is that TTLL10 has been lost in humans (as the only primate) and I am thinking that a disabled TTLL10 could have been under positive selection if it thereby short-circuited a pathway coopted by a meiotic driver on X or Y. Genes relying on poly-glycylation would be the next lead in the chain (not necessarily the driver itself)
