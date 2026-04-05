# Knowledge Base

A single-file browser app for managing a local JSON knowledge base with Claude memory sync support. Works in Chrome and Edge using the File System Access API.

## Getting started

1. Open `knowledge-base.html` in **Google Chrome** or **Microsoft Edge** (other browsers don't support the File System Access API).
2. Click **Connect file** and select your `knowledge-base.json` file (or create a new empty JSON file containing `[]`).
3. The app remembers your file handle between sessions via IndexedDB, so next time it will reconnect automatically.

## Card types

Each entry has a type, shown as an icon on the card:

| Type | Icon | Description |
|------|------|-------------|
| Fact | ☐✓ | Verified information |
| Reference | ❞ | Citations, papers, clippings |
| Observation | 👁 | Things noticed or seen |
| Hypothesis | 🧩 | Testable conjectures |
| Idea | 💡 | Open-ended thoughts |
| Note | 📄 | General notes (default for new cards) |
| Person | 👤 | Collaborators and contacts |
| GitHub | 🐙 | Synced from GitHub repos (read-only) |

## Adding and editing entries

Press the **+ Add** button (or **Cmd+N** / **Ctrl+N**) to create a new entry. Each entry has:

- **Type** — select from the type picker
- **Title** — a short heading for the card
- **Content** — the main body text (Markdown with LaTeX math via KaTeX)
- **Tags** — comma-separated labels for categorisation
- **Genes** — comma-separated gene names (displayed as chips, searchable with `@` syntax)
- **Source** — an optional reference or URL
- **Due date** — optional deadline (shown with color-coded urgency on the card)

Press **Save** (or **Cmd+Enter**) to save. The entry is written to your local JSON file immediately.

Click any card to expand it and see the full content. Click the title to edit (or the ✎ button when expanded). Use the ✕ button to delete.

## Card preview modes

A three-state toggle in the toolbar controls how much detail cards show when collapsed:

1. **Minimal** — titles only (default)
2. **Compact** — titles + tags and genes
3. **Full** — titles + tags/genes + body preview

## Searching

Type in the search bar to filter entries. Press **Escape** to clear the search.

| Syntax | Meaning | Example |
|--------|---------|---------|
| free text | matches title, content, tags, genes, source | `tau protein` |
| `#tag` | filter by tag | `#neurodegeneration` |
| `#tag1,tag2` | OR across tags | `#review,todo` |
| `@GENE` | filter by gene | `@MAPT` |
| `@GENE1,GENE2` | OR across genes | `@MAPT,HDAC6` |
| space between tokens | AND (all must match) | `@MAPT #tau` |
| ` , ` (comma flanked by spaces) | OR between groups | `#review tau , #brain amyloid` |

**Examples:**

- `@MAPT @HDAC6` — entries mentioning **both** MAPT and HDAC6
- `@MAPT,HDAC6` — entries mentioning **either** MAPT or HDAC6
- `#review tau , #brain amyloid` — entries tagged "review" containing "tau", **or** entries tagged "brain" containing "amyloid"

Tags and genes support prefix matching, so `@MAP` matches `@MAPT`, `@MAP2K1`, etc.

## Sorting

The sidebar **Sort** section offers:

| Sort | Behaviour |
|------|-----------|
| **Modified** | By modification date (default, newest first). People cards always sort last. |
| **Due** | By due date. Cards without a due date sink to the bottom. |
| **Synced** | By sync status (unsynced first). |
| **Type** | Alphabetically by entry type. |
| **Tags** | By most common tag per card. |
| **Connection** | Connections first. |

Click any sort option again to reverse direction.

## Filtering

The sidebar provides several filter sections:

- **Type** — click a type to show only matching cards
- **Tags** — click a tag to filter (tags show entry counts)
- **Connections** — cycle through: all → connections only → connections excluded
- **Archive** — toggle between active and archived cards

## Due dates

Cards can have an optional due date. The card border changes color based on urgency:

- **Red** — overdue
- **Red (brighter)** — due today
- **Muted red** — due within a few days

## Archive

Click the archive icon (📦) on any card to archive it. Archived cards are hidden by default. Use the archive filter in the sidebar to view them. Unarchiving the last archived card automatically switches back to the active view.

## Connections

Flag any card as a "connection" to mark relationships between entries. The connection icon appears on flagged cards. Use the sidebar connection filter to show only connections or exclude them.

## Link mode

Click the link button to enter link mode. Then click any card to insert a `[[id|title]]` reference at the cursor in the edit form. These references render as clickable links in expanded cards.

## Highlight genes

Toggle the gene highlight bar to enter gene names. Matching genes are shown in accent color with bold weight across all cards, and cards with the most matches sort to the top.

## GitHub integration

1. Click the GitHub icon in the bottom-left sidebar and enter a Personal Access Token (stored in localStorage).
2. Click the sync button (↻) to fetch all your repos. This also fetches the latest issue date for repos with open issues.
3. GitHub cards are **read-only** — clicking the title opens the issues view instead of edit mode.
4. Expanding a GitHub card lazy-loads the README and updates the card's modification time from the latest issue.
5. Card modification time uses `pushed_at` (last commit), updated by the latest issue date when available.

## Images

Drag and drop images onto a card while editing. Images are stored in a local `images/` folder (requires connecting a folder). Image markdown is stripped during Claude sync since local images aren't accessible to Claude.

## Web clipper bookmarklet

Clip selected text from any web page directly into the knowledge base.

### Setup

Create a new bookmark in Chrome/Edge and paste the following as the URL:

```
javascript:void(function(){var s=window.getSelection().toString().trim();var c=JSON.stringify({_kb_clip:true,content:s||'',source:location.href,title:document.title});navigator.clipboard.writeText(c).then(function(){var b=document.createElement('div');b.textContent='Clipped to KB!';b.style.cssText='position:fixed;top:20px;right:20px;background:#333;color:#fff;padding:8px 16px;border-radius:6px;z-index:999999;font:14px sans-serif';document.body.appendChild(b);setTimeout(function(){b.remove()},1500)})})()
```

### Usage

1. Highlight text on any web page.
2. Click the "Clip to KB" bookmark. A brief "Clipped to KB!" toast confirms the copy.
3. Switch to the knowledge base tab.
4. Press **Cmd+V** (or **Ctrl+V**). The add form opens pre-filled as a Reference with content block-quoted, source URL, and title.

Note: the paste shortcut only triggers the clip import when no input field is focused.

## Syncing with Claude's memory

Each entry has a sync status icon: green (synced) or red (unsynced). Editing marks the entry as unsynced.

Three sync actions:

1. **Per-entry sync** — click the sync icon on a card to copy a prompt for that single entry to your clipboard. Paste into Claude to update its memory.
2. **Sync all** — copies a full-replace prompt covering all entries.
3. **Cleanup** — copies a prompt listing entry IDs, asking Claude to delete memory entries that no longer exist locally.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| **Cmd+N** / **Ctrl+N** | Open the Add Entry form |
| **Cmd+Enter** / **Ctrl+Enter** | Save current entry |
| **Cmd+V** / **Ctrl+V** | Import clip (when no input focused) |
| **Escape** | Cancel edit or clear search |

## File format

The JSON file is a flat array of entry objects:

```json
[
  {
    "id": "unique-id",
    "type": "fact",
    "title": "Entry title",
    "content": "Markdown content...",
    "tags": ["tag1", "tag2"],
    "genes": ["MAPT", "HDAC6"],
    "source": "https://example.com",
    "date": "2026-03-28T12:00:00.000Z",
    "synced": true,
    "connection": false,
    "archived": false,
    "due": "2026-04-10"
  }
]
```

Valid types: `fact`, `reference`, `observation`, `hypothesis`, `idea`, `note`, `people`, `github`.

## Command-line tool (kb-manage.py)

`kb-manage.py` is a Python CLI for batch operations on knowledge-base JSON files. It requires the `click` library (`pip install click`).

```
python3 kb-manage.py COMMAND [ARGS] [OPTIONS]
```

### Tags

```bash
kb-manage.py list-tags data.json                        # list all tags with counts
kb-manage.py list-tags data.json --sort name             # sort alphabetically
kb-manage.py rename-tag data.json "old-name" "new-name"  # rename across all entries
kb-manage.py delete-tag data.json "unwanted"             # remove from all entries
kb-manage.py add-tag data.json "new-tag"                 # add to all entries
kb-manage.py add-tag data.json "reviewed" --where-type fact   # add only to facts
kb-manage.py add-tag data.json "tau" --where-gene MAPT        # add where gene matches
```

### Genes

```bash
kb-manage.py list-genes data.json                        # list all genes with counts
kb-manage.py rename-gene data.json "HDAC6" "HDAC6A"     # rename (case-insensitive match)
kb-manage.py delete-gene data.json "BRCA1"               # remove from all entries
```

### Types

```bash
kb-manage.py list-types data.json                        # list types with counts
kb-manage.py rename-type data.json "quote" "quote_para"  # rename a type
kb-manage.py set-type data.json hypothesis --where-tag speculative  # bulk change type
```

### Removing entries

All removal commands support `--dry-run` to preview without modifying the file.

```bash
kb-manage.py remove-by-tag data.json "deprecated" --dry-run  # preview
kb-manage.py remove-by-tag data.json "deprecated"            # remove for real
kb-manage.py remove-by-type data.json "person"               # remove all of a type
kb-manage.py remove-by-id data.json abc123 def456            # remove specific entries
```

### Search and replace

```bash
kb-manage.py grep data.json "MAPT" -i                    # search (case-insensitive)
kb-manage.py grep data.json "tau" --field content         # search specific field
kb-manage.py replace data.json "BDMI" "BDM incompatibility"          # literal replace
kb-manage.py replace data.json "chr(\d+)" "chromosome \1" --regex    # regex replace
kb-manage.py replace data.json "old text" "new text" --dry-run       # preview changes
```

### Merging and importing files

```bash
kb-manage.py merge target.json source.json               # merge by ID (skip duplicates)
kb-manage.py merge target.json source.json --overwrite   # merge (overwrite duplicates)
kb-manage.py import target.json source.json              # append all (new IDs assigned)
```

### Bulk operations

```bash
kb-manage.py set-synced data.json false                  # mark all as unsynced
kb-manage.py set-synced data.json true --where-tag reviewed  # mark filtered as synced
kb-manage.py touch data.json                             # update all dates to now
kb-manage.py touch data.json --where-tag active          # touch filtered entries
```

### Quality and diagnostics

```bash
kb-manage.py stats data.json       # summary: counts, types, tags, genes, content lengths
kb-manage.py validate data.json    # check for missing fields and unknown types
kb-manage.py clean data.json       # normalize: add missing fields, trim whitespace, dedup tags
kb-manage.py dedup data.json       # remove duplicates by title
kb-manage.py dedup data.json --by content --dry-run  # preview content-based dedup
```

## Requirements

- Google Chrome or Microsoft Edge (File System Access API required)
- `kb-manage.py` requires Python 3 and `click` (`pip install click`)
