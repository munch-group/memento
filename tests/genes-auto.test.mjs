// The Genes view on a v2 sidecar (one carrying a `resolve` table): the card half of the map is
// derived LIVE from the cards, and the network half tops itself up and saves itself. Load-bearing:
//
//   * geDerive() is kb-interactions.py's derive() in JS: thought-card genes are nodes, set-card genes
//     are annotations, aliases collapse via resolve, ambiguity (null) is never a gene. In the view a
//     card is a set when it lists more genes than the "sets >" slider — tag or not; the written
//     file keeps the builder's rule (gene-set tag, or 100+ genes).
//   * A card edit takes effect at the next render — no rebuild of interactions.json needed. The bug
//     that motivated this: a card retagged gene-set after the last build still drove the canvas.
//   * Gene-set cards in scope keep their genes visible, and appear in the card panel.
//   * Names never looked up go to MyGene; your genes never fetched go to INDRA; both are written back
//     to interactions.json — and loading a file and changing nothing never rewrites it.
//   * A legacy sidecar (no `resolve`) is left exactly as before.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✓ ${msg}`); } else { fail++; console.log(`  ✗ ${msg}`); } };
const card = (id, genes, extra = {}) =>
  ({ id, type: 'note', title: id, genes, tags: [], content: 'x', date: '2026-07-14T00:00:00Z', ...extra });
const gene = (symbol, chrom = '1', hgnc = '1') => ({ symbol, hgnc, chrom, start: 1, end: 2 });

// RLIM and RNF12 are two names for one gene; U3 is ambiguous (looked up, refused); NOVEL was never
// looked up. XIST is only ever on the set card.
function sidecarV2() {
  return {
    generated: '2026-10-03', source: 'test',
    resolve: { MAPT: gene('MAPT', '17', '6893'), MARK1: gene('MARK1', 'X', '6896'), RLIM: gene('RLIM', 'X', '13429'),
               RNF12: gene('RLIM', 'X', '13429'), STK11: gene('STK11', '19', '11389'), XIST: gene('XIST', 'X', '4955'), U3: null,
               J1: null, J2: null, J3: null, J4: null, J5: null },
    indra: { MAPT: '2026-10-01', MARK1: '2026-10-01', STK11: '2026-10-01', RLIM: '2026-10-01' },
    genes: {}, members: {}, canon: {},
    edges: [
      { a: 'MAPT', b: 'MARK1', t: 'Phosphorylation', belief: 0.9, n: 3, pmid: '1', dir: 'ba' },
      { a: 'MARK1', b: 'STK11', t: 'Phosphorylation', belief: 0.9, n: 4, pmid: '2', dir: 'ba' },
      { a: 'RLIM', b: 'XIST', t: 'Activation', belief: 0.8, n: 2, pmid: '3', dir: 'ab' },
    ],
    complex_edges: [], bridges: [],
  };
}
function cards() {
  return [
    card('c1', ['MAPT', 'MARK1'], { tags: ['Drive'] }),
    card('c2', ['STK11', 'RNF12/RLIM', 'U3', 'NOVEL']),
    card('s1', ['MAPT', 'XIST', 'J1', 'J2', 'J3', 'J4', 'J5'], { tags: ['gene-set', 'xi_escape'] }),   // 7 genes
    card('z1', ['MARK1'], { archived: true }),
  ];
}
function setup(fetchImpl) {
  const calls = [];
  const { api, sandbox } = load({ fetchImpl: async (url, opts) => { calls.push({ url: String(url), opts }); return fetchImpl ? fetchImpl(url, opts) : { ok: false, status: 500 }; } });
  api.items = cards();
  api.interactions = sidecarV2();
  api.setGeSetMax(5);   // s1 (7 genes) is a set; c1 (2) and c2 (4) are not
  api.setGeCardPanel(false);
  const off = sym => /ge-off/.test(sandbox.document.getElementById('ge-n-' + sym).className);
  return { api, sandbox, calls, off };
}

