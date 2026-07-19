#!/usr/bin/env python3
"""
kb-import-genesets.py -- import interaction-store's agents.json groups as cards

interaction-store keeps a gene registry (agents.json): 710 genes, each tagged
with the analysis groups it belongs to -- xi_escape, tubulin_transport, nDEG,
hum_nean_admix, and 23 more. That registry is the thing memento lacks and the
thing that made shuttling gene lists between the two tools necessary.

This turns each group into a memento card instead of a registry row:

    group 'xi_escape' (86 genes)  ->  one card:
        type   reference
        tags   ['xi_escape', 'gene-set']
        genes  [AFF2, AKAP17A, ALG13, ...]   (all 86)
        source most common DOI across the group's references
        body   provenance -- analysis origins and references

Once imported, a gene's group memberships are simply the tags of the gene-set
cards it appears on, recomputed by kb-interactions.py every run. No registry,
no sync, no second tool. The 'gene-set' tag is what marks a card as a SET
(annotates its genes) rather than a THOUGHT (names them as nodes), so these
cards add group colour and filtering to the Genes view without dropping 710
nodes onto the canvas.

Group names with spaces or slashes are slugified for the tag ('PTM enzymes' ->
'PTM_enzymes') so #tag search still works; the original name is kept in the
title. Idempotent: a group whose card already exists is skipped, so re-running
after adding genes upstream is safe. Reversible: --undo removes every card this
script created (matched by the 'gene-set' tag).

Usage:
    ./kb-import-genesets.py --dry-run      # show what would be written
    ./kb-import-genesets.py                # write the cards
    ./kb-import-genesets.py --undo         # remove all gene-set cards
"""

import argparse
import json
import os
import pathlib
import random
import re
import sys
import time
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kb_io

HERE = pathlib.Path(__file__).parent
KB = HERE / "knowledge-base"
AGENTS = pathlib.Path("/Users/kmt/interaction-store/agents.json")
MARK_TAG = "gene-set"
_B36 = "0123456789abcdefghijklmnopqrstuvwxyz"


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def slug(name):
    """Group name -> tag-safe token. Spaces and slashes break #tag search."""
    return re.sub(r"[\s/]+", "_", name.strip())


def _b36(n):
    s = ""
    while n:
        s = _B36[n % 36] + s
        n //= 36
    return s or "0"


def mint_id(taken):
    """12-char id in memento's scheme: base36(ms) + 4 random base36 chars."""
    while True:
        eid = _b36(int(time.time() * 1000)) + "".join(random.choice(_B36) for _ in range(4))
        if eid not in taken:
            taken.add(eid)
            return eid


def group_index(agents):
    """group name -> {genes, origins Counter, dois Counter}."""
    groups = defaultdict(lambda: {"genes": [], "origins": Counter(), "dois": Counter()})
    for gene, v in agents.items():
        for gr in (v.get("groups") or []):
            g = groups[gr]
            g["genes"].append(gene)
            ao = v.get("analysis_origin") or {}
            if ao.get("note"):
                g["origins"][ao["note"]] += 1
            for r in (v.get("references") or []):
                if r.get("doi"):
                    g["dois"][r["doi"]] += 1
    return groups


def build_body(name, info):
    lines = [f"Gene set **{name}** imported from interaction-store "
             f"(`agents.json`, {len(info['genes'])} genes).", ""]
    if info["origins"]:
        lines.append("Analysis origins:")
        for note, n in info["origins"].most_common(5):
            lines.append(f"- {note} ({n} gene{'s' if n > 1 else ''})")
        lines.append("")
    if info["dois"]:
        lines.append("References:")
        for doi, n in info["dois"].most_common(5):
            lines.append(f"- [{doi}](https://doi.org/{doi}) ({n})")
    return "\n".join(lines).rstrip() + "\n"


def existing_genesets(kb_dir):
    """slug -> id for gene-set cards already on disk, so import is idempotent."""
    out = {}
    for e in kb_io.load_all(str(kb_dir)):
        tags = e.get("tags") or []
        if MARK_TAG in tags:
            for t in tags:
                if t != MARK_TAG:
                    out[t] = e["id"]
    return out


def do_import(kb_dir, agents_path, dry_run=False):
    agents = json.loads(pathlib.Path(agents_path).read_text())
    groups = group_index(agents)
    existing = existing_genesets(kb_dir)
    taken = kb_io.entry_ids_on_disk(str(kb_dir))
    date = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())

    created, skipped = [], []
    for name, info in sorted(groups.items(), key=lambda x: -len(x[1]["genes"])):
        tag = slug(name)
        if tag in existing:
            skipped.append((name, len(info["genes"]), existing[tag]))
            continue
        genes = sorted(set(info["genes"]))
        doi = info["dois"].most_common(1)[0][0] if info["dois"] else ""
        entry = {
            "id": mint_id(taken),
            "type": "reference",
            "title": f"Gene set: {name}",
            "genes": genes,
            "tags": [tag, MARK_TAG],
            "source": f"https://doi.org/{doi}" if doi else "",
            "connection": False,
            "archived": False,
            "pinned": False,
            "due": "",
            "date": date,
            "synced": False,
            "content": build_body(name, info),
        }
        created.append(entry)
        if not dry_run:
            kb_io.save_entry(str(kb_dir), entry)

    verb = "WOULD create" if dry_run else "created"
    log(f"\n{verb} {len(created)} gene-set cards, skipped {len(skipped)} already present:")
    for e in created:
        log(f"  + {e['tags'][0]:<26} {len(e['genes']):>4} genes   {e['id']}   {e['source']}")
    for name, n, eid in skipped:
        log(f"  = {slug(name):<26} {n:>4} genes   {eid}   (exists)")
    if dry_run:
        log(f"\n--- example card body ({created[0]['tags'][0]}) ---" if created else "")
        if created:
            log(created[0]["content"])
    return created, skipped


def do_undo(kb_dir):
    ids = [e["id"] for e in kb_io.load_all(str(kb_dir)) if MARK_TAG in (e.get("tags") or [])]
    log(f"removing {len(ids)} gene-set cards ...")
    for eid in ids:
        kb_io.delete_entry(str(kb_dir), eid)
        log(f"  - {eid}")
    return ids


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--agents", type=pathlib.Path, default=AGENTS)
    p.add_argument("--kb", type=pathlib.Path, default=KB)
    p.add_argument("--dry-run", action="store_true", help="preview without writing")
    p.add_argument("--undo", action="store_true", help="delete every gene-set card")
    a = p.parse_args()
    if a.undo:
        do_undo(a.kb)
    else:
        do_import(a.kb, a.agents, dry_run=a.dry_run)


if __name__ == "__main__":
    main()
