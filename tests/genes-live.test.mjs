// The Genes view, M2: live INDRA expansion + ghost nodes. The load-bearing
// claims are about what a live fetch is allowed to add:
//
//   * HGNC grounding is the gate. A partner without an HGNC ref (a chemical, an
//     ungrounded text mention) is NOT added — the same filter the sidecar uses,
//     so a live expansion can't become a toxicology screen.
//   * A partner already in memento gains an edge; a partner NOT in memento
//     appears as a GHOST node (ghost:true), promotable to a card.
//   * Results are cached in IndexedDB — re-expanding does not re-hit INDRA.
//   * Offline, an expansion refuses rather than throwing; the M1 map is untouched.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✓ ${msg}`); } else { fail++; console.log(`  ✗ ${msg}`); } };

const HGNC = (name, id) => ({ name, db_refs: { HGNC: id } });

// A mock INDRA from_agents response for source STK11: a phosphorylation of a
// NEW gene (PRKAA1), an activation of an EXISTING gene (MARK1), an inhibition of
// a CHEMICAL (no HGNC — must be dropped), and a complex with a new gene (STRADA).
function indraResp() {
  // ev_limit=1 truncates every evidence array to one item; the TRUE counts live
  // in evidence_counts. h1's real weight is 50, not 1.
  return {
    evidence_counts: { h1: 50, h2: 12, h4: 7 },
    statements: {
      h1: { type: 'Phosphorylation', enz: HGNC('STK11', '11389'), sub: HGNC('PRKAA1', '9376'), belief: 0.9, evidence: [{ pmid: '111' }] },
      h2: { type: 'Activation', subj: HGNC('STK11', '11389'), obj: HGNC('MARK1', '6896'), belief: 0.7, evidence: [{ pmid: '222' }] },
      h3: { type: 'Inhibition', subj: HGNC('STK11', '11389'), obj: { name: 'bisphenol A', db_refs: { CHEBI: 'CHEBI:33216' } }, belief: 0.8, evidence: [{}] },
      h4: { type: 'Complex', members: [HGNC('STK11', '11389'), HGNC('STRADA', '30172')], belief: 0.6, evidence: [{ pmid: '444' }] },
    },
  };
}
function mygeneResp() {
  return [
    { query: 'PRKAA1', symbol: 'PRKAA1', genomic_pos: { chr: '5' } },
    { query: 'STRADA', symbol: 'STRADA', genomic_pos: { chr: '17' } },
  ];
}
function sidecar() {
  return {
    genes: { STK11: { chrom: '19', cards: ['c1'], groups: [] },
             MARK1: { chrom: 'X', cards: ['c1'], groups: [] },
             MARK2: { chrom: 'X', cards: ['c2'], groups: [] } },
    edges: [
      { a: 'MARK1', b: 'STK11', t: 'Phosphorylation', belief: 0.9, n: 3, pmid: 'p1' },
      { a: 'MARK2', b: 'STK11', t: 'Activation', belief: 0.6, n: 1, pmid: 'p2' },
    ],
    complex_edges: [],
  };
}

