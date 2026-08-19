// The control bar: a view switch (Dashboard · Cards · Graph · Timeline) and a card-detail switch
// (Title · Tags · Body). Both used to be dot-toggles whose state you had to decode; the point of
// the rework is that state is now explicit and every option is one click away.
import { load } from './harness.mjs';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✓ ${msg}`); } else { fail++; console.log(`  ✗ ${msg}`); } };

const noop = async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });
const note = (id, title, extra = {}) =>
  ({ id, type: 'note', title, tags: [], genes: [], content: 'body of ' + id, date: '2026-07-14T00:00:00Z', ...extra });

function setup() {
  const { api, sandbox } = load({ fetchImpl: noop });
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  api.items = [note('p1', 'Pinned', { pinned: true }), note('n1', 'Normal'), note('n2', 'Normal 2')];
  sandbox.window._kbInbox = '';
  sandbox.window._kbDigest = { id: '_digest', type: '_digest', markdown: 'digest', date: '2026-07-14T00:00:00Z' };
  const el = id => sandbox.document.getElementById(id);
  return { api, sandbox, el };
}

console.log('\nCard detail: Title / Tags / Body');
{
  // The three modes are expressed purely as classes on #item-list.
  const { api, el } = setup();
  const cls = () => ['hide-meta', 'hide-previews'].filter(c => el('item-list').classList.contains(c));

  // 'minimal' (Title) is the default, so reach it from another mode to see the class actually change.
  api.setPreviewMode('rendered');
  eq(cls(), [], 'Body   -> neither (tags and rendered body shown)');
  api.setPreviewMode('compact');
  eq(cls(), ['hide-previews'], 'Tags   -> hide-previews (tags shown, body hidden)');
  api.setPreviewMode('minimal');
  eq(cls(), ['hide-meta'], 'Title  -> hide-meta (no tags, no body)');
}

console.log('\nClicking an option goes straight there (no cycling)');
{
  const { api } = setup();
  api.setPreviewMode('rendered');
  api.setPreviewMode('minimal');           // jump two steps back in one click
  eq(api.previewMode, 'minimal', 'Body -> Title in a single click');
  api.setPreviewMode('minimal');
  eq(api.previewMode, 'minimal', 're-picking the current option is a no-op');
}

console.log('\nThe C key still cycles (must not regress)');
{
  const { api } = setup();
  api.setPreviewMode('minimal');
  const seen = [api.previewMode];
  for (let i = 0; i < 3; i++) { api.togglePreviews(); seen.push(api.previewMode); }
  eq(seen, ['minimal', 'compact', 'rendered', 'minimal'], 'minimal -> compact -> rendered -> minimal');
}

// Bulk actions: Shift-click (or any click in Select mode) selects cards instead of expanding
// them; the floating bar then pins/archives/tags/deletes the lot through the same per-card save
// paths a single edit uses. Pin/Archive act toward the shared target state, so the same button
// bulk-unarchives from the Archived scope.
console.log('\nBulk actions — select with Shift-click or Select mode; pin/archive/tag/delete the lot');
{
  const { api, sandbox, el } = setup();   // items: p1 (pinned), n1, n2
  const shift = () => ({ shiftKey: true, target: { closest: () => null }, stopPropagation(){} });
  api.renderList();

  api.toggleCard('n1', shift());
  eq(api.bulkIds, ['n1'], 'Shift-click selects the card instead of expanding it');
  api.toggleCard('n2', shift());
  eq(api.bulkIds, ['n1', 'n2'], 'a second Shift-click grows the selection');
  ok(el('bulk-bar').innerHTML.includes('2 selected'), 'the floating bar counts the selection');
  ok(/bulk-sel/.test(api.renderCard(api.items.find(i => i.id === 'n1'), false)), 'a selected card wears the ring class');
  api.toggleCard('n1', shift());
  eq(api.bulkIds, ['n2'], 'Shift-clicking a selected card drops it again');
  api.toggleCard('n1', shift());

  // pin toward the shared state, and back
  await api.bulkPin();
  ok(['n1', 'n2'].every(id => api.items.find(i => i.id === id).pinned), 'Pin pins every selected card');
  ok(el('bulk-bar').innerHTML.includes('Unpin'), '...and the bar now offers Unpin');
  await api.bulkPin();
  ok(['n1', 'n2'].every(id => !api.items.find(i => i.id === id).pinned), 'Unpin clears them all again');

  // the tag picker completes a partial tag onto all, then removes it from all
  api.items.find(i => i.id === 'n1').tags = ['Shared'];
  api.openBulkTagPicker();
  const overlay = sandbox.document.__created.find(elc => elc.innerHTML.includes('bt-on'));
  ok(!!overlay && overlay.innerHTML.includes('tag-editor'), 'the bulk tag picker wears the tag pop-up chassis');
  await api.toggleBulkTag('Shared');
  ok(['n1', 'n2'].every(id => (api.items.find(i => i.id === id).tags || []).includes('Shared')),
     'a tag on only some selected cards is completed onto all of them');
  await api.toggleBulkTag('Shared');
  ok(['n1', 'n2'].every(id => !(api.items.find(i => i.id === id).tags || []).includes('Shared')),
     'a tag on every selected card is removed from all of them');
  api.closeBulkTagPicker();

  // archive consumes the selection (the cards leave the scope)
  await api.bulkArchive();
  ok(['n1', 'n2'].every(id => api.items.find(i => i.id === id).archived), 'Archive archives every selected card');
  eq(api.bulkIds, [], '...and puts the selection away');

  // delete respects the confirm
  api.toggleCard('p1', shift());
  sandbox.confirm = () => false;
  await api.bulkDelete();
  ok(api.items.some(i => i.id === 'p1'), 'a refused confirm deletes nothing');
  sandbox.confirm = () => true;
  await api.bulkDelete();
  ok(!api.items.some(i => i.id === 'p1'), 'a confirmed Delete removes every selected card');

  // Select mode: plain clicks select; clearing puts mode and selection away together
  api.toggleBulkMode();
  api.toggleCard('n1', { target: { closest: () => null }, stopPropagation(){} });
  eq(api.bulkIds, ['n1'], 'in Select mode a plain click selects');
  api.bulkClear();
  eq([api.bulkIds.length, api.bulkMode], [0, false], 'clearing puts selection and mode away');

  const src = readFileSync(new URL('../memento.html', import.meta.url), 'utf8');
  ok(src.includes("code==='KeyM' && !readOnly"), 'M toggles Select mode (not read-only)');
  ok(src.includes('bulkMode || _bulkIds.size'), 'Esc clears the bulk selection');
  // A typed filter is the one thing here that costs real effort to reproduce, so the key you press to
  // dismiss things must not be able to take it — not as a fall-through, not at any rung of the ladder.
  ok(!/search\.value\s*=\s*''/.test(src) && !/search && search\.value/.test(src),
     '...but Esc never clears the search, at any step');
  // #search-input is type="search", which the BROWSER empties on Esc — the in-field branch's
  // preventDefault is the only thing holding that off, so it must not be dropped as tidy-up.
  ok(/if\(inField\)\{[\s\S]{0,400}?e\.preventDefault\(\);\s*\n\s*active\.blur\(\);/.test(src),
     '...including the browser doing it for us: Esc in a field preventDefaults, then blurs');
  // Shift-click must not ALSO paint a text selection across the app: the browser starts that at
  // mousedown, so a card-scoped mousedown guard suppresses it there (the harness registers no
  // listeners, so this is asserted in the source).
  ok(/mousedown[\s\S]{0,200}e\.shiftKey && !readOnly[\s\S]{0,100}closest\('\.card'\)[\s\S]{0,40}preventDefault/.test(src),
     'shift-mousedown on a card suppresses the native text-selection');
}

// Pinning: Alt-click a card to force it into view regardless of every other filter — the
// card-level twin of the Genes view's `*GENE` spike. Chip row (not a search-text token) since
// card ids are opaque, unlike gene symbols.
console.log('\nPinning a card (Alt-click) forces it into view no matter what else would hide it');
{
  const { api, sandbox } = load({ fetchImpl: noop });
  const el = id => sandbox.document.getElementById(id);
  const alt = () => ({ altKey: true, target: { closest: () => null }, stopPropagation(){} });
  api.items = [
    note('a1', 'Alpha', { tags: ['Live'] }),
    note('b1', 'Beta',  { tags: ['Dead'], archived: true }),   // wrong tag AND archived — a real stress test
  ];
  sandbox.window._kbInbox = ''; sandbox.window._kbDigest = null;
  api.setDashboard(false);
  api.renderList();

  eq(api.getVisibleItems().vis.map(i => i.id), ['a1'], 'baseline: Beta (archived) is out of scope');
  el('pinned-cards').style.display = 'none';   // the real markup's default (the fake DOM doesn't parse static inline styles)

  api.toggleCard('b1', alt());
  ok(el('pinned-cards').style.display !== 'none', 'Alt-click reveals the chip row');
  ok(el('pinned-cards').innerHTML.includes('Beta'), 'the chip shows the card TITLE, not its opaque id');
  ok(el('pinned-cards').innerHTML.includes("togglePinnedCard('b1')"), 'clicking the chip itself is wired to unpin');
  eq(api.pinnedCardIds, ['b1'], 'b1 recorded as pinned');
  eq(api.getVisibleItems().vis.map(i => i.id).sort(), ['a1', 'b1'], 'Beta shows despite being archived AND wrong-tagged');
  eq(api.expandedId, null, 'Alt-click does not ALSO expand the card');
  eq(api.bulkIds, [], '...or bulk-select it');

  api.setTagFilter('Live');   // narrow further: Beta has neither Live nor a matching archive scope
  eq(api.getVisibleItems().vis.map(i => i.id).sort(), ['a1', 'b1'], 'a #Live filter still cannot hide a pinned card');

  api.togglePinnedCard('b1');
  eq(api.pinnedCardIds, [], 'unpinning empties the set');
  eq(el('pinned-cards').style.display, 'none', '...and hides the chip row again');
  eq(api.getVisibleItems().vis.map(i => i.id), ['a1'], 'Beta drops back out (still filtered by #Live + archive scope)');
  api.setTagFilter('Live');   // toggle back off, restoring baseline scope for the rest of this block

  // untitled card: falls back to a content snippet, never a bare id
  api.items.push({ id: 'c1', type: 'note', title: '', tags: [], genes: [], content: 'first line\nrest', date: '2026-01-01T00:00:00Z' });
  api.toggleCard('c1', alt());
  ok(el('pinned-cards').innerHTML.includes('first line'), 'an untitled card falls back to its first content line');

  // clearAllFilters puts pins away with everything else
  api.clearAllFilters();
  eq(api.pinnedCardIds, [], 'clearAllFilters empties the pinned set too');
  eq(el('pinned-cards').style.display, 'none', '...and the chip row is hidden again');

  // saved views round-trip which cards were pinned, same as highlighted genes
  api.togglePinnedCard('b1');
  eq(api.hasActiveView(), true, 'a pin alone (no other filter) is enough to count as "a view worth saving"');
  ok(api.describeView(api.captureView()).includes('pin:1'), 'describeView summarises the pin count');
  const saved = api.captureView();
  api.clearAllFilters();
  eq(api.pinnedCardIds, [], 'sanity: cleared before restoring');
  api.applyView({ id: 'v1', view: saved });
  eq(api.pinnedCardIds, ['b1'], 'applyView restores the pinned set from the saved view');
  ok(el('pinned-cards').style.display !== 'none', '...and repaints the chip row');

  // The chips say what the search is being made to let through, so they have to hang off the search
  // box, not off the view switch. That is structural, not a nudge: the box and the row are one block
  // and the BLOCK owns the gap before the control bar, which puts the slack under the chips instead
  // of over them. A margin back on .searchbar would silently push them down against Dashboard·Stack
  // again, so both halves are asserted. (Layout itself is a real-browser check; this pins the shape.)
  const src2 = readFileSync(new URL('../memento.html', import.meta.url), 'utf8');
  ok(/<div class="search-block">\s*\n\s*<div class="searchbar">/.test(src2),
     'the search box opens a .search-block that the chip row shares');
  ok(/<div class="pinned-cards" id="pinned-cards"[^>]*><\/div>\s*\n\s*<\/div>/.test(src2),
     '...and the chip row is the last thing inside it, not a sibling below it');
  ok(/\.search-block \{ margin-bottom: 1rem; \}/.test(src2), 'the block owns the gap');
  ok(/\.searchbar \{ width: 100%; display: flex;/.test(src2),
     '...and the search box itself carries no bottom margin to put back above the chips');
}

// The copy-genes icon (⧉). On an expanded card it trails the last gene inside the list, always
// visible. A collapsed card's gene strip is clipped and fade-masked, so there the icon sits AFTER
// the strip (inside, the mask would swallow it) and is revealed by hovering the card.
console.log('\nCopy genes: inline on an expanded card, hover-revealed after the strip on a collapsed one');
{
  const { api } = setup();
  const g = note('g1', 'Geneful', { genes: ['MAPT', 'STK11'] });
  api.items = [g];

  const exp = api.renderCard(g, true);
  eq(exp.includes('⧉</span></span>'), true, 'expanded: the icon is the last thing inside the gene list');
  eq(exp.includes('gene-copy-hover'), false, '...and carries no hover class — it is always visible');

  const col = api.renderCard(g, false);
  eq(col.includes('</span></span><span class="gene-copy gene-copy-hover"'), true,
     'collapsed: the icon sits after the clipped gene strip, outside the mask');
  eq(col.includes(`onclick="copyGenes(event,'g1')"`), true, '...and copies the same gene list');
  eq(api.renderCard(note('g0', 'Geneless'), false).includes('gene-copy'), false,
     'a card with no genes gets no icon in either mode');

  // The reveal is CSS (the fake DOM computes no styles): hidden but keeping its slot, shown on
  // .card:hover — opacity, not display, so the strip never reflows under the pointer.
  const css = readFileSync(new URL('../memento.html', import.meta.url), 'utf8');
  eq(/\.gene-copy-hover \{ opacity: 0; pointer-events: none;/.test(css), true,
     'the hover variant starts invisible and unclickable');
  eq(/\.card:hover \.gene-copy-hover \{ opacity: 0\.6; pointer-events: auto; \}/.test(css), true,
     '...and hovering the card brings it back');
}

console.log('\nView switch: Dashboard / Cards');
{
  const { api, el } = setup();
  const listHtml = () => el('item-list').innerHTML;

  api.renderList();                     // the app starts on the dashboard; paint it once
  eq(api.digestVisible, true, 'Dashboard selected');
  eq(/data-id="p1"/.test(listHtml()), true, 'dashboard shows pinned cards');
  eq(/data-id="n1"/.test(listHtml()), false, 'dashboard hides unpinned ones');
  eq(/<h2>Priorities<\/h2>/.test(listHtml()) || /Click to create a priorities card/.test(listHtml()), true,
     'dashboard shows its head cards');

  api.setDashboard(false);
  eq(api.digestVisible, false, 'Cards selected');
  eq(/data-id="n1"/.test(listHtml()), true, 'the list shows unpinned cards');
  eq(/Click to create a priorities card/.test(listHtml()), false, 'and no dashboard heads');
}

console.log('\nThe page title names the view you are actually in');
{
  // This was the other half of the confusion: the title read "Cards" while the dashboard
  // was on screen, contradicting the control.
  const { api, el } = setup();
  api.setDashboard(true);
  api.renderFilters();
  eq(el('page-title').innerHTML, 'Dashboard', 'on the dashboard the title says Dashboard');

  api.setDashboard(false);
  api.renderFilters();
  eq(el('page-title').innerHTML, `Stack (${api.items.length})`, 'off it, the title counts the entries');
}

console.log('\nd / c / g / t jump straight to their views (no toggle)');
{
  // The keys map one-to-one onto views now: pressing d always shows the Dashboard, it never toggles
  // back off it. setView is exactly what the d/c/g/t handlers call.
  const { api } = setup();
  api.setView('dash');
  api.setView('dash');
  eq(api.mainView, 'dash', 'd shows the Dashboard and pressing it again keeps you there');
  api.setView('list');     eq(api.mainView, 'list', 'c shows Cards');
  api.setView('graph');    eq(api.mainView, 'graph', 'g shows the Graph');
  api.setView('timeline'); eq(api.mainView, 'timeline', 't shows the Timeline');
  api.setView('dash');     eq(api.mainView, 'dash', 'd comes back to the Dashboard from anywhere');
}

// ---------------------------------------------------------------------------------------------
// Scope filters. Unlike Type/Tag/Gene — facets that REPLACE each other — these AND with
// everything. The old sidebar gave no hint of that difference; these tests pin it down.
// ---------------------------------------------------------------------------------------------

function scopeSetup() {
  const { api, sandbox } = load({ fetchImpl: noop });
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  api.items = [
    note('c1', 'Connection', { connection: true }),
    note('c2', 'Connection archived', { connection: true, archived: true }),
    note('n1', 'Plain'),
    note('n2', 'Plain archived', { archived: true }),
    note('f1', 'A fact', { type: 'fact' }),
  ];
  sandbox.window._kbInbox = '';
  sandbox.window._kbDigest = null;
  api.setDashboard(false);   // scope filters only bite in the list view
  return { api, sandbox, el: id => sandbox.document.getElementById(id) };
}
const shown = (api, el) => {
  api.renderList();
  return [...el('item-list').innerHTML.matchAll(/data-id="([^"]+)"/g)].map(m => m[1]).sort();
};

console.log('\nConnections: Any / Only / None');
{
  const { api, el } = scopeSetup();
  eq(shown(api, el), ['c1', 'f1', 'n1'], 'Any  -> everything unarchived');
  api.setConnFilter('conn');
  eq(shown(api, el), ['c1'], 'Only -> just the connection cards');
  api.setConnFilter('noconn');
  eq(shown(api, el), ['f1', 'n1'], 'None -> connection cards excluded');
  api.setConnFilter('all');
  eq(shown(api, el), ['c1', 'f1', 'n1'], 'back to Any');
}

console.log('\nArchived REPLACES the list rather than adding to it');
{
  const { api, el } = scopeSetup();
  eq(shown(api, el), ['c1', 'f1', 'n1'], 'Active   -> only unarchived');
  api.setArchiveFilter('archived');
  eq(shown(api, el), ['c2', 'n2'], 'Archived -> ONLY archived (the active ones vanish)');
  api.setArchiveFilter('active');
  eq(shown(api, el), ['c1', 'f1', 'n1'], 'back to Active');
}

console.log('\nThe title announces the archived scope — which is what lets its switch hide away');
{
  const { api, el } = scopeSetup();
  api.renderFilters();
  // 5 entries, 2 of them archived — the title counts the 3 you can actually see, not all 5.
  eq(el('page-title').innerHTML, 'Stack (3)', 'the title counts the entries in scope, not the archived ones too');

  api.setArchiveFilter('archived');
  api.renderFilters();
  const t = el('page-title').innerHTML;
  eq(/title-pill[^>]*>Archived 2</.test(t), true, 'under the archived scope a pill says so, with a count');
  eq(/clearAllFilters/.test(t), true, 'and offers the ← that clears it');
}

console.log('\nThe ← points where it GOES, not at the filter you are already in');
{
  // "← #Baboons" read like a link *to* Baboons. The link now names its destination, and the
  // filter sits beside it as a pill.
  const { api, el } = scopeSetup();
  api.items.push(note('t1', 'Tagged', { tags: ['Baboons'] }));
  api.setTagFilter('Baboons');
  api.renderFilters();
  const t = el('page-title').innerHTML;
  eq(/← All<\/span>/.test(t), true, 'the link names its destination');
  eq(/←\s*#?Baboons/.test(t), false, 'the link is NOT the tag itself');
  eq(/<span class="title-pill">Baboons<\/span>/.test(t), true, 'the tag is a pill beside it');
  eq(/clearAllFilters/.test(t), true, 'and clicking the link clears the filter');

  // Same wording whichever view it returns to — the link means "drop the filters", so naming the
  // destination differently would make it read like a different action.
  api.setDashboard(true);          // the tag filter is still on (setTagFilter toggles, so don't re-call it)
  api.renderFilters();
  eq(api.activeTags, ['Baboons'], 'the tag filter survives the view switch');
  eq(/← All<\/span>/.test(el('page-title').innerHTML), true, 'still "← All" when it returns you to the dashboard');
  eq(/← Dashboard/.test(el('page-title').innerHTML), false, 'never "← Dashboard"');
}

console.log('\nTwo filters at once both show (the old title could only show one)');
{
  // Previously the title was a chain of else-ifs, so filtering by a tag while in the archived
  // scope silently swallowed the "Archived" announcement — the one thing that scope must never do.
  const { api, el } = scopeSetup();
  api.items.push(note('z9', 'Archived + tagged', { archived: true, tags: ['Baboons'] }));
  api.setArchiveFilter('archived');
  api.setTagFilter('Baboons');
  api.renderFilters();
  const t = el('page-title').innerHTML;
  eq(/>Archived \d</.test(t), true, 'the archived scope is still announced...');
  eq(/>Baboons</.test(t), true, '...alongside the tag pill');
}

console.log('\nScope ANDs with a facet (it does not replace it)');
{
  const { api, el } = scopeSetup();
  api.setFilter('fact');                       // a facet
  eq(shown(api, el), ['f1'], 'type=fact alone');
  api.setConnFilter('conn');                   // + a scope
  eq(shown(api, el), [], 'type=fact AND connections-only -> nothing matches both');
  eq(api.connFilter, 'conn', 'the scope filter survived the facet');
}

console.log('\nClearing resets both scopes');
{
  const { api } = scopeSetup();
  api.setConnFilter('conn');
  api.setArchiveFilter('archived');
  api.clearAllFilters();
  eq([api.connFilter, api.archiveFilter], ['all', 'active'], 'clearAllFilters resets scope, not just facets');
}

// ---------------------------------------------------------------------------------------------
// The sidebar's facets must describe the scope you're in. Otherwise it offers you tags and types
// that can only ever return nothing.
// ---------------------------------------------------------------------------------------------

function facetSetup() {
  const { api, sandbox } = load({ fetchImpl: noop });
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  api.items = [
    note('a1', 'Active idea',  { type: 'idea', tags: ['Live', 'Shared'] }),
    note('a2', 'Active fact',  { type: 'fact', tags: ['Live'] }),
    note('z1', 'Old note',     { type: 'note', tags: ['Dead', 'Shared'], archived: true }),
  ];
  sandbox.window._kbInbox = ''; sandbox.window._kbDigest = null;
  api.setDashboard(false);
  const el = id => sandbox.document.getElementById(id);
  const tags  = () => [...el('tag-filter-list').innerHTML.matchAll(/setTagFilter\('([^']+)'\)/g)].map(m => m[1]).sort();
  const types = () => [...el('filter-list').innerHTML.matchAll(/setFilter\('([^']+)'\)/g)].map(m => m[1]).sort();
  // "How many cards am I looking at" — the title reports it, whichever scope you're in.
  const count = () => {
    const h = el('page-title').innerHTML;
    const m = h.match(/Stack \((\d+)\)/) || h.match(/Archived (\d+)/);
    return m ? Number(m[1]) : null;
  };
  return { api, tags, types, count, el };
}

console.log('\nTags listed in the sidebar follow the archive scope');
{
  const { api, tags } = facetSetup();
  api.renderFilters();
  eq(tags(), ['Live', 'Shared'], 'Active  -> only tags used by active cards ("Dead" is not offered)');

  api.setArchiveFilter('archived');
  eq(tags(), ['Dead', 'Shared'], 'Archived -> only tags used by archived cards ("Live" is gone)');

  api.setArchiveFilter('active');
  eq(tags(), ['Live', 'Shared'], 'and back');
}

console.log('\nTypes follow it too — and there is no "All" chip any more');
{
  // Selecting no type already means every type, so a chip for it would be a second way of saying
  // the same thing, and one you could get into a fight with (is "All" on while "Fact" is?).
  const { api, types, count } = facetSetup();
  api.renderFilters();
  eq(types(), ['fact', 'idea'], 'Active  -> only the types active cards use, and no "all"');
  eq(count(), 2, 'the title counts the active cards');

  api.setArchiveFilter('archived');
  eq(types(), ['note'], 'Archived -> only the types archived cards use');
  eq(count(), 1, 'and the title counts those');
}

console.log('\nTitle count and the list agree');
{
  // Two places report "how many cards am I looking at". They must never disagree.
  const { api, count } = facetSetup();
  for (const scope of ['active', 'archived']) {
    api.setArchiveFilter(scope);
    api.renderFilters(); api.renderList();
    const inScope = api.scopedItems().length;
    eq(count(), inScope, `${scope}: the title's count matches the cards in scope (${inScope})`);
  }
}

