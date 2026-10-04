# Genes view — the rules

One-page contract. The long-form doc is [gene-view.md](gene-view.md).

## What exists (nodes)

- **Your genes** are the genes on your live (non-archived) **thought cards**, derived from the cards on every render. A card listing **more genes than the `sets >` slider** (default 50, remembered) is **left out of the Genes view entirely**: it makes no nodes, adds no tags to other genes, is never in the card panel, and doesn't count when a search or pin decides which genes stay visible. Searching for only such a card gives an empty map at any slider value. The `gene-set` tag doesn't matter here; size alone decides. The slider is a view setting: what's written to `interactions.json` (and `kb-interactions.py`, and the gene-set highlight picker) keeps the builder's rule, `gene-set` tag or ≥100 genes. On a legacy sidecar there's no slider.
- A gene is a node iff it is one of your genes with ≥1 **mechanistic** edge — or it was brought in live this session (expand, spike-in, `*GENE` spike).
- Genes with only complex edges, or none, are **isolated**: counted in the caption, never drawn.
- A card edit (new gene, retag, archive) shows on the next render. No rebuild needed — see *Automatic updates*.

## Where nodes sit (layout)

- Positions come from mechanistic edges only, laid out once per frozen gene set and cached.
- Only these move nodes: **drag**, **Relayout**, and the settle-in of newly added genes.
- Filters, toggles, search, highlight — **never** move a node. Hide/dim only.

## What shows (visibility)

- The search bar, sidebar facets and pinned cards scope **cards**; a node hides iff every card documenting it falls out of scope. Cards above the `sets >` slider never count. Nodes with no cards (ghosts, added genes) are never scoped out.
- An edge shows iff both ends show **and** it passes the filters: nature checkboxes (mechanistic only), the **complexes** toggle (the *only* control over complex edges), conf ≥, ev ≥.
- **neighbours** (off by default): also reveals a scoped-out gene that has a currently-shown edge to a gene the filter kept in scope — one hop off the filtered set, not a chain (a gene only reachable *through* a revealed neighbour stays hidden).
- **simple** (default): one grey undirected line per pair, shown iff *any* of the pair's interactions passes the filters. Untick for per-nature colours, arrowheads, and fans.
- `*GENE` in the search **spikes** that gene: it always shows (overriding scope and any Relayout focus), materialising it as a node if it was isolated. In-memento genes only.

## What lights up (highlight)

- The highlight set *is* the **Highlight genes** input (`H`); clicking nodes edits it, typing in it selects — two-way. Hiding the panel mutes the highlight without losing it. `Esc` (or a click on empty canvas) clears the set.
- Highlighted genes wear a ring; they and their (currently shown) neighbours stay full; everything else dims; only edges touching a highlighted gene stay full.
- The card panel (**cards**, default): highlighted genes → their cards; nothing highlighted → cards of every visible gene. A highlighted gene's cards show even when the search scopes them out. Cards above the `sets >` slider never appear.

## In / not in memento

- **In memento** = documented on a live thought card. Archived cards and `gene-set` cards don't count.
- **Ghost** (dashed, italic) = not in the frozen sidecar. It may still be documented — a card written since the last rebuild.
- Undocumented ghost → **Expand** + **Add to memento**. Documented gene (ghost or not) → **Expand** only; ghosts with cards become real nodes at the next sidecar rebuild.

## Relayout

- **↻ Relayout** re-packs only the *connected-visible* subgraph — visible nodes with ≥1 visible edge to another visible node — and hides the rest (the "focus") until any filter changes.
- Genes arriving while a focus is active (expand, add, refresh) join the focus; they are never hidden by it.

## Actions

| Action | Means |
|---|---|
| **Expand** (double-click / button) | Fetch this gene's INDRA neighbourhood. Partners in memento gain edges; new partners appear as ghosts (top-evidence capped; press again for the next batch). Cached per gene. |
| **＋ Spike in** | Fetch a named gene from INDRA and wire it to memento genes **only** — never brings in outsiders. New to memento → off-card node. The live cousin of the `*GENE` token, which spikes in genes memento already knows. |
| **Add … to memento** | Open the create form pre-filled from MyGene — write the card that makes the ghost yours. |
| **↻ Refresh all** | Fetch INDRA for every real node; add node-to-node edges only, never ghosts. Incremental (cache-skipped), cancellable. |
| **⭳ Save edges** | Only on a legacy sidecar (no `resolve` table). On the live format saving is automatic and `F` just saves now. |

## Keys

Single letters, no modifiers, scoped to the Genes view (`?` — or the bottom-left `?` button — shows the cheat-sheet):

`E` simple · `P` cards · `A` spike in · `X` expand selected · `L` relayout · `R` refresh all (again = cancel) · `F` save now · `B` complexes · `W` neighbours · `1/2/3` promote/suppress/modify · `Z` fit map · `H` highlight panel · `Esc` clear highlights

## Automatic updates

`interactions.json` holds only what costs a network call: **`resolve`** (gene name → HGNC symbol/chromosome, or `null` for "not a gene / ambiguous"), **`indra`** (which of your genes have had their INDRA neighbourhood fetched) and the **edges**. Everything card-derived is recomputed live.

- **New gene name on a card** → looked up with MyGene in the background (same rule as the builder: exactly one HGNC hit, else `null` — never guessed).
- **New gene of yours** (resolved, not yet in `indra`) → its INDRA neighbourhood is fetched in the background, 3 at a time, IndexedDB-cached; edges between your genes appear on the map.
- **Saved automatically** a few seconds after a change (folder write; on GitHub/iPhone a commit, batched ~20 s). The file is only written when its content changed. Expand, Spike in and Refresh all are saved the same way.
- **Edges are kept** while both genes are on some live card (node or set member) or were fetched: retagging a card `gene-set` and back never costs a re-fetch. Ghost edges are never saved.
- **Caption** shows what's pending: names to look up, genes awaiting interactions, offline, saving, or failures (a failed request waits 10 min before it's retried).
- Runs only when the app can save (folder or a write-enabled GitHub token).
- **`kb-interactions.py`** is for heavy jobs: bootstrap from the local INDRA cache, a full rebuild, and the bridge report. A rebuild reuses the browser's lookups and keeps its edges.
- **Legacy sidecar** (no `resolve`): read as a snapshot, as before; the caption says "snapshot of <date>". Run `kb-interactions.py` once to convert it.

Ghosts and expansions to genes outside memento stay in memory for the session; ghosts survive card edits but not a reload.
