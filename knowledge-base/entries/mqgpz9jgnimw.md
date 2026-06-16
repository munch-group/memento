> Which genes depend on polyglycosilation of microtubules

You almost certainly mean **polyglycylation** (glycine side-chains added to tubulin C-terminal tails), as distinct from polyglutamylation — I'll answer for that. There are really two senses of "depend on," so here's both.

**The writers (genes encoding the glycylases)**

Polyglycylation is installed by a subset of TTLL (tubulin-tyrosine-ligase-like) enzymes:
- **TTLL3** and **TTLL8** — *initiases*, adding the first (branch-point) glycine onto glutamate residues of α/β-tubulin tails.
- **TTLL10** — *elongase*, extending the polyglycine chain. Worth flagging for your work: human TTLL10 is catalytically dead (loss-of-function substitutions), so humans are largely limited to mono-/oligo-glycylation, whereas mouse TTLL10 is active and supports long chains. There's no well-defined glycine-specific "eraser" analogous to the CCP deglutamylases.

**What functionally depends on the modification**

Glycylation is concentrated on stable axonemal microtubules, so the dependent phenotypes are overwhelmingly ciliary/flagellar:
- **Sperm flagella / male fertility** — Ttll3/Ttll8 double-knockout mice show progressive axoneme instability, loss of doublet microtubules, and motility/fertility defects.
- **Motile cilia** — ependymal and airway cilia rely on it for axoneme maintenance and beating.
- **Photoreceptor connecting cilium**.
- In *Tetrahymena* and *Drosophila*, glycylation is essential for axoneme integrity, with severe ciliary phenotypes when ablated.

So if you're asking "which genes carry it out" → TTLL3/8/10. If you're asking "which genes/processes are functionally dependent on it" → the axonemal/ciliary motility module above, rather than a discrete set of reader genes (glycylation readers are far less characterized than the glutamylation readers like spastin/katanin).

Given your interest in X-linked spermatogenesis and a post-meiotic drive module, the sperm-flagellum dependency is the most relevant thread — happy to go deeper on the TTLL3/8 axoneme literature or the human TTLL10 inactivation if useful.

> Is any transport along microtubules dependent on polyglycylation. Eg kinesins, dyneins, cargo specificity
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

This is a genuinely interesting hypothesis, and it's testable with tools you already use. Before I reason about the "next link" genes, let me verify the load-bearing premises — the phylogenetic scope of the TTLL10 loss and whether anyone has looked at selection on it — since the strength of the drive argument depends heavily on whether the loss is human-specific and recent versus old/degenerative.Good — this substantially sharpens (and partly complicates) your premise. Let me do one more check on whether anyone has connected the TTLL10 loss to selection or sperm phenotype since 2009.Your premise holds up, and the primary data sharpen it in ways that actually help the hypothesis — but with two refinements that change what the "short-circuit" is and where to look next.

**What the loss actually is (refining the premise)**

The human-specific claim is correct and well-documented. Rogowski et al. mapped the inactivation to two substitutions in the conserved core TTL domain — S448N (mut3) and K467T (mut5) — and showed activity is recovered only when both are reverted to the conserved mouse/rhesus residues, not when either is reverted alone. Critically, neither mutation is found in great ape genomes, so humans appear unique in having lost TTLL10 polyglycylase activity, while mouse and rhesus TTLL10 are both active. And the sperm phenotype is direct: a polyglycylation antibody detects bands in mouse and rhesus sperm but not human sperm, whereas the monoglycylation antibody TAP952 labels human tubulin strongly.

Refinement 1 — **it's a loss of chain *elongation*, not of glycylation.** TTLL10 is the elongase; it requires pre-existing monoglycines deposited by TTLL3/8 and elongates from them, and its activity is self-limiting. So humans retain monoglycylation (via TTLL3/TTLL8) and have simply lost long polyglycine chains. For your model this is a feature: the driver would have to be exploiting *chain length* specifically, and the thing you've disabled is the high end of the glycylation axis. Any candidate "next link" must therefore be a **chain-length-discriminating** reader, not merely a glycylation-sensitive one.

