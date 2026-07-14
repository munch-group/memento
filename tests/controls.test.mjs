// The control bar: a view switch (Dashboard · All entries) and a card-detail switch
// (Title · Tags · Body). Both used to be dot-toggles whose state you had to decode; the point of
// the rework is that state is now explicit and every option is one click away.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

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

  api.setPreviewMode('minimal');
  eq(cls(), ['hide-meta'], 'Title  -> hide-meta (no tags, no body)');
  api.setPreviewMode('compact');
  eq(cls(), ['hide-previews'], 'Tags   -> hide-previews (tags shown, body hidden)');
  api.setPreviewMode('rendered');
  eq(cls(), [], 'Body   -> neither (tags and rendered body shown)');
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

console.log('\nView switch: Dashboard / All entries');
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
  eq(api.digestVisible, false, 'All entries selected');
  eq(/data-id="n1"/.test(listHtml()), true, 'the list shows unpinned cards');
  eq(/Click to create a priorities card/.test(listHtml()), false, 'and no dashboard heads');
}

console.log('\nThe page title names the view you are actually in');
{
  // This was the other half of the confusion: the title read "All entries" while the dashboard
  // was on screen, contradicting the control.
  const { api, el } = setup();
  api.setDashboard(true);
  api.renderFilters();
  eq(el('page-title').innerHTML, 'Dashboard', 'on the dashboard the title says Dashboard');

  api.setDashboard(false);
  api.renderFilters();
  eq(el('page-title').innerHTML, `All entries (${api.items.length})`, 'off it, the title counts the entries');
}

console.log('\nD still toggles the view');
{
  const { api } = setup();
  api.setDashboard(true);
  api.toggleDigest();
  eq(api.digestVisible, false, 'D leaves the dashboard');
  api.toggleDigest();
  eq(api.digestVisible, true, 'D returns to it');
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
  eq(el('page-title').innerHTML, 'All entries (3)', 'the title counts the entries in scope, not the archived ones too');

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
  eq(api.activeTag, 'Baboons', 'the tag filter survives the view switch');
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
  const allCount = () => (el('filter-list').innerHTML.match(/All <span class="sb-count">(\d+)</) || [])[1];
  return { api, tags, types, allCount };
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

console.log('\nTypes and the All count follow it too');
{
  const { api, types, allCount } = facetSetup();
  api.renderFilters();
  eq(types(), ['all', 'fact', 'idea'], 'Active  -> only the types active cards use');
  eq(allCount(), '2', 'All counts the active cards');

  api.setArchiveFilter('archived');
  eq(types(), ['all', 'note'], 'Archived -> only the types archived cards use');
  eq(allCount(), '1', 'All counts the archived cards');
}

console.log('\nTitle, sidebar count and list all agree');
{
  // Three places report "how many cards am I looking at". They must never disagree.
  const { api, allCount } = facetSetup();
  for (const scope of ['active', 'archived']) {
    api.setArchiveFilter(scope);
    api.renderFilters(); api.renderList();
    const inScope = api.scopedItems().length;
    eq(Number(allCount()), inScope, `${scope}: sidebar "All" count matches the cards in scope (${inScope})`);
  }
}

console.log('\nA facet that cannot survive the scope change is dropped');
{
  // Otherwise you switch to Archived still filtered by a tag no archived card has, and the app
  // looks empty for no visible reason.
  const { api } = facetSetup();
  api.setTagFilter('Live');
  eq(api.activeTag, 'Live', 'filtering by a tag only active cards have');
  api.setArchiveFilter('archived');
  eq(api.activeTag, null, 'switching to Archived drops it (no archived card carries it)');

  api.setArchiveFilter('active');
  api.setTagFilter('Shared');
  api.setArchiveFilter('archived');
  eq(api.activeTag, 'Shared', 'but a tag that exists in BOTH scopes survives the switch');
}

console.log('\nThe push-to-Claude machinery is gone');
{
  // Export/Cleanup/the synced flag existed to push cards into Claude's memory and then reap the
  // deletions. Claude now reads the knowledge base live via memento-mcp.py, so none of it remains.
  const { api } = setup();
  eq(api.SORTS.some(s => s.key === 'synced'), false, '"Synced" is no longer an offered sort');
  eq(api.SORTS.map(s => s.key), ['date', 'due', 'type', 'tags', 'connection', 'alpha'], 'the remaining sorts are unchanged');

  const html = (await import('node:fs')).readFileSync(new URL('../memento.html', import.meta.url), 'utf8');
  for (const gone of ['syncAll(', 'cleanupMemory(', 'syncItem(', 'syncEditingItem(', 'btn-sync-all', 'btn-reload', 'btn-form-sync']) {
    eq(html.includes(gone), false, `${gone} is gone from memento.html`);
  }
  // The field itself must stay: kb-manage.py's validate command requires it on every entry.
  eq(html.includes('synced:false'), true, 'new entries still carry `synced` (kb-manage.py validate requires it)');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
