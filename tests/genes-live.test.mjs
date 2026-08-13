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

const card = (id, genes, extra = {}) =>
  ({ id, type: 'note', title: id, genes, tags: [], content: 'x', date: '2026-07-14T00:00:00Z', ...extra });

// ---------------------------------------------------------------------------------------------
// gePromoteGhost, M3: a ghost is only "not in the frozen sidecar" — the sidecar is a snapshot,
// not the live source of truth, so a gene already on a card written since the last rebuild still
// shows as a ghost. Adding it should behave differently depending on whether it's genuinely new.
// ---------------------------------------------------------------------------------------------

async function testPromoteNewGeneIsReferenceNoTag() {
  console.log('\ngePromoteGhost — a genuinely new gene opens the form as \'reference\', with no tag added');
  const { api, sandbox } = setup();
  sandbox.document.getElementById('add-form').style.display = '';
  sandbox.document.getElementById('f-tags').value = '';
  await api.gePromoteGhost('PRKAA1');
  eq(api.selectedType, 'reference', 'type defaults to reference for sourced-info cards');
  eq(sandbox.document.getElementById('f-tags').value, '', 'no tag is auto-added');
}

async function testPromoteFillsContentFromMyGene() {
  console.log('\ngePromoteGhost — pulls basic gene info from mygene.info into the content field');
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('mygene.info')) {
      return { ok: true, status: 200, json: async () => [{
        query: 'MAPT', symbol: 'MAPT', name: 'microtubule associated protein tau',
        summary: 'Tau promotes microtubule assembly.', alias: ['TAU', 'DDPAC'],
        genomic_pos: { chr: '17', start: 45894382, end: 46028334 },
      }] };
    }
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  const { api, sandbox } = load({ fetchImpl });
  api.interactions = sidecar();
  api.renderGenes();
  sandbox.document.getElementById('add-form').style.display = '';
  await api.gePromoteGhost('MAPT');
  const content = sandbox.document.getElementById('f-content').value;
  ok(content.includes('Microtubule associated protein tau (MAPT)'), 'content opens with the capitalized name + symbol');
  ok(content.includes('Tau promotes microtubule assembly.'), 'content includes the mygene.info summary');
  ok(content.includes('Aliases: TAU, DDPAC'), 'content lists aliases');
  ok(content.includes('Position: chr17:45,894,382-46,028,334 (hg38)'), 'content lists the hg38 position');
  ok(content.includes('[GeneCards](https://www.genecards.org/cgi-bin/carddisp.pl?gene=MAPT)'), 'content links the GeneCards page');
  // A span-less genomic_pos (chromosome known, coordinates not) falls back to the plain line.
  const bare = api.geFormatGeneInfo('LONE', { name: 'x', genomic_pos: { chr: 'Y' } });
  ok(bare.includes('Chromosome: Y') && !bare.includes('Position:'), 'without a span, just the chromosome is listed');
}

async function testPromoteDoesNotClobberTypedContent() {
  console.log('\ngePromoteGhost — never overwrites content the user already started typing');
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('mygene.info')) return { ok: true, status: 200, json: async () => [{ query: 'MAPT', symbol: 'MAPT', name: 'tau', summary: 'x' }] };
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  const { api, sandbox } = load({ fetchImpl });
  api.interactions = sidecar();
  api.renderGenes();
  sandbox.document.getElementById('add-form').style.display = '';
  const p = api.gePromoteGhost('MAPT');
  sandbox.document.getElementById('f-content').value = 'already writing my own note';
  await p;
  eq(sandbox.document.getElementById('f-content').value, 'already writing my own note',
     'the fetch never overwrote what the user typed while it was in flight');
}

async function testAdoptAlreadyOnACard() {
  console.log('\ngePromoteGhost — a gene already on a live thought card is pulled in like Refresh all, no form');
  const { api, sandbox, calls } = setup();
  await api.geExpand('STK11');   // creates the PRKAA1 ghost
  ok(api.geNodes.find(n => n.sym === 'PRKAA1')?.ghost, 'PRKAA1 starts as a ghost');
  api.items = [card('c9', ['PRKAA1'], { tags: ['kinases'] })];
  const form = sandbox.document.getElementById('add-form');
  form.style.display = 'sentinel';
  sandbox.document.getElementById('f-genes').value = 'untouched';
  const before = calls.indra;
  await api.gePromoteGhost('PRKAA1');
  eq(form.style.display, 'sentinel', 'the create form is never opened');
  eq(sandbox.document.getElementById('f-genes').value, 'untouched', 'the form fields are never touched');
  const n = api.geNodes.find(nn => nn.sym === 'PRKAA1');
  ok(n && n.ghost === false, 'the node is promoted to a real (non-ghost) node');
  eq(n.cards, ['c9'], 'cards derived from the matching live card');
  eq(n.groups, ['kinases'], 'groups derived from the matching live card\'s tags');
  ok(calls.indra > before, 'its INDRA neighbourhood was fetched, same as Refresh all');
  ok(sandbox.__toasts.some(t => /already on a card/.test(t)), 'toast explains what happened');
  ok(api.geAdopted.has('PRKAA1'), 'recorded in the session adoption map');
}

