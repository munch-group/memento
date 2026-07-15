// The graph view. The load-bearing claims here are about what the graph is MADE of, because the
// design's premises don't hold against this knowledge base:
//
//   * The design clusters by shared tags. Only ~23% of these cards have a tag — but they have
//     genes. So tags AND genes attract, weighted by rarity: sharing "SMBE26" with 33 other cards
//     says almost nothing, sharing a gene with two says a lot.
//   * The design draws a connection card as a LABEL ON AN EDGE between the two cards it links.
//     Half of the real ones link only one card. So a connection card is a NODE here — which is why
//     a card with no tags and no genes still has to appear if something links it.
//   * A card with no tag, no gene and no link is left out entirely: nothing would position it.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

const noop = async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });
const card = (id, extra = {}) =>
  ({ id, type: 'note', title: id, tags: [], genes: [], source: '', content: 'body of ' + id,
     date: '2026-07-14T00:00:00Z', ...extra });
const ref = id => `[[${id}|some title]]`;

function setup(itemsList) {
  const { api, sandbox } = load({ fetchImpl: noop });
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  api.items = itemsList || [];
  sandbox.window._kbInbox = '';
  sandbox.window._kbDigest = null;
  return { api, sandbox, el: id => sandbox.document.getElementById(id) };
}
const ids = ns => ns.map(n => n.id).sort();

// ---------------------------------------------------------------------------------------------
console.log('\nLinks are the [[refs]] in a card\'s source — the syntax insertCardRef() writes');
{
  const { api } = setup();
  eq(api.grRefs({ source: `${ref('a')} ${ref('b')}` }), ['a', 'b'], 'both refs are found');
  eq(api.grRefs({ source: '[[bare]]' }), ['bare'], 'the title-less [[id]] form works too');
  eq(api.grRefs({ source: 'no refs here' }), [], 'plain text yields none');
  eq(api.grRefs({ source: '' }), [], 'an empty source yields none');
  eq(api.grRefs({ content: `${ref('a')}` }), [], 'refs in the BODY are not links — the app only writes them to source');
  // The regex is a module-level literal with /g; a stale lastIndex would make every other call fail.
  const e = { source: ref('x') };
  eq([api.grRefs(e), api.grRefs(e), api.grRefs(e)], [['x'], ['x'], ['x']], 'repeated calls give the same answer (no sticky regex state)');
}

console.log('\nWhat gets to be a node');
{
  const { api } = setup([
    card('tagged', { tags: ['drive'] }),
    card('genic', { genes: ['ARHGAP5'] }),
    card('bare'),                                        // nothing to place it by
    card('conn', { source: ref('target') }),             // a connection card: no tags, no genes
    card('target'),                                      // linked, but otherwise bare
    card('archived', { tags: ['drive'], archived: true }),
    card('_priorities', { tags: ['drive'] }),
  ]);
  eq(ids(api.grNodes()), ['conn', 'genic', 'tagged', 'target'], 'a tag, a gene, or a link earns a node');
  eq(api.grNodes().some(n => n.id === 'bare'), false, 'a card with no tag, gene or link is left out — nothing would place it');
  eq(api.grNodes().some(n => n.id === 'archived'), false, 'archived cards stay out');
  eq(api.grNodes().some(n => n.id === '_priorities'), false, '...and so do the dashboard-only special cards');

  // This is the whole reason a link endpoint counts: drop it and the connection card's edge dies
  // with it, which is exactly what the design's edge-label model could not express.
  eq(api.grNodes().some(n => n.id === 'conn'), true, 'a connection card with NO tags and NO genes still appears...');
  eq(api.grNodes().some(n => n.id === 'target'), true, '...and so does the bare card it links');
  eq(api.grIsConn(api.items.find(i => i.id === 'conn')), true, 'and it is marked as a connection, so it renders as an accent pill');
}

console.log('\nEdges: one per valid ref, and no phantoms');
{
  const { api } = setup([
    card('a', { tags: ['x'] }),
    card('b', { tags: ['x'] }),
    card('two', { source: `${ref('a')} ${ref('b')}` }),      // the design's case: links two cards
    card('one', { source: ref('a') }),                        // links only one — half of the real ones
    card('three', { source: `${ref('a')} ${ref('b')} ${ref('one')}` }),
    card('dangling', { source: ref('deleted-card') }),        // its target is gone
    card('selfref', { tags: ['x'], source: ref('selfref') }),
  ]);
  const nodes = api.grNodes();
  const edges = api.grEdges(nodes).map(e => [e.a, e.b].join('->')).sort();
  eq(edges, ['one->a', 'three->a', 'three->b', 'three->one', 'two->a', 'two->b'].sort(),
     'every ref to a card that is present becomes an edge — one, two, or three of them');
  eq(edges.some(e => e.includes('deleted-card')), false, 'a ref to a card that no longer exists draws no edge');
  eq(edges.some(e => e === 'selfref->selfref'), false, 'a card cannot link to itself');
  // A dangling-only card has no tags, no genes and no live link, so it is not a node either.
  eq(nodes.some(n => n.id === 'dangling'), false, 'a card whose only ref is dangling drops out of the graph');
}

