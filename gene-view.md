# Genes view

A gene-centric map of memento. Where the **Graph** view links *cards* by the genes
you wrote, the **Genes** view links *genes* by biology you didn't — gene–gene
interactions pulled from [INDRA](https://www.indra.bio/). The payoff is the edge
between two genes sitting on two different cards that you never connected, where
the literature says they interact.

- **Open it:** press `I` (interactions), or click **Genes** in the view bar
  (Dashboard · Cards · Graph · **Genes** · Timeline).
- **Data:** a git-tracked sidecar, `knowledge-base/interactions.json`, built by
  `kb-interactions.py` and refreshable from inside the app. The map works fully
  **offline** from that file; live features light up only when you're online.

---

## Reading the map

### Nodes are genes

Every node is a gene from your cards that has at least one **mechanistic**
interaction. Genes with no mechanistic interaction (≈690 of them) are not drawn —
they'd only pad an outer ring — and are counted in the caption as "isolated".

| Property | Encodes |
|---|---|
| **Fill colour** | Chromosome |
| **Dashed outline + italic label** | Not listed on any of your cards — a *ghost* from an expansion, or a gene you added by name. Still filled by chromosome so it stays visible. |

All nodes are the same size, and both the discs and the edges hold a constant
on-screen size as you zoom — only the layout scales, so zooming in spreads the
map out and makes edges traceable without the nodes or lines ballooning.

Chromosome colours:

| Colour | Chromosome |
|---|---|
| 🟤 terracotta (`--accent`, `#D97757`) | X |
| ⚪ grey (`#b9b7ae`) | autosome |
| 🟠 orange (`#E8A020`) | Y |
| 🔵 blue (`#5B9BD5`) | mitochondrial |
| ⬜ white (`#ffffff`) | unknown |

X-vs-autosome is the meaningful split for the drive work, which is why it's the
default encoding.

### Edges are interactions

Edge colour encodes the **nature** of the interaction, collapsed from INDRA's
statement types into four families:

| Colour | Nature | INDRA types |
|---|---|---|
| 🟢 green (`#27AE60`) | **promote** | Activation, IncreaseAmount |
| 🔴 red (`#C0392B`) | **suppress** | Inhibition, DecreaseAmount |
| 🔵 blue (`#2980B9`) | **modify** | Phosphorylation, Ubiquitination, Acetylation, Methylation, … Translocation, Gef, Gap |
| ⚫ grey dashed (`#888`) | **bind** | Complex |

The first three are *mechanistic* and are toggled by the promote/suppress/modify
checkboxes. `bind` is a colour, not a fourth checkbox: every `bind` edge is a
protein Complex, so it is governed solely by the **complexes** toggle below.

**Complex edges are off by default.** They're ~88% of all edges — INDRA mints one
for every pair of proteins in a co-immunoprecipitation, so a single pulldown wires
a dozen genes together and says nothing mechanistic. Turn them on with the
**complexes** toggle when you want them.

#### Arrowheads show direction

A mechanistic interaction is directed — one gene acts on the other — and the head
at the **target** end shows which way, in the standard signalling convention:

| Head | Nature | Reads as |
|---|---|---|
| ▶ filled arrow (green) | **promote** | A activates / increases B |
| ⊣ T-bar (red) | **suppress** | A inhibits / decreases B |
| ▶ filled arrow (blue) | **modify** | A phosphorylates / modifies B (enzyme → substrate) |

Direction comes from the INDRA statement (subject → object for regulations,
enzyme → substrate for modifications). **Complex/`bind` edges are undirected** and
carry no head. An edge whose direction isn't known yet is drawn as a plain line.
The head stops just outside the target's footprint — its disc, and the name-label
pill below it when the edge arrives from underneath — so it never hides behind the label.

#### One gene pair, several interactions

Two genes often carry more than one kind of interaction — e.g. a kinase both
**phosphorylates** and **activates** its target, or the literature both activates
*and* inhibits it. About a third of pairs are like this. Rather than stack the
colours and heads on one line (which reads as a single, confusingly two-coloured
edge), each **nature** gets its own edge, **fanned** slightly apart so its colour
and arrowhead stand alone. Duplicates *within* a nature (two kinds of modification,
say) merge into one edge, keeping the most-evidenced. A pair with a single nature
stays a straight line. This is why an activate-then-inhibit conflict shows as a
green arrow **and** a red T-bar side by side — that contradiction is real signal.

> **Filling in direction.** Older sidecars stored edges with the two genes sorted
> alphabetically, discarding direction, so only edges re-derived since carry a head.
> To direction every edge, run **Refresh all → Freeze** once: the refresh re-fetches
> from INDRA (the cache is versioned, so it re-pulls) and **upgrades** each existing
> edge's direction in place, and the freeze writes it back. A `kb-interactions.py`
> rebuild does the same from scratch.

### Ghost nodes

When you expand a gene live (below), its INDRA partners that **aren't in memento**
appear as *ghosts*: filled by chromosome with a dashed outline and italic label
(off-card). A ghost is a candidate — a gene the literature ties to yours that you
haven't written about. With a ghost selected you get two actions:

- **Expand** it (double-click, or the Expand button) — explore *its* neighbourhood
  further out, just like any node.
- **Add … to memento** (the second button) — opens memento's card-create form
  pre-filled with the gene; it becomes a real node on the next freeze/rebuild.

---

## Controls

### Tools bar (top-right)

| Control | Does |
|---|---|
| **promote / suppress / modify** | Show/hide the three **mechanistic** natures (all on by default). Unchecking every box hides every mechanistic edge — it does not wrap back around to "all on". |
| **conf ≥** slider | Hide interactions below an INDRA belief score (0–1) |
| **ev ≥** slider | Hide interactions below N independent evidence texts (1–5) |
| **complexes** | Draw protein-complex (`bind`) edges (off by default). This is the **only** control over complex edges — the nature checkboxes never touch them, so the two can't fight. |
| **↻ Relayout** | Re-pack the *connected-visible* subgraph — visible genes that have a visible edge to another visible gene — and hide the rest, until you change a filter. With no filters active every gene qualifies, so it re-lays the whole map. Expanding, adding, or refreshing a gene while a Relayout focus is active brings the new genes *into* the focus so they show — the focus grows with your exploration rather than hiding what you just surfaced. |
| **↻ Refresh all** | Bulk-fetch INDRA for every gene in memento and add interactions *between* them — never genes outside memento (see below); press again to cancel |
| **⭳ Freeze** | Write the current interactions back to `interactions.json` |
| **＋ Add gene** | Pops up an input; fetch a gene by name and connect it to your memento genes only (see below) |

**Filters hide, they never move nodes.** The map is a map: every gene is always in
the same place, so a filter you dial in and out returns you exactly where you were.
Changing filters never re-runs a query — it only masks interactions already
fetched.

### Search bar

The global search bar filters the Genes view too. A `#tag`, `/type`, or `@gene`
query hides every gene whose cards don't match — so `#Drive` narrows the map to the
genes on your drive cards and the interactions between them. It's the same query
grammar the Cards and Graph views use, reading the same visible-card set, and it
composes with the tools-bar filters. Ghost genes are never hidden this way: the
search bar filters your knowledge base, and a ghost isn't in it yet. Clearing the
search restores the full map.

### Spike in a single gene — `*GENE`

A `*GENE` token does the opposite of a filter: instead of narrowing to the genes on
matching cards, it **adds one specific gene** to the map without dragging in the
other genes on the cards it appears on. It resolves a name the same way `@` does
(exact, or a unique prefix), against the genes memento already knows — it never hits
the network. Bringing in a gene memento *doesn't* have stays the job of **＋ Add
gene**.

- `*MAPT` alone adds MAPT to the full map. If MAPT is isolated (no mechanistic
  edge), it spikes in as a lone node; if it's wired, you also see its edges to the
  other genes currently on screen.
- `#Drive *MAPT` shows the drive-card genes **plus** MAPT, even though MAPT isn't on
  a drive card — exactly "how does this one gene connect to the filtered set". A
  spiked gene is never hidden by the card filter or by *Relayout*.
- The `*` token is **Genes-view only**. It's inert everywhere else: it never changes
  the Cards, Graph, or Timeline lists.

Clearing the token drops a spiked-in gene back out — unless it has since become wired
(an expand or refresh gave it an edge), in which case it stays as a normal node.

### Mouse & keyboard

| Gesture | Action |
|---|---|
| `I` | Open the Genes view |
| **Click** a node | Toggle its highlight — the clicked gene *and its neighbours* stay lit while everything else dims. Several genes can be highlighted at once (like the Graph view): each adds its own neighbourhood to what's lit. Click a highlighted gene again to drop it. |
| **Click** empty canvas | Clear all highlights (un-dim everything) |
| **Double-click** any node | Expand it live from INDRA — ghosts included, to explore further out |
| **Drag** a node | Reposition it (it stays put) |
| **Drag** the background | Pan |
| **Wheel** | Zoom (desktop) |
| **Pinch** (two fingers) | Zoom (touch) |
| **Action bar** (bottom-centre) | Acts on the **last-clicked** gene. **Expand** it (any node); a ghost also gets an **Add to memento** button to bring it into your cards. |

The caption (bottom-left) always reports: gene count, ghost count, interactions
shown, isolated genes hidden, and how many are highlighted.

### Highlight input

The **Highlight genes** input (the target-circle button next to the search bar, or
`H`) is two-way synced with clicking. Clicking a node adds its symbol to that input
(without popping the input open); typing genes into the input highlights exactly
those, replacing whatever was highlighted before. It's the same input that
highlights genes in the Cards and Graph views, so a highlight you build here follows
you across views. The action bar targets the **last** gene in the input.

---

## Live INDRA expansion

Double-click a gene (or select it and press the action button) to fetch its
interaction neighbourhood on the spot. The pipeline, all in the browser:

1. **Query** `https://db.indra.bio/statements/from_agents?agent0=SYM&format=json&limit=500&ev_limit=1`
   — no API key, called directly from the page (INDRA sends permissive CORS
   headers). `ev_limit=1` keeps the payload small; the true evidence count comes
   from the response's `evidence_counts`, not the truncated evidence array.
2. **Ground** every agent against HGNC. An interaction is kept only if **both**
   partners carry an HGNC gene id. This is the one filter that matters: without it
   the expansion is a toxicology screen — CTD asserts "chemical changes expression
   of gene" across half the genome, so bisphenol A alone would bridge hundreds of
   your genes. Chemicals and ungrounded text mentions have no HGNC id, so they
   never become nodes.
3. **Thin** each statement to `{a, b, type, belief, n, pmid}` — endpoints, nature,
   INDRA belief score, true evidence count, and one representative PMID. The bulky
   evidence text is discarded (keeping it is how the old interaction-store cache
   reached 448 MB).
4. **Look up chromosome** for new partners in one batched call to
   [MyGene.info](https://mygene.info/) (wildcard CORS), so ghosts get coloured.
5. **Merge.** Partners already on the map gain edges; partners not in memento
   become ghosts. The existing map is *pinned* while the newcomers settle, so it
   doesn't lurch.

### Ghost cap

A hub like MAPT returns ~100 partners, which would swamp the map. Each expansion
adds only the **top 20 new ghosts by evidence count** (`GE_GHOST_CAP`). Edges to
genes already on the map are never capped — only brand-new ghosts are trimmed.

**Expanding again adds the next 20** — the button reads "Expand *X* (+N more)" once
you've expanded it, walking down the ranking each press (served from the cache, no
re-fetch) until it reads "*X* fully expanded". So a hub starts manageable and you
pull in more only as you want it.

---

## Add a gene by name

**＋ Add gene** opens a small input; type a gene symbol and press Enter. It fetches
that gene from INDRA and adds **only its interactions with genes already in
memento** — its edges to genes outside memento (ghosts) are dropped. The gene
itself appears as an off-card node (dashed) if it isn't in your cards, highlighted
so the action button targets it (to promote it to a card, double-click it or use
the button). Use it to ask "does gene X touch anything I've written about?" without
pulling in X's whole external neighbourhood. If X has no interactions with your
genes, it says so.

This is the inverse of expanding a node: **expand** surfaces ghosts (X's external
partners) as candidates; **add gene** deliberately keeps only the connections back
into memento.

---

## Refresh all

**↻ Refresh all** does in the browser what `kb-interactions.py --fetch` does:
queries the INDRA neighbourhood of **every gene in memento** — the whole sidecar
vocabulary, not just the ones already drawn — and adds the interactions *between*
memento genes.

- **Memento genes only** — an edge is added only when **both** ends are genes
  memento already knows about. Genes outside memento (ghosts) are never added.
  This is the key difference from expanding a node, which surfaces ghosts.
- **Connects isolated genes** — a gene that was isolated (in your cards but with
  no interaction in the sidecar) becomes a node the moment the refresh finds it
  interacting with another memento gene. So the node set *grows* to the true
  internal interaction graph; the newly connected genes settle in while the
  existing map stays pinned. (Press **↻ Relayout** afterwards for a clean pack.)
- **Incremental** — a gene already in the cache is skipped, so re-running is cheap.
- **Concurrent** — 5 requests in flight at once, with a progress readout top-left.
- **Cancellable** — press the button again to stop; work done so far is kept.

Because it now covers the whole vocabulary (hundreds to ~1000 genes), the first
full pass is a longer, one-time job — INDRA is ~5–7 s/gene, run 5 at a time — but
it's incremental and cancellable, so once cached it's instant. It also pulls in
lower-confidence NLP-read edges the curated bootstrap didn't have; the confidence
and evidence sliders filter those back out.

---

## Freeze — persisting what you found

**⭳ Freeze** writes the current interactions back to `interactions.json`, the same
structure `kb-interactions.py` produces:

- **`genes`, `members`, `canon`, `bridges` are untouched** — they're derived from
  your cards, not from live data.
- **`edges` / `complex_edges`** become the current node-to-node set (the frozen
  baseline plus everything you fetched live), deduplicated and sorted.
- **Ghost edges are dropped** — a frozen edge's two endpoints must both be memento
  genes, exactly as the Python builder requires, so a later `kb-interactions.py`
  rebuild stays consistent. (A ghost enters the persistent graph only by being
  promoted to a card.)

Where it writes:

- **Desktop (folder connected):** overwrites `interactions.json` in your knowledge-
  base folder. Your normal `git` workflow commits it.
- **iOS / GitHub backend:** commits `interactions.json` through the same machinery
  memento uses for cards.

Freeze asks for confirmation first — it's a deliberate, manual step, so you decide
what enters your (public) repo and when. Together, **refresh-all + freeze** replace
the old two-tool loop: you explore and persist entirely inside memento, with no
gene-list shuttling and no need to re-run the Python builder for updates.

---

## Caching

Every live fetch is cached in **IndexedDB** (`indra:<GENE>` in the `kb_fh` store),
per-device:

- Re-expanding or refreshing a gene reads the cache — **no repeat network call**.
- The cache is per-browser/per-device; it isn't shared or git-tracked. What *is*
  shared is the frozen `interactions.json` you commit.
- There is currently **no staleness check** — a gene with any cache entry is reused
  regardless of age (the fetch date is recorded but not yet used to expire
  entries). To pull fresh data for an already-cached gene, clear the browser's
  IndexedDB for the app.

The **layout** — where each node settled — is cached the same way, separately
(`ge_layout` in the same store). Laying the map out is a physics simulation over
every gene and edge, and redoing it from scratch on every open is the slowest part
of opening this view, especially on iOS: a backgrounded tab there is prone to being
evicted from memory, so "first open this session" happens far more often than on
desktop. A matching cached layout is reused instead, and only a brief settle runs to
place anything the cache didn't cover; a gene-set change invalidates it automatically
(the cache key is the exact set of connected genes), so it always reflects your data.

---

## What you control vs. what's fixed

You control **which** genes get queried and **when**, plus how the results are
displayed. You don't tune the query itself — its parameters are chosen for
correctness and payload size.

| Under your control | Fixed (not adjustable in the UI) |
|---|---|
| **Which gene** to expand (which node you double-click) | The endpoint (`db.indra.bio/…/from_agents`) |
| **When** to expand, refresh, or freeze | `limit=500` statements per gene |
| **Cancelling** a bulk refresh | `ev_limit=1` (evidence texts fetched; the count still comes through in full) |
| **Which ghosts** to promote to cards | The **HGNC-grounding** requirement |
| Display **nature** filter (promote/suppress/modify) | The **ghost cap** (top 20 by evidence) |
| Display **confidence** filter (INDRA belief ≥) | Mechanistic-vs-complex classification |
| Display **evidence** filter (texts ≥) | INDRA's **belief score** and **evidence counts** (reported as-is) |
| Showing/hiding **complexes** | No source-tier filter — the query returns *all* statements (curated DB + NLP-read); belief is your quality signal |

The four display filters — **nature, confidence, evidence, complexes** — act on data
already fetched. They never change what's queried; they mask what's shown. So
tightening "confidence ≥ 0.8" or "evidence ≥ 5" is instant and reversible, and
costs no network.

---

## Data sources

- **Interactions:** [INDRA Database](https://db.indra.bio/) — an assembly of
  curated pathway databases (SIGNOR, BioGRID, Reactome, PhosphoSitePlus, …) plus
  NLP-read literature (REACH, Sparser). Each interaction carries a belief score and
  evidence count; the map keeps one representative PMID per edge.
- **Gene identity & chromosome:** [MyGene.info](https://mygene.info/) — HGNC
  symbol resolution and genomic position.

Both are public research services queried directly from the browser; neither needs
an API key.
