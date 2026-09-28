"""Tests for kb-titles.py — bare URLs -> titled markdown links in card bodies.

Pure logic only, no network: URL boundaries, what is refused and why, DOI
derivation, title cleaning, the elided fallback label, and the rewrite itself.
The resolvers' HTTP is exercised by running the script, not here.

The trim_url expectations are not invented — they are what marked 15.0.12
(vendor/marked.min.js) autolinks each string to. That equality is the point:
the explicit href this script writes must be the href the app already produces,
or links silently change target.

Run: pixi run python tests/titles_test.py
"""

import importlib.util
import json
import os
import pathlib
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


# kb-titles.py has a hyphen, so it needs loading by path
spec = importlib.util.spec_from_file_location("kbt", os.path.join(ROOT, "kb-titles.py"))
kbt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kbt)


def why(text):
    """url -> skip reason (None = would be rewritten)."""
    return {u: w for _s, u, w in kbt.candidates(text)}


def test_trim_url():
    print("\ntrim_url — the same span marked's autolinker takes")
    eq(kbt.trim_url("https://example.com/path."), "https://example.com/path",
       "trailing full stop is not part of the URL")
    eq(kbt.trim_url("https://doi.org/10.1/2)"), "https://doi.org/10.1/2",
       "unbalanced closing paren dropped — the URL was in prose parens")
    eq(kbt.trim_url("https://www.cell.com/cell/fulltext/S0092-8674(15)00430-4"),
       "https://www.cell.com/cell/fulltext/S0092-8674(15)00430-4",
       "balanced parens kept — Cell PIIs would otherwise be truncated")
    eq(kbt.trim_url("https://en.wikipedia.org/wiki/Foo_(bar)"),
       "https://en.wikipedia.org/wiki/Foo_(bar)", "Wikipedia disambiguator kept")
    for ch in ".,;:!?'\"*_~":
        eq(kbt.trim_url("https://a.com/b" + ch), "https://a.com/b", f"trailing {ch!r} dropped")
    eq(kbt.trim_url("https://a.com/b?q=1#frag"), "https://a.com/b?q=1#frag",
       "query and fragment survive")


def test_candidates_markup():
    print("\ncandidates — markup that already owns a URL is left alone")
    eq(why("- https://a.com/x/y"), {"https://a.com/x/y": None}, "a bare URL on a list line is ours")
    eq(why("[Paper](https://a.com/x/y)"), {"https://a.com/x/y": "link"}, "markdown link skipped")
    eq(why("![alt](https://a.com/x.png)"), {"https://a.com/x.png": "link"}, "image skipped")
    eq(why("<https://a.com/x/y>"), {"https://a.com/x/y": "link"}, "angle autolink skipped")
    eq(why("[1]: https://a.com/x/y"), {"https://a.com/x/y": "link"}, "reference definition skipped")
    eq(why('<a href="https://a.com/x/y">t</a>'), {"https://a.com/x/y": "html"},
       "raw html attribute skipped")
    eq(why("`https://a.com/x/y`"), {"https://a.com/x/y": "code"}, "inline code skipped")
    eq(why("```\nhttps://a.com/x/y\n```"), {"https://a.com/x/y": "fence"}, "fenced code skipped")
    eq(why("> quoted https://a.com/x/y"), {"https://a.com/x/y": "quote"},
       "blockquote skipped — quoted text is not ours to rewrite")
    eq(why("See [PubMed\n](https://a.com/x/y) ok"), {"https://a.com/x/y": "link"},
       "link whose text and destination straddle a newline is still a link")
    eq(why("https://a.com/b[c]"), {"https://a.com/b[c]": "bracket"},
       "bracketed URL refused rather than risk changing the href")
    eq(why("https://www.readcube.com/library/**ff394a98-x**:*544294c6*"),
       {"https://www.readcube.com/library/**ff394a98-x**:*544294c6": "emphasis"},
       "a URL template annotated with ** is emphasis, not a link to retitle")
    eq(why(r"(?<=\^|\1).*?(*\w+)\].?https://www.readcube.com/library/(.*?):(.*?))"),
       {"https://www.readcube.com/library/(.*?):(.*?)": "emphasis"},
       "a documented regex that looks like a URL is refused too")
    eq(why("visit www.example.com/a/b"), {},
       "scheme-less URL not touched — [t](www…) would be a relative link")
    eq(why("- https://app.readcube.com/library/ff394a98-20f7-4882-871c-"),
       {"https://app.readcube.com/library/ff394a98-20f7-4882-871c-": "truncated"},
       "a wrapped, already-dead URL stays bare so the breakage stays visible")
    eq(why("- https://uu.nl/handle/Master%20Thesis%20-"),
       {"https://uu.nl/handle/Master%20Thesis%20-": "truncated"},
       "and the same when the wrap landed after an escape")
    eq(why("- https://a.com/x/y-z"), {"https://a.com/x/y-z": None},
       "an interior hyphen is not a truncation")


