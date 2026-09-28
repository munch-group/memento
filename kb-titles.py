#!/usr/bin/env python3
"""
kb-titles.py -- turn bare URLs in card bodies into titled markdown links.

marked already autolinks a bare URL, so the links work today; what they lack is
readable text. This rewrites

    - https://www.nature.com/articles/s41586-021-03451-0

into

    - [Towards complete and error-free genome assemblies of all vertebrate species](https://www.nature.com/articles/s41586-021-03451-0)

in knowledge-base/entries/*.md, so the title is in the source of truth and every
consumer sees it -- the app, the MCP server, the digest, git diffs -- with no
per-render network call and nothing to keep in sync.

TITLES COME FROM METADATA APIS, NOT FROM <title>. Scraping HTML would fail on
exactly the domains this knowledge base is made of: sciencedirect.com answers
403, nature.com 303s away from the article, and readcube.com library links are
auth-gated SPAs with no public title at all. Four resolvers, keyed on URL shape:

    doi     a DOI anywhere in the path/query, or synthesized for the
            nature.com/articles/<id> and elifesciences.org/articles/<n> forms
            -> doi.org content negotiation (CSL JSON)
    pubmed  pubmed.ncbi.nlm.nih.gov/<pmid>          -> NCBI esummary
    pmc     .../pmc/articles/PMC<n>                 -> NCBI esummary
    github  github.com/<owner>/<repo>               -> api.github.com

No generic scraping proxy (r.jina.ai, microlink): it would hand every grant and
collaboration URL in here to a third party. The cost of that choice is that
sciencedirect PIIs, oup article numbers and funder pages stay untitled -- those
fall back to an elided label (nature.com/articles/…), and URLs already short
enough to read are left bare rather than churned.

WHAT IT REFUSES TO TOUCH, and why each one matters:

    a URL with prose in front of it on the same line (--prose-chars)
        105 of the 189 bare URLs here sit in numbered citation lists and quoted
        abstracts that already name the paper. Titling those duplicates text
        that is already there, inside quotes nobody wrote to be edited.
    blockquote lines, fenced code, inline code
        quoted and literal text is not ours to rewrite.
    anything already a link -- [t](url), <url>, [1]: url, href="url"
        including links whose text and destination straddle a newline.
    a scheme-less www.example.com
        marked autolinks it; [label](www.example.com) would be a RELATIVE link.
    a URL ending in '-' or a cut-off percent escape
        a wrapped line, so the link is already dead; a label would hide that.
    a URL containing [ ] or *
        marked percent-encodes brackets and keeps them; and a '*' inside a URL
        span is markdown emphasis being used as annotation -- this corpus
        documents URL templates as
        readcube.com/library/**<uuid>**:*<uuid>* and a readcube-rewriting regex
        as .../library/(.*?):(.*?). Wrapping either in [](…) moves the emphasis
        markers and changes what renders. Changing a href or a rendering
        silently is the one unacceptable outcome.
    type 'github' and '_digest' entries
        both are regenerated -- github bodies from repo.description on every
        refresh (and rendered with esc(), never as markdown), _digest by
        kb-digest.py. A rewrite there is erased, or invisible, or both.

Usage:
    ./kb-titles.py --dry-run          # report every rewrite, touch nothing
    ./kb-titles.py                    # resolve and rewrite in place
    ./kb-titles.py --offline          # cache only, no network
    ./kb-titles.py --entry a1b2c3     # one entry
"""

import argparse
import bisect
import html
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter

HERE = pathlib.Path(__file__).parent
KB = HERE / "knowledge-base"
CACHE = HERE / ".titles-cache"

UA = "memento-kb-titles/1.0"
CSL = "application/vnd.citationstyles.csl+json"
ESUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"

# Entry types whose bodies are generated rather than written (see module docstring).
SKIP_TYPES = {"github", "_digest"}

