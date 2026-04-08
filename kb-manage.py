#!/usr/bin/env python3
"""Command-line tool for batch operations on per-entry knowledge base files."""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import click

from kb_io import load_all, save_entry, save_all, delete_entry, entry_ids_on_disk


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


VALID_TYPES = [
    "fact", "idea", "hypothesis", "quote", "reference",
    "observation", "connection", "person",
]


@click.group()
def cli():
    """Batch operations on a knowledge-base directory."""
    pass


# ── Tags ────────────────────────────────────────────────────


@cli.command("rename-tag")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("old")
@click.argument("new")
def rename_tag(kb_dir, old, new):
    """Rename a tag across all entries.  OLD → NEW"""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        tags = e.get("tags", [])
        if old in tags:
            tags = [new if t == old else t for t in tags]
            seen = set()
            e["tags"] = [t for t in tags if not (t in seen or seen.add(t))]
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Renamed tag '{old}' → '{new}' in {len(changed)} entries.")


@cli.command("delete-tag")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("tag")
def delete_tag(kb_dir, tag):
    """Remove a tag from all entries."""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        tags = e.get("tags", [])
        if tag in tags:
            e["tags"] = [t for t in tags if t != tag]
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Removed tag '{tag}' from {len(changed)} entries.")


@cli.command("add-tag")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("tag")
@click.option("--where-tag", help="Only add to entries that already have this tag.")
@click.option("--where-type", help="Only add to entries of this type.")
@click.option("--where-gene", help="Only add to entries containing this gene.")
def add_tag(kb_dir, tag, where_tag, where_type, where_gene):
    """Add a tag to entries (optionally filtered)."""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        if where_tag and where_tag not in e.get("tags", []):
            continue
        if where_type and e.get("type") != where_type:
            continue
        if where_gene and where_gene.upper() not in [g.upper() for g in e.get("genes", [])]:
            continue
        tags = e.get("tags", [])
        if tag not in tags:
            tags.append(tag)
            e["tags"] = tags
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Added tag '{tag}' to {len(changed)} entries.")


@cli.command("list-tags")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.option("--sort", "sort_by", type=click.Choice(["name", "count"]), default="count",
              help="Sort by name or count (default: count).")
def list_tags(kb_dir, sort_by):
    """List all tags with usage counts."""
    entries = load_all(kb_dir)
    counts = {}
    for e in entries:
        for t in e.get("tags", []):
            counts[t] = counts.get(t, 0) + 1
    if sort_by == "count":
        items = sorted(counts.items(), key=lambda x: -x[1])
    else:
        items = sorted(counts.items())
    for tag, count in items:
        click.echo(f"  {count:4d}  {tag}")
    click.echo(f"\n{len(items)} unique tags across {len(entries)} entries.")


# ── Genes ───────────────────────────────────────────────────


@cli.command("rename-gene")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("old")
@click.argument("new")
def rename_gene(kb_dir, old, new):
    """Rename a gene across all entries.  OLD → NEW"""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        genes = e.get("genes", [])
        matched = [i for i, g in enumerate(genes) if g.upper() == old.upper()]
        if matched:
            for i in matched:
                genes[i] = new
            seen = set()
            e["genes"] = [g for g in genes if not (g.upper() in seen or seen.add(g.upper()))]
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Renamed gene '{old}' → '{new}' in {len(changed)} entries.")


@cli.command("delete-gene")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("gene")
def delete_gene(kb_dir, gene):
    """Remove a gene from all entries."""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        genes = e.get("genes", [])
        if any(g.upper() == gene.upper() for g in genes):
            e["genes"] = [g for g in genes if g.upper() != gene.upper()]
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Removed gene '{gene}' from {len(changed)} entries.")


@cli.command("list-genes")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.option("--sort", "sort_by", type=click.Choice(["name", "count"]), default="count")
def list_genes(kb_dir, sort_by):
    """List all genes with usage counts."""
    entries = load_all(kb_dir)
    counts = {}
    for e in entries:
        for g in e.get("genes", []):
            key = g.upper()
            counts[key] = counts.get(key, 0) + 1
    if sort_by == "count":
        items = sorted(counts.items(), key=lambda x: -x[1])
    else:
        items = sorted(counts.items())
    for gene, count in items:
        click.echo(f"  {count:4d}  {gene}")
    click.echo(f"\n{len(items)} unique genes across {len(entries)} entries.")


# ── Types ───────────────────────────────────────────────────


@cli.command("rename-type")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("old")
@click.argument("new")
def rename_type(kb_dir, old, new):
    """Rename a type across all entries.  OLD → NEW"""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        if e.get("type") == old:
            e["type"] = new
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Renamed type '{old}' → '{new}' in {len(changed)} entries.")