console.log('\nAttraction: rare terms pull harder than common ones');
{
  // 6 cards share the common tag; 2 share the rare gene. If both pulled equally, the two would be
  // no closer than any pair in the crowd — and the clusters would mean nothing.
  const common = Array.from({ length: 6 }, (_, i) => card('c' + i, { tags: ['SMBE26'] }));
  const { api } = setup([
    ...common,
    card('r1', { genes: ['ARHGAP5'] }),
    card('r2', { genes: ['ARHGAP5'] }),
  ]);
  const nodes = api.grNodes();
  const pairs = api.grPairs(nodes);
  const find = (a, b) => pairs.find(p => (p.a === a && p.b === b) || (p.a === b && p.b === a));
  const rare = find('r1', 'r2'), crowd = find('c0', 'c1');
  eq(!!rare && !!crowd, true, 'both pairs attract');
  eq(rare.w > crowd.w, true, `a gene shared by 2 pulls harder than a tag shared by 6 (${rare.w.toFixed(2)} vs ${crowd.w.toFixed(2)})`);
  eq(pairs.some(p => p.a === 'c0' && p.b === 'r1'), false, 'cards sharing nothing do not attract at all');
}

console.log('\nGenes: an alias bundle counts as each of its aliases');
{
  // Genes are stored as "RLIM/RNF12" — one token, two names. A card naming only RNF12 shares it.
  const { api } = setup([
    card('a', { genes: ['RLIM/RNF12'] }),
    card('b', { genes: ['RNF12'] }),
    card('c', { genes: ['SMC1B'] }),
  ]);
  const pairs = api.grPairs(api.grNodes());
  eq(pairs.some(p => [p.a, p.b].sort().join() === 'a,b'), true, 'RLIM/RNF12 and RNF12 are the same gene, so they attract');
  eq(pairs.some(p => [p.a, p.b].includes('c') && p.a !== p.b && [p.a, p.b].sort().join() !== 'a,b'), false,
     'a card with an unrelated gene attracts nobody');
}

console.log('\nThe layout actually clusters what shares something');
{
  // The real test of a force layout: cards that share a gene must end up nearer each other than
  // cards that share nothing. Everything else here is bookkeeping.
  const { api } = setup([
    card('x1', { genes: ['GENEX'] }), card('x2', { genes: ['GENEX'] }), card('x3', { genes: ['GENEX'] }),
    card('y1', { genes: ['GENEY'] }), card('y2', { genes: ['GENEY'] }), card('y3', { genes: ['GENEY'] }),
  ]);
  api.setView('graph');                      // renders and (with no rAF in the sandbox) solves it
  const P = api.grPos;
  const d = (a, b) => Math.hypot(P[a].x - P[b].x, P[a].y - P[b].y);
  const mean = xs => xs.reduce((s, v) => s + v, 0) / xs.length;
  const within = mean([d('x1', 'x2'), d('x1', 'x3'), d('x2', 'x3'), d('y1', 'y2'), d('y1', 'y3'), d('y2', 'y3')]);
  const across = mean([d('x1', 'y1'), d('x1', 'y2'), d('x2', 'y3'), d('x3', 'y1'), d('x3', 'y2')]);
  eq(within < across, true, `cards sharing a gene settle closer than cards sharing nothing (${within.toFixed(0)}px vs ${across.toFixed(0)}px)`);
  eq(Object.keys(P).length, 6, 'every node got a position');
  eq(Object.values(P).every(p => isFinite(p.x) && isFinite(p.y)), true, '...and none of them blew up to NaN or Infinity');
}

console.log('\nPills do not end up sitting on top of one another');
{
  // This is the thing that decides whether the view is a map or a hairball. A card in the core has
  // ~20 springs pulling it inward against a single 1/d² push holding it off, so attraction wins and
  // the middle collapses into a solid block of overlapping pills. Repulsion tuning cannot fix that;
  // a hard collision constraint can. On the real knowledge base it took overlapping pairs from 294
  // to 35 out of 18,915.
  const many = Array.from({ length: 24 }, (_, i) =>
    card('n' + i, { genes: ['SHARED'], title: 'A card with a fairly long title ' + i }));
  const { api } = setup(many);
  api.setView('graph');
  const P = api.grPos, N = api.grNodes();
  let clash = 0;
  for (let i = 0; i < N.length; i++) {
    for (let j = i + 1; j < N.length; j++) {
      const a = P[N[i].id], b = P[N[j].id];
      if (Math.abs(a.x - b.x) < 170 && Math.abs(a.y - b.y) < 26) clash++;   // inside the pill boxes
    }
  }
  eq(clash, 0, '24 cards all pulled together by one shared gene still land clear of each other');
}