# Prose before a URL on its line means the line already says what the link is.
PROSE_CHARS = 25

# An elided label must buy at least this many characters to be worth rewriting
# for; below it, '…' just trades a readable word for a shorter mystery.
MIN_ELISION = 8

# GFM strips these from the end of an autolink, so we must too -- otherwise the
# explicit href we write would differ from the one marked produces today.
TRAIL = ".,;:!?'\"*_~"

# Titles a metadata API should never return, but cheap to refuse if it does.
JUNK = {"just a moment", "redirecting", "access denied", "page not found",
        "error", "not found", "untitled"}

# ( ) [ ] are IN the charset on purpose: marked's autolinker takes them, so this
# must see the same span it does. Brackets are rejected later, parens balanced.
BARE = re.compile(r"https?://[^\s<>\"'`\x00]+")


def log(*a):
    print(*a, file=sys.stderr, flush=True)


# ---------------------------------------------------------------------------
# finding the URLs that are ours to rewrite
# ---------------------------------------------------------------------------

def trim_url(url):
    """The URL as marked's autolinker ends it: trailing punctuation off,
    unbalanced closing parens off, to a fixed point.

    Verified against marked 15.0.12 for '…/path.', '(…/10.1/2)', '…, then',
    'S0092-8674(15)00430-4', 'Foo_(bar)' and each char in TRAIL.
    """
    while url:
        if url[-1] in TRAIL:
            url = url[:-1]
            continue
        if url.endswith(")") and url.count(")") > url.count("("):
            url = url[:-1]
            continue
        break
    return url


def _blocked_map(text):
    """One reason code per character, naming the markup that owns that span.

    Matching happens on the raw text and a candidate is classified by the reason
    sitting under its first character -- so a URL inside a code span or a
    markdown link is reported as skipped rather than silently not found.
    """
    reason = [None] * len(text)

    def mark(a, b, why):
        for i in range(a, min(b, len(text))):
            if reason[i] is None:       # outermost markup wins
                reason[i] = why

    # Line-based first: fences and blockquotes enclose everything else.
    pos = 0
    in_fence = False
    for line in text.splitlines(keepends=True):
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_fence = not in_fence
            mark(pos, pos + len(line), "fence")
        elif in_fence:
            mark(pos, pos + len(line), "fence")
        elif stripped.startswith(">"):
            mark(pos, pos + len(line), "quote")
        pos += len(line)

    # [text](url) and ![alt](url). The classes match newlines, so a link whose
    # text and destination straddle one is covered -- that shape is in this
    # corpus ('…)[PubMed\n](https://…)') and is exactly what a per-line masker
    # mistakes for a bare URL.
    for m in re.finditer(r"!?\[[^\]]*\]\(\s*[^)]*\)", text):
        mark(*m.span(), "link")
    for m in re.finditer(r"^[ \t]*\[[^\]]+\]:[ \t]*\S+", text, re.M):
        mark(*m.span(), "link")
    for m in re.finditer(r"<[^>\s]+>", text):
        mark(*m.span(), "link")
    for m in re.finditer(r"`[^`]*`", text):
        mark(*m.span(), "code")
    for m in re.finditer(r"""\w+\s*=\s*("[^"]*"|'[^']*')""", text):
        mark(*m.span(), "html")

    return reason


_LIST_MARK = re.compile(r"^[\s>]*(?:[-*+]|\d+[.)])?\s*")
_IS_ITEM = re.compile(r"^(?:[-*+]|\d+[.)])\s+\S")
_ENDS_CLEAN = re.compile(r"""[.:!?)\]"'»;]$""")


