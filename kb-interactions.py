#!/usr/bin/env python3
"""
kb-interactions.py -- build knowledge-base/interactions.json

The gene sidecar for memento's Genes view. Three stages:

  resolve   card gene tokens -> canonical HGNC symbol + chromosome (MyGene.info)
  ingest    INDRA statements -> thin mechanistic edges
  freeze    write interactions.json, report bridge candidates

Grounding against HGNC is the validation step. It is doing four jobs at once,
which is why there is no blocklist anywhere in this file:

    RNF12                     -> RLIM      (alias collapses onto canonical)
    OCT4                      -> POU5F1
    MCAK                      -> KIF2C
    amplicon_chrX_CSAG1/2/3_0 -> unresolved, stays one non-node
    GABBRI / ADHI1C / THEMS   -> unresolved (OCR damage drops itself)
    chr6 / None / rs991760    -> unresolved
    bisphenol A / air pollutants -> no HGNC ref, so never enters as a gene

That last one is not hypothetical. Without the HGNC filter, the one-hop
expansion is a toxicology screen: CTD asserts "chemical changes expression of
gene" across half the genome, so bisphenol A alone bridges 350 of these genes
and 21,592 "genes" come back. With it, 2,701 do.

Cards are read as one of two kinds, which is the whole gene-set model:

    thought card (few genes)  -- the genes are the subject; they become nodes
    set card    (many genes)  -- the card IS a set; its TAGS become attributes
                                 of its genes, and it contributes no nodes

That is the memento-native form of interaction-store's agents.json `groups`,
so there is no gene registry here and no file to keep in sync. A gene's groups
are the tags of the cards it appears on, recomputed every run.

Bootstrapping reads interaction-store's 448MB INDRA cache when present (it is
data already paid for). --fetch tops up from the live API. Both paths converge
on the same thin edge record; the browser will do this online and freeze the
same file, at which point --indra-cache stops mattering.

Usage:
    ./kb-interactions.py                      # cache only, no network beyond MyGene
    ./kb-interactions.py --fetch              # top up missing genes from INDRA
    ./kb-interactions.py --bridges 40         # longer bridge report
"""

import argparse
import json
import math
import pathlib
import sqlite3
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter, defaultdict

HERE = pathlib.Path(__file__).parent
KB = HERE / "knowledge-base"
ENTRIES = KB / "entries"
OUT = KB / "interactions.json"
CACHE = HERE / ".interactions-cache"
INDRA_CACHE = pathlib.Path("/Users/kmt/interaction-store/indra_db_cache.db")

MYGENE = "https://mygene.info/v3/query"
INDRA = "https://db.indra.bio/statements/from_agents"

# Mechanistic statement types. Complex is deliberately absent: it is 88% of all
# edges (2,674 of 3,036) because INDRA expands each multi-member complex to
# every pairwise combination, so one co-IP dump wires a dozen genes together and
# says nothing about mechanism. interaction-store's own DEFAULT_EDGE_PRIORITY
# ranks Complex last for the same reason. Kept out of the default graph, carried
# in the sidecar under a separate key so the view can offer it as a toggle.
MECH = {
    "Activation", "Inhibition", "Phosphorylation", "Dephosphorylation",
    "IncreaseAmount", "DecreaseAmount", "Ubiquitination", "Deubiquitination",
    "Acetylation", "Deacetylation", "Methylation", "Demethylation",
    "Sumoylation", "Desumoylation", "Palmitoylation", "Ribosylation",
    "Hydroxylation", "Glycosylation", "Farnesylation", "Gef", "Gap",
    "Translocation",
}

PRIMARY = {str(i) for i in range(1, 23)} | {"X", "Y", "MT"}

# A card is a SET (annotates its genes) rather than a THOUGHT (names them as
# nodes) if it is either explicitly tagged 'gene-set' -- which the agents.json
# import does -- or simply lists too many genes to be about any one of them.
# The size distribution is strongly bimodal: 1719, 1497, 1412, 983, 759, 513,
# 467, 445, 339, 315, 228, 149, then a gap down to a median of 18, so a 100..149
# threshold splits the same 16 dump cards off. Those 16 hold 79% of the whole
# gene vocabulary; the tag catches the rest.
SET_CARD_MIN_GENES = 100
SET_TAG = "gene-set"


def is_set_card(card):
    return SET_TAG in (card.get("tags") or []) or len(card["toks"]) >= SET_CARD_MIN_GENES


def log(*a):
    print(*a, file=sys.stderr, flush=True)


# ---------------------------------------------------------------------------
# cards
# ---------------------------------------------------------------------------