Refinement 2 — **the loss is two-hit and partially polymorphic, which is itself the selection lead.** mut3 segregates: alleles lacking mut3 are common in sub-Saharan Africans (55% heterozygous, ~17% homozygous) but mut3 reaches ~92% in Europeans. Since you need both hits to inactivate, mut5 is presumably the older fixing lesion and mut3 a second, population-differentiated layer. That layering — one fixed inactivation plus a swept second site — is exactly the structure you'd test for adaptive "locking in," and it gives you a concrete allele with a frequency trajectory rather than a monomorphic knockout.

**NAP1 and nucleosome assembly**

TTLL10 isn't only a tubulin enzyme. **Its original identification was as a polyglycylase of nucleosome assembly protein 1 (NAP1)**, a 60-kDa cytoplasmic protein that accumulates in elongating spermatids. That puts a TTLL10 substrate squarely in the spermatid chromatin-remodeling window — the histone-to-protamine transition — rather than the flagellum. Given your heterochromatin-sink framing, a chromatin-chaperone substrate of the lost enzyme is arguably a *better* drive-chain candidate than the axoneme, because chromatin-state asymmetries are one of the few things that can plausibly stay cell-autonomous in a syncytium. I'd treat NAP1 polyglycylation as a first-class lead, not a footnote.

**Candidate "next link" genes (chain-length-dependent effectors)**

On the axonemal/transport branch, the proximal readers whose function tracks glycylation state:
- **Kinesin-2 / IFT**: KIF17 (the Osm3 ortholog), KIF3A/KIF3B/KIFAP3 — enhanced by glycylation; required for flagellar assembly.
- **Axonemal dyneins**: outer-arm heavy chains (DNAH8, DNAH17), DNAI1/2, DNALI1 — the Chlamydomonas data tie glycylation to outer-arm dynein control of motility, and this connects to the t-haplotype precedent below.
- **Severing/depolymerases**: SPAST, KATNA1, KIF2C (MCAK) — *suppressed* by glycylation, so they read it inversely.

On the chromatin branch: NAP1L1/NAP1L4 and the spermatid NAP-family chaperones.

And the link to your existing X module: the mouse **t-haplotype** is the proof-of-concept that a drive system can act *through differential sperm flagellar/motility function* (RAC/RHO–GTPase signaling onto the axoneme), with a cis-acting responder (Smok1) solving the sharing problem. Your DYNLT3 (Tctex-type dynein light chain) sits right at that interface. If an X driver biases Y-bearing spermatid fate via dynein behavior on the shared axonemal track, the *track's* glycylation state is the shared medium, and TTLL10 loss caps how extreme that medium can get.

**The objection you have to clear**

The syncytium. Tubulin, the TTLLs, and most post-meiotic products are shared across spermatids through intercellular bridges, which normally equalizes haploid phenotypes and suppresses drive. A glycylation-based driver therefore can't work as a simple haploid-expressed modifier — it needs the poison-antidote architecture (a diffusible/shared "poison" plus a *cis*-tethered responder). So the coherent version of your model is: polyglycylation is the shared poison-delivery axis, the driver provides a chromosome-linked reader/responder, and disabling the elongase flattens the dynamic range the responder exploits. NAP1's chromatin role is attractive partly because chromatin compartmentalization is one of the few cis-restricted channels available.

**Tests you can actually run with your stack**

1. **Archaic genotypes (your IBDmix wheelhouse).** Rogowski predates high-coverage archaics, so the great-ape statement says nothing about Neanderthal/Denisova. Pull mut5 (K467T) and mut3 (S448N) genotypes from Altai/Vindija/Chagyrskaya/Denisova. If mut5 is shared with archaics, the fixing loss predates the ~600 kya split; if mut3 is derived/modern-human-only, you have a clean post-split second hit to test for a sweep.
2. **Selection on mut3 directly.** It's a segregating, strongly population-differentiated site — run iHS/nSL and Fst in 1000G, and look it up in the Akbari et al. 2026 time-series to see if the European trajectory is recent and directional. Caveat: TTLL10 is at 1p36.33, subtelomeric, gene-dense and high-recombination, so haplotype-based statistics will be noisy and you'll want to control for the local recombination landscape.
3. **Transmission/sex-ratio phenotype.** The sharp prediction of a drive-suppression model is that the *ancestral active* allele (or non-mut3 haplotype) should associate with transmission distortion or skewed offspring sex ratio. The segregating African mut3 polymorphism is the natural contrast for a TDT-style or offspring-sex-ratio analysis if you can find a cohort with the genotype.
4. **Co-evolution signal.** If TTLL10 loss neutralized an X/Y sperm driver, expect a coincident relaxation of selection or sequence turnover on candidate ampliconic X/Y spermatid genes — datable against the archaic result from (1).

