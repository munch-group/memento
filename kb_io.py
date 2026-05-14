"""Shared I/O for per-entry knowledge base (entries/{id}.json + entries/{id}.md)."""

import json
import os
import re


def _entries_dir(kb_dir):
    return os.path.join(kb_dir, "entries")


_TABLE_ROW_RE = re.compile(r"^\s*\|.*\|\s*$")
_UNESCAPED_PIPE_RE = re.compile(r"(?<!\\)\|")
_SEPARATOR_CELL_RE = re.compile(r"^\s*:?-+:?\s*$")


def _split_row(line):
    """Return (leading_ws, cells) for a table row, or None if not a valid row."""
    leading_ws = line[: len(line) - len(line.lstrip())]
    stripped = line.strip()
    parts = _UNESCAPED_PIPE_RE.split(stripped)
    if len(parts) < 3 or parts[0] != "" or parts[-1] != "":
        return None
    return leading_ws, [c.strip() for c in parts[1:-1]]


def _is_separator_row(cells):
    return bool(cells) and all(_SEPARATOR_CELL_RE.match(c) for c in cells)


def _separator_alignment(cell):
    """Return 'left', 'right', 'center', or None for an unstripped separator cell."""
    c = cell.strip()
    left = c.startswith(":")
    right = c.endswith(":")
    if left and right:
        return "center"
    if right:
        return "right"
    if left:
        return "left"
    return None


def _format_table_block(rows):
    """rows is a list of (leading_ws, cells). Returns list of formatted lines."""
    n_cols = max(len(cells) for _, cells in rows)
    # Pad short rows with empty cells so column count is uniform.
    normalized = [(lw, cells + [""] * (n_cols - len(cells))) for lw, cells in rows]

    # Detect alignment from the separator row, if present (must be row index 1).
    alignments = ["left"] * n_cols
    sep_idx = None
    for i, (_, cells) in enumerate(normalized):
        if _is_separator_row(cells):
            sep_idx = i
            for j, c in enumerate(cells):
                alignments[j] = _separator_alignment(c) or "left"
            break

    # Compute per-column widths from non-separator rows only.
    widths = [0] * n_cols
    for i, (_, cells) in enumerate(normalized):
        if i == sep_idx:
            continue
        for j, c in enumerate(cells):
            if len(c) > widths[j]:
                widths[j] = len(c)
    widths = [max(w, 3) for w in widths]  # separator needs at least "---"

    out = []
    for i, (lw, cells) in enumerate(normalized):
        if i == sep_idx:
            seg = []
            for j in range(n_cols):
                align = alignments[j]
                w = widths[j]
                if align == "center":
                    seg.append(":" + "-" * (w - 2) + ":")
                elif align == "right":
                    seg.append("-" * (w - 1) + ":")
                elif align == "left" and _separator_alignment(cells[j]) == "left":
                    seg.append(":" + "-" * (w - 1))
                else:
                    seg.append("-" * w)
            out.append(lw + "| " + " | ".join(seg) + " |")
        else:
            padded = []
            for j in range(n_cols):
                c = cells[j]
                w = widths[j]
                align = alignments[j]
                if align == "right":
                    padded.append(c.rjust(w))
                elif align == "center":
                    padded.append(c.center(w))
                else:
                    padded.append(c.ljust(w))
            out.append(lw + "| " + " | ".join(padded) + " |")
    return out


def _normalize_md(text):
    """Sanitize markdown for storage: swap box-drawing pipes for ASCII, align table columns.

    Tables get uniform per-column padding so the next column never starts flush against
    the previous cell's content. Fenced code blocks are left untouched.
    """
    if not text:
        return text
    text = text.replace("│", "|")
    out_lines = []
    in_fence = False
    table_buf = []  # list of (leading_ws, cells)

    def flush_table():
        if table_buf:
            out_lines.extend(_format_table_block(table_buf))
            table_buf.clear()

    for line in text.split("\n"):
        if line.lstrip().startswith("```") or line.lstrip().startswith("~~~"):
            flush_table()
            in_fence = not in_fence
            out_lines.append(line)
            continue
        if not in_fence and _TABLE_ROW_RE.match(line):
            parsed = _split_row(line)
            if parsed is not None:
                table_buf.append(parsed)
                continue
        flush_table()
        out_lines.append(line)
    flush_table()
    return "\n".join(out_lines)


def load_all(kb_dir):
    """Load all entries from kb_dir/entries/. Returns list of dicts with 'content' reattached."""
    edir = _entries_dir(kb_dir)
    if not os.path.isdir(edir):
        return []
    entries = []
    seen = set()
    for name in os.listdir(edir):
        if not name.endswith(".json"):
            continue
        eid = name[:-5]
        if eid in seen:
            continue
        seen.add(eid)
        json_path = os.path.join(edir, name)
        md_path = os.path.join(edir, f"{eid}.md")
        with open(json_path, encoding="utf-8") as f:
            entry = json.load(f)
        md_text = ""
        if os.path.exists(md_path):
            with open(md_path, encoding="utf-8") as f:
                md_text = f.read()
        if entry.get("type") == "_digest":
            entry["markdown"] = md_text
        else:
            entry["content"] = md_text
        entries.append(entry)
    return entries


def save_entry(kb_dir, entry):
    """Write a single entry as entries/{id}.json + entries/{id}.md."""
    edir = _entries_dir(kb_dir)
    os.makedirs(edir, exist_ok=True)
    eid = entry["id"]

    # Separate content from metadata
    meta = dict(entry)
    if meta.get("type") == "_digest":
        md_text = meta.pop("markdown", "")
    else:
        md_text = meta.pop("content", "")

    md_text = _normalize_md(md_text)

    with open(os.path.join(edir, f"{eid}.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    with open(os.path.join(edir, f"{eid}.md"), "w", encoding="utf-8") as f:
        f.write(md_text)


def save_all(kb_dir, entries):
    """Write all entries. Does NOT delete removed entries — use delete_entry for that."""
    for entry in entries:
        save_entry(kb_dir, entry)


def delete_entry(kb_dir, eid):
    """Remove entries/{eid}.json and entries/{eid}.md if they exist."""
    edir = _entries_dir(kb_dir)
    for ext in (".json", ".md"):
        path = os.path.join(edir, f"{eid}{ext}")
        if os.path.exists(path):
            os.remove(path)


def entry_ids_on_disk(kb_dir):
    """Return set of entry IDs that exist on disk."""
    edir = _entries_dir(kb_dir)
    if not os.path.isdir(edir):
        return set()
    return {name[:-5] for name in os.listdir(edir) if name.endswith(".json")}