@cli.command("list-types")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
def list_types(kb_dir):
    """List all types with usage counts."""
    entries = load_all(kb_dir)
    counts = {}
    for e in entries:
        t = e.get("type", "")
        counts[t] = counts.get(t, 0) + 1
    for t, c in sorted(counts.items(), key=lambda x: -x[1]):
        click.echo(f"  {c:4d}  {t}")


# ── Remove entries ──────────────────────────────────────────


@cli.command("remove-by-tag")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("tag")
@click.option("--dry-run", is_flag=True, help="Show what would be removed.")
def remove_by_tag(kb_dir, tag, dry_run):
    """Remove all entries that have TAG."""
    entries = load_all(kb_dir)
    keep, drop = [], []
    for e in entries:
        (drop if tag in e.get("tags", []) else keep).append(e)
    if dry_run:
        for e in drop:
            click.echo(f"  would remove: [{e.get('type')}] {e.get('title') or e.get('id')}")
        click.echo(f"\n{len(drop)} entries would be removed ({len(keep)} kept).")
    else:
        for e in drop:
            delete_entry(kb_dir, e["id"])
        click.echo(f"Removed {len(drop)} entries with tag '{tag}' ({len(keep)} kept).")


@cli.command("remove-by-type")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("type_name")
@click.option("--dry-run", is_flag=True)
def remove_by_type(kb_dir, type_name, dry_run):
    """Remove all entries of TYPE_NAME."""
    entries = load_all(kb_dir)
    keep, drop = [], []
    for e in entries:
        (drop if e.get("type") == type_name else keep).append(e)
    if dry_run:
        for e in drop:
            click.echo(f"  would remove: {e.get('title') or e.get('id')}")
        click.echo(f"\n{len(drop)} entries would be removed ({len(keep)} kept).")
    else:
        for e in drop:
            delete_entry(kb_dir, e["id"])
        click.echo(f"Removed {len(drop)} entries of type '{type_name}' ({len(keep)} kept).")


@cli.command("remove-by-id")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("ids", nargs=-1, required=True)
def remove_by_id(kb_dir, ids):
    """Remove entries by one or more IDs."""
    id_set = set(ids)
    existing = entry_ids_on_disk(kb_dir)
    removed = 0
    for eid in id_set:
        if eid in existing:
            delete_entry(kb_dir, eid)
            removed += 1
    click.echo(f"Removed {removed} entries.")


# ── Search / Replace ────────────────────────────────────────


@cli.command("replace")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("pattern")
@click.argument("replacement")
@click.option("--field", multiple=True, default=("content", "title"),
              help="Fields to search (default: content, title). Repeat for multiple.")
@click.option("--regex", "use_regex", is_flag=True, help="Treat PATTERN as a regex.")
@click.option("--dry-run", is_flag=True)
def replace(kb_dir, pattern, replacement, field, use_regex, dry_run):
    """Search/replace text across entries."""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        entry_changed = False
        for f in field:
            val = e.get(f, "")
            if not isinstance(val, str):
                continue
            if use_regex:
                new_val = re.sub(pattern, replacement, val)
            else:
                new_val = val.replace(pattern, replacement)
            if new_val != val:
                if dry_run:
                    click.echo(f"  [{e.get('id')}] {f}: '{pattern}' found")
                else:
                    e[f] = new_val
                entry_changed = True
        if entry_changed:
            changed.append(e)
    if not dry_run:
        for e in changed:
            save_entry(kb_dir, e)
    click.echo(f"{'Would modify' if dry_run else 'Modified'} {len(changed)} entries.")


@cli.command("grep")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("pattern")
@click.option("--field", multiple=True, default=("content", "title", "tags", "genes"),
              help="Fields to search.")
@click.option("-i", "--ignore-case", is_flag=True)
def grep(kb_dir, pattern, field, ignore_case):
    """Search entries for PATTERN and print matches."""
    entries = load_all(kb_dir)
    flags = re.IGNORECASE if ignore_case else 0
    rx = re.compile(pattern, flags)
    n = 0
    for e in entries:
        matched_fields = []
        for f in field:
            val = e.get(f, "")
            if isinstance(val, list):
                val = ", ".join(str(v) for v in val)
            if not isinstance(val, str):
                continue
            if rx.search(val):
                matched_fields.append(f)
        if matched_fields:
            title = e.get("title") or e.get("content", "")[:60]
            click.echo(f"  {e['id']}  [{e.get('type')}] {title}")
            click.echo(f"           matched in: {', '.join(matched_fields)}")
            n += 1
    click.echo(f"\n{n} entries matched.")