console.log('\ngeDerive — the file model (builder parity) and the view (sets fully excluded)');
{
  const { api } = setup();
  ok(api.geIsLive(), 'a sidecar with a resolve table is live');
  const F = api.geDerive(api.geIsSetCard);   // what geBuildSidecar writes, = kb-interactions.py derive()
  eq(Object.keys(F.genes).sort(), ['MAPT', 'MARK1', 'RLIM', 'STK11'], 'file: thought-card genes are the genes; RNF12/RLIM collapse to RLIM');
  eq(F.genes.MAPT.cards, ['c1'], 'file: a set card never counts as documenting a gene');
  eq(F.genes.MAPT.groups, ['Drive', 'gene-set', 'xi_escape'], "file: a gene also on a set card carries the set's tags");
  eq(F.members, { XIST: ['gene-set', 'xi_escape'] }, 'file: a gene only on a set card is a member');
  eq(F.genes.MARK1.cards, ['c1'], 'an archived card documents nothing');
  eq(F.canon, { RNF12: 'RLIM' }, 'canon maps an alias to its symbol');
  eq([...F.pending], ['NOVEL'], 'only a never-looked-up name is pending; the ambiguous U3 (null) is not');
  const V = api.geRefreshDerived();          // the Genes view: s1 (7 genes > 5) is excluded outright
  eq(Object.keys(V.genes).sort(), ['MAPT', 'MARK1', 'RLIM', 'STK11'], 'view: same genes');
  eq(V.genes.MAPT.groups, ['Drive'], "view: an excluded set card adds no tags to MAPT");
  eq(V.members, {}, 'view: an excluded card has no members either');
  api.interactions.resolve.Mapt = undefined; delete api.interactions.resolve.Mapt;
  api.items = [card('c1', ['Mapt'])];
  eq(Object.keys(api.geDerive(api.geIsSetCard).genes), ['MAPT'], 'lookup is case-blind: Mapt reuses the MAPT entry');
}

console.log('\nA card edit takes effect at the next render (the stale-sidecar bug)');
{
  const { api, off } = setup();
  api.mainView = 'genes';
  api.renderGenes();
  ok(!off('MAPT') && !off('MARK1') && !off('STK11'), 'all three wired genes drawn');
  api.items.find(i => i.id === 'c1').genes = ['MAPT', 'MARK1', 'J1', 'J2', 'J3', 'J4'];   // c1 grows to 6 genes: now a set
  api.renderGenes();
  eq(Object.keys(api.geGenes()).sort(), ['RLIM', 'STK11'], 'a card growing past the threshold turns its genes into members at once');
  eq(api.geNodes.map(n => n.sym).sort(), [], 'no node is left wired (MARK1-STK11 needs MARK1 as a node)');
  api.items.find(i => i.id === 'c1').genes = ['MAPT', 'MARK1'];
  api.renderGenes();
  eq(api.geNodes.map(n => n.sym).sort(), ['MAPT', 'MARK1', 'STK11'], 'shrinking it brings them straight back, edges intact');
  api.items.find(i => i.id === 'c1').tags = ['Drive', 'LoF'];
  api.renderGenes();
  eq(api.geNodes.find(n => n.sym === 'MAPT').groups, ['Drive', 'LoF'], 'a tag edit updates groups in place');
}

console.log('\nThe "sets >" slider decides what a gene set is — size, not the tag');
{
  const { api, sandbox } = setup();
  api.mainView = 'genes';
  api.renderGenes();
  ok(!!sandbox.document.getElementById('ge-setmax-val'), 'the slider is in the toolbar on a live sidecar');
  api.setGeSetMax(7, true);
  ok('XIST' in api.geGenes(), 'at 7, the gene-set-tagged s1 (7 genes) is a normal card: XIST is one of your genes');
  eq(api.geNodes.map(n => n.sym).sort(), ['MAPT', 'MARK1', 'RLIM', 'STK11', 'XIST'], '...and RLIM-XIST now draws');
  ok(!('XIST' in api.geBuildSidecar().genes), 'the written file keeps the builder rule (s1 is tagged gene-set) — the slider is view-only');
  api.setGeSetMax(1, true);
  eq(Object.keys(api.geGenes()), [], 'at 1, every multi-gene card is a set');
  api.setGeSetMax(5, true);
  eq(api.geNodes.map(n => n.sym).sort(), ['MAPT', 'MARK1', 'STK11'], 'back at 5: the original map');
  eq(sandbox.localStorage.getItem('ge_setmax'), '5', 'the setting is remembered');
  const L = load({ fetchImpl: async () => ({ ok: false }) });
  L.api.interactions = { genes: { A: { chrom: '1', cards: ['c1'], groups: [] }, B: { chrom: '2', cards: ['c1'], groups: [] } },
                         edges: [{ a: 'A', b: 'B', t: 'Activation', belief: 1, n: 1 }], complex_edges: [] };
  L.api.mainView = 'genes'; L.api.renderGenes();
  const html = L.sandbox.document.getElementById('genes-view').innerHTML;
  ok(/id="ge-n-A"/.test(html) && !/ge-setmax-val/.test(html),
     'a legacy sidecar draws its map without the slider (its node set is the stored snapshot)');
}