async function testAddHiddenWhenDocumented() {
  console.log('\ngeUpdateAction — a ghost already documented on a live thought card offers Expand only');
  const { api, sandbox } = setup();
  await api.geExpand('STK11');   // creates the PRKAA1 ghost
  api.geSelect('PRKAA1');
  const add = sandbox.document.getElementById('ge-action-add');
  const exp = sandbox.document.getElementById('ge-action-expand');
  ok(add.style.display !== 'none', 'no card yet: the ghost offers Add');
  api.items = [card('c9', ['PRKAA1'])];
  api.geUpdateAction();
  ok(add.style.display === 'none', 'a live thought card exists: Add is gone');
  ok(/Expand/.test(exp.textContent), '...but Expand is still offered');
  // The rule matches gePromoteGhost's adopt branch exactly: set-only and archived mentions don't count.
  api.items = [card('c9', ['PRKAA1'], { tags: ['gene-set'] })];
  api.geUpdateAction();
  ok(add.style.display !== 'none', 'a gene-set-only mention still offers Add (no per-gene note yet)');
  api.items = [card('c9', ['PRKAA1'], { archived: true })];
  api.geUpdateAction();
  ok(add.style.display !== 'none', 'an archived-only mention still offers Add');
}

async function testPanelShowsGhostCard() {
  console.log('\ncard panel — a ghost\'s live card (unknown to the frozen sidecar) still appears');
  const { api, sandbox } = setup();
  await api.geExpand('STK11');   // creates the PRKAA1 ghost
  api.items = [card('c9', ['PRKAA1'])];
  api.setGeCardPanel(true);
  api.geSelect('PRKAA1');
  const panel = sandbox.document.getElementById('ge-cards');
  ok(/data-id="c9"/.test(panel.innerHTML), 'the ghost\'s live card shows in the panel (geThoughtCards path)');
  api.setGeCardPanel(false);
}

async function testAdoptSkipsSetOnlyMentions() {
  console.log('\ngePromoteGhost — a gene mentioned ONLY on a gene-set card still opens the form (no per-gene note yet)');
  const { api, sandbox } = setup();
  await api.geExpand('STK11');
  api.items = [card('c9', ['PRKAA1'], { tags: ['xi_escape', 'gene-set'] })];
  sandbox.document.getElementById('add-form').style.display = '';
  await api.gePromoteGhost('PRKAA1');
  eq(sandbox.document.getElementById('f-genes').value, 'PRKAA1', 'a set-only mention still falls through to the create form');
  eq(api.geNodes.find(nn => nn.sym === 'PRKAA1').ghost, true, 'the node stays a ghost — no per-gene note exists yet');
}

async function testAdoptSkipsArchivedCards() {
  console.log('\ngePromoteGhost — an archived card mentioning the gene does not count as "already documented"');
  const { api, sandbox } = setup();
  await api.geExpand('STK11');
  api.items = [card('c9', ['PRKAA1'], { archived: true })];
  sandbox.document.getElementById('add-form').style.display = '';
  await api.gePromoteGhost('PRKAA1');
  eq(sandbox.document.getElementById('f-genes').value, 'PRKAA1', 'an archived-only mention still opens the form');
}

async function testAdoptOffline() {
  console.log('\ngePromoteGhost — offline, an already-documented gene is still adopted, just without new interactions');
  const { api, sandbox, calls } = setup();
  await api.geExpand('STK11');
  api.items = [card('c9', ['PRKAA1'])];
  sandbox.navigator.onLine = false;
  const before = calls.indra;
  await api.gePromoteGhost('PRKAA1');
  eq(calls.indra, before, 'no network call while offline');
  const n = api.geNodes.find(nn => nn.sym === 'PRKAA1');
  ok(n && n.ghost === false, 'the node is still promoted — it really is documented, regardless of connectivity');
  ok(sandbox.__toasts.some(t => /connect/i.test(t)), 'toast explains interactions need a connection');
}

async function testAdoptDoubleClickGuard() {
  console.log('\ngePromoteGhost — a second click while adopting is a no-op (busy guard)');
  const { api, calls } = setup();
  await api.geExpand('STK11');
  api.items = [card('c9', ['PRKAA1'])];
  const before = calls.indra;
  const p1 = api.gePromoteGhost('PRKAA1');
  const p2 = api.gePromoteGhost('PRKAA1');   // fired before p1 settles
  await Promise.all([p1, p2]);
  eq(calls.indra, before + 1, 'only one INDRA fetch happened, not two');
}

// ---------------------------------------------------------------------------------------------
// The merge paths adopt live-card genes directly: a partner documented on a thought card written
// since the last sidecar rebuild must arrive as a REAL node (cards/groups from the live card,
// recorded as a session adoption), never as a white/dashed ghost. Regression for the RHOA case.
// ---------------------------------------------------------------------------------------------