def test_candidates_prose():
    print("\ncandidates — prose in front means the line already names the link")
    eq(why("- Rolling Regression — PyMC example gallery https://a.com/x/y"),
       {"https://a.com/x/y": "prose"}, "a line that already titles the link is skipped")
    eq(why("- SMBE talks: https://a.com/x/y"), {"https://a.com/x/y": None},
       "a short label in front is not a title")
    eq(why("1. Lupianez, D.G. et al. (2015). Disruptions of chromatin domains. https://a.com/x/y"),
       {"https://a.com/x/y": "prose"}, "numbered citation skipped")
    eq(why("https://a.com/x/y"), {"https://a.com/x/y": None}, "URL alone on its line is ours")
    eq(why("* https://a.com/x/y"), {"https://a.com/x/y": None}, "'*' list marker is not prose")
    eq(why("3) https://a.com/x/y"), {"https://a.com/x/y": None}, "'3)' list marker is not prose")


def test_candidates_wrapped():
    print("\ncandidates — a pasted title hard-wrapped across '- ' lines is already a title")
    eq(why("- There is a lot of rare variation on AFF2: Excess variants in\n"
           "- AFF2 detected by massively parallel sequencing of males with autism\n"
           "- spectrum disorder - PMC https://a.com/x/y"),
       {"https://a.com/x/y": "wrapped"},
       "the URL's own line is only the tail of the title above it")
    eq(why("- Loss of circSRY reduces γH2AX level in germ cells - PubMed\n"
           "- https://a.com/x/y"),
       {"https://a.com/x/y": "wrapped"},
       "a URL alone on its line is still wrapped when the title is right above")
    eq(why("- Evolution of a Sperm-Specific Ion Channel Complex: CatSperβ -\n"
           "- PMC https://a.com/x/y"),
       {"https://a.com/x/y": "wrapped"}, "a dangling '-' does not end a title")
    eq(why("- Some note about a thing. \n- https://a.com/x/y"),
       {"https://a.com/x/y": None},
       "a list line that ends cleanly is a sibling, not the head of a wrap")
    eq(why("- CAR Models — PyMC example gallery https://a.com/one\n- https://a.com/x/y"),
       {"https://a.com/one": "prose", "https://a.com/x/y": None},
       "a list line ending in its own link is a sibling too")
    eq(why("Maybe use optax.contrib.reduce_on_plateau to avoid spikes when it plateaus\n"
           "https://a.com/x/y"),
       {"https://a.com/x/y": None},
       "a plain prose line above is not a wrapped list item")
    eq(why("## Anti-sense transcript regulation\n\nhttps://a.com/x/y"),
       {"https://a.com/x/y": None}, "a blank line above ends any wrap")
    eq(why("https://a.com/x/y"), {"https://a.com/x/y": None}, "nothing above line 1 to wrap from")