The honest caveat: no one has described a glycylation-dependent meiotic drive system, so this is genuinely novel rather than under-explored — which cuts both ways. The strongest non-adaptive null is plain relaxed constraint (humans needing less long-chain glycylation), and the two-hit structure is consistent with that too. The archaic dating in (1) is the cheapest experiment that would most move your prior, and the NAP1 chromatin branch is the lead I'd add to your existing axonemal thinking.

> Two things: 1. My collaborator has established that Neanderthals and Denisovans had functional poly-glycoglycylation. He also reports that in knockout zebrafish male KO crossed with female WT reduces the number of successfully fertilized eggs, and interesting, that this effect is even more severe if male KO is crossed with female KO - potentially suggesting that loosing TTLL10 induces a state of spermatozoa that (maybe DNA damage) may be partially rescued in  by a functional copy in the egg. 2. Consider the posibility that poly-glycylation acts as a means to control the selective bidirectional transport across spermatid bridges connecting X and Y spermatids

Both of these are substantive, and the second one is the most mechanistically interesting version of the hypothesis I've seen you reach for. Let me ground two molecular handles before I reason about it, because they're load-bearing.The archaic-functional result is the most important thing you've told me, and your idea #2 turns out to map onto a real, documented transport system. Let me take them in turn.

**1a. Archaic functionality tightens the timing — and hands you a clean test**

If Neanderthals and Denisovans retained active polyglycylation, then mut5 (the fixing lesion) arose and fixed in the modern human lineage *after* the split (<~600 kya), with mut3 layering on more recently and still segregating. That's a young, lineage-specific, two-step inactivation — the best possible scenario for both sweep detection and a human-specific drive-suppression story.

The sharp, cheap prediction is in your wheelhouse: if the loss was adaptive, the functional archaic allele should have been selected *against* on reintroduction. So at TTLL10 (1p36.33) you'd predict an **archaic-ancestry desert** — no surviving introgressed Neanderthal/Denisovan haplotypes carrying active TTLL10, even though they existed and were reintroduced. Run IBDmix there and check it against the Platt et al. sex-bias framework. A desert at a locus where archaics carried the *ancestral functional* state, in the modern-human lineage that uniquely disabled it, is exactly the configuration that distinguishes adaptive loss from drift. (Caveat: subtelomeric, gene-dense, high-recombination region — control the local map carefully, and the desert could be driven by a neighbor.)

**1b. The zebrafish crosses point at the chromatin/zygotic branch, not the drive branch**

Two cautions first. Zebrafish lack heteromorphic sex chromosomes, so the KO tells you about a *conserved* role of polyglycylation in fertilization success and a maternally-rescuable sperm state — it's silent on XY drive. And "fertilization success" matters for interpretation: a pure motility defect (glycylation → axonemal dynein) is *not* maternally rescuable — the egg can't fix a sperm that doesn't arrive. So the fact that a WT egg partially rescues, and a KO egg cannot, means the scored phenotype includes a **post-entry, egg-buffered step**, which is precisely why your collaborator's DNA-damage intuition is well-motivated.

The KO×KO-worse-than-KO×WT pattern is a maternal-effect rescue: maternal (egg-deposited) TTLL10/polyglycylation acts in the zygote on a paternally-derived structure. Two candidates, distinguishable experimentally:
- **Paternal genome integrity / packaging** — TTLL10 also polyglycylates NAP1, which accumulates in elongating spermatids during the histone→protamine transition. Defective packaging → sperm DNA damage → maternal repair machinery in the zygote partially fixes it. Test: γH2AX on the paternal pronucleus, sperm chromatin structure assays.
- **Paternal centriole** — the zebrafish zygote uses the sperm-contributed centriole for the first cleavages, and basal bodies/centrioles are glycylated. A defective paternal centriole → abnormal first division, rescuable if the egg supplies modifying capacity. Test: first-cleavage spindle/centrosome imaging.

Either way, this is independent evidence that polyglycylation guards something beyond the flagellum — and the chromatin option dovetails with your heterochromatin-sink thinking.

**2. The bridge-transport idea — it lands on a real system**

