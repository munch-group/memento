#!/usr/bin/env python
"""MCP server exposing the Memento knowledge base to Claude.

This replaces the old push model (Export/Cleanup: paste 528 cards into a chat and ask Claude to
remember them). Claude now *queries* the knowledge base when it needs something, which means it is
never stale, deleted cards simply stop being returned, and nothing has to be synced or reaped.

Read-only by design. Capture stays with kb-capture.py.

Run:      pixi run python memento-mcp.py [knowledge-base/]
Register: see .mcp.json (Claude Code) and README (Claude Desktop).
"""

import os
import re
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone

# An MCP client launches this from whatever working directory it likes, so don't depend on one.
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from mcp.server.fastmcp import FastMCP

from kb_io import load_all

KB_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "knowledge-base")

mcp = FastMCP("memento")

# --- entry cache ---------------------------------------------------------------------------
# The knowledge base changes underneath a long-lived server — the web app writes to it, and so
# does `git pull`. Serving a stale snapshot would reintroduce exactly the staleness problem this
# server exists to remove. Re-stat the directory on every call (cheap) and reload only when it
# has actually changed.
_cache: list[dict] = []
_signature: tuple | None = None


def _dir_signature(kb_dir: str) -> tuple:
    edir = os.path.join(kb_dir, "entries")
    if not os.path.isdir(edir):
        return (0, 0.0)
    count, newest = 0, 0.0
    with os.scandir(edir) as it:
        for e in it:
            if e.name.endswith((".json", ".md")):
                count += 1
                newest = max(newest, e.stat().st_mtime)
    return (count, newest)


def entries() -> list[dict]:
    global _cache, _signature
    sig = _dir_signature(KB_DIR)
    if sig != _signature:
        _cache = load_all(KB_DIR)
        _signature = sig
    return _cache


# --- helpers -------------------------------------------------------------------------------
_IMG_RE = re.compile(r"!\[[^\]]*\]\(images/[^)]+\)")


def _text(entry: dict) -> str:
    return entry.get("content") or entry.get("markdown") or ""


def _summary(entry: dict) -> dict:
    """The compact shape search returns — enough to decide whether to fetch the full card."""
    return {
        "id": entry.get("id"),
        "type": entry.get("type"),
        "title": entry.get("title") or "",
        "tags": entry.get("tags") or [],
        "genes": entry.get("genes") or [],
        "date": entry.get("date") or "",
        "archived": bool(entry.get("archived")),
    }