def test_url_doi():
    print("\nurl_doi — a DOI in the path or query, or synthesized where the id IS one")
    eq(kbt.url_doi("https://doi.org/10.1038/s41586-021-03451-0"), "10.1038/s41586-021-03451-0",
       "doi.org")
    eq(kbt.url_doi("https://dx.doi.org/10.1016/j.cell.2015.04.004"), "10.1016/j.cell.2015.04.004",
       "dx.doi.org")
    eq(kbt.url_doi("https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1004610"),
       "10.1371/journal.pgen.1004610", "PLOS puts it in the query")
    eq(kbt.url_doi("https://link.springer.com/article/10.1007/s00439-021-02290-3"),
       "10.1007/s00439-021-02290-3", "Springer path")
    eq(kbt.url_doi("https://onlinelibrary.wiley.com/doi/10.1111/mec.16000"),
       "10.1111/mec.16000", "Wiley path")
    eq(kbt.url_doi("https://molecularneurodegeneration.biomedcentral.com/articles/10.1186/s13024-024-00731-x"),
       "10.1186/s13024-024-00731-x", "BMC path")
    eq(kbt.url_doi("https://www.nature.com/articles/s41586-021-03451-0"),
       "10.1038/s41586-021-03451-0", "nature article id IS the DOI suffix")
    eq(kbt.url_doi("https://elifesciences.org/articles/64620"), "10.7554/eLife.64620",
       "eLife article number IS the DOI suffix")
    eq(kbt.url_doi("https://www.biorxiv.org/content/10.1101/2024.03.24.586479v1.full.pdf"),
       "10.1101/2024.03.24.586479", "bioRxiv version and page suffixes stripped")
    eq(kbt.url_doi("https://www.biorxiv.org/content/10.1101/2024.03.24.586479v2"),
       "10.1101/2024.03.24.586479", "bioRxiv bare version stripped")
    eq(kbt.url_doi("https://www.frontiersin.org/articles/10.3389/fonc.2021.672781/full"),
       "10.3389/fonc.2021.672781", "Frontiers hangs '/full' off the DOI as a path segment")
    eq(kbt.url_doi("https://www.frontiersin.org/journals/oncology/articles/10.3389/fonc.2021.672781/full"),
       "10.3389/fonc.2021.672781", "and the same in its newer URL shape")
    eq(kbt.url_doi("https://www.sciencedirect.com/science/article/pii/S1750946724000849"), None,
       "a ScienceDirect PII is not a DOI — stays untitled by design")
    eq(kbt.url_doi("https://academic.oup.com/mbe/article/41/5/msae100"), None,
       "an OUP article number is not a DOI")
    eq(kbt.url_doi("https://novonordiskfonden.dk/en/grants/"), None, "a funder page has no DOI")


def test_id_resolvers():
    print("\npubmed_id / pmc_id / github_repo")
    eq(kbt.pubmed_id("https://pubmed.ncbi.nlm.nih.gov/33911273/"), "33911273", "PubMed id")
    eq(kbt.pubmed_id("https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4643966/"), None,
       "a PMC URL is not a PubMed id")
    eq(kbt.pmc_id("https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4643966/"), "4643966",
       "old PMC path")
    eq(kbt.pmc_id("https://pmc.ncbi.nlm.nih.gov/articles/PMC4512676/"), "4512676", "new PMC host")
    eq(kbt.pmc_id("https://pubmed.ncbi.nlm.nih.gov/33911273/"), None, "PubMed URL is not PMC")
    eq(kbt.github_repo("https://github.com/DartML/Stein-Variational-Gradient-Descent"),
       "DartML/Stein-Variational-Gradient-Descent", "owner/repo")
    eq(kbt.github_repo("https://github.com/owner/repo.git"), "owner/repo", "'.git' dropped")
    eq(kbt.github_repo("https://github.com/owner/repo/blob/main/x.py"), "owner/repo",
       "a deep link still names its repo")
    eq(kbt.github_repo("https://github.com/orgs/munch-group/repositories"), None,
       "reserved path is not a repo")
    eq(kbt.github_repo("https://github.com"), None, "bare host is not a repo")