console.log('\nThe layout space grows with the graph');
{
  // 200 cards crammed into one viewport is a hairball whatever the forces do. They get room, and
  // you pan and zoom over them instead.
  const small = setup([card('a', { tags: ['x'] }), card('b', { tags: ['x'] })]);
  small.api.setView('graph');
  const sw = small.api.grW;

  const big = setup(Array.from({ length: 60 }, (_, i) => card('n' + i, { tags: ['x'] })));
  big.api.setView('graph');
  eq(big.api.grW > sw, true, `60 cards get a wider layout space than 2 (${big.api.grW}px vs ${sw}px)`);
}

console.log('\nThe same knowledge base lays out the same way twice');
{
  // Math.random() in the seed positions would reshuffle the whole picture on every re-render — and
  // a re-render happens on every edit, every keystroke in the search box.
  const mk = () => {
    const { api } = setup([
      card('a', { genes: ['G1'] }), card('b', { genes: ['G1'] }), card('c', { tags: ['t'] }), card('d', { tags: ['t'] }),
    ]);
    api.setView('graph');
    return JSON.stringify(api.grPos);
  };
  eq(mk(), mk(), 'two identical knowledge bases produce identical layouts');
}

console.log('\nFiltering HIDES nodes — it never moves them');
{
  // The graph is a map. A map that redraws itself every time you search is not a map: you would
  // lose the very thing you had just learned where to find. So the node set — and every position in
  // it — is independent of the search bar and the facets.
  const { api, el, sandbox } = setup([
    card('a', { tags: ['drive'], title: 'Meiotic drive' }),
    card('b', { tags: ['drive'], title: 'Drive candidates' }),
    card('c', { tags: ['admin'], title: 'Funding' }),
    card('d', { tags: ['admin'], title: 'Grant' }),
  ]);
  api.setView('graph');
  const before = JSON.stringify(api.grPos);
  const off = id => sandbox.document.getElementById('gr-n-' + id).classList.contains('gr-off');

  eq(ids(api.grNodes()), ['a', 'b', 'c', 'd'], 'every qualifying card is a node');
  eq([off('a'), off('c')], [false, false], 'unfiltered, none is hidden');

  el('search-input').value = '#drive';
  api.renderList();                       // exactly what a keystroke in the search box does
  eq(ids(api.grNodes()), ['a', 'b', 'c', 'd'], 'a #tag search does NOT remove the other nodes...');
  eq([off('a'), off('b'), off('c'), off('d')], [false, false, true, true], '...it hides them');
  eq(api.grShownCount(), 2, 'and the title counts what you can actually see');
  eq(JSON.stringify(api.grPos), before, 'NOTHING moved — every node is exactly where it was');

  api.setFilter('note');                  // a sidebar Type facet: same rule
  api.renderList();
  eq(JSON.stringify(api.grPos), before, 'a Type facet does not reposition anything either');

  el('search-input').value = '';
  api.renderList();
  eq([off('a'), off('c')], [false, false], 'clearing the search brings them straight back...');
  eq(JSON.stringify(api.grPos), before, '...to exactly where they were, so you are not lost');
}

console.log('\nAn edge goes when either end of it goes');
{
  // A line hanging off into empty space, pointing at a card that is no longer drawn, is worse than
  // no line at all.
  const { api, el, sandbox } = setup([
    card('a', { tags: ['drive'] }),
    card('b', { tags: ['admin'] }),
    card('link', { tags: ['drive'], source: `${ref('a')} ${ref('b')}` }),
  ]);
  api.setView('graph');
  const edges = api.grEdges(api.grNodes());
  const opacity = i => sandbox.document.getElementById('gr-e' + i).getAttribute('opacity');
  eq(edges.length, 2, 'the connection card draws two edges');
  eq([opacity(0), opacity(1)], ['1', '1'], 'unfiltered, both are drawn');

  el('search-input').value = '#drive';       // hides 'b', which is one end of the second edge
  api.renderList();
  const toB = edges.findIndex(e => e.a === 'b' || e.b === 'b');
  const toA = edges.findIndex(e => e.a === 'a' || e.b === 'a');
  eq(opacity(toB), '0', 'the edge to the hidden card is not drawn...');
  eq(opacity(toA), '1', '...and the one between two visible cards still is');
}

