"""Tests for memento-mcp.py — the MCP server Claude queries the knowledge base through.

Drives the tool functions directly against a synthetic knowledge base; no MCP transport needed
to test the logic. Run: pixi run python tests/mcp_test.py
"""

import importlib.util
import json
import os
import shutil
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

PASS = FAIL = 0


def eq(actual, expected, msg):
    global PASS, FAIL
    if actual == expected:
        PASS += 1
        print(f"  ✓ {msg}")
    else:
        FAIL += 1
        print(f"  ✗ {msg}\n      expected {expected!r}\n      actual   {actual!r}")


def write_entry(kb, eid, content, **meta):
    edir = os.path.join(kb, "entries")
    os.makedirs(edir, exist_ok=True)
    m = {"id": eid, "type": "note", "title": "", "tags": [], "genes": [],
         "date": "2026-07-01T00:00:00Z", "synced": False, "archived": False}
    m.update(meta)
    with open(os.path.join(edir, f"{eid}.json"), "w") as f:
        json.dump(m, f)
    with open(os.path.join(edir, f"{eid}.md"), "w") as f:
        f.write(content)


def load_server(kb):
    sys.argv = ["memento-mcp.py", kb]
    spec = importlib.util.spec_from_file_location("memento_mcp", os.path.join(ROOT, "memento-mcp.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


kb = tempfile.mkdtemp()
try:
    write_entry(kb, "a1", "Meiotic drive on the X in baboons.", type="hypothesis",
                title="Drive on X", tags=["Baboons", "LoF"], genes=["SMC1B"], date="2026-07-10T00:00:00Z")
    write_entry(kb, "a2", "Recombination rate varies along the chromosome.", type="fact",
                tags=["Baboons"], genes=["RLIM/RNF12"], date="2026-07-05T00:00:00Z")
    write_entry(kb, "z1", "An old idea I archived.", tags=["Dead"], archived=True, date="2026-01-01T00:00:00Z")
    write_entry(kb, "_digest", "Digest summarising everything above.", type="_digest", date="2026-07-11T00:00:00Z")
    write_entry(kb, "_priorities", "- ship the talk", title="Priorities", date="2026-07-09T00:00:00Z")
    m = load_server(kb)

    print("\nsearch_entries")
    r = m.search_entries(query="meiotic drive")
    eq([e["id"] for e in r["entries"]], ["a1"], "free-text search finds the card")
    eq(r["entries"][0]["snippet"].startswith("Meiotic drive"), True, "and returns a snippet, not the full body")
    eq("content" in r["entries"][0], False, "search never returns full bodies (keeps context small)")

    eq([e["id"] for e in m.search_entries(tag="Baboons")["entries"]], ["a1", "a2"], "filter by tag")
    eq([e["id"] for e in m.search_entries(tag="baboons")["entries"]], ["a1", "a2"], "tag match is case-insensitive")
    eq([e["id"] for e in m.search_entries(type="fact")["entries"]], ["a2"], "filter by type")
    eq([e["id"] for e in m.search_entries(gene="SMC1B")["entries"]], ["a1"], "filter by gene")
    eq([e["id"] for e in m.search_entries(gene="RLIM")["entries"]], ["a2"], "gene alias matches (RLIM of RLIM/RNF12)")
    eq([e["id"] for e in m.search_entries(gene="RNF12")["entries"]], ["a2"], "...and the other alias too")
    eq([e["id"] for e in m.search_entries(query="", limit=99)["entries"]][0], "a1", "results are newest-first")

    print("\nWhat search deliberately hides")
    ids = [e["id"] for e in m.search_entries(query="", limit=99)["entries"]]
    eq("z1" in ids, False, "archived entries are excluded by default")
    eq("z1" in [e["id"] for e in m.search_entries(query="", include_archived=True, limit=99)["entries"]], True,
       "...but include_archived brings them back")
    eq("_digest" in ids, False, "the generated digest is excluded (it would echo other cards back)")
    eq("_priorities" in ids, True, "but Priorities is a real card and stays searchable")

    print("\nA model's bad regex must not become an error")
    eq(m.search_entries(query="C++ (unclosed")["total"], 0, "an invalid regex is treated as literal text, not raised")
    eq(m.search_entries(query="drive|recombination")["total"], 2, "a valid regex still works")

    print("\nget_entry")
    full = m.get_entry("a1")
    eq(full["content"], "Meiotic drive on the X in baboons.", "returns the markdown body from the sibling .md")
    eq(full["title"], "Drive on X", "and the metadata from the .json")
    eq(m.get_entry("_digest")["content"].startswith("Digest"), True, "the digest is fetchable by id even though search hides it")
    eq("error" in m.get_entry("nope"), True, "an unknown id returns an error, not a crash")

    # The app's timeline writes `schedule` onto the entry. get_entry builds its result field by
    # field, so a new field reaches Claude only if it is named here — it does not ride along.
    sched = {"subtasks": [{"id": "s1", "title": "figures", "start": "2026-07-12", "end": "2026-07-17"}]}
    write_entry(kb, "a4", "scheduled card", title="Paper", due="2026-08-07", schedule=sched)
    scheduled = m.get_entry("a4")
    eq(scheduled["schedule"], sched, "a scheduled entry reports its timeline bars")
    eq(scheduled["due"], "2026-08-07", "...and its due date")
    eq(m.get_entry("a1")["schedule"], {}, "an unscheduled one reports an empty schedule, not a missing key")

    print("\nlist_tags / list_genes")
    eq([t["tag"] for t in m.list_tags()["tags"]], ["Baboons", "LoF"], "tags exclude archived-only vocabulary")
    genes = [g["gene"] for g in m.list_genes()["genes"]]
    eq(sorted(genes), ["RLIM/RNF12", "SMC1B"], "genes are reported as stored, not split on '/'")
    # Splitting would shred amplicon names like amplicon_chrX_CSAG1/2/3_0 into "2", "3_0".
    write_entry(kb, "a3", "amplicon card", genes=["amplicon_chrX_CSAG1/2/3_0"])
    eq("2" in [g["gene"] for g in m.list_genes()["genes"]], False,
       "an amplicon name containing slashes does not produce a bogus gene called '2'")

    print("\nThe cache must not serve stale data")
    # This is the whole point of the server: a card deleted in the app simply stops being returned,
    # with no Cleanup step. That only holds if the cache notices the change.
    eq(m.search_entries(query="recombination")["total"], 1, "card is found")
    os.remove(os.path.join(kb, "entries", "a2.json"))
    os.remove(os.path.join(kb, "entries", "a2.md"))
    eq(m.search_entries(query="recombination")["total"], 0, "deleting it makes it vanish immediately — no cleanup step")
    write_entry(kb, "a4", "A brand new card about drive.", date="2026-07-12T00:00:00Z")
    eq(m.search_entries(query="brand new")["total"], 1, "a newly written card is picked up immediately")

finally:
    shutil.rmtree(kb, ignore_errors=True)

print(f"\n{'ALL PASS' if FAIL == 0 else 'FAILURES'}: {PASS} passed, {FAIL} failed\n")
sys.exit(1 if FAIL else 0)
