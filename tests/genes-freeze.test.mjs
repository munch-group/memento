// The Genes view, M3: refresh-all + freeze. Load-bearing claims:
//
//   * Refresh-all fetches every real node incrementally (cached genes never
//     re-hit INDRA) and merges only NODE-to-NODE edges — no ghosts, no relayout.
//   * Freeze regenerates interactions.json in the SAME shape kb-interactions.py
//     emits: genes/members/canon/bridges untouched (card-derived), edges =
//     current node-to-node set, ghost edges dropped, endpoints sorted.
//   * Freeze writes via the folder (desktop) or a GitHub commit (iOS).
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✓ ${msg}`); } else { fail++; console.log(`  ✗ ${msg}`); } };

const HGNC = (name, id) => ({ name, db_refs: { HGNC: id } });

// INDRA response for a source gene, linking it to the other two nodes and to a
// brand-new gene (which, in refresh-all, must be ignored — node-to-node only).
function indraFor(sym) {
  const H = { STK11: '11389', MARK1: '6896', MARK2: '3332', NEWGENE: '999' };
  const others = ['STK11', 'MARK1', 'MARK2'].filter(s => s !== sym);
  const stmts = {};
  others.forEach((o, i) => { stmts['h' + i] = { type: 'Activation', subj: HGNC(sym, H[sym]), obj: HGNC(o, H[o]), belief: 0.7, evidence: [{ pmid: 'p' + sym + o }] }; });
  stmts['hnew'] = { type: 'Phosphorylation', enz: HGNC(sym, H[sym]), sub: HGNC('NEWGENE', H.NEWGENE), belief: 0.8, evidence: [{ pmid: 'pnew' }] };
  return { statements: stmts };
}
function sidecar() {
  return {
    generated: '2026-01-01', source: 'x',
    genes: { STK11: { chrom: '19', cards: ['c1'], groups: [] },
             MARK1: { chrom: 'X', cards: ['c1'], groups: [] },
             MARK2: { chrom: 'X', cards: ['c2'], groups: [] } },
    members: { PRKAA2: ['someset'] },
    canon: { RNF12: 'RLIM' },
    edges: [{ a: 'MARK1', b: 'STK11', t: 'Phosphorylation', belief: 0.9, n: 3, pmid: 'seed1' },
            { a: 'MARK2', b: 'STK11', t: 'Phosphorylation', belief: 0.8, n: 2, pmid: 'seed2' }],
    complex_edges: [],
    bridges: [{ gene: 'SRC', n: 5 }],
  };
}
function mockFetch() {
  const calls = { indra: 0, byGene: {} };
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('db.indra.bio')) {
      calls.indra++;
      const m = u.match(/agent0=([^&]+)/);
      const sym = m ? decodeURIComponent(m[1]) : '';
      calls.byGene[sym] = (calls.byGene[sym] || 0) + 1;
      return { ok: true, status: 200, json: async () => indraFor(sym) };
    }
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  return { fetchImpl, calls };
}
function setup() {
  const { fetchImpl, calls } = mockFetch();
  const { api, sandbox } = load({ fetchImpl });
  api.interactions = sidecar();
  api.renderGenes();
  return { api, sandbox, calls };
}

function testMergeNodeEdges() {
  console.log('\ngeMergeNodeEdges — node-to-node only, no ghosts, deduped');
  const { api } = setup();
  const before = api.geEdges.length;
  const rec = { edges: [
    { a: 'MARK2', b: 'STK11', t: 'Activation', belief: 0.7, n: 1, pmid: 'x', complex: false },   // both nodes -> add
    { a: 'STK11', b: 'NEWGENE', t: 'Phosphorylation', belief: 0.8, n: 1, pmid: 'y', complex: false }, // ghost -> skip
    { a: 'MARK1', b: 'STK11', t: 'Phosphorylation', belief: 0.9, n: 3, pmid: 'seed1', complex: false }, // dup -> skip
  ] };
  const added = api.geMergeNodeEdges(rec);
  eq(added, 1, 'only the node-to-node, non-duplicate edge is added');
  eq(api.geEdges.length, before + 1, 'edge count grew by one');
  ok(!api.geNodes.some(n => n.sym === 'NEWGENE'), 'the off-map gene did NOT become a node');
}

// The singleton regression: geEnsureMementoNode used to run on BOTH endpoints before the edge was
// accepted, so an isolated memento gene whose only fetched edges point outside memento (or are
// complex-only) materialised as an edgeless node. Promotion may only happen for a mechanistic
// edge that is actually added.
function testMergeNoSingletons() {
  console.log('\ngeMergeNodeEdges — a rejected edge never leaves a promoted singleton behind');
  const { fetchImpl } = mockFetch();
  const { api } = load({ fetchImpl });
  api.interactions = {
    generated: 'x', source: 'x',
    genes: { STK11: { chrom: '19', cards: ['c1'], groups: [] },
             MARK1: { chrom: 'X',  cards: ['c1'], groups: [] },
             ISO1:  { chrom: '1',  cards: ['c2'], groups: [] },    // isolated: no sidecar edge
             ISO2:  { chrom: '2',  cards: ['c2'], groups: [] } },  // isolated: no sidecar edge
    members: {}, canon: {},
    edges: [{ a: 'MARK1', b: 'STK11', t: 'Phosphorylation', belief: 0.9, n: 3, pmid: 'seed1' }],
    complex_edges: [],
    bridges: [],
  };
  api.renderGenes();
  eq(api.geNodes.length, 2, 'only the wired pair starts as nodes');
  eq(api.geIsolated, 2, 'the two edgeless genes are counted isolated');

  // (1) isolated memento gene -> gene OUTSIDE memento: rejected without side effects
  let added = api.geMergeNodeEdges({ edges: [{ a: 'ISO1', b: 'OUTSIDER', t: 'Activation', belief: 0.7, n: 1, pmid: 'x', complex: false }] });
  eq(added, 0, 'an edge to a non-memento gene adds nothing');
  ok(!api.geNodes.some(n => n.sym === 'ISO1'), '...and the isolated memento endpoint was NOT promoted');
  eq(api.geIsolated, 2, '...and the isolated count is untouched');

  // (2) complex-only edge between two isolated memento genes: complex edges never make a gene a node
  added = api.geMergeNodeEdges({ edges: [{ a: 'ISO1', b: 'ISO2', t: 'Complex', belief: 0.7, n: 1, pmid: 'x', complex: true }] });
  eq(added, 0, 'a complex edge between two isolated genes adds nothing');
  eq(api.geNodes.length, 2, '...and promotes neither');

  // (3) a complex edge between EXISTING nodes still merges (drawable via the complexes toggle)
  added = api.geMergeNodeEdges({ edges: [{ a: 'MARK1', b: 'STK11', t: 'Complex', belief: 0.7, n: 1, pmid: 'x', complex: true }] });
  eq(added, 1, 'a complex edge between existing nodes still merges');

  // (4) a mechanistic edge into the map still promotes — the case the docs promise
  added = api.geMergeNodeEdges({ edges: [{ a: 'ISO1', b: 'STK11', t: 'Activation', belief: 0.7, n: 1, pmid: 'x', complex: false }] });
  eq(added, 1, 'a mechanistic edge to an existing node is added');
  ok(api.geNodes.some(n => n.sym === 'ISO1'), '...and ISO1 is now promoted — it has a drawable edge');
  eq(api.geIsolated, 1, '...and the isolated count drops by one');
}

async function testRefreshAll() {
  console.log('\ngeRefreshAll — every memento gene fetched once, incremental, edges merged');
  const { api, calls } = setup();
  await api.geRefreshAll();
  eq(calls.indra, 3, 'one INDRA call per memento gene (3)');
  ok(api.geEdges.length > 1, 'node-to-node edges were added to the map');
  ok(!api.geNodes.some(n => n.ghost), 'refresh-all adds NO ghosts');
  // incremental: a second refresh hits cache, no new network calls
  await api.geRefreshAll();
  eq(calls.indra, 3, 'second refresh is fully cached — no new INDRA calls');
}

async function testRefreshPromotesIsolated() {
  console.log('\ngeRefreshAll — an isolated memento gene that interacts is connected, never a ghost');
  const calls = { indra: 0 };
  const H = { HUB: '1', PARTNER: '2', ISOG: '3', OUT: '9' };
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('db.indra.bio')) {
      calls.indra++;
      const m = u.match(/agent0=([^&]+)/), sym = m ? decodeURIComponent(m[1]) : '';
      const stmts = {};
      ['HUB', 'PARTNER', 'ISOG', 'OUT'].filter(s => s !== sym).forEach((o, i) => {
        stmts['h' + i] = { type: 'Activation', subj: HGNC(sym, H[sym] || '0'), obj: HGNC(o, H[o]), belief: 0.7, evidence: [{ pmid: 'p' }] };
      });
      return { ok: true, status: 200, json: async () => ({ statements: stmts }) };
    }
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  const { api } = load({ fetchImpl });
  api.interactions = {
    generated: 'x', source: 'x',
    genes: { HUB: { chrom: '1', cards: ['c1'], groups: [] }, PARTNER: { chrom: '1', cards: ['c1'], groups: [] },
             ISOG: { chrom: 'X', cards: ['c2'], groups: [] } },   // ISOG is in memento but has no edge -> isolated
    edges: [{ a: 'HUB', b: 'PARTNER', t: 'Phosphorylation', belief: 0.9, n: 5, pmid: 'seed' }],
    complex_edges: [], members: {}, canon: {}, bridges: [],
  };
  api.renderGenes();
  ok(!api.geNodes.some(n => n.sym === 'ISOG'), 'ISOG starts isolated (not a drawn node)');
  await api.geRefreshAll();
  const isog = api.geNodes.find(n => n.sym === 'ISOG');
  ok(isog && !isog.ghost, 'ISOG (a memento gene) is promoted to a real node, not a ghost');
  ok(isog && isog.cclass === 'X', 'the promoted node keeps its sidecar metadata (X chromosome)');
  ok(!api.geNodes.some(n => n.sym === 'OUT'), 'OUT (not in memento) is NOT added — refresh never makes ghosts');
  eq(calls.indra, 3, 'queried all three memento genes, including the isolated one');
}

async function testRefreshOffline() {
  console.log('\ngeRefreshAll — offline refuses');
  const { api, sandbox, calls } = setup();
  sandbox.navigator.onLine = false;
  await api.geRefreshAll();
  eq(calls.indra, 0, 'no calls when offline');
  ok(sandbox.__toasts.some(t => /connection/i.test(t)), 'a connection toast is shown');
}

function testBuildFrozen() {
  console.log('\ngeBuildFrozen — same shape as kb-interactions.py, ghost edges dropped');
  const { api } = setup();
  // splice in a live ghost edge and a live node-node edge
  api.geEdges.push({ a: 'MARK2', b: 'STK11', t: 'Activation', belief: 0.7, n: 1, pmid: 'live1', complex: false });
  api.geEdges.push({ a: 'STK11', b: 'GHOSTX', t: 'Activation', belief: 0.5, n: 1, pmid: 'g', complex: false });
  const out = api.geBuildFrozen();
  eq(Object.keys(out.genes).sort(), ['MARK1', 'MARK2', 'STK11'], 'genes dict unchanged (card-derived)');
  eq(out.members, { PRKAA2: ['someset'] }, 'members carried through untouched');
  eq(out.canon, { RNF12: 'RLIM' }, 'canon carried through untouched');
  eq(out.bridges, [{ gene: 'SRC', n: 5 }], 'bridges carried through untouched');
  ok(!out.edges.some(e => e.a === 'GHOSTX' || e.b === 'GHOSTX'), 'ghost edge dropped (endpoint not a memento gene)');
  ok(out.edges.some(e => e.pmid === 'live1'), 'live node-to-node edge persisted');
  ok(out.edges.some(e => e.pmid === 'seed1'), 'baseline edge persisted');
  // sorted by (a,b)
  const sorted = [...out.edges].sort((x, y) => x.a < y.a ? -1 : x.a > y.a ? 1 : x.b < y.b ? -1 : x.b > y.b ? 1 : 0);
  eq(out.edges.map(e => e.a + e.b), sorted.map(e => e.a + e.b), 'edges sorted by endpoints');
  ok(/frozen in-app/.test(out.source), 'source marks it as frozen in-app');
  eq(out.edges[0].n !== undefined && out.edges[0].belief !== undefined, true, 'edge records keep belief and n');
}

async function testFreezeWritesFolder() {
  console.log('\ngeFreeze — writes interactions.json to the connected folder');
  const { api, sandbox } = setup();
  let written = null;
  const fakeDir = {
    getFileHandle: async (name, opts) => {
      ok(name === 'interactions.json' && opts && opts.create, 'opens interactions.json for create');
      return { createWritable: async () => ({ write: async (t) => { written = t; }, close: async () => {} }) };
    },
  };
  sandbox.__setHandles(fakeDir, null);
  await api.geFreeze();      // harness confirm() returns true
  ok(written, 'a file body was written');
  const parsed = JSON.parse(written);
  ok(parsed.genes && parsed.edges && parsed.source.includes('frozen'), 'written JSON is a valid frozen sidecar');
  ok(parsed.edges.some(e => e.pmid === 'seed1'), 'baseline edge present in the written file');
}

const card = (id, genes, extra = {}) =>
  ({ id, type: 'note', title: id, genes, tags: [], content: 'x', date: '2026-07-14T00:00:00Z', ...extra });

// A gene adopted this session via gePromoteGhost (see genes-live.test.mjs) is never written into
// interactions.genes directly — geBuildFrozen() folds _geAdopted in only at freeze time, so the
// loaded baseline stays exactly what was loaded until a real freeze (or kb-interactions.py rebuild).
async function testBuildFrozenIncludesAdoptedGene() {
  console.log('\ngeBuildFrozen — a live-session adoption is folded in without mutating the loaded baseline');
  const { api } = setup();
  await api.geExpand('STK11');   // indraFor's phosphorylation partner -> NEWGENE ghost
  ok(api.geNodes.find(n => n.sym === 'NEWGENE')?.ghost, 'NEWGENE starts as a ghost');
  const genesBefore = JSON.stringify(api.interactions.genes);
  api.items = [card('c9', ['NEWGENE'], { tags: ['grp1'] })];
  await api.gePromoteGhost('NEWGENE');
  ok(api.geAdopted.has('NEWGENE'), 'the adoption is recorded in the session map');
  eq(JSON.stringify(api.interactions.genes), genesBefore, 'the loaded baseline object is byte-for-byte unchanged');
  ok(!('NEWGENE' in api.interactions.genes), 'NEWGENE was never written into the loaded genes dict');
  const out = api.geBuildFrozen();
  ok('NEWGENE' in out.genes, 'geBuildFrozen() folds the adopted gene into its output');
  eq(out.genes.NEWGENE.cards, ['c9'], 'adopted gene keeps its live-card id');
  eq(out.genes.NEWGENE.groups, ['grp1'], 'adopted gene keeps its live-card tags as groups');
  ok(out.edges.some(e => e.a === 'NEWGENE' || e.b === 'NEWGENE'), 'an edge touching the adopted gene survives into the frozen output');
}

async function testFreezeIncludesAdoptedGene() {
  console.log('\ngeFreeze — a live-session adoption is written into interactions.json, then the session map clears');
  const { api, sandbox } = setup();
  await api.geExpand('STK11');
  api.items = [card('c9', ['NEWGENE'])];
  await api.gePromoteGhost('NEWGENE');
  let written = null;
  const fakeDir = { getFileHandle: async () => ({ createWritable: async () => ({ write: async (t) => { written = t; }, close: async () => {} }) }) };
  sandbox.__setHandles(fakeDir, null);
  await api.geFreeze();
  const parsed = JSON.parse(written);
  ok('NEWGENE' in parsed.genes, 'the adopted gene is written into interactions.json on Freeze');
  eq(api.geAdopted.size, 0, 'the session adoption map is cleared after a successful freeze — folded into the new baseline');
}

async function run() {
  console.log('Genes view (M3 — refresh-all + freeze)');
  testMergeNodeEdges();
  testMergeNoSingletons();
  await testRefreshAll();
  await testRefreshPromotesIsolated();
  await testRefreshOffline();
  testBuildFrozen();
  await testFreezeWritesFolder();
  await testBuildFrozenIncludesAdoptedGene();
  await testFreezeIncludesAdoptedGene();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
run();