console.log('\nDragging a card does not set the whole map swimming');
{
  // The rest of the graph holds still. Only cards that would end up UNDERNEATH the one you dragged
  // give way, and only by as much as it takes.
  const { api } = setup([
    card('a', { genes: ['G1'] }), card('b', { genes: ['G1'] }), card('c', { genes: ['G1'] }),
    card('x', { genes: ['G2'] }), card('y', { genes: ['G2'] }), card('z', { genes: ['G2'] }),
  ]);
  api.setView('graph');
  const P = api.grPos;
  const snap = JSON.parse(JSON.stringify(P));
  const moved = id => Math.hypot(P[id].x - snap[id].x, P[id].y - snap[id].y);

  // Drop 'a' into open space, well clear of everything else.
  api.grMoveNode('a', api.grW - 100, 30);
  eq(Math.round(moved('a')) > 0, true, 'the card you dragged goes where you put it');
  const others = ['b', 'c', 'x', 'y', 'z'].map(moved);
  eq(others.every(d => d < 0.001), true, `nothing else budges (max ${Math.max(...others).toFixed(3)}px)`);

  // Now drop it right on top of 'z'. That one — and only that one — has to give way.
  const before = JSON.parse(JSON.stringify(P));
  api.grMoveNode('a', before.z.x, before.z.y);
  const nudged = ['b', 'c', 'x', 'y', 'z'].filter(id => Math.hypot(P[id].x - before[id].x, P[id].y - before[id].y) > 1);
  eq(nudged.includes('z'), true, 'a card you drop onto DOES move out from under you');
  eq(nudged.length <= 2, true, `and it does not cascade across the graph (${nudged.length} node(s) moved)`);
}

console.log('\nBarging a card through a cloud leaves the cloud as it was');
{
  // The cards you shove past are on springs back to where they belong. Without that, the collision
  // constraint alone would leave a wake of permanently scattered cards behind every drag — you
  // could not move anything across the graph without wrecking the map on the way.
  const { api } = setup([
    card('drag', { genes: ['G0'], title: 'The one being dragged' }),
    ...Array.from({ length: 9 }, (_, i) => card('c' + i, { genes: ['CLOUD'], title: 'Cloud card ' + i })),
  ]);
  api.setView('graph');
  const P = api.grPos;
  const home = JSON.parse(JSON.stringify(P));
  const cloud = Array.from({ length: 9 }, (_, i) => 'c' + i);
  const drift = () => cloud.map(id => Math.hypot(P[id].x - home[id].x, P[id].y - home[id].y));

  // Walk it right over each card of the cloud in turn, as a real drag through them would.
  let shoved = 0, worstShove = 0;
  for (const id of cloud) {
    api.grMoveNode('drag', home[id].x, home[id].y);          // land squarely on top of this one
    const d = Math.hypot(P[id].x - home[id].x, P[id].y - home[id].y);
    worstShove = Math.max(worstShove, d);
    if (d > 20) shoved++;
  }
  eq(shoved, 9, `each card it lands on gets out of the way while it is there (${shoved} of 9)`);
  // And no further. A pill is 30px tall and 190px wide, so resolving the overlap sideways would
  // both cost 6x more AND — being the direction you drag — plough the card along in front of you
  // across the whole map. It steps aside vertically instead.
  eq(worstShove < 70, true, `...by a single step aside, not ploughed along (worst ${worstShove.toFixed(0)}px)`);

  // Now take it back out to open space. The cloud must close up behind it.
  api.grMoveNode('drag', api.grW - 110, 40);
  const after = drift();
  eq(Math.max(...after) < 3, true,
     `once it has passed, every card is back where it belongs (worst drift ${Math.max(...after).toFixed(2)}px)`);
}

console.log('\nLink: Tags · Genes · Both decides what the map is built out of');
{
  // A tag is a topic you chose; a gene is a fact about the card. They say different things, so which
  // of them the map is built from is a question only you can answer.
  const mk = () => setup([
    card('t1', { tags: ['drive'] }),                    // tags only
    card('t2', { tags: ['drive'] }),
    card('g1', { genes: ['ARHGAP5'] }),                 // genes only
    card('g2', { genes: ['ARHGAP5'] }),
    card('tg', { tags: ['drive'], genes: ['ARHGAP5'] }),
  ]);
  const pairOf = (api, a, b) => api.grPairs(api.grNodes()).some(p => [p.a, p.b].sort().join() === [a, b].sort().join());

  const both = mk().api;
  both.setView('graph');
  eq(both.grLinkBy, 'both', 'Both is the default');
  eq(ids(both.grNodes()), ['g1', 'g2', 't1', 't2', 'tg'], 'Both  → every card with a tag OR a gene is on the map');
  eq([pairOf(both, 't1', 't2'), pairOf(both, 'g1', 'g2')], [true, true], '...and both kinds of sharing link cards');

  const tags = mk().api;
  tags.setView('graph');
  tags.setGrLinkBy('tags');
  eq(ids(tags.grNodes()), ['t1', 't2', 'tg'], 'Tags  → the gene-only cards drop out: nothing would place them');
  eq(pairOf(tags, 't1', 't2'), true, '...shared tags still link');
  eq(tags.grPairs(tags.grNodes()).some(p => [p.a, p.b].includes('g1')), false, '...and shared genes link nothing');

  const genes = mk().api;
  genes.setView('graph');
  genes.setGrLinkBy('genes');
  eq(ids(genes.grNodes()), ['g1', 'g2', 'tg'], 'Genes → the tag-only cards drop out instead');
  eq(pairOf(genes, 'g1', 'g2'), true, '...shared genes link');
  eq(genes.grTerms(genes.items.find(i => i.id === 'tg')).size, 1, '...and a card with both contributes only its gene');

  // A card linked by a [[ref]] belongs on the map whatever the switch says — otherwise its edge
  // would point at nothing.
  const { api: linked } = setup([card('a', { tags: ['x'] }), card('conn', { source: ref('a') })]);
  linked.setView('graph');
  linked.setGrLinkBy('genes');
  eq(ids(linked.grNodes()), ['a', 'conn'], 'a linked card stays on the map under any Link setting');
}