This is the strongest version. The default suppressor of drive in the testis is exactly what you're proposing to subvert: spermatids stay connected by cytoplasmic bridges so that haploid differentiation is directed by the products of both parental chromosomes, making the syncytium functionally diploid. And the cargo that gets shared isn't abstract — the chromatoid body and smaller granules dissociating from it move from one spermatid to another through the connecting cytoplasmic bridge.

Now the convergence: the motor that moves that cargo is kinesin-2. KIF17b localizes to the chromatoid body, which moves actively and non-randomly making frequent contacts with the nuclear envelope, and KIF17b physically interacts with the PIWI-family protein MIWI; separately it serves as the motor of a TB-RBP ribonucleoprotein complex transporting specific CREM-regulated mRNAs in postmeiotic germ cells. The canonical spermatid model literally draws mRNAs moving to the cytoplasm along microtubules via KIF17b, with some transferred to another cell through the intercellular bridge. Kinesin-2 is precisely the motor the reconstitution data show is *enhanced* by glycylation and capped by the TTLL10 loss. So polyglycylation is a credible tuning knob on the exact RNP-traffic system that enforces haploid equalization.

The clean statement of your hypothesis then becomes: **polyglycine chain length sets the gain on kinesin-2-mediated selectivity of inter-spermatid transport; a driver co-opts that to rectify the sharing network (bias which RNPs reach X- vs Y-bearing nuclei); disabling the elongase collapses the dynamic range and restores fair sharing.** Losing specifically the elongase — not all glycylation — is exactly what this predicts, because chain length is the gain control, not the on/off switch.

But the crux you can't skip is the same one as before, one level up: glycylation is written on *shared* tubulin, so by default it's symmetric and can't by itself distinguish the two connected nuclei. To bias X vs Y you still need a **cis-restricted asymmetry source** — a chromosome-tethered reader, a locally-anchored TTLL regulator, or localized translation at one nucleus — and glycylation then acts as the conduit that the cis element rectifies. Glycylation is the diode's silicon; something chromosome-linked has to be the doping that sets the direction. The honest framing is that your model needs both, and the polyglycylation pathway is the coopted *medium*, consistent with your original "next link in the chain, not the driver" intuition. The chromatoid body/MIWI connection is suggestive here because piRNA/transposon-silencing asymmetries are one of the few things plausibly maintained cis at each nucleus.

**What I'd test, ordered by cost**

1. IBDmix archaic-ancestry desert at TTLL10 (1b above) — cheapest, highest information about adaptive vs neutral loss.
2. mut3/mut5 in the Akbari time series + iHS/Fst with the African–European contrast as anchor; check whether the European trajectory is recent and directional.
3. Coevolution screen: do KIF17b (KIF17), KIF3A/B, TB-RBP/Translin, or chromatoid-body genes show lineage-specific changes coincident with the modern-human TTLL10 loss? A driver-suppression event often leaves correlated turnover on the coopted machinery.
4. For the collaborator, in an XY model (mouse): does TTLL10 KO shift transmission ratio or offspring sex ratio? Is long-chain glycylation actually present on manchette/bridge-traversing microtubules (not just the axoneme)? Is chromatoid-body/KIF17b traffic across bridges altered? And the decisive one for the cis-asymmetry question: is there *any* detectable asymmetry in glycylation or KIF17b-cargo distribution between connected X- and Y-spermatids — zero in WT would confirm fair sharing, and a driver's signature would be local rectification.

Three honest caveats to keep in view: zebrafish can't speak to the XY-drive arm; KIF17b has a documented microtubule-*independent*, PKA-driven mode for at least one cargo (ACT), so not all its transport reads the tubulin code; and whether glycylation marks the relevant non-axonemal spermatid microtubules is still an open empirical question rather than an established fact. The cis-asymmetry source remains the load-bearing unknown — that's the thing I'd design the next experiment around.

> No sequenced human carry TTLL10   introgressed from Neanderthals. A single human carries a TTLL10 recieved from Denisovans that only admixed with central/east asian modern humans (expecially Oceeania). Through my research network i know of a hospital rutinely sequencing pations that about 5 in 50,000 patients carry a functional TTLL10 and also that a functional TTLL10 has been observed in a small number of West Africans (Camaroon). No TTLL* genes in the Akbari data set. I have a selection scan on the 1000-genomes data set that can query when I get home.