// A fetch that routes by host and counts calls, so tests can assert the cache
// short-circuits the network.
function mockFetch() {
  const calls = { indra: 0, mygene: 0 };
  const fetchImpl = async (url, opts) => {
    const u = String(url);
    if (u.includes('db.indra.bio')) { calls.indra++; return { ok: true, status: 200, json: async () => indraResp() }; }
    if (u.includes('mygene.info')) { calls.mygene++; return { ok: true, status: 200, json: async () => mygeneResp() }; }
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  return { fetchImpl, calls };
}

function setup() {
  const { fetchImpl, calls } = mockFetch();
  const { api, sandbox } = load({ fetchImpl });
  api.interactions = sidecar();
  api.renderGenes();   // build + settle the M1 map
  return { api, sandbox, calls };
}

function testStmtAgents() {
  console.log('\ngeStmtAgents — HGNC grounding gates every agent');
  const { api } = setup();
  eq(api.geStmtAgents({ enz: HGNC('STK11', '1'), sub: HGNC('PRKAA1', '2') }), ['STK11', 'PRKAA1'], 'enz/sub grounded agents');
  eq(api.geStmtAgents({ members: [HGNC('A', '1'), HGNC('B', '2')] }), ['A', 'B'], 'complex members');
  eq(api.geStmtAgents({ subj: HGNC('STK11', '1'), obj: { name: 'bisphenol A', db_refs: { CHEBI: 'x' } } }), ['STK11'], 'chemical (no HGNC) dropped');
  eq(api.geStmtAgents({ subj: { name: 'X' }, obj: HGNC('Y', '2') }), ['Y'], 'ungrounded name dropped');
  eq(api.geStmtAgents({ enz: HGNC('mapt', '6893'), sub: HGNC('Fyn', '4') }), ['MAPT', 'FYN'], 'names upper-cased');
}

function testParseIndra() {
  console.log('\ngeParseIndra — edges incident to the source, sorted, complex-aware');
  const { api } = setup();
  const edges = api.geParseIndra(indraResp(), 'STK11');
  const keyed = Object.fromEntries(edges.map(e => [[e.a, e.b].join('-'), e]));
  ok(!edges.some(e => e.a.includes('BISPHENOL') || e.b.includes('BISPHENOL')), 'chemical partner never appears');
  ok('PRKAA1-STK11' in keyed || 'STK11-PRKAA1' in keyed, 'STK11–PRKAA1 edge present');
  const phos = edges.find(e => e.t === 'Phosphorylation');
  eq([phos.a, phos.b].sort(), ['PRKAA1', 'STK11'], 'endpoints sorted');
  eq(phos.pmid, '111', 'pmid carried from evidence');
  eq(phos.n, 50, 'evidence count is the TRUE total (evidence_counts), not the ev_limit=1 array length');
  const cplx = edges.find(e => e.t === 'Complex');
  ok(cplx && cplx.complex === true, 'complex edge flagged complex');
  eq(edges.length, 3, 'three edges (chemical dropped)');
}

async function testExpand() {
  console.log('\ngeExpand — a live fetch adds ghosts and edges, existing map pinned');
  const { api, calls } = setup();
  const before = api.geNodes.length;      // 3 wired nodes
  await api.geExpand('STK11');

  eq(calls.indra, 1, 'INDRA queried once');
  ok(calls.mygene >= 1, 'MyGene queried for new-partner chromosomes');
  const byS = Object.fromEntries(api.geNodes.map(n => [n.sym, n]));
  ok('PRKAA1' in byS && byS.PRKAA1.ghost === true, 'PRKAA1 added as a ghost (not in memento)');
  ok('STRADA' in byS && byS.STRADA.ghost === true, 'STRADA (complex partner) added as a ghost');
  eq(byS.PRKAA1.cclass, 'auto', 'PRKAA1 chromosome (chr5) grounded to autosome');
  ok(!('BISPHENOL A' in byS), 'the chemical is not a node');
  eq(api.geNodes.length, before + 2, 'exactly two ghosts added');
  ok(api.geEdges.some(e => e.t === 'Activation' && ((e.a === 'STK11' && e.b === 'MARK1') || (e.a === 'MARK1' && e.b === 'STK11'))),
     'new STK11–MARK1 activation edge added between existing nodes');
  eq(api.geExpanded, ['STK11'], 'STK11 recorded as expanded');
}

async function testCache() {
  console.log('\ngeExpand — second time is served from IndexedDB, not the network');
  const { api, calls } = setup();
  await api.geExpand('STK11');
  eq(calls.indra, 1, 'first expand hits INDRA once');
  api.geTestResetExpanded();          // forget the session guard, keep the cache
  await api.geExpand('STK11');
  eq(calls.indra, 1, 'second expand adds NO INDRA call — cache hit');
}

async function testAlreadyExpanded() {
  console.log('\ngeExpand — re-expanding with nothing left adds nothing new (cache reused)');
  const { api, calls } = setup();   // mock has only 2 ghost partners, both fit under the cap
  await api.geExpand('STK11');
  const n = api.geNodes.length, c = calls.indra;
  await api.geExpand('STK11');   // everything already shown
  eq(api.geNodes.length, n, 'no duplicate ghosts on re-expand');
  eq(calls.indra, c, 'no extra INDRA call — the cache is reused');
}

async function testReExpandNextBatch() {
  console.log('\ngeExpand — re-expanding adds the NEXT batch of ghosts, from cache');
  let indraCalls = 0;
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('db.indra.bio')) {
      indraCalls++;
      const stmts = {};   // 23 partners, evidence = i so GH23 is strongest, GH1 weakest
      for (let i = 1; i <= 23; i++) stmts['h' + i] = { type: 'Phosphorylation', enz: HGNC('STK11', '11389'), sub: HGNC('GH' + i, String(1000 + i)), belief: 0.9, evidence: Array.from({ length: i }, (_, j) => ({ pmid: 'p' + i + j })) };
      return { ok: true, status: 200, json: async () => ({ statements: stmts }) };
    }
    if (u.includes('mygene')) return { ok: true, status: 200, json: async () => [] };
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  const { api, sandbox } = load({ fetchImpl });
  api.interactions = sidecar();
  api.renderGenes();
  const CAP = api.GE_GHOST_CAP;
  const exp = () => sandbox.document.getElementById('ge-action-expand').textContent;

  await api.geExpand('STK11');
  eq(api.geNodes.filter(n => n.ghost).length, CAP, `first Expand adds the top ${CAP} ghosts`);
  ok(!api.geNodes.some(n => n.sym === 'GH1'), 'the weakest ghost (GH1) is not in yet');
  api.geSelect('STK11');
  ok(/more/.test(exp()), 'the Expand button offers "more" while partners remain');

  const c = indraCalls;
  await api.geExpand('STK11');   // re-expand → next batch
  eq(indraCalls, c, 're-expand re-uses the cache — no new INDRA call');
  eq(api.geNodes.filter(n => n.ghost).length, 23, 'the remaining 3 ghosts are now added (23 total)');
  ok(api.geNodes.some(n => n.sym === 'GH1'), 'the weakest ghost is added on the second pass');
  ok(/fully expanded/.test(exp()), 'once nothing remains, the button reads "fully expanded"');
}