console.log('\nA card above the slider is fully excluded — even when it is the whole search');
{
  const { api, sandbox, off } = setup();
  api.mainView = 'genes';
  api.setGeCardPanel(true);
  const search = sandbox.document.getElementById('search-input');
  const shown = () => api.geNodes.filter(n => !off(n.sym)).map(n => n.sym).sort();
  search.value = '#xi_escape';   // matches only s1, the 7-gene card (above 5)
  api.renderGenes();
  eq(shown(), [], 'searching for only the big card shows no genes (MAPT is on it, but it no longer counts)');
  ok(!sandbox.document.getElementById('ge-cards').innerHTML.includes('data-id="s1"'), '...and it is not in the card panel');
  api.setGeSetMax(6, true);
  eq(shown(), [], 'moving the slider below its size changes nothing — the bug was that it did');
  api.setGeSetMax(7, true);
  eq(shown(), ['MAPT', 'XIST'], 'at its size (7) it is a normal card: its genes show (RLIM, wired to XIST but not on it, stays out)');
  ok(sandbox.document.getElementById('ge-cards').innerHTML.includes('data-id="s1"'), '...and it is in the panel');
}

console.log('\nAuto-lookup: never-looked-up names go to MyGene, with the builder\'s refusal rule');
{
  const myGene = async (url, opts) => ({ ok: true, json: async () => {
    const qs = decodeURIComponent(/q=([^&]*)/.exec(opts.body)[1]).split(',');
    return qs.flatMap(q => q === 'NOVEL' ? [{ query: q, symbol: 'NOVEL1', HGNC: '999', genomic_pos: [{ chr: 'HSCHR1_ALT', start: 5 }, { chr: '7', start: 10, end: 20 }] }]
      : q === 'TWO' ? [{ query: q, symbol: 'A', HGNC: '1' }, { query: q, symbol: 'B', HGNC: '2' }]
      : [{ query: q, notfound: true }]);
  } });
  const { api, calls } = setup(myGene);
  api.items.push(card('c3', ['TWO', 'nope']));
  await api.geAutoResolve();
  eq(calls.length, 1, 'one batched MyGene request');
  ok(/scopes=symbol%2Calias%2Cretired/.test(calls[0].opts.body), 'same scopes as kb-interactions.py (symbol, alias, retired)');
  eq(api.interactions.resolve.NOVEL, { symbol: 'NOVEL1', hgnc: '999', chrom: '7', start: 10, end: 20 }, 'a unique hit is stored, primary-assembly position only');
  eq([api.interactions.resolve.TWO, api.interactions.resolve.nope], [null, null], 'ambiguous and not-found are stored as null (refused, never guessed)');
  ok('NOVEL1' in api.geGenes(), 'the new gene is one of yours immediately');
  eq(api.geDerive().pending.size, 0, 'nothing left pending');
}

console.log('\nAuto-INDRA: your genes never fetched get fetched; edges land in the stored pool');
{
  const indra = async (url) => {
    const sym = decodeURIComponent(/agent0=([^&]*)/.exec(String(url))[1]);
    const ag = n => ({ name: n, db_refs: { HGNC: '1' } });
    return { ok: true, json: async () => ({ statements: {
      h1: { type: 'Activation', belief: 0.7, subj: ag('STK11'), obj: ag(sym), evidence: [{ pmid: '9' }] },   // STK11 -> NOVEL1
      h2: { type: 'Activation', belief: 0.9, subj: ag(sym), obj: ag('OUTSIDER'), evidence: [{ pmid: '8' }] },
    }, evidence_counts: { h1: 5, h2: 7 } }) };
  };
  const { api, calls } = setup(indra);
  api.interactions.resolve.NOVEL = gene('NOVEL1', '7', '999');
  await api.geAutoIndra();
  eq(calls.map(c => /agent0=([^&]*)/.exec(c.url)[1]), ['NOVEL1'], 'only the gene missing from the indra registry is fetched');
  ok(!!api.interactions.indra.NOVEL1, '...and is then registered, so it is never fetched again');
  const e = api.interactions.edges.find(x => x.a === 'NOVEL1' || x.b === 'NOVEL1');
  eq(e && [e.a, e.b, e.t, e.n, e.dir], ['NOVEL1', 'STK11', 'Activation', 5, 'ba'], 'stored canonical, a/b sorted, direction flipped to match (STK11 -> NOVEL1)');
  ok(!api.interactions.edges.some(x => x.a === 'OUTSIDER' || x.b === 'OUTSIDER'), 'an edge to a gene not on your cards is not stored');
}