Both of these are substantial, and they pull the story in a direction that's actually different from where we started — so let me work through them carefully, including where they're in tension. First let me ground one piece of cell biology I don't want to assert from memory: whether microtubule-based transport actually crosses the spermatid bridges, since your second hypothesis lives or dies on that.Both of these change the shape of the problem, and they actually point at two *different* conflict architectures. Let me take them in turn and then deal with the tension between them, because I don't think they're the same mechanism.

**1. Archaic functionality dates the loss — and forces a correction to the mut3 story**

If Neanderthals and Denisovans had functional polyglycylation, the inactivation is modern-human-specific and postdates the split (~600 kya), which is the single most selection-friendly fact you could have. A recent, lineage-specific, fixed loss of an otherwise-conserved enzyme is the textbook setup for an adaptive loss or a sweep, and it's directly datable from ancient DNA.

But it also forces me to walk back something from before. Recall Rogowski's epistasis result: reverting *either* inactivating site alone does not restore activity — you need both reverted. That means each mutation is independently sufficient to kill the enzyme, so whichever arose first did the inactivating and the second landed on an already-dead gene. So the segregating mut3 polymorphism (the African/European frequency difference) is most likely *neutral variation on a background already inactivated by the other lesion*, not a selection signal. The population differentiation I flagged earlier is probably demography, not a sweep. The corollary is the actually-pivotal, checkable question: **is there any fully-ancestral, doubly-functional TTLL10 haplotype still segregating in sub-Saharan Africa?** If individuals "lacking mut3" still carry the other lesion, no — the loss is fixed. If a doubly-ancestral allele exists, you have *segregating functional TTLL10 in living humans*, which would be spectacular and immediately testable for transmission distortion. Your collaborator's archaic genotypes plus the African mut3 carriers settle this directly: phase mut3 and mut5 (S448N / K467T), determine which is the fixed inactivator, and check whether the ancestral combination survives anywhere.

There's also a logical point the zebrafish data sharpen: losing TTLL10 is *costly* (reduced fertilization). You don't lose a fertility-promoting gene by drift-tolerated relaxation alone and fix it lineage-wide; an adaptive loss requires a benefit that outweighs a direct fertility cost. Suppressing a genomic conflict is one of the very few things that fits that bill — which, perversely, makes the fitness cost evidence *for* your conflict framing rather than against it.

**2. The zebrafish maternal rescue looks like modification/rescue, not meiotic drive**

The structure you describe — paternal KO defect, partially rescued by a functional maternal copy, worse in KO×KO — is a maternal-effect rescue of a paternal-effect lesion. That is the signature of a **toxin–antidote / mod-resc system**, and the closest natural analog is *Wolbachia* cytoplasmic incompatibility: the sperm is "modified" (CI disrupts the histone-to-protamine handoff and produces paternal DNA-condensation defects and damage), and the egg "rescues" via a matching maternal factor. Your collaborator's DNA-damage intuition fits that mold precisely.

And this routes to the branch I flagged before but should now promote: TTLL10's non-tubulin substrate is **NAP1**, glycylated specifically in elongating spermatids — a histone chaperone sitting right at the protamine-transition step. A clean model for the zebrafish result is that TTLL10/NAP1-dependent chromatin remodeling sets up paternal chromatin correctly, loss produces retained-histone/DNA-damage sperm, and maternal machinery (the egg's own NAP/repair/remodeling, or maternally deposited TTLL10 product acting on the sperm-derived material) partially repairs it post-fertilization. The maternal genotype mattering in KO×KO is the tell that there's a maternally provided product acting on the paternal contribution in the zygote.

The important caveat: **zebrafish has no heteromorphic XY**, so this experiment cannot be testing an X-versus-Y bridge mechanism. It's testing a general paternal-chromatin/fertility axis. So the zebrafish data support a *post-fertilization, chromatin, parent-of-origin* role — which is a different conflict stage from your hypothesis 1. Worth being explicit that these are two separate stories that happen to share an enzyme. To pin the mechanism, look at *where* the KO zygotes fail: fertilization/syngamy/first-cleavage failure points to the sperm aster/centriolar microtubules (maternal enzyme fixing paternal hardware); later failure with γH2AX and altered protamine ratios points to the NAP1/chromatin–damage model.

**3. The bridge-transport hypothesis is mechanistically viable — with one cell-biological gap**

This is the more original idea and it survives contact with the literature better than I expected. The key facts:

