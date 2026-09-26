// The dashboard's special cards (Priorities, Networking, Strategy). They are ordinary note
// entries with reserved ids — so the Python tooling needs no special-casing — that render as
// dashboard heads and never appear in the normal card list.
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

// The <h2> of every dashboard head, in emission order. Networking and Strategy are glued into a
// single array entry (see digestHeads), so this pulls every <h2> out of each entry rather than
// just the first — otherwise Strategy's heading would be invisible to this helper. A head with no
// <h2> is the "click to create" placeholder for a special card that doesn't exist yet.
const headings = html => html
  .flatMap(h => [...h.matchAll(/<h2[^>]*>(?:<a[^>]*>)?([^<]+)/g)].map(m => m[1].trim()));

function setup(cards) {
  const { api, sandbox } = load({ fetchImpl: noop });
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  api.items = cards;
  sandbox.window._kbInbox = 'inbox text';
  sandbox.window._kbDigest = { id: '_digest', type: '_digest', markdown: 'digest body', date: '2026-07-14T00:00:00Z' };
  return { api, sandbox };
}

console.log('\nThe registry');
{
  const { api } = setup([]);
  eq(api.SPECIAL_CARDS.map(s => s.id), ['_priorities', '_networking', '_strategy'], 'Priorities, Networking, then Strategy');
  eq([...api.SPECIAL_IDS], ['_priorities', '_networking', '_strategy', '_digest'], 'the generated digest is special too');
}

console.log('\nDashboard order: Priorities, Networking, Strategy, Dashboard, then Inbox');
{
  const { api } = setup([
    note('_strategy', 'Strategy'),        // deliberately out of order in `items`...
    note('_networking', 'Networking'),
    note('_priorities', 'Priorities'),
    note('n1', 'Normal'),
  ]);
  // ...the dashboard order comes from the registry, not from entry order on disk.
  eq(headings(api.digestHeads()), ['Priorities', 'Networking', 'Strategy', 'Dashboard', 'Inbox'], 'heads render in the intended order');
}

console.log('\nNetworking and Strategy are glued to one column, Strategy directly below Networking');
{
  // Heads distribute round-robin across columns (see renderList), which would otherwise scatter
  // Networking and Strategy into different columns. Check every column count the layout can pick.
  const { api, sandbox } = setup([
    note('_priorities', 'Priorities'),
    note('_networking', 'Networking'),
    note('_strategy', 'Strategy'),
  ]);
  const list = sandbox.document.getElementById('item-list');
  api.digestVisible = true;
  for (const [width, nCols] of [[450, 1], [1200, 2], [1400, 3], [1900, 4]]) {
    list.offsetWidth = width;
    api.renderList();
    const cols = list.innerHTML.split('class="item-col"').slice(1);
    eq(cols.length, nCols, `width ${width}: layout picks ${nCols} column(s)`);
    const col = cols.find(c => c.includes('<h2>Networking</h2>'));
    const iN = col ? col.indexOf('<h2>Networking</h2>') : -1;
    const iS = col ? col.indexOf('<h2>Strategy</h2>') : -1;
    eq(iN !== -1 && iS > iN, true, `${nCols} column(s): Strategy is in the same column, after Networking`);
    eq(iN !== -1 && !col.slice(iN + '<h2>Networking</h2>'.length, iS === -1 ? undefined : iS).includes('<h2>'), true,
       `${nCols} column(s): nothing else sits between Networking and Strategy`);
  }
}

console.log('\nA missing special card offers to create itself');
{
  const { api } = setup([note('_priorities', 'Priorities')]);
  const heads = api.digestHeads();
  eq(headings(heads), ['Priorities', 'Dashboard', 'Inbox'], 'Strategy is absent from the headings');
  eq(heads.some(h => /Click to create a strategy card/.test(h)), true, 'a placeholder invites creating it');

  await api.createSpecialCard('_strategy');
  const made = api.items.find(i => i.id === '_strategy');
  eq(!!made, true, 'the Strategy entry is created');
  eq([made.title, made.type], ['Strategy', 'note'], 'it is an ordinary note entry, titled Strategy');
  eq([...api.queue.keys()].sort(),
     ['knowledge-base/entries/_strategy.json', 'knowledge-base/entries/_strategy.md'],
     'and it is queued for commit like any other card');
  eq(headings(api.digestHeads()), ['Priorities', 'Strategy', 'Dashboard', 'Inbox'], 'it now takes its place on the dashboard');
}

