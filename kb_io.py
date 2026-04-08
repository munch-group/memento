"""Shared I/O for per-entry knowledge base (entries/{id}.json + entries/{id}.md)."""

import json
import os


def _entries_dir(kb_dir):
    return os.path.join(kb_dir, "entries")


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