async function testOffline() {
  console.log('\ngeExpand — offline refuses, the M1 map is untouched');
  const { api, sandbox, calls } = setup();
  sandbox.navigator.onLine = false;
  const before = api.geNodes.length;
  await api.geExpand('STK11');
  eq(calls.indra, 0, 'no network call when offline');
  eq(api.geNodes.length, before, 'no nodes added offline');
  ok(sandbox.__toasts.some(t => /connection/i.test(t)), 'a "needs a connection" toast is shown');
}

async function testGhostCap() {
  console.log('\ngeExpand — ghosts capped at the top GE_GHOST_CAP by evidence');
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('db.indra.bio')) {
      const K = 23;   // more than the cap; evidence count = i, so GH1 is weakest, GH23 strongest
      const stmts = {};
      for (let i = 1; i <= K; i++) {
        stmts['h' + i] = { type: 'Phosphorylation', enz: HGNC('STK11', '11389'), sub: HGNC('GH' + i, String(1000 + i)),
                           belief: 0.9, evidence: Array.from({ length: i }, (_, j) => ({ pmid: 'p' + i + '_' + j })) };
      }
      return { ok: true, status: 200, json: async () => ({ statements: stmts }) };
    }
    if (u.includes('mygene')) return { ok: true, status: 200, json: async () => [] };
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  const { api, sandbox } = load({ fetchImpl });
  api.interactions = sidecar();
  api.renderGenes();
  const CAP = api.GE_GHOST_CAP;
  await api.geExpand('STK11');
  const ghosts = api.geNodes.filter(n => n.ghost);
  eq(ghosts.length, CAP, 'exactly GE_GHOST_CAP ghosts kept (' + CAP + ')');
  ok(api.geNodes.some(n => n.sym === 'GH23'), 'highest-evidence ghost (GH23) kept');
  ok(!api.geNodes.some(n => n.sym === 'GH1'), 'lowest-evidence ghost (GH1) dropped');
  ok(sandbox.__toasts.some(t => /more, Expand again/.test(t)), 'toast reports how many more can be added');
}

