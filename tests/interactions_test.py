"""Tests for kb-interactions.py — the gene sidecar builder for the Genes view.

Covers the pure logic only: token splitting, card-kind classification, HGNC
grounding of INDRA agents, and edge thinning. No network — the MyGene and INDRA
calls are exercised by --fetch, not here.

Run: pixi run python tests/interactions_test.py
"""

import importlib.util
import json
import os
import sys
import tempfile
import pathlib

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


# kb-interactions.py has a hyphen, so it needs loading by path
spec = importlib.util.spec_from_file_location(
    "kbi", os.path.join(ROOT, "kb-interactions.py"))
kbi = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kbi)


def test_alias_fragments():
    print("\nalias_fragments — '/' is overloaded and we refuse to guess")
    eq(kbi.alias_fragments("RLIM/RNF12"), ["RLIM", "RNF12"], "alias token splits")
    eq(kbi.alias_fragments("MAPT"), ["MAPT"], "bare token passes through")
    eq(kbi.alias_fragments("amplicon_chrX_CSAG1/2/3_0"),
       ["amplicon_chrX_CSAG1", "2", "3_0"],
       "amplicon splits too — HGNC decides, not the splitter")
    eq(kbi.alias_fragments("A//B"), ["A", "B"], "double slash yields no empties")
    eq(kbi.alias_fragments("  MAPT / HDAC6 "), ["MAPT", "HDAC6"], "whitespace trimmed")
    eq(kbi.alias_fragments(""), [], "empty token yields nothing")


def test_split_kinds():
    print("\nsplit_kinds — a set card annotates, a thought card names")
    cards = [
        {"id": "a", "tags": [], "toks": ["MAPT", "HDAC6"]},
        {"id": "b", "tags": [], "toks": [f"G{i}" for i in range(150)]},
        {"id": "c", "tags": ["xi_escape", "gene-set"], "toks": ["AFF2", "ALG13"]},
    ]
    thought, sets_ = kbi.split_kinds(cards)
    eq([c["id"] for c in thought], ["a"], "small untagged card is a thought")
    eq(sorted(c["id"] for c in sets_), ["b", "c"], "big card OR gene-set-tagged card is a set")
    # a small card wearing the gene-set tag is still a set — that is the whole
    # point of the tag: an 86-gene imported set must not become 86 nodes
    eq(kbi.is_set_card({"tags": ["gene-set"], "toks": ["A"]}), True,
       "gene-set tag makes a 1-gene card a set")
    eq(kbi.is_set_card({"tags": [], "toks": ["G"] * kbi.SET_CARD_MIN_GENES}), True,
       "size threshold itself counts as a set")
    eq(kbi.is_set_card({"tags": ["Drive"], "toks": ["MAPT"]}), False,
       "ordinary tagged thought card stays a thought")


def test_statement_agents():
    print("\nstatement_agents — HGNC grounding keeps chemicals out")
    hgnc = lambda n, i: {"name": n, "db_refs": {"HGNC": i, "UP": "X"}}

    eq(kbi.statement_agents({"subj": hgnc("MAPT", "6893"), "obj": hgnc("HDAC6", "14064")}),
       ["MAPT", "HDAC6"], "regulation uses subj/obj")
    eq(kbi.statement_agents({"enz": hgnc("STK11", "11389"), "sub": hgnc("MARK2", "3332")}),
       ["STK11", "MARK2"], "modification uses enz/sub")
    eq(kbi.statement_agents({"members": [hgnc("A", "1"), hgnc("B", "2"), hgnc("C", "3")]}),
       ["A", "B", "C"], "complex uses members[]")

    # The one that matters: CTD chemicals have MESH/CHEBI refs, never HGNC.
    # Unfiltered, bisphenol A bridges 350 genes and the view becomes a
    # toxicology screen.
    chem = {"name": "bisphenol A", "db_refs": {"CHEBI": "CHEBI:33216", "MESH": "C006780"}}
    eq(kbi.statement_agents({"subj": chem, "obj": hgnc("MAPT", "6893")}),
       ["MAPT"], "chemical without HGNC ref is dropped")
    eq(kbi.statement_agents({"subj": chem, "obj": chem}), [], "chemical-only statement empties")
    eq(kbi.statement_agents({"subj": chem, "obj": hgnc("MAPT", "6893")}, hgnc_only=False),
       ["BISPHENOL A", "MAPT"], "filter is defeatable for inspection")

    eq(kbi.statement_agents({"subj": {"db_refs": {"HGNC": "1"}}}), [], "nameless agent dropped")
    eq(kbi.statement_agents({"subj": hgnc("mapt", "6893"), "obj": hgnc("Hdac6", "14064")}),
       ["MAPT", "HDAC6"], "names upper-cased for matching")