def _snippet(text: str, rx: re.Pattern | None, width: int = 220) -> str:
    body = _IMG_RE.sub("", text).strip()
    if rx:
        m = rx.search(body)
        if m:
            start = max(0, m.start() - width // 3)
            out = body[start:start + width]
            return ("…" if start else "") + out.replace("\n", " ").strip() + ("…" if start + width < len(body) else "")
    return body[:width].replace("\n", " ").strip() + ("…" if len(body) > width else "")


def _compile(query: str) -> re.Pattern | None:
    """Treat the query as a regex, but fall back to a literal search if it isn't valid —
    a model writing `C++` or `(draft` shouldn't get an error instead of results."""
    if not query:
        return None
    try:
        return re.compile(query, re.IGNORECASE)
    except re.error:
        return re.compile(re.escape(query), re.IGNORECASE)


# --- tools ---------------------------------------------------------------------------------
@mcp.tool()
def search_entries(
    query: str = "",
    tag: str | None = None,
    type: str | None = None,
    gene: str | None = None,
    include_archived: bool = False,
    limit: int = 20,
) -> dict:
    """Search Kasper's knowledge base and return compact matches.

    Use this first to find relevant cards, then call get_entry for the full text of the ones that
    matter. Returns summaries (id, title, tags, genes, date) plus a snippet — not full bodies —
    so a broad search stays cheap.

    Args:
        query: Free text, matched case-insensitively against content, title, tags and genes.
            Regex is supported; an invalid pattern is treated as literal text.
        tag: Only entries carrying this tag (exact, case-insensitive).
        type: Only entries of this type (fact, reference, observation, hypothesis, idea, note,
            people, github, view).
        gene: Only entries listing this gene (matches gene aliases too).
        include_archived: Archived entries are excluded unless this is true.
        limit: Maximum number of matches to return.
    """
    rx = _compile(query)
    hits = []
    for e in entries():
        if e.get("type") == "_digest":
            continue  # derived summary of the KB itself — would just echo other cards back
        if not include_archived and e.get("archived"):
            continue
        if tag and tag.lower() not in [t.lower() for t in (e.get("tags") or [])]:
            continue
        if type and e.get("type") != type:
            continue
        if gene:
            aliases = [a.upper() for g in (e.get("genes") or []) for a in str(g).split("/")]
            if gene.upper() not in aliases:
                continue
        if rx:
            haystack = "\n".join([
                _text(e), e.get("title") or "",
                ", ".join(e.get("tags") or []), ", ".join(e.get("genes") or []),
            ])
            if not rx.search(haystack):
                continue
        hit = _summary(e)
        hit["snippet"] = _snippet(_text(e), rx)
        hits.append(hit)

    hits.sort(key=lambda h: h["date"], reverse=True)
    return {"total": len(hits), "returned": min(len(hits), limit), "entries": hits[:limit]}


@mcp.tool()
def get_entry(entry_id: str) -> dict:
    """Fetch one knowledge base entry in full, including its markdown body.

    Args:
        entry_id: The entry id, as returned by search_entries (e.g. "mnhs3dmls8ll"). The special
            ids "_priorities", "_strategy" and "_digest" hold Kasper's current priorities,
            strategy, and the generated "where am I" digest.
    """
    for e in entries():
        if e.get("id") == entry_id:
            out = _summary(e)
            out.update({
                "content": _text(e),
                "source": e.get("source") or "",
                "connection": bool(e.get("connection")),
                "due": e.get("due") or "",
                # Set by the app's timeline view: {"subtasks": [{id, title, start, end}]}, with
                # start/end as inclusive "YYYY-MM-DD" days. Absent unless the entry is scheduled.
                "schedule": e.get("schedule") or {},
            })
            return out
    return {"error": f"no entry with id {entry_id!r}"}


@mcp.tool()
def list_tags() -> dict:
    """List every tag in the knowledge base with the number of entries carrying it.

    Use this to discover the actual vocabulary before searching by tag, rather than guessing.
    """
    counts = Counter(t for e in entries() if not e.get("archived") for t in (e.get("tags") or []))
    return {"tags": [{"tag": t, "count": n} for t, n in counts.most_common()]}


@mcp.tool()
def list_genes(limit: int = 200) -> dict:
    """List the genes mentioned in the knowledge base, most-mentioned first, with entry counts.

    Tokens are reported exactly as stored. A token may bundle aliases with "/" (e.g.
    "RLIM/RNF12") — search_entries(gene=...) matches either alias, but they are not split here,
    because some tokens are amplicon names that also contain slashes
    (e.g. "amplicon_chrX_CSAG1/2/3_0") and splitting those yields meaningless fragments.

    Args:
        limit: Maximum number of genes to return (there are thousands).
    """
    counts = Counter(
        str(g).strip()
        for e in entries() if not e.get("archived")
        for g in (e.get("genes") or []) if str(g).strip()
    )
    return {
        "total": len(counts),
        "genes": [{"gene": g, "count": n} for g, n in counts.most_common(limit)],
    }


@mcp.tool()
def recent_entries(days: int = 14, limit: int = 20) -> dict:
    """List the entries Kasper has added or changed most recently.

    Use this to answer "what have I been working on" without searching for a specific topic.

    Args:
        days: How far back to look.
        limit: Maximum number of entries to return.
    """
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    hits = [
        _summary(e) | {"snippet": _snippet(_text(e), None)}
        for e in entries()
        if e.get("type") != "_digest" and not e.get("archived") and (e.get("date") or "") >= cutoff
    ]
    hits.sort(key=lambda h: h["date"], reverse=True)
    return {"since_days": days, "total": len(hits), "entries": hits[:limit]}


if __name__ == "__main__":
    mcp.run(transport="stdio")