console.log('\nType and Tag are multi-select: each chip is its own switch');
{
  const { api, el } = facetSetup();
  eq([api.activeTypes, api.activeTags], [[], []], 'nothing selected to begin with — which means everything');

  api.setFilter('fact');
  eq(api.activeTypes, ['fact'], 'a click turns a type on');
  api.setFilter('idea');
  eq(api.activeTypes, ['fact', 'idea'], '...and another turns a SECOND one on rather than replacing it');
  api.setFilter('fact');
  eq(api.activeTypes, ['idea'], '...and clicking it again turns it back off');

  // Selecting several types is an OR; a type and a tag together are an AND.
  api.setFilter('fact');
  eq(shown(api, el), ['a1', 'a2'], 'two types selected shows the cards of either');
  api.setTagFilter('Live');
  eq(api.activeTags, ['Live'], 'a tag can be on at the same time as a type...');
  eq(api.activeTypes, ['fact', 'idea'], '...and does not wipe the types out, as it used to');
  api.setTagFilter('Live');
  eq(api.activeTags, [], 'and the tag toggles off again');
}

console.log('\nA facet that cannot survive the scope change is dropped');
{
  // Otherwise you switch to Archived still filtered by a tag no archived card has, and the app
  // looks empty for no visible reason.
  const { api } = facetSetup();
  api.setTagFilter('Live');
  eq(api.activeTags, ['Live'], 'filtering by a tag only active cards have');
  api.setArchiveFilter('archived');
  eq(api.activeTags, [], 'switching to Archived drops it (no archived card carries it)');

  api.setArchiveFilter('active');
  api.setTagFilter('Shared');
  api.setArchiveFilter('archived');
  eq(api.activeTags, ['Shared'], 'but a tag that exists in BOTH scopes survives the switch');

  api.setArchiveFilter('active');
  api.setFilter('idea');
  eq(api.activeTypes, ['idea'], 'the same goes for a type...');
  api.setArchiveFilter('archived');
  eq(api.activeTypes, [], '...no archived card is an idea, so it is dropped');
}