# ── Merge / Import ──────────────────────────────────────────


@cli.command("merge")
@click.argument("target", type=click.Path(exists=True, file_okay=False))
@click.argument("source", type=click.Path(exists=True, file_okay=False))
@click.option("--overwrite", is_flag=True,
              help="If an ID exists in both, overwrite with SOURCE version.")
def merge(target, source, overwrite):
    """Merge SOURCE entries into TARGET directory."""
    t_entries = load_all(target)
    s_entries = load_all(source)
    t_ids = {e["id"] for e in t_entries}
    added, updated = 0, 0
    for se in s_entries:
        if se["id"] in t_ids:
            if overwrite:
                save_entry(target, se)
                updated += 1
        else:
            save_entry(target, se)
            added += 1
    click.echo(f"Merged: {added} added, {updated} updated.")


@cli.command("import")
@click.argument("target", type=click.Path(exists=True, file_okay=False))
@click.argument("source", type=click.Path(exists=True, file_okay=False))
def import_file(target, source):
    """Append all entries from SOURCE into TARGET (new IDs assigned to avoid collisions)."""
    import random
    import string
    s_entries = load_all(source)
    existing_ids = entry_ids_on_disk(target)
    n = 0
    for se in s_entries:
        while se["id"] in existing_ids:
            se["id"] = "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
        existing_ids.add(se["id"])
        save_entry(target, se)
        n += 1
    click.echo(f"Imported {n} entries into {target}.")


# ── Bulk field operations ───────────────────────────────────


@cli.command("set-synced")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("value", type=click.Choice(["true", "false"]))
@click.option("--where-tag", help="Only affect entries with this tag.")
@click.option("--where-type", help="Only affect entries of this type.")
def set_synced(kb_dir, value, where_tag, where_type):
    """Set the synced flag on all (or filtered) entries."""
    entries = load_all(kb_dir)
    val = value == "true"
    changed = []
    for e in entries:
        if where_tag and where_tag not in e.get("tags", []):
            continue
        if where_type and e.get("type") != where_type:
            continue
        if e.get("synced") != val:
            e["synced"] = val
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Set synced={val} on {len(changed)} entries.")


@cli.command("set-type")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.argument("new_type")
@click.option("--where-tag", help="Only affect entries with this tag.")
@click.option("--where-type", help="Only affect entries currently of this type.")
def set_type(kb_dir, new_type, where_tag, where_type):
    """Change the type of filtered entries."""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        if where_tag and where_tag not in e.get("tags", []):
            continue
        if where_type and e.get("type") != where_type:
            continue
        if e.get("type") != new_type:
            e["type"] = new_type
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Set type='{new_type}' on {len(changed)} entries.")


@cli.command("touch")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.option("--where-tag", help="Only touch entries with this tag.")
def touch(kb_dir, where_tag):
    """Update the date field to now (marks entries as recently modified)."""
    entries = load_all(kb_dir)
    stamp = now_iso()
    changed = []
    for e in entries:
        if where_tag and where_tag not in e.get("tags", []):
            continue
        e["date"] = stamp
        changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Touched {len(changed)} entries.")


# ── Stats ───────────────────────────────────────────────────


@cli.command("stats")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
def stats(kb_dir):
    """Print summary statistics for the knowledge base."""
    entries = load_all(kb_dir)
    click.echo(f"Entries:  {len(entries)}")
    types = {}
    for e in entries:
        t = e.get("type", "?")
        types[t] = types.get(t, 0) + 1
    click.echo("Types:")
    for t, c in sorted(types.items(), key=lambda x: -x[1]):
        click.echo(f"  {c:4d}  {t}")
    synced = sum(1 for e in entries if e.get("synced"))
    click.echo(f"Synced:   {synced}/{len(entries)}")
    all_tags = set()
    for e in entries:
        all_tags.update(e.get("tags", []))
    click.echo(f"Tags:     {len(all_tags)} unique")
    all_genes = set()
    for e in entries:
        all_genes.update(g.upper() for g in e.get("genes", []))
    click.echo(f"Genes:    {len(all_genes)} unique")
    lengths = [len(e.get("content", "")) for e in entries]
    if lengths:
        click.echo(f"Content:  {min(lengths)}-{max(lengths)} chars (avg {sum(lengths)//len(lengths)})")
    over = sum(1 for l in lengths if l > 1000)
    if over:
        click.echo(f"          {over} entries over 1000 chars")


# ── Deduplicate ─────────────────────────────────────────────


@cli.command("dedup")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.option("--by", "by_field", type=click.Choice(["title", "content", "id"]),
              default="title", help="Field to detect duplicates on.")