console.log('\nSpecial cards never appear in the normal list');
{
  const { api, sandbox } = setup([
    note('_priorities', 'Priorities'),
    note('_strategy', 'Strategy'),
    note('_networking', 'Networking'),
    note('p1', 'Pinned', { pinned: true }),
    note('n1', 'Normal'),
  ]);
  const listHtml = () => sandbox.document.getElementById('item-list').innerHTML;

  api.digestVisible = false;      // the ordinary list
  api.renderList();
  const list = listHtml();
  eq(/data-id="n1"/.test(list), true, 'a normal card is listed');
  eq(/data-id="_priorities"/.test(list) || /data-id="_strategy"/.test(list) || /data-id="_networking"/.test(list), false,
     'no special card leaks into the list');

  api.digestVisible = true;       // the dashboard
  api.renderList();
  const dash = listHtml();
  eq(/data-id="p1"/.test(dash), true, 'the dashboard shows pinned cards');
  eq(/data-id="n1"/.test(dash), false, 'but not unpinned ones');
  eq(/data-id="_strategy"/.test(dash), false, 'and Strategy appears only as a head, never as a card');
  eq(/<h2>Strategy<\/h2>/.test(dash), true, 'the Strategy head is rendered');
  eq(/data-id="_networking"/.test(dash), false, 'and Networking appears only as a head, never as a card');
  eq(/<h2>Networking<\/h2>/.test(dash), true, 'the Networking head is rendered');
}

console.log('\nThe dashboard also surfaces cards coming due within two weeks');
{
  // The dashboard is "what needs attention": the deadline cards (due within two weeks, overdue
  // included) come first with a blue border, then the pinned cards.
  const { api, sandbox } = setup([]);
  const T = api.todayISO(), at = n => api.addDaysISO(T, n);
  api.items = [
    note('_priorities', 'Priorities'),
    note('pin',    'Pinned',         { pinned: true }),
    note('over',   'Overdue',        { due: at(-3) }),
    note('urgent', 'Due in 2 days',  { due: at(2) }),
    note('soon',   'Due in a week',  { due: at(7) }),
    note('edge',   'Due in 13 days', { due: at(13) }),
    note('far',    'Due in 20 days', { due: at(20) }),
    note('plain',  'No due date'),
  ];
  const dashIds = () => {
    api.digestVisible = true; api.renderList();
    return [...sandbox.document.getElementById('item-list').innerHTML.matchAll(/data-id="([^"]+)"/g)]
      .map(m => m[1]).filter(id => !id.startsWith('_')).sort();
  };

  eq(api.dueSoon(api.items.find(i => i.id === 'soon')), true, 'due in a week counts as due-soon');
  eq(api.dueSoon(api.items.find(i => i.id === 'over')), true, 'so does overdue — it needs attention most');
  eq(api.dueSoon(api.items.find(i => i.id === 'edge')), true, '...and due in 13 days (inside two weeks)');
  eq(api.dueSoon(api.items.find(i => i.id === 'far')), false, 'but due in 20 days does not');
  eq(api.dueSoon(api.items.find(i => i.id === 'plain')), false, 'and a card with no due date never does');

  eq(dashIds(), ['edge', 'over', 'pin', 'soon', 'urgent'], 'the dashboard shows pinned AND due-within-two-weeks cards, nothing else');

  api.digestVisible = true; api.renderList();
  const list = sandbox.document.getElementById('item-list');
  const html = list.innerHTML;
  const cardClass = id => (html.match(new RegExp(`class="(card[^"]*)"[^>]*data-id="${id}"`)) || [])[1] || '';

  // The dashboard container carries dash-view, which is what the quiet-border CSS keys off.
  eq(list.classList.contains('dash-view'), true, 'the dashboard list is marked dash-view');

  // Only a deadline under four days out gets the red deadline-urgent border — overdue included.
  eq(/\bdeadline-urgent\b/.test(cardClass('urgent')), true, 'a deadline 2 days out is urgent → red border');
  eq(/\bdeadline-urgent\b/.test(cardClass('over')), true, '...and so is an overdue one');
  eq(/\bdeadline-urgent\b/.test(cardClass('soon')), false, 'a deadline a week out is not — no coloured border');
  eq(/\bdeadline-urgent\b/.test(cardClass('edge')), false, 'nor one 13 days out');
  eq(/\bdeadline-urgent\b/.test(cardClass('pin')), false, 'and a plain pinned card never is');
  // The pinned outline is dropped on the dashboard by the .dash-view CSS, not by removing the class.
  eq(/\bpinned\b/.test(cardClass('pin')), true, 'the pinned card keeps its pinned class (the outline is hidden via CSS)');

  // Deadline cards are ordered ahead of the pinned ones. The dashboard distributes cards round-robin
  // across columns, so this stacks per column: in whichever column the pinned card lands, every card
  // above it is a deadline card.
  const deadlineIds = new Set(['over', 'urgent', 'soon', 'edge']);
  const cols = html.split('class="item-col"').slice(1);
  const abovePinAllDeadlines = cols.every(colHtml => {
    const colIds = [...colHtml.matchAll(/data-id="([^"]+)"/g)].map(m => m[1]).filter(id => !id.startsWith('_'));
    const pinPos = colIds.indexOf('pin');
    return pinPos === -1 || colIds.slice(0, pinPos).every(id => deadlineIds.has(id));
  });
  eq(abovePinAllDeadlines, true, 'in its column, every card above the pinned one is a deadline card');
}