// ---------------------------------------------------------------------------------------------
// Search bar <-> sidebar sync. Type/Tag chips and the /type #tag tokens in the search box are two
// views of the same state now: clicking a chip writes its token, typing a token selects its chip.
// ---------------------------------------------------------------------------------------------

console.log('\nA sidebar click writes the matching /type token into the search bar');
{
  const { api, el } = facetSetup();
  api.setFilter('fact');
  eq(el('search-input').value, '/fact', 'clicking a Type chip writes its token');
  api.setFilter('idea');
  eq(el('search-input').value, '/fact,idea', 'a second type appends in TYPES-array order, not click order');
  api.setFilter('fact');
  eq(el('search-input').value, '/idea', 'toggling one back off leaves just the other');
  api.setFilter('idea');
  eq(el('search-input').value, '', 'toggling the last one off empties the box');
}

console.log('\nA sidebar tag click writes #tag too, alongside any type token');
{
  const { api, el } = facetSetup();
  api.setTagFilter('Shared');
  eq(el('search-input').value, '#Shared', 'clicking a Tag chip writes its token');
  api.setTagFilter('Live');
  eq(el('search-input').value, '#Live,Shared', 'a second tag appends alphabetically');
  api.setFilter('fact');
  eq(el('search-input').value, '/fact #Live,Shared', 'a type token is prepended ahead of the tag token');
  api.setTagFilter('Live'); api.setTagFilter('Shared');
  eq(el('search-input').value, '/fact', 'toggling both tags off strips the tag token but keeps the type token');
}