def test_clean_title():
    print("\nclean_title — metadata markup out, markdown-safe text in")
    eq(kbt.clean_title("<jats:italic>Drosophila</jats:italic> genome evolution"),
       "Drosophila genome evolution", "JATS markup stripped")
    eq(kbt.clean_title("Genes &amp; development"), "Genes & development", "entities unescaped")
    eq(kbt.clean_title("Towards complete assemblies of all vertebrate species."),
       "Towards complete assemblies of all vertebrate species",
       "esummary's trailing period dropped")
    eq(kbt.clean_title("A ragged\n   title"), "A ragged title", "whitespace collapsed")
    eq(kbt.clean_title("<i>CircSry</i>\n          regulates spermatogenesis"),
       "CircSry regulates spermatogenesis",
       "a real CSL title: italics tag plus the newline behind it")
    eq(kbt.clean_title(["First", "Second"]), "First", "a CSL list title takes its first element")
    eq(kbt.clean_title("Effects of [Ca2+] on cells | part 1"),
       r"Effects of \[Ca2+\] on cells \| part 1",
       "brackets and pipe escaped — they would end the link, or a table row")
    eq(kbt.clean_title("Just a moment"), None, "junk title refused")
    eq(kbt.clean_title("ok"), None, "too short to be a title")
    eq(kbt.clean_title(None), None, "no title is no title")
    eq(kbt.clean_title(""), None, "empty title is no title")


def test_short_label():
    print("\nshort_label — elide only when it buys enough to be worth the churn")
    eq(kbt.short_label("https://www.nature.com/articles/s41586-021-03451-0"),
       "nature.com/articles/…", "long article URL elided, 'www.' dropped")
    eq(kbt.short_label("https://www.readcube.com/library/"
                       "ff394a98-20f7-4882-871c-840e9f73d65b:ee9663e2-0081-4b33-aa2d-5f925c0f9573"),
       "readcube.com/library/…", "a private library UUID pair is pure noise")
    eq(kbt.short_label("https://omabrowser.org/api/docs"), None,
       "'…' in place of 'docs' loses a word and saves nothing")
    eq(kbt.short_label("https://novonordiskfonden.dk/en/grants/"), None,
       "already readable — left bare")
    eq(kbt.short_label("https://smbe2026.org/virtual-streaming/"), None,
       "one path segment is not worth eliding")
    eq(kbt.short_label("https://example.com"), None, "no path, nothing to elide")
    eq(kbt.short_label("https://scholar.google.com/citations?hl=en&user=OUZ899MAAAAJ"
                       "&view_op=list_works&sortby=pubdate"),
       "scholar.google.com/citations?…",
       "only a query was dropped, so '?…' — '/…' would imply a path that is not there")
    eq(kbt.short_label("https://a.com/one?q=2"), None,
       "a short query is not worth eliding either")


def test_link_for():
    print("\nlink_for — title, else label, else leave it bare")
    eq(kbt.link_for("https://a.com/x/y/z/long-enough", "Real Title"),
       ("[Real Title](https://a.com/x/y/z/long-enough)", "title"), "title wins")
    eq(kbt.link_for("https://www.nature.com/articles/s41586-021-03451-0", None),
       ("[nature.com/articles/…](https://www.nature.com/articles/s41586-021-03451-0)", "label"),
       "no title falls back to the elided label")
    eq(kbt.link_for("https://omabrowser.org/api/docs", None), (None, "bare"),
       "nothing to gain — reported as bare, left in place")
    eq(kbt.link_for("https://www.cell.com/cell/fulltext/S0092-8674(15)00430-4", "Paper"),
       ("[Paper](<https://www.cell.com/cell/fulltext/S0092-8674(15)00430-4>)", "title"),
       "a parenthesised destination is wrapped in <> so it cannot be misparsed")