console.log('\nAutosave: written when something changed, never on a no-op load');
{
  const { api, sandbox } = setup();
  let writes = 0, written = null;
  sandbox.__setHandles({ getFileHandle: async () => ({ createWritable: async () => ({ write: async t => { writes++; written = t; }, close: async () => {} }) }) }, null);
  api.readOnly = false;
  api.interactions = JSON.parse(JSON.stringify(api.geBuildSidecar()));   // a file exactly as the app would write it
  api.geAfterLoad();
  await api.geSaveNow();
  eq(writes, 0, 'loading a current file and changing nothing writes nothing');
  ok(api.geBuildSidecar().edges.some(x => x.a === 'RLIM' && x.b === 'XIST'),
     'an edge to a set member (XIST) is kept — retagging must not cost a re-fetch');
  api.items.push(card('c4', ['XIST']));   // XIST becomes a node
  await api.geSaveNow();
  eq(writes, 1, 'a card edit that changes the derived genes writes once');
  const out = JSON.parse(written);
  ok('XIST' in out.genes, 'the written file carries the re-derived genes (for older readers)');
  await api.geSaveNow();
  eq(writes, 1, 'saving again with no change writes nothing');
}

console.log('\nA legacy sidecar (no resolve) is left alone');
{
  const { api, calls } = setup();
  api.interactions = { generated: '2026-08-14', genes: { MAPT: { chrom: '17', cards: ['c1'], groups: [] } }, edges: [], complex_edges: [] };
  ok(!api.geIsLive(), 'no resolve table -> not live');
  await api.geAutoRun();
  eq(calls.length, 0, 'no lookup, no fetch');
  eq(Object.keys(api.geGenes()), ['MAPT'], 'genes are the stored snapshot');
  ok(api.geAutoText().includes('snapshot of 2026-08-14'), 'the caption says it is a snapshot');
}

console.log('\nOffline: nothing is fetched, and the caption says why');
{
  const { api, sandbox, calls } = setup();
  sandbox.navigator.onLine = false;
  api.readOnly = false;
  sandbox.__setHandles({ getFileHandle: async () => ({ createWritable: async () => ({ write: async () => {}, close: async () => {} }) }) }, null);
  await api.geAutoResolve();
  eq(calls.length, 0, 'no MyGene request while offline');
  ok(/1 name to look up · offline/.test(api.geAutoText()), 'caption: "1 name to look up · offline — resumes when back online"');
}

console.log('\nBackoff: a failed gene is not re-requested on every card save');
{
  const { api, calls } = setup(async () => ({ ok: false, status: 503 }));
  api.interactions.resolve.NOVEL = gene('NOVEL1', '7', '999');
  await api.geAutoIndra();
  eq(calls.length, 1, 'first attempt: one request (NOVEL1)');
  ok(/INDRA unreachable for 1 gene — retrying in 10 min/.test(api.geAutoText()), 'the caption says so');
  await api.geAutoIndra();
  eq(calls.length, 1, 'an immediate second run (a card save) does not re-send it');
  ok(!api.interactions.indra.NOVEL1, 'a failed gene is not registered as fetched');
}

console.log('\nNode size: 6 px after a fit whatever the gene count; zooming in grows it to the 18 px cap');
{
  const { api } = setup();
  const px = z => { api.geZoomRaw = z; return Math.round(18 * z / api.geNodeScale() * 10) / 10; };   // on-screen disc width
  for (const fit of [0.3, 0.4]) {   // a big map fits at 30%, a small one at 40%: same dots either way
    api.geFitZoomRaw = fit;
    eq([px(fit), px(fit * 2), px(fit * 100)], [6, 12, 18], `fit at ${fit * 100}%: 6 px at the fit, 12 px zoomed 2x, capped at 18`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