def _is_wrapped(lines, idx):
    """True when line `idx` continues an unterminated list line above it.

    Some entries here are dumps of pasted browser titles, hard-wrapped across
    consecutive '- ' lines with the URL at the end of the last fragment:

        - There is a lot of rare variation on AFF2, associated with ASD: Excess variants in
        - AFF2 detected by massively parallel sequencing of males with autism
        - spectrum disorder - PMC https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3441129/

    The URL's own line carries only 'spectrum disorder - PMC', so the per-line
    prose rule sees nothing to object to and would append a second copy of the
    whole title. An unterminated list line above means the title is already up
    there. A list line that ends cleanly, or that ends with its own link, is a
    sibling rather than the head of a wrap.

    This does refuse some genuine 'note, then link' lists. That asymmetry is
    deliberate: a missed title leaves a URL exactly as readable as it is today,
    while a wrong one edits the note itself.
    """
    if idx == 0:
        return False
    prev = lines[idx - 1].strip()
    if not prev or not _IS_ITEM.match(prev):
        return False
    if "http://" in prev or "https://" in prev:
        return False
    return not _ENDS_CLEAN.search(prev)

# A URL cannot legitimately end in '-' or a cut-off percent escape; when one
# does, the line was wrapped and the link is already broken. Leaving it bare
# keeps the breakage visible -- a label would make a dead link look healthy --
# and the skip count is the report that says how many to mend by hand.
_TRUNCATED = re.compile(r"(?:-|%[0-9A-Fa-f]{0,2})$")


def candidates(text):
    """(start, url, reason) for every bare-looking URL; reason None = rewrite it."""
    reason = _blocked_map(text)
    lines = text.splitlines()
    starts = [0]
    for line in text.splitlines(keepends=True):
        starts.append(starts[-1] + len(line))

    out = []
    for m in BARE.finditer(text):
        url = trim_url(m.group())
        if not url:
            continue
        why = reason[m.start()]
        if why is None and ("[" in url or "]" in url):
            why = "bracket"
        if why is None and "*" in url:
            why = "emphasis"
        if why is None and _TRUNCATED.search(url):
            why = "truncated"
        if why is None:
            # Prose in front of it means the line already names the link -- on
            # this line, or on the one it wrapped from.
            idx = bisect.bisect_right(starts, m.start()) - 1
            prefix = _LIST_MARK.sub("", text[starts[idx]:m.start()], count=1)
            if len(prefix.strip()) > PROSE_CHARS:
                why = "prose"
            elif _is_wrapped(lines, idx):
                why = "wrapped"
        out.append((m.start(), url, why))
    return out


# ---------------------------------------------------------------------------
# link text
# ---------------------------------------------------------------------------

_TAGS = re.compile(r"<[^>]+>")


def clean_title(raw):
    """A metadata title as markdown link text, or None if it is not usable.

    CSL delivers JATS markup and entities (<jats:italic>Drosophila</jats:italic>,
    &amp;) and esummary a trailing period; [ ] | are escaped because they would
    otherwise end the link -- or, for |, a table row. kb_io's table padding
    already treats \\| as an escaped pipe, so that stays consistent.
    """
    if isinstance(raw, list):
        raw = raw[0] if raw else None
    if not isinstance(raw, str):
        return None
    t = html.unescape(_TAGS.sub("", raw))
    t = " ".join(t.split()).rstrip(".")
    if len(t) < 3 or t.lower() in JUNK:
        return None
    return t.replace("\\", "\\\\").replace("[", r"\[").replace("]", r"\]").replace("|", r"\|")


def short_label(url):
    """'nature.com/articles/…' -- or None when eliding buys too little.

    The fallback for a URL no resolver can title. It is a stand-in for an
    unknown title, not a summary of the URL: uniform, and never claiming more
    than it knows. '?…' rather than '/…' when only a query string was dropped,
    because '/…' would imply path depth the URL does not have. None when the URL
    is already about as short as the label would be -- '…/api/…' in place of
    '…/api/docs' is churn that costs you the word 'docs'.
    """
    p = urllib.parse.urlsplit(url)
    host = p.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    segs = [s for s in p.path.split("/") if s]
    plain = (host + p.path + (("?" + p.query) if p.query else "")
             + (("#" + p.fragment) if p.fragment else "")).rstrip("/")
    if not segs:
        return None
    if len(segs) > 1:
        label = f"{host}/{segs[0]}/…"
    elif p.query or p.fragment:
        label = f"{host}/{segs[0]}?…"
    else:
        return None                     # one segment, nothing else: already short
    return label if len(label) + MIN_ELISION <= len(plain) else None