def load_cards(entries=ENTRIES):
    """Live cards that carry genes, each as (id, tags, gene tokens)."""
    out = []
    for f in sorted(entries.glob("*.json")):
        try:
            e = json.loads(f.read_text())
        except (json.JSONDecodeError, OSError):
            continue
        if e.get("archived") or not e.get("genes"):
            continue
        toks = [str(g).strip() for g in e["genes"] if str(g).strip()]
        if toks:
            out.append({"id": e["id"], "tags": e.get("tags") or [], "toks": toks})
    return out


def split_kinds(cards):
    thought = [c for c in cards if not is_set_card(c)]
    sets_ = [c for c in cards if is_set_card(c)]
    return thought, sets_


def alias_fragments(token):
    """Split a gene token on '/' the way the frontend's geneAliases() does.

    The separator is overloaded -- 'RLIM/RNF12' is two names for one gene,
    'amplicon_chrX_CSAG1/2/3_0' is one name containing slashes -- and the token
    alone cannot tell you which. We do not try: split everything, let HGNC
    decide. Both RLIM and RNF12 ground to HGNC:13429 and collapse to one node;
    'amplicon_chrX_CSAG1', '2' and '3_0' ground to nothing, so that token
    contributes no nodes and survives untouched on its card.
    """
    return [p.strip() for p in str(token).split("/") if p.strip()]


# ---------------------------------------------------------------------------
# resolve
# ---------------------------------------------------------------------------

