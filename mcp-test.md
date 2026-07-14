# Testing the Memento MCP server

Everything below is already built and committed to the working tree — this file is just the
checklist for when you can restart Claude.

**What changed:** Claude no longer needs cards pasted into it. It reads the knowledge base live
through an MCP server (`memento-mcp.py`). That's why Export, Cleanup, the per-card ✓/⊘ sync
icons, the form's "Sync ↗" button and the "Synced" sort are all gone from the app, along with
Reload (both platforms now refresh themselves).

---

## 0. Push first

The new files are untracked, so `pixi run push` alone would miss them:

```sh
git add memento-mcp.py .mcp.json tests pixi.toml memento.html mcp-test.md && pixi run push
```

Sanity check before restarting anything:

```sh
pixi run test          # 198 assertions across 8 files, all should pass
```

---

## 1. Does the server run at all?

This needs no Claude restart — it's a plain stdio program.

```sh
cd /Users/kmt/memento
pixi run python memento-mcp.py knowledge-base
```

It should sit there silently waiting on stdin (that's correct — it speaks JSON-RPC over stdio).
Press Ctrl-C.

For a real end-to-end check that it answers tool calls:

```sh
pixi run python tests/mcp_test.py     # 26 assertions against a synthetic KB
```

---

## 2. Claude Code

`.mcp.json` in the repo root registers the server for this project. **Restart Claude Code**, then:

```
/mcp
```

Expect `memento` listed as **connected**, with five tools: `search_entries`, `get_entry`,
`list_tags`, `list_genes`, `recent_entries`.

Then ask it something only the knowledge base knows, and watch which tool it calls:

> What have I written about meiotic drive in baboons?

**Pass:** it calls `search_entries`, then `get_entry` on the interesting hits.
**Fail:** it greps the repo instead, or says it can't find anything.

Two more worth trying:

> What are my current priorities and strategy?

Should call `get_entry` on `_priorities` and `_strategy`.

> What have I added to the knowledge base in the last two weeks?

Should call `recent_entries` (~32 entries at time of writing).

---

## 3. Claude Desktop

I merged `memento` into `claude_desktop_config.json` **additively** — your existing `memory`
server and every preference were preserved. Backup:

```
~/Library/Application Support/Claude/claude_desktop_config.json.bak-20260714-120215
```

**Fully quit Claude Desktop** (⌘Q — closing the window is not enough) and reopen. The MCP
indicator should show `memento`. Ask it the same questions as above.

---

## 4. The test that proves the whole point

This is the reason Export and Cleanup are gone. Do it in **Claude Code** or **Claude Desktop**:

1. Ask Claude to find a specific card (note its id).
2. Delete that card in the Memento app.
3. Ask Claude the same question again.

**Expected:** the card is simply gone from the results. **No cleanup step, no prompt to paste,
nothing to reap.** Under the old push model you had to run Cleanup to tell Claude the card had
been deleted; under pull it can't be stale by construction.

(There's an automated test for exactly this in `tests/mcp_test.py` — "deleting it makes it
vanish immediately — no cleanup step" — but it's worth seeing once for real.)

---

## 5. iOS auto-refresh (replaces the Reload button)

1. On the Mac, add or edit a card and `pixi run push`.
2. On the phone, background the Memento app and reopen it.

**Expected:** the change appears on its own. No Reload button, no tap. It costs one cheap
`GET /commits/main` on return and only reloads if `main` actually moved.

Also confirm it can't eat your work: make an edit on the phone and background the app within
~2 seconds (before the commit flushes). The refresh is skipped entirely while a write is
pending, so the edit survives.

---

## 6. Fix claude.ai's memory — do this, it matters

claude.ai's account memory holds a **badly stale** picture of Memento (wrong repo name, a
`~/Documents/knowledge-base.json` that hasn't existed in ages, a "Sync to Claude" button that no
longer exists) plus **seven copied knowledge-base cards** that will drift from the source of
truth the moment you edit them. Paste this into claude.ai:

> Please replace everything you have in memory about Memento / my knowledge base — almost all of
> it is out of date.
>
> **Delete:**
> - Every knowledge-base entry you've stored (ARHGAP5, CACNA1C, CASK/DMD, 17q21.31 H1/H2,
>   tau/MAPT kinases, tau directional transport, HDAC6). Do not keep copies of my knowledge base
>   in memory: they fork from the source of truth and go stale.
> - The old architecture: `munch-group/knowledge-base`, `~/Documents/knowledge-base.json`,
>   `knowledge-base.html`, Import/Export JSON buttons, the "Sync to Claude" button, `KB_SYNC`
>   messages, registering entries into a memory graph, and the `external` field. None of that
>   exists any more.
>
> **Replace with:**
> Memento is my personal knowledge base. Repo `munch-group/memento` (`/Users/kmt/memento`). Each
> card is a pair of files: `knowledge-base/entries/<id>.json` (metadata) + `<id>.md` (body). Card
> types: fact, reference, observation, hypothesis, idea, note, people, github, view. The app is
> one self-contained file, `memento.html` — on the Mac it reads and writes the folder directly via
> the File System Access API in Chrome; on iOS it is served from munch-group.org/memento and
> commits to the repo through the GitHub API.
>
> There is no "sync to Claude" step any more. In **Claude Code and Claude Desktop**, read the
> knowledge base through the `memento` MCP server (`search_entries`, `get_entry`, `list_tags`,
> `list_genes`, `recent_entries`) — it is live, so nothing goes stale and deleted cards simply
> stop being returned. **Never copy card contents into memory.** On **claude.ai web or mobile**
> you do not have that server: say you cannot see the knowledge base rather than answering from
> memory.