async function testExpandAdoptsDocumentedPartner() {
  console.log('\ngeExpand — a partner documented on a live thought card arrives as a REAL node, not a ghost');
  const { api } = setup();
  api.items = [card('c9', ['PRKAA1'], { tags: ['kinases'] })];   // card written since the last sidecar rebuild
  await api.geExpand('STK11');
  const n = api.geNodes.find(nn => nn.sym === 'PRKAA1');
  ok(n && n.ghost === false, 'PRKAA1 (on a live card) is a real node from the start');
  eq(n.cards, ['c9'], 'cards derived from the live card');
  eq(n.groups, ['kinases'], 'groups derived from the live card\'s tags');
  eq(n.cclass, 'auto', 'chromosome still grounded via MyGene (chr5 -> autosome)');
  ok(api.geAdopted.has('PRKAA1'), 'recorded as a session adoption');
  const strada = api.geNodes.find(nn => nn.sym === 'STRADA');
  ok(strada && strada.ghost === true, 'STRADA (on no card) still arrives as a ghost');
  const frozen = api.geBuildFrozen();
  ok(!!frozen.genes.PRKAA1, 'Freeze folds the adopted gene in');
  ok(frozen.edges.some(e => e.a === 'PRKAA1' && e.b === 'STK11'), '...and keeps its edge (both endpoints documented)');
}

async function testExpandSetOnlyOrArchivedStillGhost() {
  console.log('\ngeExpand — set-only and archived mentions do NOT adopt (same rule as gePromoteGhost)');
  { const { api } = setup();
    api.items = [card('c9', ['PRKAA1'], { tags: ['gene-set'] })];
    await api.geExpand('STK11');
    ok(api.geNodes.find(nn => nn.sym === 'PRKAA1').ghost === true, 'a gene-set-only mention still ghosts'); }
  { const { api } = setup();
    api.items = [card('c9', ['PRKAA1'], { archived: true })];
    await api.geExpand('STK11');
    ok(api.geNodes.find(nn => nn.sym === 'PRKAA1').ghost === true, 'an archived-only mention still ghosts'); }
}

async function testDocumentedPartnerExemptFromCap() {
  console.log('\ngeExpand — a documented partner never competes for the ghost cap');
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('db.indra.bio')) {
      const K = 23;   // more than the cap; evidence count = i, so GH1 is weakest
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
  const { api } = load({ fetchImpl });
  api.interactions = sidecar();
  api.renderGenes();
  api.items = [card('c9', ['GH1'])];   // the WEAKEST partner is documented
  await api.geExpand('STK11');
  const gh1 = api.geNodes.find(n => n.sym === 'GH1');
  ok(gh1 && gh1.ghost === false, 'GH1 (weakest evidence, but on a card) is in as a real node');
  eq(api.geNodes.filter(n => n.ghost).length, api.GE_GHOST_CAP, 'the cap still applies to the true ghosts');
  ok(!api.geNodes.some(n => n.sym === 'GH2'), 'the ghost trimmed by the cap is now GH2, the weakest true ghost');
}

async function testAddGeneDocumented() {
  console.log('\ngeAddGene — a named gene already on a live thought card arrives solid, not dashed');
  const fetchImpl = async (url) => {
    const u = String(url);
    if (u.includes('db.indra.bio')) {
      const stmts = { h1: { type: 'Activation', subj: HGNC('NEWX', '1'), obj: HGNC('HUB', '2'), belief: 0.8, evidence: [{ pmid: 'p1' }] } };
      return { ok: true, status: 200, json: async () => ({ statements: stmts, evidence_counts: {} }) };
    }
    if (u.includes('mygene')) return { ok: true, status: 200, json: async () => [{ query: 'NEWX', symbol: 'NEWX', genomic_pos: { chr: '7' } }] };
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  const { api } = load({ fetchImpl });
  api.interactions = {
    generated: 'x', source: 'x', members: {}, canon: {}, bridges: [],
    genes: { HUB: { chrom: '1', cards: ['c1'], groups: [] } },
    edges: [], complex_edges: [],
  };
  api.renderGenes();
  api.items = [card('c9', ['NEWX'], { tags: ['leads'] })];
  await api.geAddGene('newx');
  const n = api.geNodes.find(nn => nn.sym === 'NEWX');
  ok(n && n.ghost === false, 'NEWX is a real node — it is on a live card');
  eq(n.cards, ['c9'], 'cards from the live card');
  eq(n.groups, ['leads'], 'groups from the live card\'s tags');
  ok(api.geAdopted.has('NEWX'), 'recorded as a session adoption');
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
  await testPromoteNewGeneIsReferenceNoTag();
  await testPromoteFillsContentFromMyGene();
  await testPromoteDoesNotClobberTypedContent();
  await testAdoptAlreadyOnACard();
  await testAddHiddenWhenDocumented();
  await testPanelShowsGhostCard();
  await testAdoptSkipsSetOnlyMentions();
  await testAdoptSkipsArchivedCards();
  await testAdoptOffline();
  await testAdoptDoubleClickGuard();
  await testExpandAdoptsDocumentedPartner();
  await testExpandSetOnlyOrArchivedStillGhost();
  await testDocumentedPartnerExemptFromCap();
  await testAddGeneDocumented();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
run();