console.log('\nSyncing a chip leaves free text and other OR-groups untouched');
{
  const { api, el } = facetSetup();
  el('search-input').value = 'foo, bar baz';
  api.setFilter('fact');
  eq(el('search-input').value, '/fact foo, bar baz', 'the token is prepended to group 1; group 2 survives verbatim');
}

console.log('\nTyping a /type or #tag token selects the matching sidebar chip');
{
  const { api, el } = facetSetup();
  el('search-input').value = '/fact';
  api.renderFilters();
  eq(api.activeTypes, ['fact'], 'typing /fact selects the Fact chip');

  el('search-input').value = '#live';   // lowercase — resolveTag() always lowercases
  api.renderFilters();
  eq(api.activeTags, ['Live'], 'a lowercase #tag token still selects the real-cased Live chip');

  el('search-input').value = '#Live,Shared';
  api.renderFilters();
  eq(api.activeTags, ['Live', 'Shared'], 'a comma-joined tag token (OR) selects both chips');

  el('search-input').value = '';
  api.renderFilters();
  eq(api.activeTypes, [], 'clearing the box clears the type chips too');
  eq(api.activeTags, [], '...and the tag chips');
}

console.log('\nAn AND-style tag query freezes the chips instead of misrepresenting it');
{
  // No combination of chips (pure OR) can mean "Live AND Shared", so a hand-typed AND query must
  // leave the sidebar exactly as it was rather than pretend it's an OR of the same names.
  const { api, el } = facetSetup();
  api.setTagFilter('Live');
  eq(api.activeTags, ['Live'], 'baseline: Live selected via the sidebar');

  el('search-input').value = '#Live #Shared';   // two separate bare tokens = AND
  api.renderFilters();
  eq(api.activeTags, ['Live'], 'two separate #tag tokens (AND) leave the chips frozen');

  el('search-input').value = '#Live #Shared,Dead';   // "Live AND (Shared OR Dead)" — still not chip-able
  api.renderFilters();
  eq(api.activeTags, ['Live'], 'an AND mixed with an OR also freezes the chips');
}