def link_for(url, title):
    """(markdown, kind) -- kind is 'title', 'label', or 'bare' for leave-alone."""
    text = clean_title(title) if title else None
    kind = "title"
    if not text:
        text = short_label(url)
        kind = "label"
    if not text:
        return None, "bare"
    # A destination with parens is legal but fragile; <> makes it unambiguous.
    dest = f"<{url}>" if ("(" in url or ")" in url) else url
    return f"[{text}]({dest})", kind


# ---------------------------------------------------------------------------
# resolvers
# ---------------------------------------------------------------------------

def _get(url, accept=None, tries=3):
    headers = {"User-Agent": UA}
    if accept:
        headers["Accept"] = accept
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code in (404, 403, 401):
                return None                      # a real answer: no such record
            if i == tries - 1:
                return None
            time.sleep(2 ** i)
        except Exception:
            if i == tries - 1:
                return None
            time.sleep(2 ** i)
    return None


_DOI_IN = re.compile(r"(10\.\d{4,9}/[^\s?#&]+)")


def url_doi(url):
    """The DOI this URL denotes, or None.

    Most publishers put it in the path or query, which covers cell, plos,
    springer, wiley, biomedcentral, mdpi and oup's /doi/ form in one rule.
    nature and eLife are worth synthesizing because their article ids ARE the
    DOI suffix, and between them they are 40+ URLs here.
    """
    p = urllib.parse.urlsplit(url)
    host = p.netloc.lower()
    if host.startswith("www."):
        host = host[4:]

    m = _DOI_IN.search(urllib.parse.unquote(p.path)) or _DOI_IN.search(urllib.parse.unquote(p.query))
    if m:
        doi = m.group(1).rstrip("/.,;")
        # bioRxiv/medRxiv hang the page variant off the DOI: 586479v1.full.pdf
        if doi.startswith("10.1101/"):
            doi = re.sub(r"v\d+(?=\.|$)", "", doi)
        # Page variants ride along as suffixes, dot-joined (bioRxiv's
        # '…586479v1.full.pdf') or as a path segment (Frontiers' '…672781/full').
        # Repeated on purpose: '.full.pdf' is two suffixes, not one.
        doi = re.sub(r"(?:/(?:full|full-text|abstract|meta|pdf))+$", "", doi)
        return re.sub(r"(?:\.(?:full|full-text|abstract|supplementary-material|pdf))+$", "", doi) or None

    path = p.path.rstrip("/")
    if host.endswith("nature.com"):
        m = re.fullmatch(r"/articles/([A-Za-z0-9._-]+)", path)
        if m:
            return "10.1038/" + m.group(1)
    if host.endswith("elifesciences.org"):
        m = re.fullmatch(r"/articles/(\d+)", path)
        if m:
            return "10.7554/eLife." + m.group(1)
    return None


def pubmed_id(url):
    p = urllib.parse.urlsplit(url)
    if not p.netloc.lower().endswith("pubmed.ncbi.nlm.nih.gov"):
        return None
    m = re.fullmatch(r"/(\d{4,9})", p.path.rstrip("/"))
    return m.group(1) if m else None


def pmc_id(url):
    p = urllib.parse.urlsplit(url)
    if "ncbi.nlm.nih.gov" not in p.netloc.lower():
        return None
    m = re.search(r"/(?:pmc/)?articles/PMC(\d+)", p.path)
    return m.group(1) if m else None