def test_rewrite():
    print("\nrewrite")
    titles = {"https://doi.org/10.1/2": "A Structured Coalescent Model",
              "https://a.com/x/y/z/deep": "Second Paper"}

    out, changes = kbt.rewrite("- https://doi.org/10.1/2\n", titles)
    eq(out, "- [A Structured Coalescent Model](https://doi.org/10.1/2)\n", "titled in place")
    eq([c[2] for c in changes], ["title"], "one titled change reported")

    again, changes2 = kbt.rewrite(out, titles)
    eq(again, out, "idempotent — the rewrite is a markdown link, so it is skipped next run")
    eq(changes2, [], "and reports nothing to do")

    two = "- https://doi.org/10.1/2 https://a.com/x/y/z/deep\n"
    out2, _ = kbt.rewrite(two, titles)
    eq(out2, "- [A Structured Coalescent Model](https://doi.org/10.1/2) "
             "[Second Paper](https://a.com/x/y/z/deep)\n",
       "two URLs on one line — right-to-left application keeps offsets valid")

    quoted = "> We find that https://doi.org/10.1/2 is the source\n"
    out3, changes3 = kbt.rewrite(quoted, titles)
    eq(out3, quoted, "a quoted line is returned byte-identical")
    eq(changes3, [], "and nothing is reported as changed")

    bare = "- https://omabrowser.org/api/docs\n"
    out4, changes4 = kbt.rewrite(bare, {})
    eq(out4, bare, "unresolvable and not worth eliding — left exactly as it was")
    eq([c[2] for c in changes4], ["bare"], "reported as bare")

    eq(kbt.rewrite("no urls here\n", titles), ("no urls here\n", []), "a body with no URLs")


def test_entry_files():
    print("\nentry_files — generated bodies are not ours to rewrite")
    with tempfile.TemporaryDirectory() as d:
        edir = pathlib.Path(d) / "entries"
        edir.mkdir()
        for eid, meta in [("note1", {"id": "note1", "type": "note"}),
                          ("repo1", {"id": "repo1", "type": "github"}),
                          ("_digest", {"id": "_digest", "type": "_digest"}),
                          ("_priorities", {"id": "_priorities", "type": "note"}),
                          ("nomd", {"id": "nomd", "type": "note"})]:
            (edir / f"{eid}.json").write_text(json.dumps(meta))
            if eid != "nomd":
                (edir / f"{eid}.md").write_text("- https://a.com/x/y\n")
        ids = [e[0] for e in kbt.entry_files(d)]
        eq(ids, ["_priorities", "note1"], "github and _digest skipped, a .md-less entry skipped")
        eq([e[0] for e in kbt.entry_files(d, only="note1")], ["note1"], "--entry narrows to one")


def test_run_offline():
    print("\nrun --offline --dry-run — no network, no writes")
    with tempfile.TemporaryDirectory() as d:
        edir = pathlib.Path(d) / "entries"
        edir.mkdir()
        (edir / "a.json").write_text(json.dumps({"id": "a", "type": "note"}))
        body = ("- https://www.nature.com/articles/s41586-021-03451-0\n"
                "- Already titled: [x](https://a.com/y)\n"
                "> quoted https://b.com/x/y/z\n"
                "- https://c.com/cut-off-\n")
        (edir / "a.md").write_text(body)
        stats = kbt.run(d, dry_run=True, offline=True, cache_dir=pathlib.Path(d) / "cache")
        eq((edir / "a.md").read_text(), body, "--dry-run wrote nothing")
        eq(stats["broken"], [("a", "https://c.com/cut-off-")],
           "a dead URL is named, not just counted — only a human can mend it")
        eq(stats["kinds"].get("label"), 1, "offline still labels what it cannot title")
        eq(stats["skipped"].get("quote"), 1, "the quoted URL was skipped")
        eq(stats["skipped"].get("link"), 1, "the existing link was skipped")

        kbt.run(d, offline=True, cache_dir=pathlib.Path(d) / "cache")
        eq((edir / "a.md").read_text(),
           "- [nature.com/articles/…](https://www.nature.com/articles/s41586-021-03451-0)\n"
           "- Already titled: [x](https://a.com/y)\n"
           "> quoted https://b.com/x/y/z\n"
           "- https://c.com/cut-off-\n",
           "without --dry-run only the eligible URL changed")


if __name__ == "__main__":
    print("kb-titles.py")
    test_trim_url()
    test_candidates_markup()
    test_candidates_prose()
    test_candidates_wrapped()
    test_url_doi()
    test_id_resolvers()
    test_clean_title()
    test_short_label()
    test_link_for()
    test_rewrite()
    test_entry_files()
    test_run_offline()
    print(f"\n{PASS} passed, {FAIL} failed")
    sys.exit(1 if FAIL else 0)