def _post(url, data, tries=3):
    body = urllib.parse.urlencode(data).encode()
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=body,
                                         headers={"Content-Type": "application/x-www-form-urlencoded"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except Exception as exc:
            if i == tries - 1:
                raise
            log(f"    retry {i+1}/{tries}: {exc.__class__.__name__}")
            time.sleep(2 ** i)


def _primary_chrom(hit):
    gp = hit.get("genomic_pos")
    if not gp:
        return None
    # MAPT returns three: chr17 plus two alt contigs (HSCHR17_*). Keep the
    # primary assembly and ignore the rest.
    for g in (gp if isinstance(gp, list) else [gp]):
        if str(g.get("chr")) in PRIMARY:
            return g
    return None


def resolve(fragments, cache_file=None, batch=900):
    """fragment -> {symbol, hgnc, chrom, start, end}. Unresolvable ones absent.

    Ambiguity is left unresolved rather than guessed: 'U3' returns six
    candidates (SNORD3A, SNORD3F, SNORD3P1, ...) and picking one would invent a
    fact. It stays a non-node and stays visible on its card.
    """
    cache_file = cache_file or (CACHE / "resolve.json")
    cache_file.parent.mkdir(exist_ok=True)
    known = json.loads(cache_file.read_text()) if cache_file.exists() else {}

    todo = sorted({f for f in fragments if f not in known})
    if todo:
        log(f"  resolving {len(todo)} new fragments via MyGene.info ...")
        for i in range(0, len(todo), batch):
            chunk = todo[i:i + batch]
            hits = _post(MYGENE, {
                "q": ",".join(chunk),
                "scopes": "symbol,alias,retired",
                "fields": "symbol,HGNC,genomic_pos",
                "species": "human",
            })
            seen = defaultdict(list)
            for h in hits:
                seen[h.get("query")].append(h)
            for q in chunk:
                hs = [h for h in seen.get(q, []) if not h.get("notfound")]
                # 1:N means ambiguous. Refuse rather than pick.
                uniq = {h.get("HGNC") for h in hs if h.get("HGNC")}
                if len(hs) != 1 or len(uniq) != 1:
                    known[q] = None
                    continue
                h = hs[0]
                gp = _primary_chrom(h) or {}
                known[q] = {
                    "symbol": h.get("symbol"),
                    "hgnc": h.get("HGNC"),
                    "chrom": gp.get("chr"),
                    "start": gp.get("start"),
                    "end": gp.get("end"),
                }
            log(f"    {min(i+batch, len(todo))}/{len(todo)}")
        cache_file.write_text(json.dumps(known))
    return {k: v for k, v in known.items() if v}


# ---------------------------------------------------------------------------
# ingest
# ---------------------------------------------------------------------------

def statement_agents(s, hgnc_only=True):
    """Gene names in a statement, whatever shape it has.

    INDRA statements are not uniformly shaped: regulations carry subj/obj,
    modifications enz/sub, and Complex a members[] list. Requiring an HGNC ref
    is what keeps chemicals (CHEBI/MESH refs, from CTD) out of a gene graph.
    """
    if s.get("members") is not None:
        ags = list(s["members"])
    else:
        ags = [s[k] for k in ("subj", "obj", "enz", "sub") if isinstance(s.get(k), dict)]
    out = []
    for a in ags:
        if not a.get("name"):
            continue
        if hgnc_only and "HGNC" not in (a.get("db_refs") or {}):
            continue
        out.append(a["name"].strip().upper())
    return out


def partition_agents(ags, inside_upper):
    """Split upper-cased HGNC agent names into (inside, outside).

    inside_upper maps UPPER(symbol) -> the canonical-case symbol, so the returned
    inside names come back in their canonical spelling and the match is
    case-insensitive. Without this, a mixed-case gene like C3orf49 never matches
    the upper-cased agent 'C3ORF49', so it silently gets NO edges -- and any edge
    that did slip through would be stored as 'C3ORF49', which isn't a key in the
    canonical-case genes dict. Both bugs vanish once inside names are canonical.
    """
    ins, out = [], []
    for a in ags:
        canonical = inside_upper.get(a)
        if canonical is not None:
            ins.append(canonical)
        else:
            out.append(a)
    return ins, out


def thin(s, a, b):
    """The edge record memento actually needs.

    Evidence arrays are dropped here on purpose: they are ~3KB per statement,
    and keeping them is how interaction-store's cache reached 448MB. One PMID
    is enough to open the paper; the rest is re-fetchable on demand.
    """
    ev = s.get("evidence") or []
    pmid = next((e.get("pmid") for e in ev if e.get("pmid")), None)
    return {
        "a": a, "b": b,
        "t": s.get("type"),
        "belief": round(float(s.get("belief") or 0), 3),
        "n": len(ev),
        "pmid": pmid,
    }


def from_local_cache(symbols, db_path=INDRA_CACHE):
    """Statements for `symbols` out of interaction-store's SQLite cache."""
    if not db_path.exists():
        log(f"  no local INDRA cache at {db_path} -- skipping (use --fetch)")
        return {}
    db = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    keys = [r[0] for r in db.execute("select gene from cache")]
    want = {s.upper() for s in symbols}
    out = {}
    for k in keys:
        base = k.split("::")[0].upper()
        if base not in want:
            continue
        # bare key or the curated tier; skip the noisier tiers
        if "::" in k and not k.endswith("::curated"):
            continue
        row = db.execute("select statements from cache where gene=?", (k,)).fetchone()
        if row:
            out.setdefault(base, []).extend(json.loads(row[0]))
    db.close()
    log(f"  local cache supplied {len(out)}/{len(want)} genes")
    return out


def fetch_indra(symbol, ev_limit=1, limit=500):
    q = urllib.parse.urlencode({
        "agent0": symbol, "format": "json",
        "limit": limit, "ev_limit": ev_limit,
    })
    with urllib.request.urlopen(f"{INDRA}?{q}", timeout=90) as r:
        d = json.loads(r.read())
    stmts = d.get("statements") or {}
    return list(stmts.values()), d.get("total_evidence", 0)


def pmid_counts(symbols, batch=900):
    """symbol -> number of GeneRIF PMIDs. Literature popularity, batched.

    INDRA's total_evidence looked like the cheap way to measure how famous a
    gene is, but a limit=1 query still costs 5.7-6.8s because the server
    computes the whole result set anyway -- ~25 minutes for 250 candidates, and
    hopeless in a browser. MyGene returns the same signal for 900 genes in one
    sub-second call, over the wildcard-CORS endpoint we already use to ground.

        MARK4 29    STK11 509    SRC 741    CDKN1A 1544    MYC 2307
    """
    out = {}
    syms = sorted(set(symbols))
    for i in range(0, len(syms), batch):
        chunk = syms[i:i + batch]
        try:
            hits = _post(MYGENE, {
                "q": ",".join(chunk), "scopes": "symbol",
                "fields": "symbol,generif", "species": "human",
            })
        except Exception as exc:
            log(f"    pmid_counts batch failed ({exc.__class__.__name__}), scoring without")
            continue
        for h in hits:
            g = h.get("query")
            gr = h.get("generif")
            n = len(gr) if isinstance(gr, list) else (1 if gr else 0)
            out[g] = max(out.get(g, 0), n)
    return out


# ---------------------------------------------------------------------------
# build
# ---------------------------------------------------------------------------

def build(fetch=False, n_bridges=20, min_links=5):
    log("[1/4] reading cards")
    cards = load_cards()
    thought, sets_ = split_kinds(cards)
    log(f"  {len(cards)} live cards with genes -> {len(thought)} thought, {len(sets_)} set")

    frags = {f for c in cards for t in c["toks"] for f in alias_fragments(t)}
    log(f"  {len(frags)} distinct fragments")

    log("[2/4] grounding against HGNC")
    res = resolve(frags)
    log(f"  resolved {len(res)}/{len(frags)} ({100*len(res)//max(len(frags),1)}%)")

    # Two populations, and the distinction is the whole model:
    #
    #   inside  -- named on a thought card. These are NODES.
    #   member  -- only ever listed on a set card. These are NOT nodes; the set
    #              card's tags become their attributes. They stay eligible as
    #              bridges, which is the useful part: a bridge that is already
    #              in your xi_escape set is a far stronger suggestion than a
    #              gene off the street.
    #
    # Without this split every one of the 1719 genes on a single dataset card
    # becomes a node and the layout drowns. 16 set cards hold 79% of the
    # vocabulary.
    inside, member = {}, {}
    for c in cards:
        is_set = is_set_card(c)
        for t in c["toks"]:
            for f in alias_fragments(t):
                r = res.get(f)
                if not r:
                    continue
                sym = r["symbol"]
                bag = member if is_set else inside
                g = bag.setdefault(sym, {
                    "symbol": sym, "hgnc": r["hgnc"], "chrom": r.get("chrom"),
                    "start": r.get("start"), "end": r.get("end"),
                    "cards": set(), "groups": set(),
                })
                if not is_set:
                    g["cards"].add(c["id"])
                g["groups"].update(c["tags"])
    # A gene named on a thought card is a node even if a set card also lists it;
    # fold the set card's tags in and drop it from the member-only population.
    for sym, g in list(member.items()):
        if sym in inside:
            inside[sym]["groups"].update(g["groups"])
            del member[sym]
    log(f"  {len(inside)} gene nodes (named on thought cards)")
    log(f"  {len(member)} set members (annotated only, not nodes)")

    log("[3/4] ingesting INDRA statements")
    stmts = from_local_cache(inside.keys())
    if fetch:
        missing = [s for s in inside if s not in stmts]
        # INDRA's from_agents is slow (~6-30s/gene: it computes the whole result
        # set even at ev_limit=1), so serial fetching of ~1000 genes runs for
        # hours. Fetch a few at a time -- the same 5-way concurrency the browser's
        # "Refresh all" uses -- which brings a full rebuild down to tens of minutes.
        log(f"  fetching {len(missing)} genes live (5 concurrent) ...")
        from concurrent.futures import ThreadPoolExecutor, as_completed
        done = 0
        with ThreadPoolExecutor(max_workers=5) as ex:
            futs = {ex.submit(fetch_indra, sym): sym for sym in missing}
            for fut in as_completed(futs):
                sym = futs[fut]
                done += 1
                try:
                    st, _ = fut.result()
                    if st:
                        stmts[sym] = st
                except Exception as exc:
                    log(f"    {sym}: {exc.__class__.__name__}")
                if done % 25 == 0:
                    log(f"    {done}/{len(missing)}")

    mech, complexes = {}, {}
    outside = defaultdict(set)
    inside_upper = {k.upper(): k for k in inside}   # case-insensitive match, canonical result
    for sym, sts in stmts.items():
        for s in sts:
            ags = statement_agents(s)
            if len(ags) < 2:
                continue
            ins, out = partition_agents(ags, inside_upper)
            for o in set(out):
                for i2 in set(ins):
                    if s.get("type") in MECH:
                        outside[o].add(i2)
            if len(set(ins)) < 2:
                continue
            is_mech = s.get("type") in MECH
            # A mechanistic statement is DIRECTED: statement_agents returns agents
            # source-first (subj->obj for regulations, enz->sub for modifications),
            # and such a statement has exactly two agents. The source is ins[0].
            # Complex membership is undirected, so it carries no direction. We keep
            # a/b alphabetical (undirected key, so A-B and B-A still dedup together)
            # and record which way the arrow points in `dir`: "ab" = a->b, "ba" = b->a.
            src = ins[0] if (is_mech and len(set(ins)) == 2) else None
            pairs = sorted(set(ins))
            for x in range(len(pairs)):
                for y in range(x + 1, len(pairs)):
                    a, b = pairs[x], pairs[y]
                    tgt = mech if is_mech else complexes
                    key = (a, b, s.get("type"))
                    prev = tgt.get(key)
                    e = thin(s, a, b)
                    if src is not None:
                        e["dir"] = "ab" if src == a else "ba"
                    if not prev or e["n"] > prev["n"]:
                        tgt[key] = e

    log(f"  {len(mech)} mechanistic edges, {len(complexes)} complex edges")
    log(f"  {len(outside)} outside genes touch >=1 of yours")

    log("[4/4] ranking bridges")
    cand = {o: v for o, v in outside.items() if len(v) >= min_links}
    log(f"  {len(cand)} link >={min_links} of yours")
    rif = pmid_counts(cand.keys())

    # PROVISIONAL METRIC. Nobody has validated this; treat the order as a
    # suggestion and the `links` column as the real output. What was measured:
    #
    #   raw n            popularity contest -- CDKN1A, SRC, MYC, SP1 bridge
    #                    everything in any gene set and are leads about nothing
    #   n/log(PMIDs)     does NOT fix it: STK11 #15 -> #12, SRC stays #1
    #   n/PMIDs          does NOT fix it: STK11 -> #10, SRC -> #7
    #   n/span           degenerate on the full set: TNK1 (3 links, all on one
    #                    card) outranks everything. Concentration alone rewards
    #                    bridges whose links you had already grouped, which is
    #                    the opposite of a discovery.
    #   n^2/span         collapses back onto raw n
    #
    # So: require enough links to be a real bridge (min_links), THEN rank by
    # concentration, on the theory that a hub sprays across 20-29 cards while a
    # lead piles into a few. That puts STK11 (LKB1, upstream kinase of the MARK
    # family, which phosphorylates tau -- and MARK1/2/4 + MAPT are on the
    # cards) at #1 and drops MYC to #21.
    #
    # It is still not a clean separator: SRC lands #3 and stays there under
    # every variant tried. The honest position is that "interesting bridge" is
    # a domain judgement this file cannot make.
    scored = []
    for o, v in cand.items():
        cards = set()
        for l in v:
            cards.update(inside[l]["cards"])
        span = len(cards) or 1
        scored.append({
            "gene": o, "links": sorted(v), "n": len(v),
            "pmids": rif.get(o, 0), "span": span,
            "score": round(len(v) / span, 3),
            # A bridge already sitting in one of your gene sets is a stronger
            # suggestion than one off the street -- surface that.
            "groups": sorted(member[o]["groups"]) if o in member else [],
        })
    scored.sort(key=lambda x: (-x["score"], -x["n"]))

    sidecar = {
        "generated": time.strftime("%Y-%m-%d"),
        "source": "INDRA db.indra.bio + MyGene.info",
        "genes": {
            g["symbol"]: {
                "hgnc": g["hgnc"], "chrom": g.get("chrom"),
                "start": g.get("start"), "end": g.get("end"),
                "cards": sorted(g["cards"]), "groups": sorted(g["groups"]),
            } for g in inside.values()
        },
        # Set-card genes: no node, but the view can still say "already in your
        # xi_escape set" when one turns up as a bridge.
        "members": {g["symbol"]: sorted(g["groups"]) for g in member.values()},
        "canon": {f: r["symbol"] for f, r in res.items() if f != r["symbol"]},
        "edges": sorted(mech.values(), key=lambda e: (e["a"], e["b"])),
        "complex_edges": sorted(complexes.values(), key=lambda e: (e["a"], e["b"])),
        "bridges": scored[:n_bridges * 5],
    }
    OUT.write_text(json.dumps(sidecar, indent=1))
    kb = OUT.stat().st_size / 1024
    log(f"\nwrote {OUT} ({kb:.0f} KB)")

    print(f"\n{'='*78}")
    print(f"BRIDGES -- genes you have NOT written about, linking >={min_links} that you have")
    print(f"  ranked by concentration; see the note in build(). ORDER IS PROVISIONAL.")
    print(f"{'='*78}")
    print(f"  {'gene':<9} {'links':>5} {'cards':>5} {'PMIDs':>6} {'conc':>5}  linked genes")
    for b in scored[:n_bridges]:
        tag = f"  [{', '.join(b['groups'][:2])}]" if b["groups"] else ""
        print(f"  {b['gene']:<9} {b['n']:>5} {b['span']:>5} {b['pmids']:>6} {b['score']:>5.2f}  "
              f"{', '.join(b['links'][:5])}{tag}")
    return sidecar


def main():
    global INDRA_CACHE
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--fetch", action="store_true",
                   help="top up missing genes from the live INDRA API and score bridges")
    p.add_argument("--bridges", type=int, default=20, help="rows in the bridge report")
    p.add_argument("--min-links", type=int, default=5,
                   help="a bridge must link at least this many of your genes (default 5)")
    p.add_argument("--indra-cache", type=pathlib.Path, default=INDRA_CACHE)
    a = p.parse_args()
    INDRA_CACHE = a.indra_cache
    build(fetch=a.fetch, n_bridges=a.bridges, min_links=a.min_links)


if __name__ == "__main__":
    main()
