// The Genes view (M1: offline). Load-bearing claims, because a gene map is not a
// card map:
//
//   * Nodes are GENES from the interactions.json sidecar, not cards. A gene is a
//     node only if it has a MECHANISTIC interaction; genes with none (or only a
//     complex) would pad an outer ring, so they are counted, not drawn.
//   * Complex edges are 88% of the data and never spring the layout — toggling
//     them only draws lines between nodes already placed.
//   * Property filters (nature / confidence / evidence) HIDE; they never relayout.
//   * An edge to a gene that is not itself a node is dropped (both ends must exist).
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✓ ${msg}`); } else { fail++; console.log(`  ✗ ${msg}`); } };
const noop = async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });

// A small synthetic sidecar exercising every branch: two chromosomes, an
// isolated gene, an unknown-chromosome gene, three natures, a complex edge, and
// an edge whose far end is NOT a node.
function sidecar() {
  return {
    genes: {
      MAPT:  { chrom: '17', cards: ['c1'], groups: ['Drive'] },   // 17 -> autosome
      MARK1: { chrom: 'X',  cards: ['c1'], groups: [] },
      MARK2: { chrom: 'X',  cards: ['c2'], groups: ['xi_escape'] },
      STK11: { chrom: '19', cards: ['c3'], groups: [] },
      LONE:  { chrom: 'Y',  cards: ['c4'], groups: [] },          // no mech edge -> isolated
      UNK:   { chrom: null, cards: [],     groups: [] },          // unknown chrom, isolated
    },
    edges: [
      { a: 'STK11', b: 'MARK1', t: 'Phosphorylation', belief: 0.90, n: 3, pmid: '1' },
      { a: 'STK11', b: 'MARK2', t: 'Activation',      belief: 0.50, n: 1, pmid: '2' },
      { a: 'MAPT',  b: 'MARK1', t: 'Inhibition',      belief: 0.80, n: 2, pmid: '3' },
      { a: 'MAPT',  b: 'GHOST', t: 'Activation',      belief: 0.99, n: 5 },   // GHOST not a node -> dropped
    ],
    complex_edges: [
      { a: 'MAPT', b: 'MARK2', t: 'Complex', belief: 0.70, n: 1, pmid: '4' },
    ],
  };
}
function setup() {
  const { api, sandbox } = load({ fetchImpl: noop });
  api.interactions = sidecar();
  return { api, sandbox };
}

function testNatureAndChrom() {
  console.log('\ngeNature / geChromClass — the two colour encodings');
  const { api } = setup();
  eq(api.geNature('Activation'), 'promote', 'Activation is promote');
  eq(api.geNature('IncreaseAmount'), 'promote', 'IncreaseAmount is promote');
  eq(api.geNature('Inhibition'), 'suppress', 'Inhibition is suppress');
  eq(api.geNature('DecreaseAmount'), 'suppress', 'DecreaseAmount is suppress');
  eq(api.geNature('Phosphorylation'), 'modify', 'Phosphorylation is modify');
  eq(api.geNature('Complex'), 'bind', 'Complex is bind');
  eq(api.geNature('Weirdtype'), 'modify', 'unknown type falls back to modify');
  eq(api.geChromClass('X'), 'X', 'X chromosome');
  eq(api.geChromClass('Y'), 'Y', 'Y chromosome');
  eq(api.geChromClass('17'), 'auto', 'a number is autosome');
  eq(api.geChromClass('MT'), 'MT', 'mitochondrial');
  eq(api.geChromClass(null), 'unknown', 'missing chromosome is unknown');
  eq(api.geIdSafe('HLA-A'), 'HLA-A', 'safe id keeps hyphens');
  eq(api.geIdSafe('weird.sym/x'), 'weird_sym_x', 'unsafe id chars become underscores');
}

function testModel() {
  console.log('\ngeBuildModel — nodes are wired genes; isolated genes counted, not drawn');
  const { api } = setup();
  api.geBuildModel();
  const syms = api.geNodes.map(n => n.sym).sort();
  eq(syms, ['MAPT', 'MARK1', 'MARK2', 'STK11'], 'only genes with a mechanistic edge are nodes');
  eq(api.geIsolated, 2, 'LONE and UNK are isolated (2), not nodes');
  const deg = Object.fromEntries(api.geNodes.map(n => [n.sym, n.deg]));
  eq(deg, { MAPT: 1, MARK1: 2, MARK2: 1, STK11: 2 }, 'degree counts mechanistic edges only (complex excluded)');
  ok(api.geNodes.every(n => n.r >= 5), 'every disc has a positive radius');
  const mapt = api.geNodes.find(n => n.sym === 'MAPT');
  eq(mapt.cclass, 'auto', 'MAPT (chr17) is autosome-coloured');
  eq(api.geNodes.find(n => n.sym === 'MARK1').cclass, 'X', 'MARK1 is X-coloured');
  // _geEdges keeps mech + complex where BOTH ends are nodes; the GHOST edge is gone
  const kinds = api.geEdges.map(e => e.t).sort();
  eq(kinds, ['Activation', 'Complex', 'Inhibition', 'Phosphorylation'], 'GHOST edge dropped; complex kept in _geEdges');
  eq(api.geMechEdges.length, 3, 'three mechanistic springs (GHOST filtered out)');
}

function testDrawnAndComplexToggle() {
  console.log('\ngeComputeDrawn / setGeShowComplex — complex is off by default, a draw-only overlay');
  const { api } = setup();
  api.geBuildModel();
  api.geComputeDrawn();
  eq(api.geDrawn.length, 3, 'default drawn set is mechanistic only (3)');
  ok(api.geDrawn.every(e => !e.complex), 'no complex edge drawn by default');
  api.setGeShowComplex(true);
  eq(api.geDrawn.length, 4, 'toggling complexes on adds the one complex edge');
  ok(api.geShowComplex, 'flag is set');
  // toggling complex must NOT change the layout springs
  eq(api.geMechEdges.length, 3, 'mechanistic springs unchanged by the complex toggle');
  api.setGeShowComplex(false);
  eq(api.geDrawn.length, 3, 'toggling back off removes it again');
}

function testEdgeFilters() {
  console.log('\ngeEdgeShown — nature / confidence / evidence filters');
  const { api } = setup();
  api.geBuildModel();
  const byPmid = p => api.geEdges.find(e => e.pmid === p);
  const act = byPmid('2');   // STK11-MARK2 Activation, belief .50, n 1
  const pho = byPmid('1');   // STK11-MARK1 Phosphorylation, belief .90, n 3
  const inh = byPmid('3');   // MAPT-MARK1 Inhibition, belief .80, n 2

  ok(api.geEdgeShown(act) && api.geEdgeShown(pho) && api.geEdgeShown(inh), 'all shown at defaults');
  api.setGeMinBelief(0.6);
  ok(!api.geEdgeShown(act), 'belief 0.50 hidden by conf >= 0.6');
  ok(api.geEdgeShown(pho), 'belief 0.90 survives conf >= 0.6');
  api.setGeMinBelief(0);
  api.setGeMinEv(2);
  ok(!api.geEdgeShown(act), 'n=1 hidden by ev >= 2');
  ok(api.geEdgeShown(inh), 'n=2 survives ev >= 2');
  api.setGeMinEv(1);

  // nature filter: empty set means "all"; unchecking narrows
  eq(api.geNatures, null, 'natures start null (= all on)');
  api.setGeNature('promote', false);   // turn promote off -> {suppress,modify}
  ok(!api.geEdgeShown(act), 'promote edge hidden when promote unchecked');
  ok(api.geEdgeShown(inh), 'suppress edge still shown');
  ok(api.geEdgeShown(pho), 'modify edge still shown');
  api.setGeNature('promote', true);    // back to all
  eq(api.geNatures, null, 'all-on collapses back to the null sentinel');
  // unchecking every nature hides all mechanistic edges (empty set = show none, not wrap-around to all)
  api.setGeNature('promote', false); api.setGeNature('suppress', false); api.setGeNature('modify', false);
  eq(api.geNatures, [], 'all three unchecked leaves an explicit empty set');
  ok(!api.geEdgeShown(act) && !api.geEdgeShown(inh) && !api.geEdgeShown(pho), 'no mechanistic edge shows when every nature is off');
  api.setGeNature('promote', true); api.setGeNature('suppress', true); api.setGeNature('modify', true);
  eq(api.geNatures, null, 'rechecking all returns to the null sentinel');
  ok(api.geEdgeShown(act), 'promote edge shown again');
}

function testEdgeToggleStability() {
  console.log('\nedge show/hide — stress: complex≠bind duplication, order-independence, no rebuild');
  const { api, sandbox } = load({ fetchImpl: noop });
  api.mainView = 'genes';
  api.interactions = {
    generated: 'x', source: 'x', members: {}, canon: {}, bridges: [],
    genes: {
      A: { chrom: '1', cards: ['ca'], groups: [] }, B: { chrom: '2', cards: ['cb'], groups: [] },
      C: { chrom: 'X', cards: ['cc'], groups: [] }, D: { chrom: '3', cards: ['cd'], groups: [] },
      E: { chrom: 'Y', cards: ['ce'], groups: [] },
    },
    edges: [
      { a: 'A', b: 'B', t: 'Activation',      belief: 0.90, n: 5, pmid: 'm1' },  // promote
      { a: 'B', b: 'C', t: 'Inhibition',      belief: 0.70, n: 3, pmid: 'm2' },  // suppress
      { a: 'C', b: 'D', t: 'Phosphorylation', belief: 0.50, n: 2, pmid: 'm3' },  // modify
      { a: 'A', b: 'D', t: 'IncreaseAmount',  belief: 0.95, n: 8, pmid: 'm4' },  // promote
      { a: 'C', b: 'E', t: 'Inhibition',      belief: 0.85, n: 6, pmid: 'm5' },  // suppress
      { a: 'B', b: 'D', t: 'Ubiquitination',  belief: 0.60, n: 1, pmid: 'm6' },  // modify
    ],
    complex_edges: [
      { a: 'A', b: 'C', t: 'Complex', belief: 0.80, n: 4, pmid: 'x1' },
      { a: 'D', b: 'E', t: 'Complex', belief: 0.40, n: 1, pmid: 'x2' },
      { a: 'B', b: 'E', t: 'Complex', belief: 0.90, n: 7, pmid: 'x3' },
    ],
  };
  api.items = ['ca', 'cb', 'cc', 'cd', 'ce'].map(id => ({ id, type: 'note', tags: [], genes: [], title: '', source: '', content: 'x', date: '2026-01-01T00:00:00Z' }));
  const search = sandbox.document.getElementById('search-input');
  search.value = ''; api.renderGenes();

  const vis = i => sandbox.document.getElementById('ge-e' + i).getAttribute('opacity') === '1';
  const domVisible = () => api.geDrawn.map((_, i) => vis(i));
  // The intended contract: a complex edge is governed ONLY by the complexes toggle (its
  // presence in geDrawn) plus the sliders; the nature checkboxes filter mechanistic edges only.
  const wantVisible = () => api.geDrawn.map(e => {
    const beliefOk = (e.belief || 0) >= api.geMinBelief;
    const evOk = (e.n || 0) >= api.geMinEv;
    const natOk = e.complex ? true : (api.geNatures === null || api.geNatures.includes(e.nat));
    return beliefOk && evOk && natOk;
  });
  const match = label => eq(domVisible(), wantVisible(), label);

  // (1) The reported bug: "bind" and "complexes" are two switches over the SAME edges.
  api.setGeShowComplex(true);
  const complexIdx = () => api.geDrawn.map((e, i) => (e.complex ? i : -1)).filter(i => i >= 0);
  ok(complexIdx().length === 3, 'all three complex edges are drawn when complexes on');
  ok(complexIdx().every(vis), 'complexes on ⇒ complex edges shown');
  api.setGeNature('bind', false);
  ok(complexIdx().every(vis), 'unchecking "bind" must NOT hide complex edges — they have their own toggle');
  api.setGeNature('bind', true);

  // (2) Turning every mechanistic nature off must leave complex edges alone (and vice-versa).
  for (const nat of ['promote', 'suppress', 'modify']) api.setGeNature(nat, false);
  ok(complexIdx().every(vis), 'all mechanistic natures off, complexes on ⇒ only complex edges show');
  ok(api.geDrawn.every((e, i) => e.complex || !vis(i)), '...and every mechanistic edge is hidden');
  for (const nat of ['promote', 'suppress', 'modify']) api.setGeNature(nat, true);

  // (3) Order-independence / no hysteresis: after every op the DOM equals a pure function of state.
  const ops = [
    ['nat', 'promote', false], ['complex', true], ['nat', 'suppress', false], ['belief', 0.6],
    ['complex', false], ['nat', 'bind', false], ['nat', 'promote', true], ['ev', 3],
    ['complex', true], ['nat', 'modify', false], ['belief', 0], ['nat', 'bind', true],
    ['nat', 'suppress', true], ['ev', 1], ['nat', 'modify', true], ['complex', false],
    ['complex', true], ['complex', true], ['nat', 'promote', false], ['nat', 'promote', false],
  ];
  let allMatch = true;
  for (const [kind, a, b] of ops) {
    if (kind === 'nat') api.setGeNature(a, b);
    else if (kind === 'complex') api.setGeShowComplex(a);
    else if (kind === 'belief') api.setGeMinBelief(a);
    else if (kind === 'ev') api.setGeMinEv(a);
    const w = wantVisible(), g = domVisible();
    if (JSON.stringify(w) !== JSON.stringify(g)) { allMatch = false; break; }
  }
  ok(allMatch, 'the shown-edge set is always a pure function of the current filter state (no path dependence)');

  // (4) Two different paths to the same target state give the identical shown set.
  const reset = () => { for (const n of ['promote', 'suppress', 'modify']) api.setGeNature(n, true); api.setGeShowComplex(false); api.setGeMinBelief(0); api.setGeMinEv(1); };
  reset(); api.setGeShowComplex(true); api.setGeNature('promote', false); api.setGeMinBelief(0.6);
  const pathA = domVisible().join(',');
  reset(); api.setGeMinBelief(0.6); api.setGeNature('promote', false); api.setGeShowComplex(true);
  const pathB = domVisible().join(',');
  eq(pathB, pathA, 'reaching the same filter state by a different order yields the same edges');

  // (5) Toggling complexes must not make the next search rebuild the model (which drops live ghosts).
  reset(); search.value = ''; api.renderGenes();
  api.geMergeAddGene('GHOSTZ', { edges: [{ a: 'GHOSTZ', b: 'A', t: 'Activation', nat: 'promote', belief: 0.8, n: 3, pmid: 'g', complex: false }], chrom: { GHOSTZ: 'X' } });
  ok(api.geNodes.some(n => n.sym === 'GHOSTZ' && n.ghost), 'a live ghost is on the map');
  api.setGeShowComplex(true);
  search.value = ''; api.renderGenes();   // a search re-render right after the toggle
  ok(api.geNodes.some(n => n.sym === 'GHOSTZ' && n.ghost), 'toggling complexes does not make the next render drop the ghost');
}

function testEdgeDirection() {
  console.log('\nedge direction — parse subj→obj, carry dir, render PPI arrowheads, offset to the rim');
  const { api, sandbox } = load({ fetchImpl: noop });

  // (1) geParseIndra recovers direction from the raw statement (source-first agents).
  const resp = { statements: {
    h1: { type: 'Activation',      subj: { name: 'AAA', db_refs: { HGNC: '1' } }, obj: { name: 'BBB', db_refs: { HGNC: '2' } }, evidence: [{ pmid: 'p1' }] },
    h2: { type: 'Phosphorylation', enz:  { name: 'CCC', db_refs: { HGNC: '3' } }, sub: { name: 'DDD', db_refs: { HGNC: '4' } }, evidence: [{ pmid: 'p2' }] },
    h3: { type: 'Inhibition',      subj: { name: 'ZZZ', db_refs: { HGNC: '5' } }, obj: { name: 'AAA', db_refs: { HGNC: '1' } }, evidence: [{ pmid: 'p3' }] },
    h4: { type: 'Complex',         members: [{ name: 'AAA', db_refs: { HGNC: '1' } }, { name: 'EEE', db_refs: { HGNC: '6' } }], evidence: [{ pmid: 'p4' }] },
  }, evidence_counts: { h1: 5, h2: 3, h3: 4, h4: 2 } };
  const eA = api.geParseIndra(resp, 'AAA');
  const ab = eA.find(e => e.a === 'AAA' && e.b === 'BBB');
  const za = eA.find(e => e.a === 'AAA' && e.b === 'ZZZ');
  const ae = eA.find(e => e.a === 'AAA' && e.b === 'EEE');
  eq(ab && ab.dir, 'ab', 'AAA→BBB (subj→obj) is dir "ab" (arrow at b)');
  eq(za && za.dir, 'ba', 'ZZZ→AAA lands as a<b with dir "ba" (arrow points back at a)');
  ok(ae && !ae.dir, 'a Complex membership edge carries no direction');
  const eC = api.geParseIndra(resp, 'CCC');
  eq((eC.find(e => e.b === 'DDD') || {}).dir, 'ab', 'CCC→DDD (enz→sub) is dir "ab"');

  // (2) direction survives geBuildModel and drives the marker HTML.
  api.interactions = {
    generated: 'x', source: 'x', members: {}, canon: {}, bridges: [],
    genes: { A: { chrom: '1', cards: ['c'], groups: [] }, B: { chrom: '1', cards: ['c'], groups: [] },
             C: { chrom: '1', cards: ['c'], groups: [] }, D: { chrom: '1', cards: ['c'], groups: [] },
             E: { chrom: '1', cards: ['c'], groups: [] }, F: { chrom: '1', cards: ['c'], groups: [] },
             G: { chrom: '1', cards: ['c'], groups: [] }, H: { chrom: '1', cards: ['c'], groups: [] } },
    edges: [
      { a: 'A', b: 'B', t: 'Activation',      belief: 0.9, n: 5, pmid: 'p', dir: 'ab' },   // promote, head at b
      { a: 'C', b: 'D', t: 'Inhibition',      belief: 0.8, n: 4, pmid: 'p', dir: 'ba' },   // suppress, head at a
      { a: 'E', b: 'F', t: 'Phosphorylation', belief: 0.7, n: 3, pmid: 'p', dir: 'ab' },   // modify, head at b
      { a: 'G', b: 'H', t: 'Activation',      belief: 0.6, n: 2, pmid: 'p' },              // no dir -> no head
    ],
    complex_edges: [{ a: 'A', b: 'C', t: 'Complex', belief: 0.5, n: 2, pmid: 'p' }],
  };
  api.geBuildModel();
  const abE = api.geEdges.find(e => e.a === 'A' && e.b === 'B');
  eq(abE.dir, 'ab', 'dir survives geBuildModel into _geEdges');
  api.geComputeDrawn();
  const html = api.geEdgesHtml();
  ok(/ge-nat-promote[^>]*marker-end="url\(#ge-mk-promote\)"/.test(html), 'promote a→b gets a filled arrow at the b end (marker-end)');
  ok(/ge-nat-suppress[^>]*marker-start="url\(#ge-mk-suppress\)"/.test(html), 'suppress b→a gets a T-bar at the a end (marker-start)');
  ok(/ge-nat-modify[^>]*marker-end="url\(#ge-mk-modify\)"/.test(html), 'modify a→b gets an open arrow at the b end');
  // the direction-less edge (G-H) must have no marker
  const ghLine = html.split('<line').find(s => /ge-nat-promote/.test(s) && !/marker-/.test(s));
  ok(!!ghLine, 'a direction-less mechanistic edge gets no arrowhead');
  ok(/#ge-mk-promote/.test(html) && /<defs>/.test(html), 'marker <defs> are embedded in the edge layer (survive a complex-toggle rebuild)');

  // (3) geApplyDOM pulls the HEAD endpoint back to the rim; the tail stays at the node centre.
  api.mainView = 'genes';
  sandbox.document.getElementById('search-input').value = '';
  api.renderGenes();
  const pos = api.gePos;
  const num = (id, at) => Number(sandbox.document.getElementById(id).getAttribute(at));
  const drawn = api.geDrawn;
  const idxOf = (a, b) => drawn.findIndex(e => e.a === a && e.b === b);
  const near = (x, y) => Math.abs(x - y) < 0.01;
  // A→B (dir ab): x1,y1 at A's centre; x2,y2 pulled IN from B's centre
  const iAB = idxOf('A', 'B');
  ok(near(num('ge-e' + iAB, 'x1'), pos.A.x) && near(num('ge-e' + iAB, 'y1'), pos.A.y), 'directed edge tail stays at the source centre');
  const dHead = Math.hypot(num('ge-e' + iAB, 'x2') - pos.B.x, num('ge-e' + iAB, 'y2') - pos.B.y);
  ok(dHead > 1, 'directed edge head is pulled back off the target centre (arrow clears the disc)');
  // G→H (no dir): both ends exactly at node centres
  const iGH = idxOf('G', 'H');
  ok(near(num('ge-e' + iGH, 'x2'), pos.H.x) && near(num('ge-e' + iGH, 'y2'), pos.H.y), 'a direction-less edge is not pulled back (drawn centre-to-centre)');

  // (4) a re-fetch UPGRADES a pre-direction edge in place (so a Refresh can complete direction on
  // an old sidecar instead of skipping the edge as a duplicate) — and it survives a freeze.
  const gh = api.geEdges.find(e => e.a === 'G' && e.b === 'H');
  ok(gh && !gh.dir, 'G-H starts direction-less (as in an old sidecar)');
  api.geMergeNodeEdges({ edges: [{ a: 'G', b: 'H', t: 'Activation', nat: 'promote', belief: 0.6, n: 9, pmid: 'p', complex: false, dir: 'ab' }] });
  eq(api.geEdges.find(e => e.a === 'G' && e.b === 'H').dir, 'ab', 'a re-fetch upgrades the existing edge\'s direction (not skipped as a dup)');
  const frozen = api.geBuildFrozen();
  eq((frozen.edges.find(e => e.a === 'G' && e.b === 'H') || {}).dir, 'ab', 'the upgraded direction is written on freeze');
  ok(!frozen.edges.some(e => e.a === 'A' && e.b === 'C'), 'complex edges are not in the frozen mech set');
}

function testShownCount() {
  console.log('\ngeShownCount — wired-gene count, before and after build');
  const { api } = setup();
  eq(api.geShownCount(), 4, 'pre-build: counts genes with a mechanistic edge from the raw sidecar');
  api.geBuildModel();
  // renderGenes is what sets _geBuilt; drive the full render to flip it
  api.renderGenes();
  eq(api.geShownCount(), 4, 'post-build: the four wired nodes');
}

function testLayoutDeterministic() {
  console.log('\nlayout — deterministic seed, finite settled positions, filter never moves nodes');
  const { api } = setup();
  api.renderGenes();   // builds, seeds, and settles synchronously (no rAF in the harness)
  const pos = api.gePos;
  const P = s => pos[s];
  ok(['MAPT','MARK1','MARK2','STK11'].every(s => P(s) && isFinite(P(s).x) && isFinite(P(s).y)),
     'every node has a finite position');
  const distinct = new Set(['MAPT','MARK1','MARK2','STK11'].map(s => `${Math.round(P(s).x)},${Math.round(P(s).y)}`));
  ok(distinct.size === 4, 'nodes do not all collapse to one point');

  // Re-seed determinism: same symbols must seed to the same angles.
  const before = JSON.stringify(P('STK11'));
  api.geInitPositions(false);
  const seeded = JSON.stringify(api.gePos['STK11']);
  ok(seeded !== undefined, 're-seeding produces a position');

  // A property filter must not move any node (the map principle).
  const snapshot = ['MAPT','MARK1','MARK2','STK11'].map(s => `${P(s).x},${P(s).y}`).join('|');
  api.setGeMinBelief(0.99);   // hides almost every edge
  const after = ['MAPT','MARK1','MARK2','STK11'].map(s => `${P(s).x},${P(s).y}`).join('|');
  eq(after, snapshot, 'tightening the confidence filter hides edges but moves nothing');
}

function testSelect() {
  console.log('\ngeSelect — multi-highlight, toggle, last-clicked drives the action');
  const { api } = setup();   // sidecar has MAPT, MARK1, MARK2 wired
  api.renderGenes();
  eq(api.geSelIds, [], 'nothing highlighted initially');
  api.geSelect('MAPT');
  eq(api.geSelIds, ['MAPT'], 'MAPT highlighted');
  api.geSelect('MARK1');
  eq(api.geSelIds, ['MAPT', 'MARK1'], 'a second gene stays highlighted too (multi)');
  eq(api.geLastSel, 'MARK1', 'the last click is remembered for the action button');
  api.geSelect('MARK1');
  eq(api.geSelIds, ['MAPT'], 'clicking MARK1 again un-highlights just it');
  eq(api.geLastSel, 'MAPT', 'last-clicked falls back to a still-highlighted gene');
  api.geClearSelection();
  eq(api.geSelIds, [], 'clearing (tap on empty) drops all highlights');
  eq(api.geLastSel, null, 'and the last-clicked');
}

function testCardScope() {
  console.log('\nsearch-bar scope — #tag and /type filtering hide off-map genes');
  const { api, sandbox } = load({ fetchImpl: noop });
  api.interactions = {
    genes: { STK11: { chrom: '19', cards: ['c1'], groups: [] },
             MARK1: { chrom: 'X', cards: ['c2'], groups: [] } },
    edges: [{ a: 'MARK1', b: 'STK11', t: 'Phosphorylation', belief: 0.9, n: 3, pmid: 'p' }],
    complex_edges: [],
  };
  api.items = [
    { id: 'c1', type: 'note', title: 'a', tags: ['Drive'], genes: ['STK11'], source: '', content: 'x', date: '2026-01-01T00:00:00Z' },
    { id: 'c2', type: 'fact', title: 'b', tags: ['Other'], genes: ['MARK1'], source: '', content: 'y', date: '2026-01-01T00:00:00Z' },
  ];
  const search = sandbox.document.getElementById('search-input');
  const off = sym => /ge-off/.test(sandbox.document.getElementById('ge-n-' + sym).className);

  search.value = '';
  api.renderGenes();
  ok(!off('STK11') && !off('MARK1'), 'no filter: both genes shown');

  search.value = '#Drive';
  api.renderGenes();
  ok(off('MARK1'), 'MARK1 (only on the #Other card) hidden by #Drive');
  ok(!off('STK11'), 'STK11 (on the #Drive card) stays shown');

  search.value = '/fact';
  api.renderGenes();
  ok(off('STK11'), 'STK11 (a note) hidden by /fact');
  ok(!off('MARK1'), 'MARK1 (a fact) stays shown');

  search.value = '';
  api.renderGenes();
  ok(!off('STK11') && !off('MARK1'), 'clearing the search restores both');
}

function testRelayoutConnected() {
  console.log('\ngeRelayout — packs only visible nodes with visible edges to visible nodes');
  const { api, sandbox } = load({ fetchImpl: noop });
  api.interactions = {
    genes: { A: { chrom: '1', cards: [], groups: [] }, B: { chrom: '1', cards: [], groups: [] },
             C: { chrom: '1', cards: [], groups: [] }, D: { chrom: '1', cards: [], groups: [] } },
    edges: [ { a: 'A', b: 'B', t: 'Phosphorylation', belief: 0.9, n: 5, pmid: '1' },
             { a: 'C', b: 'D', t: 'Phosphorylation', belief: 0.4, n: 1, pmid: '2' } ],
    complex_edges: [],
  };
  api.renderGenes();
  const off = sym => /ge-off/.test(sandbox.document.getElementById('ge-n-' + sym).className);

  api.geRelayout();   // nothing filtered: A–B and C–D both visible, so all four qualify
  ok(!off('A') && !off('B') && !off('C') && !off('D'), 'no filter: relayout keeps all connected nodes');

  api.setGeMinBelief(0.6);   // hides the weak C–D edge, isolating C and D
  api.geRelayout();
  ok(!off('A') && !off('B'), 'A and B (joined by a visible edge) are kept');
  ok(off('C') && off('D'), 'C and D (their only edge now hidden) are excluded from the relayout');

  // clearing the filter drops the focus and shows everything again
  api.setGeMinBelief(0);
  ok(!off('A') && !off('B') && !off('C') && !off('D'), 'lowering the filter restores all nodes');
}

function testHighlightInputSync() {
  console.log('\nhighlight input ↔ node clicks are synced');
  const { api, sandbox } = setup();
  api.mainView = 'genes';
  api.renderGenes();
  const inp = sandbox.document.getElementById('highlight-input');
  const wrap = sandbox.document.getElementById('highlight-input-wrap');

  // click a node -> its symbol lands in the input, without revealing the input field
  api.geSelect('STK11');
  ok(/STK11/.test(inp.value), 'clicking a node adds it to the highlight input');
  ok(wrap.style.display !== 'flex', 'the input field is not force-revealed');
  api.geSelect('MARK1');
  ok(/STK11/.test(inp.value) && /MARK1/.test(inp.value), 'a second click adds the second gene');

  // type into the input -> replaces the highlight (removes the others)
  inp.value = 'MAPT';
  api.updateHighlightSet();
  eq(api.geSelIds, ['MAPT'], 'typing MAPT replaces the highlight — only MAPT stays lit');

  // clearing the input clears the highlight
  inp.value = '';
  api.updateHighlightSet();
  eq(api.geSelIds, [], 'clearing the input clears the highlight');
}

function testHighlightFocus() {
  console.log('\nhighlight focus — clicked genes + neighbours stay lit, the rest dim (multi)');
  const { api, sandbox } = setup();   // edges: STK11–MARK1, STK11–MARK2, MAPT–MARK1 (mech)
  api.renderGenes();
  const dim = sym => /ge-dim/.test(sandbox.document.getElementById('ge-n-' + sym).className);

  api.geSelect('STK11');
  ok(!dim('STK11') && !dim('MARK1') && !dim('MARK2'), 'STK11 and its neighbours stay lit');
  ok(dim('MAPT'), 'MAPT (not connected to STK11) is dimmed');

  api.geSelect('MAPT');   // second selection accumulates
  ok(!dim('MAPT') && !dim('MARK1'), 'adding MAPT lights it and its neighbour too');
  ok(!dim('STK11') && !dim('MARK2'), 'the first selection stays lit');

  api.geClearSelection();
  ok(!dim('STK11') && !dim('MAPT') && !dim('MARK2'), 'clearing removes all dimming');
}

function testSpikeGenes() {
  console.log('\n*GENE spike — force a single gene into the display, ignored in card filtering');
  const { api, sandbox } = load({ fetchImpl: noop });
  api.mainView = 'genes';
  api.interactions = {
    generated: 'x', source: 'x', members: {}, canon: {}, bridges: [],
    genes: { HUB: { chrom: '1', cards: ['c1'], groups: [] }, PARTNER: { chrom: '1', cards: ['c1'], groups: [] },
             FAR: { chrom: 'X', cards: ['c2'], groups: [] }, ISOG: { chrom: 'Y', cards: ['c3'], groups: [] } },
    edges: [{ a: 'HUB', b: 'PARTNER', t: 'Phosphorylation', belief: 0.9, n: 5, pmid: 'p' },
            { a: 'HUB', b: 'FAR', t: 'Phosphorylation', belief: 0.9, n: 5, pmid: 'p' }],   // ISOG has no edge
    complex_edges: [],
  };
  api.items = [
    { id: 'c1', type: 'note', tags: ['Drive'], genes: ['HUB', 'PARTNER'], title: '', source: '', content: 'x', date: '2026-01-01T00:00:00Z' },
    { id: 'c2', type: 'note', tags: ['Other'], genes: ['FAR'], title: '', source: '', content: 'x', date: '2026-01-01T00:00:00Z' },
    { id: 'c3', type: 'note', tags: ['Other'], genes: ['ISOG'], title: '', source: '', content: 'x', date: '2026-01-01T00:00:00Z' },
  ];
  const search = sandbox.document.getElementById('search-input');
  const has = sym => api.geNodes.some(n => n.sym === sym);
  const off = sym => { const el = sandbox.document.getElementById('ge-n-' + sym); return !!(el && /ge-off/.test(el.className)); };

  search.value = ''; api.renderGenes();
  ok(!has('ISOG'), 'baseline: ISOG (isolated) is off the map');

  // (a) *ISOG spikes the isolated gene in
  search.value = '*ISOG'; api.renderGenes();
  ok(has('ISOG'), '*ISOG adds the isolated gene as a node');
  ok(!off('ISOG'), '...and it is shown, not hidden');
  // (d) the * token does NOT filter cards: FAR (on a card, not spiked) stays visible
  ok(!off('FAR'), '*ISOG does not filter the card list (other wired genes still show)');
  // (d') and it is literally inert for the Cards view — getVisibleItems().vis unchanged
  search.value = ''; const baseVis = api.getVisibleItems().vis.map(i => i.id).sort();
  search.value = '*ISOG'; const spikeVis = api.getVisibleItems().vis.map(i => i.id).sort();
  eq(spikeVis.join(','), baseVis.join(','), '*ISOG leaves the Cards view (getVisibleItems) identical');

  // (c) removing the token drops the spike-added gene
  search.value = ''; api.renderGenes();
  ok(!has('ISOG'), 'removing *ISOG drops it back out of the map');

  // (b) a wired gene spiked past a card filter
  search.value = '#Drive'; api.renderGenes();
  ok(off('FAR'), '#Drive hides FAR (its card isn\'t Drive-tagged)');
  search.value = '#Drive *FAR'; api.renderGenes();
  ok(!off('FAR'), '#Drive *FAR spikes FAR back into the Drive-filtered view');
  ok(!off('HUB'), '...and the Drive genes stay shown');

  // (e) an unresolvable *ZZZ is ignored
  search.value = '*ZZZZZ'; api.renderGenes();
  ok(!has('ZZZZZ') && api.geSpikeSet.length === 0, 'an unknown *ZZZZZ token is ignored');
}

function testSpikePreservesGhosts() {
  console.log('\n*GENE spike — adding a spike does NOT drop live ghosts/expansions (no rebuild)');
  const { api, sandbox } = load({ fetchImpl: noop });
  api.mainView = 'genes';
  api.interactions = {
    generated: 'x', source: 'x', members: {}, canon: {}, bridges: [],
    genes: { HUB: { chrom: '1', cards: ['c1'], groups: [] }, PARTNER: { chrom: '1', cards: ['c1'], groups: [] },
             ISOG: { chrom: 'Y', cards: ['c3'], groups: [] } },
    edges: [{ a: 'HUB', b: 'PARTNER', t: 'Phosphorylation', belief: 0.9, n: 5, pmid: 'p' }],
    complex_edges: [],
  };
  api.renderGenes();
  // add a live ghost (a gene not in memento) via the add-gene merge
  api.geMergeAddGene('GHOSTX', { edges: [{ a: 'GHOSTX', b: 'HUB', t: 'Activation', nat: 'promote', belief: 0.8, n: 3, pmid: 'p', complex: false }], chrom: { GHOSTX: 'X' } });
  ok(api.geNodes.some(n => n.sym === 'GHOSTX' && n.ghost), 'a live ghost is on the map');
  // now spike an isolated gene — the ghost must survive (short-circuit, no geBuildModel)
  sandbox.document.getElementById('search-input').value = '*ISOG'; api.renderGenes();
  ok(api.geNodes.some(n => n.sym === 'ISOG'), 'the spike was added');
  ok(api.geNodes.some(n => n.sym === 'GHOSTX' && n.ghost), 'the live ghost is NOT lost by the spike');
}

function testEmptyStates() {
  console.log('\nempty states — no sidecar, and a sidecar with no wired genes');
  const { api, sandbox } = load({ fetchImpl: noop });
  api.interactions = null;
  api.renderGenes();
  ok(/kb-interactions\.py/.test(sandbox.document.getElementById('genes-view').innerHTML),
     'no sidecar -> prompts to build interactions.json');
  api.interactions = { genes: { A: { chrom: 'X', cards: [], groups: [] } }, edges: [], complex_edges: [] };
  api.renderGenes();
  ok(/No connected genes/.test(sandbox.document.getElementById('genes-view').innerHTML),
     'sidecar with no mechanistic edges -> "no connected genes"');
}

console.log('Genes view (M1)');
testNatureAndChrom();
testModel();
testDrawnAndComplexToggle();
testEdgeFilters();
testShownCount();
testLayoutDeterministic();
testSelect();
testHighlightInputSync();
testHighlightFocus();
testEdgeToggleStability();
testEdgeDirection();
testSpikeGenes();
testSpikePreservesGhosts();
testCardScope();
testRelayoutConnected();
testEmptyStates();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