- Organelle traffic across spermatid intercellular bridges is real, and it's *microtubule- and motor-dependent*: microtubule inhibitors prevented all organelle movement through the bridges and disintegrated the chromatoid body.
- The bridge is *already a selective filter*, not a free-diffusion pore: only 28% of granules entering a bridge were actually transported into the neighboring cell, and granule speed dropped significantly during passage, and some shared granules carried a haploid-specific gene product. A channel that already passes ~1 in 4 cargoes is exactly the kind of thing that could be *rectified* — biased toward one neighbor.
- The relevant motor is in the family glycylation regulates: the testis kinesin-2 KIF17b is an established transporter of haploid gene products in spermatids, and the chromatoid body itself shuttles between cells through the bridges.

So your hypothesis maps onto a concrete machine: glycylation sets motor selectivity (kinesin-2 up, kinesin-1 down, dynein modulated — from the reconstitution work), which on a bridge-spanning track translates into *which cargoes cross and in which direction*. Long-chain polyglycylation would tune that rectifier to its extreme; losing the elongase caps the dynamic range and de-rectifies the bridge back toward symmetric sharing. That is a clean, localized version of your "short-circuit" — and the natural cargo is the chromatoid body, which carries the piRNA/miRNA silencing machinery, i.e., precisely the kind of payload whose asymmetric delivery could bias spermatid fate.

The gap you have to close — and it's the same one that defeats most XY-drive models — is the **source of asymmetry**. Tubulin and the TTLL enzymes are themselves shared across the bridge, so on their own the tracks on the X-spermatid and Y-spermatid sides should be *equally* glycylated. A rectifier can amplify an asymmetry but can't manufacture one. For drive you still need a *cis-restricted* symmetry-breaker — an X- or Y-tethered factor that is not freely shared (a locally translated/anchored transcript, a chromosome-associated reader, or asymmetric chromatoid-body inheritance). Glycylation would be the conduit; the driver supplies the valve setting on one side. Second gap: it's not established that the *cytoplasmic/manchette/bridge* microtubules carry glycylation at all — glycylation has so far looked largely axoneme-restricted, and the Ventelä experiments showed MT-dependence, not glycylation-dependence. So the load-bearing unknown is simply: **are the bridge-spanning transport microtubules glycylated, and does chain length gate their motor selectivity?** That's an antibody (polyG/TAP952) co-localization plus a TTLL3/8/10-perturbation transport assay — very doable for your collaborator who already has the KO line.

**Synthesis and what would unify them**

You now have two conflict stages on one enzyme: an intra-testicular routing function (hypothesis 1, pre-fertilization, possibly XY-biasing via the bridge rectifier) and a post-fertilization paternal-chromatin/mod-resc function (the zebrafish data, via NAP1). They could be independent pleiotropy, or they could be one system if the thing the bridge differentially delivers *is* the chromatin-remodeling capacity (NAP1-loaded chromatoid material), so that asymmetric routing in the syncytium and the chromatin state carried into the zygote are the same axis read at two times. That unified version is the most ambitious but also the most falsifiable.

Discriminating experiments, in rough order of cheapness:

1. **Phase mut3/mut5 against archaics + African carriers** to fix the loss order and ask whether functional TTLL10 still segregates — settles the selection-detectability question and is squarely in your and your collaborator's wheelhouse.
2. **Localize glycylation in spermatids** (polyG vs TAP952) to manchette, bridge-region, and chromatoid-body-associated microtubules — the make-or-break for hypothesis 2.
3. **Where do zebrafish KO zygotes fail** (sperm aster MTs vs γH2AX/protamine) — separates the microtubule-hardware rescue from the NAP1/chromatin-damage model.
4. **Asymmetry test**: in a heteromorphic-sex-chromosome model (mouse, not zebrafish), ask whether chromatoid-body/granule flux across bridges is biased by spermatid genotype, and whether that bias collapses under glycylation perturbation.

The honest summary: the archaic dating materially strengthens the adaptive-loss case; the zebrafish data are real but point at a chromatin/mod-resc axis distinct from intra-male XY drive; and the bridge-rectifier idea is mechanistically grounded except for the unproven premise that bridge-transport microtubules are glycylated — which is the first thing I'd nail down, because everything in hypothesis 2 hangs on it.

> What does the literature say about the cargoes carried by KIF17b?