async function testAddGene() {
  console.log('\ngeAddGene — add a named gene, connect to memento genes only (never ghosts)');
  const H = { NEWX: '1', HUB: '2', PARTNER: '3', EXTERNAL: '9' };
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('db.indra.bio')) {
      const stmts = {
        h1: { type: 'Activation', subj: HGNC('NEWX', H.NEWX), obj: HGNC('HUB', H.HUB), belief: 0.8, evidence: [{ pmid: 'p1' }] },
        h2: { type: 'Inhibition', subj: HGNC('NEWX', H.NEWX), obj: HGNC('PARTNER', H.PARTNER), belief: 0.7, evidence: [{ pmid: 'p2' }] },
        h3: { type: 'Activation', subj: HGNC('NEWX', H.NEWX), obj: HGNC('EXTERNAL', H.EXTERNAL), belief: 0.9, evidence: [{ pmid: 'p3' }] },
      };
      return { ok: true, status: 200, json: async () => ({ statements: stmts, evidence_counts: {} }) };
    }
    if (u.includes('mygene')) return { ok: true, status: 200, json: async () => [{ query: 'NEWX', symbol: 'NEWX', genomic_pos: { chr: '7' } }] };
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  const { api } = load({ fetchImpl });
  api.interactions = {
    generated: 'x', source: 'x', members: {}, canon: {}, bridges: [],
    genes: { HUB: { chrom: '1', cards: ['c1'], groups: [] }, PARTNER: { chrom: '1', cards: ['c1'], groups: [] } },
    edges: [{ a: 'HUB', b: 'PARTNER', t: 'Phosphorylation', belief: 0.9, n: 5, pmid: 'seed' }],
    complex_edges: [],
  };
  api.renderGenes();
  await api.geAddGene('newx');   // typed lower-case; should upper-case
  const newx = api.geNodes.find(n => n.sym === 'NEWX');
  ok(newx && newx.ghost && newx.cards.length === 0, 'NEWX added as an off-card node (not on any card)');
  ok(!api.geNodes.some(n => n.sym === 'EXTERNAL'), 'EXTERNAL (not in memento) is NOT added — no ghosts');
  const touchesNewx = s => api.geEdges.some(e => (e.a === 'NEWX' || e.b === 'NEWX') && (e.a === s || e.b === s));
  ok(touchesNewx('HUB'), 'NEWX–HUB edge added (HUB is in memento)');
  ok(touchesNewx('PARTNER'), 'NEWX–PARTNER edge added');
  ok(!api.geEdges.some(e => e.a === 'EXTERNAL' || e.b === 'EXTERNAL'), 'no edge to EXTERNAL');
  eq(api.geLastSel, 'NEWX', 'the added gene is highlighted (last-selected), so the button targets it');
}

async function testExpandGhost() {
  console.log('\ngeExpand — a ghost can be expanded too; its action bar offers Expand AND Add');
  const { api, sandbox, calls } = setup();
  await api.geExpand('STK11');   // creates the PRKAA1 ghost
  const ghost = api.geNodes.find(n => n.sym === 'PRKAA1');
  ok(ghost && ghost.ghost, 'PRKAA1 ghost exists');

  api.geSelect('PRKAA1');
  const add = sandbox.document.getElementById('ge-action-add');
  const exp = sandbox.document.getElementById('ge-action-expand');
  ok(add.style.display !== 'none' && /Add/.test(add.textContent), 'a ghost shows an Add button');
  ok(/Expand/.test(exp.textContent), 'a ghost ALSO shows an Expand button');
  api.geSelect('PRKAA1');   // deselect it
  api.geSelect('STK11');    // a real (in-memento) node
  ok(add.style.display === 'none', 'a real node shows no Add button (expand only)');

  const before = calls.indra;
  await api.geExpand('PRKAA1');   // must NOT be refused (previously ghosts were blocked)
  ok(calls.indra > before, 'expanding the ghost fetched from INDRA — not blocked');
  ok(api.geExpanded.includes('PRKAA1'), 'the ghost is now marked expanded');
}

function testPromote() {
  console.log('\ngePromoteGhost — opens memento\'s create form pre-filled with the gene');
  const { api, sandbox } = setup();
  sandbox.document.getElementById('add-form').style.display = '';   // form already open
  api.gePromoteGhost('PRKAA1');
  eq(sandbox.document.getElementById('f-genes').value, 'PRKAA1', 'gene symbol dropped into the form');
}

async function run() {
  console.log('Genes view (M2 — live INDRA)');
  testStmtAgents();
  testParseIndra();
  await testExpand();
  await testCache();
  await testAlreadyExpanded();
  await testOffline();
  await testGhostCap();
  await testReExpandNextBatch();
  await testAddGene();
  await testExpandGhost();
  testPromote();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
run();