console.log('\nA card whose timeline bar spans today leads the dashboard, then due date order takes over');
{
  // A third way onto the dashboard, on top of pinned/due-soon: a schedule bar covering today. Those
  // lead every other card, and everything after them is ordered strictly by due date (soonest on
  // top) — a pinned card with no due date at all trails behind every due-dated card, near or far.
  const { api, sandbox } = setup([]);
  const T = api.todayISO(), at = n => api.addDaysISO(T, n);
  api.items = [
    note('_priorities', 'Priorities'),
    note('pin',    'Pinned, no due',                { pinned: true }),
    note('urgent', 'Due in 2 days',                  { due: at(2) }),
    note('soon',   'Due in a week',                  { due: at(7) }),
    note('inprog', 'Bar spans today, no due or pin'),
  ];
  api.tlSeed(api.items.find(i => i.id === 'inprog'));   // bar: today .. today+2

  eq(api.scheduleOverlapsToday(api.items.find(i => i.id === 'inprog')), true, 'a freshly seeded bar spans today');
  eq(api.scheduleOverlapsToday(api.items.find(i => i.id === 'pin')), false, 'a plain pinned card carries no bar');

  const list = sandbox.document.getElementById('item-list');
  list.offsetWidth = 450;   // force a single column so the resulting order is unambiguous
  api.digestVisible = true;
  api.renderList();
  const ids = [...list.innerHTML.matchAll(/data-id="([^"]+)"/g)].map(m => m[1]).filter(id => !id.startsWith('_'));
  eq(ids, ['inprog', 'urgent', 'soon', 'pin'],
     'in-progress card first, then ascending due date, then the due-less pin last');
}

console.log('\nSpecial cards are not taggable or pinnable');
{
  const { api } = setup([note('_priorities', 'Priorities'), note('_strategy', 'Strategy'), note('_networking', 'Networking'), note('n1', 'Normal')]);
  eq(api.taggable(api.items.find(i => i.id === '_strategy')), false, 'Strategy takes no tags');
  eq(api.taggable(api.items.find(i => i.id === '_priorities')), false, 'nor does Priorities');
  eq(api.taggable(api.items.find(i => i.id === '_networking')), false, 'nor does Networking');
  eq(api.taggable(api.items.find(i => i.id === 'n1')), true, 'a normal card still does');
}