@click.option("--dry-run", is_flag=True)
def dedup(kb_dir, by_field, dry_run):
    """Remove duplicate entries based on a field."""
    entries = load_all(kb_dir)
    seen = set()
    keep, drop = [], []
    for e in entries:
        key = e.get(by_field, "")
        if isinstance(key, str):
            key = key.strip().lower()
        if key and key in seen:
            drop.append(e)
        else:
            if key:
                seen.add(key)
            keep.append(e)
    if dry_run:
        for e in drop:
            click.echo(f"  would remove: [{e.get('type')}] {e.get('title') or e.get('id')}")
        click.echo(f"\n{len(drop)} duplicates found ({len(keep)} would be kept).")
    else:
        for e in drop:
            delete_entry(kb_dir, e["id"])
        click.echo(f"Removed {len(drop)} duplicates ({len(keep)} kept).")


# ── Validate / Clean ────────────────────────────────────────


@cli.command("validate")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
def validate(kb_dir):
    """Check entries for schema issues."""
    entries = load_all(kb_dir)
    required = {"id", "type", "content", "title", "tags", "date", "synced"}
    issues = 0
    for i, e in enumerate(entries):
        missing = required - set(e.keys())
        if missing:
            click.echo(f"  entry {i} ({e.get('id','?')}): missing fields: {missing}")
            issues += 1
        if e.get("type") and e["type"] not in VALID_TYPES:
            click.echo(f"  entry {i} ({e.get('id','?')}): unknown type '{e['type']}'")
            issues += 1
        if not e.get("id"):
            click.echo(f"  entry {i}: missing id")
            issues += 1
        if not isinstance(e.get("tags", []), list):
            click.echo(f"  entry {i} ({e.get('id','?')}): tags is not a list")
            issues += 1
        if not isinstance(e.get("genes", []), list):
            click.echo(f"  entry {i} ({e.get('id','?')}): genes is not a list")
            issues += 1
    if issues == 0:
        click.echo(f"All {len(entries)} entries valid.")
    else:
        click.echo(f"\n{issues} issues found in {len(entries)} entries.")


@cli.command("clean")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
def clean(kb_dir):
    """Normalize entries: ensure all required fields, trim whitespace, sort tags/genes."""
    entries = load_all(kb_dir)
    changed = []
    for e in entries:
        modified = False
        for f, default in [("title", ""), ("tags", []), ("genes", []),
                           ("source", ""), ("synced", False)]:
            if f not in e:
                e[f] = default
                modified = True
        for f in ("title", "content", "source"):
            if isinstance(e.get(f), str) and e[f] != e[f].strip():
                e[f] = e[f].strip()
                modified = True
        for f in ("tags", "genes"):
            if isinstance(e.get(f), list):
                orig = e[f]
                seen = set()
                deduped = [x for x in orig if not (x in seen or seen.add(x))]
                if deduped != orig:
                    e[f] = deduped
                    modified = True
        if modified:
            changed.append(e)
    for e in changed:
        save_entry(kb_dir, e)
    click.echo(f"Cleaned {len(changed)} entries.")


# ── Prune images ────────────────────────────────────────────


@cli.command("prune-images")
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.option("--dry-run", is_flag=True, help="Show what would be deleted without removing files.")
def prune_images(kb_dir, dry_run):
    """Delete images in the images/ subfolder that are not referenced by any entry."""
    entries = load_all(kb_dir)
    img_dir = Path(kb_dir) / "images"

    if not img_dir.is_dir():
        click.echo("No images/ subfolder found.")
        return

    referenced = set()
    for e in entries:
        for field in ("content", "source"):
            text = e.get(field, "")
            if not isinstance(text, str):
                continue
            for m in re.finditer(r'!\[[^\]]*\]\(images/([^)]+)\)', text):
                referenced.add(m.group(1))
            for m in re.finditer(r'images/([^\s"\'<>)]+)', text):
                referenced.add(m.group(1))

    on_disk = set()
    for p in img_dir.iterdir():
        if p.is_file():
            on_disk.add(p.name)

    orphaned = on_disk - referenced
    kept = on_disk - orphaned

    if not orphaned:
        click.echo(f"No orphaned images. All {len(on_disk)} images are referenced.")
        return

    for name in sorted(orphaned):
        if dry_run:
            click.echo(f"  would delete: images/{name}")
        else:
            (img_dir / name).unlink()
            click.echo(f"  deleted: images/{name}")

    total_label = "Would delete" if dry_run else "Deleted"
    click.echo(f"\n{total_label} {len(orphaned)} orphaned images ({len(kept)} kept).")


if __name__ == "__main__":
    cli()