That last paragraph is load-bearing. Memory is shared across your whole account, but the MCP
server is stdio-local — it exists **only** in Claude Desktop and Claude Code. Without that
sentence, claude.ai on the web will keep confabulating from whatever fragments survive.

**Then check Settings → Memory yourself.** Asking Claude to forget is less reliable than deleting
the entries directly.

---

## Troubleshooting

**`memento` doesn't appear in `/mcp`.** Confirm the exact command in `.mcp.json` runs from any
directory (Claude Desktop will not `cd` into the repo):

```sh
cd /tmp && pixi run --manifest-path /Users/kmt/memento/pixi.toml \
  python /Users/kmt/memento/memento-mcp.py /Users/kmt/memento/knowledge-base
```

**It connects but returns nothing.** Check the KB path resolves:

```sh
pixi run --manifest-path /Users/kmt/memento/pixi.toml python -c "
import importlib.util
s = importlib.util.spec_from_file_location('m','/Users/kmt/memento/memento-mcp.py')
m = importlib.util.module_from_spec(s); s.loader.exec_module(m)
print(len(m.entries()), 'entries loaded from', m.KB_DIR)"
```

Should print ~529.

**Claude Desktop ignores it.** ⌘Q properly — closing the window leaves it running with the old
config.

---

## Known, unfixed — say the word and I'll do either

1. **Your quick-capture hotkey is dead.** `~/bin/kb-capture.py` is a **broken symlink** to
   `/Users/kmt/knowledge_base/kb-capture.py`, a directory that no longer exists. If ⌥⌘K still
   points there, capture has been silently failing. Fix:

   ```sh
   ln -sf /Users/kmt/memento/kb-capture.py ~/bin/kb-capture.py
   ```

   I left it alone because it's outside the repo and I don't know whether the hotkey still
   invokes that path.

2. **`kb-manage.py validate` is broken.** Its `VALID_TYPES` (line 19) lists `quote`, `connection`,
   `person` — but your actual card types are `note`, `people`, `github`. It therefore reports
   **364 of 529 cards** as having an "unknown type", which makes the command useless. One line to
   fix. (The stale type list in claude.ai's memory is the same fossil, from the same era.)

3. **The `memory` MCP server in Claude Desktop is empty** — it has never written a byte
   (no `memory.json` exists anywhere). Harmless, but redundant now. Drop it from the config if
   you like.

---

## What the server deliberately does *not* do

- **It is read-only.** Claude can search and read, not write. Capture stays with `kb-capture.py`.
  Adding `create_entry` is ~10 lines if you decide you want it.
- **It is local-only** (stdio), so it reaches Claude Code and Claude Desktop but **not** the
  Claude app on your phone or claude.ai in a browser. Reaching those needs a *remote* MCP server:
  a public HTTPS endpoint with OAuth, which means hosting a service and putting your entire
  personal knowledge base behind auth you own. Worth deciding deliberately, not by accident.
- **Search never returns full card bodies** — only summaries plus a snippet — so a broad search
  stays cheap. Claude fetches the full text with `get_entry` for the cards that actually matter.
