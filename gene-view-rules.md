# Genes view — the rules

One-page contract. The long-form doc is [gene-view.md](gene-view.md).

## What exists (nodes)

- A gene is a node iff it has ≥1 **mechanistic** edge in the frozen sidecar (`interactions.json`) — or it was brought in live this session (expand, spike-in, `*GENE` spike). 
- Genes with only complex edges, or none, are **isolated**: counted in the caption, never drawn.
- The sidecar is a **snapshot** of your cards; the live map can be ahead of it.

## Where nodes sit (layout)

- Positions come from mechanistic edges only, laid out once per frozen gene set and cached.
- Only these move nodes: **drag**, **Relayout**, and the settle-in of newly added genes.
- Filters, toggles, search, highlight — **never** move a node. Hide/dim only.

## What shows (visibility)

- The search bar and sidebar facets scope **cards**; a node hides iff all of its cards fall out of scope. Nodes with no cards (ghosts, added genes) are never scoped out.
- An edge shows iff both ends show **and** it passes the filters: nature checkboxes (mechanistic only), the **complexes** toggle (the *only* control over complex edges), conf ≥, ev ≥.
- **simple** (default): one grey undirected line per pair, shown iff *any* of the pair's interactions passes the filters. Untick for per-nature colours, arrowheads, and fans.
- `*GENE` in the search **spikes** that gene: it always shows (overriding scope and any Relayout focus), materialising it as a node if it was isolated. In-memento genes only.

## What lights up (highlight)

- The highlight set *is* the **Highlight genes** input (`H`); clicking nodes edits it, typing in it selects — two-way. Hiding the panel mutes the highlight without losing it. `Esc` (or a click on empty canvas) clears the set.
- Highlighted genes wear a ring; they and their (currently shown) neighbours stay full; everything else dims; only edges touching a highlighted gene stay full.
- The card panel (**cards**, default): highlighted genes → their cards; nothing highlighted → cards of every visible gene. A highlighted gene's cards show even when the search scopes them out.

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
| **⭳ Save edges** | Write the live state back to `interactions.json`: baseline genes + this session's adoptions; edges = current node-to-node set, ghost edges dropped. The snapshot catches up to the map. |

## Keys

Single letters, no modifiers, scoped to the Genes view (`?` — or the bottom-left `?` button — shows the cheat-sheet):

`E` simple · `P` cards · `A` spike in · `X` expand selected · `L` relayout · `R` refresh all (again = cancel) · `F` save edges (confirms) · `B` complexes · `1/2/3` promote/suppress/modify · `Z` fit map · `H` highlight panel · `Esc` clear highlights

## Live vs frozen

- Expansions, ghosts and added genes live in memory (fetches cached in IndexedDB); a reload keeps only what was frozen.
- **Save edges** persists edges; a `kb-interactions.py` rebuild re-derives everything from the cards. Both converge: cards are the source of truth for *genes*, INDRA for *edges*. 