console.log('\nA multi-OR-group query freezes both facets — ambiguous which group is "the" scope');
{
  const { api, el } = facetSetup();
  api.setFilter('idea');
  eq(api.activeTypes, ['idea'], 'baseline: Idea selected via the sidebar');

  el('search-input').value = '/fact, other text';   // a second, unrelated OR-group
  api.renderFilters();
  eq(api.activeTypes, ['idea'], 'the sidebar stays put rather than being overwritten from group 1 alone');
}

console.log('\nSwitching archive scope drops the stale token from the search text too');
{
  // setArchiveFilter already drops a facet the new scope has no cards for (tested above) — the
  // search box must not keep showing a token for a filter that was just silently dropped.
  const { api, el } = facetSetup();
  api.setTagFilter('Live');
  eq(el('search-input').value, '#Live', 'baseline: token written for the Live tag');
  api.setArchiveFilter('archived');
  eq(api.activeTags, [], 'the tag itself is dropped (existing behavior)');
  eq(el('search-input').value, '', 'and the stale #Live token no longer lingers in the box');
}

console.log('\nAn old-format saved view (singular type/tag, tokens not yet baked into q) still applies');
{
  const view = { id: 'v1', type: 'view', title: 'Old view', view: { type: 'fact', tag: 'Live', q: 'legacy text' } };
  const { api, el } = facetSetup();
  api.applyView(view);
  eq(api.activeTypes, ['fact'], 'legacy singular `type` still restores the Type chip');
  eq(api.activeTags, ['Live'], 'legacy singular `tag` still restores the Tag chip');
  eq(el('search-input').value, '/fact #Live legacy text', 'the search box now shows the tokens too, not just the old free text');
}