console.log('\n"draw" makes the invisible web of shared tags and genes visible');
{
  const { api, el, sandbox } = setup([
    card('a', { tags: ['drive'] }),
    card('b', { tags: ['drive'] }),          // shares a tag with a
    card('c', { genes: ['ARHGAP5'] }),
    card('d', { genes: ['ARHGAP5'] }),       // shares a gene with c
    card('lone', { tags: ['solo'] }),        // shares nothing with anyone
  ]);
  api.setView('graph');
  const segs = () => (sandbox.document.getElementById('gr-web').getAttribute('d') || '').split('M').filter(Boolean).length;

  eq(api.grWeb, false, 'off by default — the pull is felt, not drawn');
  eq(segs(), 0, 'and nothing is drawn');

  api.setGrWeb(true);
  eq(segs(), 2, 'on, every pair that shares something gets a line (a–b and c–d, but nobody to lone)');

  // A line to a card that has been filtered away would point at nothing.
  el('search-input').value = '#drive';
  api.renderList();
  eq(segs(), 1, 'a line is drawn only when BOTH its ends are on screen');

  el('search-input').value = '';
  api.renderList();
  eq(segs(), 2, 'and comes back when they are');

  // It follows the Link switch: under Genes, a shared tag is not a link at all.
  api.setGrLinkBy('genes');
  eq(segs(), 1, 'under Link=Genes only the shared-gene pair is drawn');

  api.setGrWeb(false);
  eq(segs(), 0, 'and unchecking puts it away again');
}

console.log('\nSpacing is a dial on the physics, not a redraw');
{
  const { api } = setup([
    ...Array.from({ length: 6 }, (_, i) => card('a' + i, { genes: ['G1'], title: 'A card with a fairly long title ' + i })),
    ...Array.from({ length: 6 }, (_, i) => card('b' + i, { genes: ['G2'], title: 'Another longish card title ' + i })),
  ]);
  api.setView('graph');
  const P = api.grPos, N = api.grNodes();
  const spread = () => {                       // mean distance between every pair of cards
    let sum = 0, n = 0;
    for (let i = 0; i < N.length; i++)
      for (let j = i + 1; j < N.length; j++, n++)
        sum += Math.hypot(P[N[i].id].x - P[N[j].id].x, P[N[i].id].y - P[N[j].id].y);
    return sum / n;
  };
  eq(api.grSpacing, 1, 'it starts at 1');
  const normal = spread(), room = api.grW;

  api.setGrSpacing(1.8);
  const airy = spread();
  eq(airy > normal * 1.15, true, `turned up, the cards spread out (${normal.toFixed(0)}px → ${airy.toFixed(0)}px apart)`);
  eq(api.grW > room, true, `...and the layout space grows with them, or they would just pile against the edges (${room}px → ${api.grW}px)`);

  api.setGrSpacing(0.6);
  const tight = spread();
  eq(tight < normal, true, `turned down, they close up (${tight.toFixed(0)}px apart)`);

  // Still a map, not a pile: the collision constraint holds whatever the spacing.
  let clash = 0;
  for (let i = 0; i < N.length; i++)
    for (let j = i + 1; j < N.length; j++) {
      const a = P[N[i].id], b = P[N[j].id];
      if (Math.abs(a.x - b.x) < 170 && Math.abs(a.y - b.y) < 26) clash++;   // inside the pill boxes
    }
  eq(clash, 0, '...but never onto one another — collision still holds at the tightest setting');

  // The polish pass is what makes that true. While the forces are running, the springs pull cards
  // back together faster than the collision passes can separate them; once the forces are spent,
  // nothing is fighting the constraint any more and it can be run to convergence for almost free.
  // On the real knowledge base it takes the default layout from 34 overlapping pairs to none.
  api.setGrSpacing(1);
  let after = 0;
  for (let i = 0; i < N.length; i++)
    for (let j = i + 1; j < N.length; j++) {
      const a = P[N[i].id], b = P[N[j].id];
      if (Math.abs(a.x - b.x) < 170 && Math.abs(a.y - b.y) < 26) after++;
    }
  eq(after, 0, 'and back at the default the layout is clean too');

  // The layout space grows under the viewport, so unless the view is re-framed the map simply walks
  // off the screen as you turn the dial up.
  // The view frames the CARDS, not the layout box they sit in — so measure against where the cards
  // actually are.
  const framed = () => {
    const cw = 900, ch = 560;                           // the sandbox canvas has no measurable size
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const e of api.grNodes()) {
      const p = api.grPos[e.id], hw = api.grHW[e.id];
      x0 = Math.min(x0, p.x - hw); x1 = Math.max(x1, p.x + hw);
      y0 = Math.min(y0, p.y - 16); y1 = Math.max(y1, p.y + 16);
    }
    const mx = api.grPan.x + api.grZoom * (x0 + x1) / 2;   // where the middle of the map lands on screen
    const my = api.grPan.y + api.grZoom * (y0 + y1) / 2;
    return { offCentre: Math.max(Math.abs(mx - cw / 2), Math.abs(my - ch / 2)),
             overflow: Math.max(api.grZoom * (x1 - x0) - cw, api.grZoom * (y1 - y0) - ch) };
  };
  for (const sp of [1.8, 0.6, 1.3]) {
    api.setGrSpacing(sp);
    const f = framed();
    eq(f.offCentre < 1, true, `at spacing ${sp} the middle of the map is still the middle of the view`);
    eq(f.overflow < 1, true, `...and the whole of it is still in view (overflow ${f.overflow.toFixed(1)}px)`);
  }

  api.setGrSpacing(99);
  eq(api.grSpacing, 1.8, 'the dial cannot be pushed past its maximum');
  api.setGrSpacing(0);
  eq(api.grSpacing, 0.6, '...or below its minimum');
}