_GH_RESERVED = {"orgs", "settings", "features", "about", "topics", "search",
                "sponsors", "marketplace", "collections", "login", "explore",
                "notifications", "pulls", "issues", "apps", "enterprise"}


def github_repo(url):
    p = urllib.parse.urlsplit(url)
    if not p.netloc.lower().endswith("github.com"):
        return None
    segs = [s for s in p.path.split("/") if s]
    if len(segs) < 2 or segs[0].lower() in _GH_RESERVED:
        return None
    return f"{segs[0]}/{segs[1].removesuffix('.git')}"


def resolve(url):
    """(title, via). title None when nothing could title it."""
    doi = url_doi(url)
    if doi:
        d = _get("https://doi.org/" + urllib.parse.quote(doi, safe="/:."), CSL)
        if isinstance(d, dict) and d.get("title"):
            return d["title"], "doi"
        return None, "doi"

    pmid = pubmed_id(url)
    if pmid:
        d = _get(f"{ESUMMARY}?db=pubmed&id={pmid}&retmode=json")
        return _esummary_title(d), "pubmed"

    pmc = pmc_id(url)
    if pmc:
        d = _get(f"{ESUMMARY}?db=pmc&id={pmc}&retmode=json")
        return _esummary_title(d), "pmc"

    repo = github_repo(url)
    if repo:
        d = _get(f"https://api.github.com/repos/{repo}")
        if isinstance(d, dict) and d.get("full_name"):
            desc = (d.get("description") or "").strip()
            return (f"{d['full_name']} — {desc}" if desc else d["full_name"]), "github"
        return None, "github"

    return None, "none"


def _esummary_title(d):
    if not isinstance(d, dict):
        return None
    res = d.get("result") or {}
    for k, v in res.items():
        if k != "uids" and isinstance(v, dict) and v.get("title"):
            return v["title"]
    return None


# ---------------------------------------------------------------------------
# rewrite
# ---------------------------------------------------------------------------

def rewrite(text, titles):
    """(new_text, changes). `titles` maps url -> title or None.

    Applied right to left so earlier offsets stay valid. Idempotent: what this
    writes is a markdown link, which candidates() then classifies as 'link'.
    """
    changes = []
    edits = []
    for start, url, why in candidates(text):
        if why is not None:
            continue
        link, kind = link_for(url, titles.get(url))
        if kind == "bare":
            changes.append((url, None, "bare"))
            continue
        edits.append((start, len(url), link))
        changes.append((url, link, kind))

    for start, length, link in reversed(edits):
        text = text[:start] + link + text[start + length:]
    return text, changes


def entry_files(kb_dir, only=None):
    """Eligible (id, json_path, md_path), skipping generated bodies."""
    edir = pathlib.Path(kb_dir) / "entries"
    out = []
    for jf in sorted(edir.glob("*.json")):
        eid = jf.stem
        if only and eid != only:
            continue
        mf = jf.with_suffix(".md")
        if not mf.exists():
            continue
        try:
            meta = json.loads(jf.read_text(encoding="utf-8"))
        except Exception:
            continue
        if meta.get("type") in SKIP_TYPES:
            continue
        out.append((eid, jf, mf))
    return out