console.log('\nOpen issues: every repo card\'s open issues, concatenated, one collapsed row per repo');
{
  const iss = (number, state, title, extra = {}) =>
    ({ number, state, title, date: '2026-09-01T00:00:00Z', labels: [], url: `https://github.com/o/r/issues/${number}`, ...extra });
  const repo = (name, date, issues, extra = {}) => ({
    id: 'gh_o_' + name, type: 'github', title: name, tags: [], genes: [], content: '', date,
    _ghFullName: 'o/' + name, _ghIssuesRecent: issues, ...extra });
  const cards = () => [
    repo('old',      '2026-01-01T00:00:00Z', [iss(1, 'open', 'Old one')], { _ghIssuesAt: '2026-09-20T00:00:00Z' }),
    repo('fresh',    '2026-09-01T00:00:00Z', [iss(3, 'open', 'Third <b>'), iss(7, 'open', 'Seventh', { labels: ['bug'] }), iss(5, 'closed', 'Done')],
         { _ghIssuesAt: '2026-09-25T00:00:00Z' }),
    repo('allclosed','2026-09-10T00:00:00Z', [iss(2, 'closed', 'Shut')]),
    repo('archived', '2026-09-11T00:00:00Z', [iss(9, 'open', 'Hidden')], { archived: true }),
    repo('uncached', '2026-09-12T00:00:00Z', undefined),
  ];
  const { api, sandbox } = setup([note('_priorities', 'Priorities'), ...cards()]);
  const heads = api.digestHeads();
  eq(headings(heads), ['Priorities', 'Dashboard', 'Inbox', 'Open issues'], 'Open issues is the last dashboard head');
  const card = api.renderGhIssuesCard();
  const repos = [...card.matchAll(/<summary><span>([^<]+)<\/span><span class="gh-repo-n">(\d+)/g)].map(m => [m[1], +m[2]]);
  eq(repos, [['fresh', 2], ['old', 1]], 'repos with open issues only, most recently active first, with counts');
  eq(/<h2>Open issues <span class="gh-repo-n">3<\/span>/.test(card), true, 'the heading carries the total');
  eq(/Done|Shut|Hidden/.test(card), false, 'closed issues and archived repos are left out');
  eq([...card.matchAll(/>#(\d+)</g)].map(m => +m[1]), [7, 3, 1], 'issues newest-number first within a repo');
  eq(card.includes('Third &lt;b&gt;') && card.includes('<code>bug</code>'), true, 'titles are escaped; labels shown as on the repo card');
  eq((card.match(/<details[^>]*>/g) || []).every(t => !/\sopen\b/.test(t)), true, 'every repo row starts collapsed');
  eq(/Fetched/.test(card), true, 'the card says how old its (stalest) cache is');

  // Open state survives a re-render, and a reload (localStorage).
  api.ghIssuesToggle({ dataset: { id: 'gh_o_old' }, open: true });
  eq(/<details data-id="gh_o_old" open/.test(api.renderGhIssuesCard()), true, 'an expanded repo stays expanded on re-render');
  eq(sandbox.localStorage.getItem('gh_issues_open'), '["gh_o_old"]', 'and is remembered across reloads');
  api.ghIssuesToggle({ dataset: { id: 'gh_o_old' }, open: false });
  eq(/<details data-id="gh_o_old" open/.test(api.renderGhIssuesCard()), false, 'collapsing it is remembered too');

  const none = setup([repo('allclosed', '2026-09-10T00:00:00Z', [iss(2, 'closed', 'Shut')])]).api;
  eq(none.renderGhIssuesCard(), '', 'no open issues anywhere: no card at all');
}

console.log('\nOpen issues: ↻ re-fetches every repo, and a failed fetch keeps the cache');
{
  const raw = (number, state, title, pr) => ({ number, state, title, updated_at: '2026-09-26T00:00:00Z', labels: [{ name: 'x' }],
    html_url: `https://github.com/o/r/issues/${number}`, ...(pr ? { pull_request: {} } : {}) });
  const fetchImpl = async url => url.includes('/o/good/')
    ? { ok: true, status: 200, json: async () => [raw(11, 'open', 'New'), raw(12, 'open', 'A PR', true), raw(4, 'closed', 'Gone')] }
    : { ok: false, status: 500, json: async () => ({}) };
  const { api, toasts } = load({ fetchImpl });
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  const mk = name => ({ id: 'gh_o_' + name, type: 'github', title: name, tags: [], genes: [], content: '', date: '2026-09-01T00:00:00Z',
    _ghFullName: 'o/' + name, _ghCommits: [{ sha: 'abc1234', msg: 'm', date: '2026-09-01T00:00:00Z' }],
    _ghIssuesRecent: [{ number: 4, state: 'open', title: 'Was open', date: '2026-08-01T00:00:00Z', labels: [], url: 'u' }] });
  api.items = [mk('good'), mk('bad')];
  await api.ghRefreshAllIssues();
  const [good, bad] = api.items;
  eq(good._ghIssuesRecent.map(i => [i.number, i.state]), [[11, 'open'], [4, 'closed']], 'fetched issues replace the cache (PRs dropped)');
  eq(good._ghCommits.length, 1, 'commits are left untouched');
  eq(!!good._ghIssuesAt, true, 'and the fetch time is stamped');
  eq(bad._ghIssuesRecent.map(i => i.number), [4], 'a failed fetch leaves that repo\'s cache alone');
  eq([...api.queue.keys()].filter(k => k.includes('gh_o_') && k.endsWith('.json')), ['knowledge-base/entries/gh_o_good.json'], 'only the refreshed card is saved');
  eq(toasts.at(-1), 'Issues refreshed — 1 of 2 repos failed', 'the toast reports the failure');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