console.log('\nRelayout arranges the cards you can SEE');
{
  // With a filter on, the hidden cards take no part: the shown ones are rearranged among themselves
  // and get the view to themselves. The hidden ones are not repositioned — they keep their places
  // and sit the round out, so clearing the filter puts you back on the map you had.
  const { api, el } = setup([
    ...Array.from({ length: 5 }, (_, i) => card('shown' + i, { tags: ['drive'], genes: ['G' + i] })),
    ...Array.from({ length: 7 }, (_, i) => card('hid' + i, { tags: ['admin'], genes: ['H' + i] })),
  ]);
  api.setView('graph');
  const shown = Array.from({ length: 5 }, (_, i) => 'shown' + i);
  const hidden = Array.from({ length: 7 }, (_, i) => 'hid' + i);
  const snap = JSON.parse(JSON.stringify(api.grPos));
  const moved = id => Math.hypot(api.grPos[id].x - snap[id].x, api.grPos[id].y - snap[id].y);

  el('search-input').value = '#drive';
  api.renderList();
  eq(api.grSim.map(e => e.id).sort(), shown.sort(), 'the physics now acts only on the cards still on screen');
  eq(shown.concat(hidden).every(id => moved(id) < 0.001), true, 'merely filtering still moves nothing');

  api.grRelayout();
  eq(hidden.every(id => moved(id) < 0.001), true, 'Relayout leaves every hidden card exactly where it was');
  eq(shown.some(id => moved(id) > 1), true, '...and rearranges the shown ones');

  // And it frames them: five cards must not end up a speck in the corner of a box built for twelve.
  // The view fits the CARDS, not the box — capped at 1:1, since blowing them up past natural size
  // would be worse than leaving them readable.
  let x0 = Infinity, x1 = -Infinity;
  for (const id of shown) { const p = api.grPos[id], hw = api.grHW[id]; x0 = Math.min(x0, p.x - hw); x1 = Math.max(x1, p.x + hw); }
  eq(Math.abs(api.grPan.x + api.grZoom * (x0 + x1) / 2 - 450) < 1, true, '...and centres them in the view');
  eq(api.grZoom, 1, '...at natural size, not shrunk to fit an empty box');

  // Clearing the filter brings the hidden cards back, still where they were.
  el('search-input').value = '';
  api.renderList();
  eq(hidden.every(id => moved(id) < 0.001), true, 'clearing the filter finds every hidden card still in its place');
  eq(api.grSim.length, 12, '...and they take part in the physics again');
}

