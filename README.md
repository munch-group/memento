# Knowledge Base

A single-file browser app for managing a local JSON knowledge base with Claude memory sync support. Works in Chrome and Edge using the File System Access API.

## Getting started

1. Open `knowledge-base.html` in **Google Chrome** or **Microsoft Edge** (other browsers don't support the File System Access API).
2. Click **Connect file** and select your `knowledge-base.json` file (or create a new empty JSON file containing `[]`).
3. The app remembers your file handle between sessions via IndexedDB, so next time it will reconnect automatically.

## Adding and editing entries

Press the **+ Add** button (or **Cmd+N** / **Ctrl+N**) to create a new entry. Each entry has:

- **Type** — one of: Fact, Idea, Hypothesis, Quote/Para, Reference, Observation, Connection, Person
- **Title** — a short heading for the card
- **Content** — the main body text (supports Markdown, rendered when expanded)
- **Tags** — comma-separated labels for categorisation
- **Genes** — comma-separated gene names (displayed as chips, searchable with `@` syntax)
- **Source** — an optional reference or URL

Press **Save** (or **Cmd+Enter**) to save. The entry is written to your local JSON file immediately.

Click any card to expand it and see the full content. Click the **Edit** button inside an expanded card to modify it. Use the **Delete** button to remove an entry.

## Searching

Type in the search bar to filter entries. The search supports several syntaxes:

| Syntax | Meaning | Example |
|--------|---------|---------|
| free text | matches title, content, tags, genes, source | `tau protein` |
| `#tag` | filter by tag | `#neurodegeneration` |
| `@GENE` | filter by gene | `@MAPT` |
| space between tokens | AND (all must match) | `@MAPT #tau` |
| comma within `@` or `#` | OR (any may match) | `@MAPT,HDAC6` |

**Examples:**

- `@MAPT @HDAC6` — entries that mention **both** MAPT and HDAC6
- `@MAPT,HDAC6` — entries that mention **either** MAPT or HDAC6
- `#review,todo tau` — entries tagged "review" or "todo" that also contain "tau"

You can also click gene chips or tag chips on any card to filter by that gene or tag. Click the back arrow (shown in the page header) to clear filters and return to the full view.

## Sorting

The sidebar has a **Sort** section with three options:

- **Modified** — sort by modification date (default, most recent first)
- **Synced** — sort by sync status (unsynced entries first)
- **Type** — sort alphabetically by entry type

Click an option again to reverse the sort direction.

## Filtering by type and tag

The sidebar also shows **Type** and **Tags** sections. Click any type or tag to filter the view to matching entries. Active filters combine with sorting and search.

## Syncing with Claude's memory

Each entry has a coloured sync status icon: green (synced) or red (unsynced). Editing an entry marks it as unsynced.

There are three sync actions:

1. **Per-entry sync** — Click the sync status icon on any card (or the Sync button in the edit form). This copies a prompt to your clipboard that you can paste into any Claude conversation to update that single entry in Claude's memory.

2. **Sync all** — Click the **Sync all** button in the toolbar. This copies a full-replace prompt covering all entries. Best used when the knowledge base is small or you want a complete refresh.

3. **Cleanup** — Click the **Cleanup** button in the toolbar. This copies a lightweight prompt listing only entry IDs, asking Claude to delete any memory entries that no longer exist locally. Useful for removing stale entries without re-syncing everything.

After pasting a sync prompt into Claude, the corresponding entries are marked as synced.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| **Cmd+N** (Mac) / **Ctrl+N** (Windows) | Open the Add Entry form |
| **Cmd+Enter** (Mac) | Save the current entry |

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
    "synced": true
  }
]
```

Valid types: `fact`, `idea`, `hypothesis`, `quote`, `reference`, `observation`, `connection`, `person`.

## Requirements

- Google Chrome or Microsoft Edge (File System Access API required)
- No server, no build step, no dependencies beyond the browser