def load_cache(path):
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def run(kb_dir, dry_run=False, offline=False, refresh=False, only=None,
        limit=None, prose_chars=PROSE_CHARS, sleep=0.2, cache_dir=CACHE):
    global PROSE_CHARS
    PROSE_CHARS = prose_chars

    files = entry_files(kb_dir, only)
    log(f"kb-titles: {len(files)} eligible entries in {kb_dir}/entries")

    # Pass 1: what is there, and which URLs need a title.
    bodies, wanted, skipped, broken = {}, [], Counter(), []
    for eid, _jf, mf in files:
        text = mf.read_text(encoding="utf-8")
        bodies[eid] = text
        for _start, url, why in candidates(text):
            if why:
                skipped[why] += 1
                if why == "truncated":
                    broken.append((eid, url))
            elif url not in wanted:
                wanted.append(url)
    total = sum(skipped.values()) + len(wanted)
    detail = " · ".join(f"{n} {k}" for k, n in skipped.most_common())
    log(f"  {total} bare URLs · {len(wanted)} to title · skipped: {detail or 'none'}")

    # Pass 2: resolve, cached. Negative results are cached too, so a URL nothing
    # can title is not re-asked every run; --refresh is the way back.
    cache_file = pathlib.Path(cache_dir) / "titles.json"
    cache = {} if refresh else load_cache(cache_file)
    todo = [u for u in wanted if u not in cache]
    if limit:
        todo = todo[:limit]
    if todo and not offline:
        log(f"  resolving {len(todo)} URLs ({len(wanted) - len(todo)} cached) ...")
        for i, url in enumerate(todo, 1):
            title, via = resolve(url)
            cache[url] = {"title": title, "via": via,
                          "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
            log(f"    {i}/{len(todo)} {via:6} {'✓ ' + str(title)[:70] if title else '– ' + url[:70]}")
            if via != "none":
                time.sleep(sleep)
        cache_file.parent.mkdir(parents=True, exist_ok=True)
        cache_file.write_text(json.dumps(cache, indent=1, ensure_ascii=False), encoding="utf-8")
    elif todo:
        log(f"  offline: {len(todo)} URLs unresolved, falling back to labels")

    titles = {u: (cache.get(u) or {}).get("title") for u in wanted}

    # Pass 3: rewrite.
    kinds, touched = Counter(), 0
    for eid, _jf, mf in files:
        new, changes = rewrite(bodies[eid], titles)
        for _url, link, kind in changes:
            kinds[kind] += 1
        if new == bodies[eid]:
            continue
        touched += 1
        log(f"  {eid}")
        for url, link, kind in changes:
            if link:
                log(f"    {kind:5} {url}\n          → {link}")
        if not dry_run:
            # Written directly rather than through kb_io.save_entry, whose
            # markdown normalisation would put unrelated changes in the diff.
            mf.write_text(new, encoding="utf-8")

    verb = "would rewrite" if dry_run else "rewrote"
    log(f"\n  {verb} {kinds['title'] + kinds['label']} URLs in {touched} entries "
        f"({kinds['title']} titled, {kinds['label']} labelled) · {kinds['bare']} left bare")
    if dry_run:
        log("  --dry-run: nothing written")
    # Named, not just counted: these are dead links, and only you can mend them.
    if broken:
        log(f"\n  {len(broken)} URLs are cut off mid-address (a wrapped line) and already dead:")
        for eid, url in broken:
            log(f"    {eid}  {url}")
    return {"skipped": dict(skipped), "kinds": dict(kinds), "entries": touched,
            "broken": broken}


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("kb_dir", nargs="?", default=str(KB))
    p.add_argument("--dry-run", action="store_true", help="report every rewrite, write nothing")
    p.add_argument("--offline", action="store_true", help="use the cache only, no network")
    p.add_argument("--refresh", action="store_true", help="ignore cached titles and re-resolve")
    p.add_argument("--entry", help="restrict to one entry id")
    p.add_argument("--limit", type=int, help="cap how many URLs are resolved this run")
    p.add_argument("--prose-chars", type=int, default=PROSE_CHARS,
                   help=f"skip a URL with more than this much prose before it (default {PROSE_CHARS})")
    p.add_argument("--sleep", type=float, default=0.2, help="seconds between API calls")
    p.add_argument("--cache-dir", default=str(CACHE))
    a = p.parse_args()
    run(a.kb_dir, dry_run=a.dry_run, offline=a.offline, refresh=a.refresh,
        only=a.entry, limit=a.limit, prose_chars=a.prose_chars, sleep=a.sleep,
        cache_dir=a.cache_dir)


if __name__ == "__main__":
    main()