console.log('\nThe gene highlight picks cards out of the map without narrowing it');
{
  const { api, el, sandbox } = setup([
    card('hit1', { genes: ['ARHGAP5'], tags: ['x'] }),
    card('hit2', { genes: ['RLIM/RNF12'], tags: ['x'] }),   // an alias bundle: naming RNF12 must find it
    card('miss', { genes: ['SMC1B'], tags: ['x'] }),
  ]);
  api.setView('graph');
  const cls = (id, c) => sandbox.document.getElementById('gr-n-' + id).classList.contains(c);
  const before = JSON.stringify(api.grPos);

  eq([cls('hit1', 'gr-hi'), cls('miss', 'gr-dim')], [false, false], 'with nothing typed, no card is lit and none is faded');

  el('highlight-input').value = 'ARHGAP5 RNF12';
  api.updateHighlightSet();
  eq(cls('hit1', 'gr-hi'), true, 'a card carrying a named gene lights up');
  eq(cls('hit2', 'gr-hi'), true, '...including one whose gene is an alias bundle (RLIM/RNF12)');
  eq(cls('miss', 'gr-hi'), false, 'a card carrying none of them does not');
  eq(cls('miss', 'gr-dim'), true, '...it fades back instead');
  eq(cls('hit1', 'gr-off'), false, 'highlighting HIDES nothing — every card is still on the map');
  eq(JSON.stringify(api.grPos), before, '...and nothing moved: it is a repaint, not a re-layout');

  el('highlight-input').value = '';
  api.updateHighlightSet();
  eq([cls('hit1', 'gr-hi'), cls('miss', 'gr-dim')], [false, false], 'clearing the field puts every card back to normal');
}

console.log('\nA node\'s tooltip IS the card, and Title · Tags · Body says how much of it');
{
  // The tooltip is drawn by the same renderCard() the list uses, and dressed by the same two CSS
  // classes the same switch already sets on #item-list. One switch, one meaning, everywhere — and
  // a card that looks the same wherever you meet it.
  const { api, sandbox } = setup([
    card('a', { tags: ['drive'], genes: ['ARHGAP5'], title: 'Meiotic drive', content: 'The body of the card' }),
  ]);
  api.setView('graph');
  const pop = () => sandbox.document.getElementById('app-pop');
  const html = () => pop().innerHTML;

  api.setPreviewMode('rendered');
  api.grShowPop('a');
  eq(/data-id="a"/.test(html()), true, 'the tooltip renders the real card, not a bespoke bubble of its own');
  eq(pop().classList.contains('cardmode'), true, '...so the dark chrome gets out of its way');
  eq(pop().classList.contains('card'), false, "...and the wrapper does NOT take the app's own .card class, which would frame the card in a second card");
  eq(/hide-previews|hide-meta/.test(html()), false, 'Body  → the whole card: tags, genes and body');

  api.setPreviewMode('compact');
  api.grShowPop('a');
  eq(/class="pop-card hide-previews"/.test(html()), true, 'Tags  → the same class the list uses to drop the body');

  api.setPreviewMode('minimal');
  api.grShowPop('a');
  eq(/class="pop-card hide-meta"/.test(html()), true, 'Title → the same class the list uses to drop tags and body too');

  // Whatever the mode, the card is a preview: clicking it means "open this card", and none of its
  // own tag chips, pins or buttons may fire behind your back.
  eq(/onclick="openCardFocused\('a'\)"/.test(html()), true, 'and clicking anywhere on it opens the card');

  // A tooltip is a COLLAPSED card, and the action icons now live only on the expanded card's bottom
  // row — so the tooltip has none of them, which is exactly what frees the space for the title.
  eq(/tl-icon|archive-icon|pin-icon|focus-icon|card-bottom-actions/.test(html()), false,
     'the tooltip carries no action icons — they belong to the expanded card, giving the title the room');
}

console.log('\nThe ← puts you back on the map you left, not in the card list');
{
  // Clicking a node's tooltip opens the card full-width. The ← then has to return you to the GRAPH,
  // with the layout exactly as you left it — the layout is the thing you were reading, and coming
  // back to a freshly shuffled one would throw away everything you had worked out.
  const { api, el } = setup([
    card('a', { genes: ['G1'], title: 'Alpha' }), card('b', { genes: ['G1'] }), card('c', { genes: ['G2'] }),
  ]);
  api.setView('graph');
  const layout = JSON.stringify(api.grPos);

  api.openCardFocused('a');                 // what clicking the tooltip does
  eq(api.mainView, 'list', 'the card opens full-width in the list');
  eq(/Back to the graph/.test(el('page-title').innerHTML), true, '...and the ← says where it goes');

  api.backFromFocus();
  eq(api.mainView, 'graph', 'the ← goes back to the graph, not to All entries');
  eq(JSON.stringify(api.grPos), layout, '...with the layout exactly as it was left');

  // A card you dragged must still be where you put it after the round trip.
  api.grMoveNode('c', 300, 120);
  const placed = JSON.stringify(api.grPos.c);
  api.openCardFocused('c');
  api.backFromFocus();
  eq(JSON.stringify(api.grPos.c), placed, 'a card you had placed by hand is still where you put it');

  // The timeline gets the same treatment, and focusing from the list itself still returns there.
  api.setView('timeline');
  api.openCardFocused('a');
  api.backFromFocus();
  eq(api.mainView, 'timeline', 'from the timeline, the ← goes back to the timeline');

  api.setView('list');
  api.focusCard({ stopPropagation(){} }, 'a');
  eq(/Back to the all entries/.test(el('page-title').innerHTML), true, 'focusing from the list still says all entries');
  api.backFromFocus();
  eq(api.mainView, 'list', '...and still returns there (no regression)');
}