console.log('\nA click round-trips through the text back to the same Set (idempotent)');
{
  const { api } = facetSetup();
  api.setFilter('fact'); api.setTagFilter('Live');
  api.renderFilters();   // simulates the extra derive pass a real oninput would also trigger
  eq(api.activeTypes, ['fact'], 'activeTypes unchanged by the round trip');
  eq(api.activeTags, ['Live'], 'activeTags unchanged by the round trip');
}

console.log('\nThe push-to-Claude machinery is gone');
{
  // Export/Cleanup/the synced flag existed to push cards into Claude's memory and then reap the
  // deletions. Claude now reads the knowledge base live via memento-mcp.py, so none of it remains.
  const { api } = setup();
  eq(api.SORTS.some(s => s.key === 'synced'), false, '"Synced" is no longer an offered sort');
  eq(api.SORTS.map(s => s.key), ['date', 'due', 'type', 'tags', 'connection', 'alpha'], 'the remaining sorts are unchanged');

  const html = (await import('node:fs')).readFileSync(new URL('../memento.html', import.meta.url), 'utf8');
  // btn-reload is NOT in this list any more. Reload was dropped when both platforms started
  // refreshing themselves, but self-refresh is deliberately conservative — it re-reads only when
  // the sha moved — so the button came back for the case that needs it: "go and look right now".
  for (const gone of ['syncAll(', 'cleanupMemory(', 'syncItem(', 'syncEditingItem(', 'btn-sync-all', 'btn-form-sync']) {
    eq(html.includes(gone), false, `${gone} is gone from memento.html`);
  }
  eq(html.includes('btn-reload'), true, 'the manual reload button is present');
  eq(html.includes('reloadNow()'), true, 'and it is wired to reloadNow()');
  // The field itself must stay: kb-manage.py's validate command requires it on every entry.
  eq(html.includes('synced:false'), true, 'new entries still carry `synced` (kb-manage.py validate requires it)');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