def test_thin():
    print("\nthin — evidence arrays are dropped, one PMID kept")
    s = {
        "type": "Phosphorylation", "belief": 0.856864,
        "evidence": [
            {"source_api": "sparser", "text": "x" * 4000},
            {"source_api": "reach", "pmid": "27849045", "text": "y" * 4000},
        ],
    }
    e = kbi.thin(s, "STK11", "MARK2")
    eq(e["a"], "STK11", "endpoint a")
    eq(e["t"], "Phosphorylation", "type carried")
    eq(e["belief"], 0.857, "belief rounded to 3dp")
    eq(e["n"], 2, "evidence counted")
    eq(e["pmid"], "27849045", "first available pmid kept")
    eq("evidence" in e, False, "evidence array not carried — this is the 448MB lesson")
    eq(len(json.dumps(e)) < 200, True, "record stays small")
    eq(kbi.thin({"type": "Activation", "evidence": []}, "A", "B")["pmid"], None,
       "no evidence yields no pmid")
    eq(kbi.thin({"type": "Activation"}, "A", "B")["belief"], 0.0, "missing belief is 0")


def test_load_cards():
    print("\nload_cards — archived and gene-less cards excluded")
    with tempfile.TemporaryDirectory() as d:
        p = pathlib.Path(d)
        (p / "a.json").write_text(json.dumps({"id": "a", "genes": ["MAPT"], "tags": ["t"]}))
        (p / "b.json").write_text(json.dumps({"id": "b", "genes": ["X"], "archived": True}))
        (p / "c.json").write_text(json.dumps({"id": "c", "genes": [], "tags": []}))
        (p / "d.json").write_text(json.dumps({"id": "d", "tags": []}))
        (p / "e.json").write_text(json.dumps({"id": "e", "genes": ["  ", "FMR1"]}))
        (p / "bad.json").write_text("{not json")
        got = {c["id"] for c in kbi.load_cards(p)}
        eq(got, {"a", "e"}, "only live cards carrying real genes")
        e = [c for c in kbi.load_cards(p) if c["id"] == "e"][0]
        eq(e["toks"], ["FMR1"], "blank tokens stripped")


def test_partition_agents():
    print("\npartition_agents — case-insensitive, returns canonical spelling (Cxorf fix)")
    inside_upper = {"C3ORF49": "C3orf49", "MAPT": "MAPT", "CXORF65": "CXorf65"}
    ins, out = kbi.partition_agents(["C3ORF49", "MAPT", "SRC"], inside_upper)
    eq(sorted(ins), ["C3orf49", "MAPT"], "mixed-case gene matched AND returned canonical")
    eq(out, ["SRC"], "unknown agent goes outside")
    ins2, out2 = kbi.partition_agents(["CXORF65", "CXORF65"], inside_upper)
    eq(ins2, ["CXorf65", "CXorf65"], "each occurrence canonicalised (dedup happens later via set)")
    eq(kbi.partition_agents([], inside_upper), ([], []), "empty in, empty out")
    eq(kbi.partition_agents(["FYN"], {"MAPT": "MAPT"})[0], [], "no inside match -> empty ins")


def test_mech_excludes_complex():
    print("\nMECH — Complex is out of the default graph")
    eq("Complex" in kbi.MECH, False, "Complex excluded — 88% of edges, one co-IP = a dozen")
    eq("Phosphorylation" in kbi.MECH, True, "Phosphorylation is mechanistic")
    eq("Activation" in kbi.MECH and "Inhibition" in kbi.MECH, True, "regulation is mechanistic")
    eq("IncreaseAmount" in kbi.MECH, True, "transcriptional amount is mechanistic")


if __name__ == "__main__":
    print("kb-interactions.py")
    test_alias_fragments()
    test_split_kinds()
    test_statement_agents()
    test_thin()
    test_load_cards()
    test_partition_agents()
    test_mech_excludes_complex()
    print(f"\n{PASS} passed, {FAIL} failed")
    sys.exit(1 if FAIL else 0)