console.log('\nLink mode reaches the graph, as it does the card list');
{
  // Creating a card, hitting Link, then picking the cards it refers to — that has to work wherever
  // you can see the cards. In the graph it never did: the banner was rendered INTO the card list, so
  // no panel could show it, and a click on a node started a drag.
  const { api, sandbox } = setup([
    card('a', { tags: ['x'], title: 'Alpha' }),
    card('b', { tags: ['x'], title: 'Beta' }),
  ]);
  api.setView('graph');
  const src = () => sandbox.document.getElementById('f-source').value;
  const banner = () => sandbox.document.getElementById('link-banner').innerHTML;
  const cls = (id, c) => sandbox.document.getElementById('gr-n-' + id).classList.contains(c);
  const ev = { preventDefault(){}, stopPropagation(){}, clientX: 0, clientY: 0, button: 0 };

  eq(/Link mode/.test(banner()), false, 'no banner when link mode is off');
  api.toggleLinkMode();
  eq(/Link mode/.test(banner()), true, 'the banner shows in the GRAPH, not only in the card list');
  eq([cls('a', 'link-target'), cls('b', 'link-target')], [true, true], '...and the nodes become link targets');

  const before = JSON.stringify(api.grPos);
  api.grNodeDown(ev, 'b');
  eq(/\[\[b\|Beta\]\]/.test(src()), true, 'clicking a node inserts its reference, exactly as clicking a card does');
  eq(JSON.stringify(api.grPos), before, '...and does not drag it out of place instead');
  eq(sandbox.document.getElementById('f-connection').checked, true, '...and marks the card being written as a connection');

  api.grNodeDown(ev, 'a');
  eq(/\[\[a\|Alpha\]\].*\[\[b\|Beta\]\]|\[\[b\|Beta\]\].*\[\[a\|Alpha\]\]/.test(src()), true, 'a second node adds a second reference');

  // The card you are editing cannot be a reference to itself.
  api.editingId = 'a';
  api.renderList();
  eq(cls('a', 'link-target'), false, 'the card being edited is not a link target');
  eq(cls('b', 'link-target'), true, '...but the others still are');
  api.editingId = null;

  api.toggleLinkMode();
  eq(/Link mode/.test(banner()), false, 'leaving link mode takes the banner away');
  eq(cls('b', 'link-target'), false, '...and puts the nodes back');
  eq(JSON.stringify(api.grPos), before, 'and none of it moved the layout');
}

console.log('\nThe view sits alongside Dashboard, All entries and Timeline');
{
  const { api, el } = setup([card('a', { tags: ['x'] }), card('b', { tags: ['x'] })]);

  api.setView('graph');
  eq(api.mainView, 'graph', 'setView goes to the graph');
  eq(el('item-list').style.display, 'none', '...hides the card list');
  eq(el('timeline-view').style.display, 'none', '...and the timeline');
  eq(el('graph-view').style.display, '', '...and shows the graph');
  eq(el('main-area').classList.contains('panel-mode'), true, '...stretched to fill the view, like the timeline');
  eq(/gr-node/.test(el('graph-view').innerHTML), true, '...with nodes in it');
  // Each node wears its type's own icon — the same glyph the card wears in the list, so you can
  // recognise a card in either view. The border carries the type colour; the icon says which type.
  eq(/<span class="gr-icon"><svg/.test(el('graph-view').innerHTML), true, '...each led by its card-type icon');

  api.renderFilters();
  eq(el('page-title').innerHTML, 'Graph (2)', 'the count lives in the page title, so the panel needs no header');

  api.setView('list');
  eq(el('graph-view').style.display, 'none', 'leaving it hides the graph');
  eq(el('item-list').style.display, '', '...and brings the card list back');
  eq(el('main-area').classList.contains('panel-mode'), false, '...with its normal layout');
  eq(api.grAlpha, 0, 'and the force simulation is stopped, not left running behind another view');

  api.toggleGraphView();
  eq(api.mainView, 'graph', 'G opens the graph');
  api.toggleGraphView();
  eq(api.mainView, 'list', '...and G again leaves it');
  api.toggleTimelineView();
  eq(api.mainView, 'timeline', 'T still opens the timeline (the two views do not fight)');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
