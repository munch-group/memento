// The dashboard's special cards (Priorities, Strategy). They are ordinary note entries with
// reserved ids — so the Python tooling needs no special-casing — that render as dashboard heads
// and never appear in the normal card list.
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

// The <h2> of each dashboard head, in the order they're emitted. A head with no <h2> is the
// "click to create" placeholder for a special card that doesn't exist yet.
const headings = html => html
  .map(h => h.match(/<h2[^>]*>(?:<a[^>]*>)?([^<]+)/))
  .filter(Boolean)
  .map(m => m[1].trim());

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
  eq(api.SPECIAL_CARDS.map(s => s.id), ['_priorities', '_strategy'], 'Priorities then Strategy');
  eq([...api.SPECIAL_IDS], ['_priorities', '_strategy', '_digest'], 'the generated digest is special too');
}

console.log('\nDashboard order: Priorities, Strategy, Dashboard, then Inbox');
{
  const { api } = setup([
    note('_strategy', 'Strategy'),        // deliberately out of order in `items`...
    note('_priorities', 'Priorities'),
    note('n1', 'Normal'),
  ]);
  // ...the dashboard order comes from the registry, not from entry order on disk.
  eq(headings(api.digestHeads()), ['Priorities', 'Strategy', 'Dashboard', 'Inbox'], 'heads render in the intended order');
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
    note('p1', 'Pinned', { pinned: true }),
    note('n1', 'Normal'),
  ]);
  const listHtml = () => sandbox.document.getElementById('item-list').innerHTML;

  api.digestVisible = false;      // the ordinary list
  api.renderList();
  const list = listHtml();
  eq(/data-id="n1"/.test(list), true, 'a normal card is listed');
  eq(/data-id="_priorities"/.test(list) || /data-id="_strategy"/.test(list), false,
     'neither special card leaks into the list');

  api.digestVisible = true;       // the dashboard
  api.renderList();
  const dash = listHtml();
  eq(/data-id="p1"/.test(dash), true, 'the dashboard shows pinned cards');
  eq(/data-id="n1"/.test(dash), false, 'but not unpinned ones');
  eq(/data-id="_strategy"/.test(dash), false, 'and Strategy appears only as a head, never as a card');
  eq(/<h2>Strategy<\/h2>/.test(dash), true, 'the Strategy head is rendered');
}

console.log('\nThe dashboard also surfaces cards coming due within two weeks');
{
  // The dashboard is "what needs attention": the deadline cards (due within two weeks, overdue
  // included) come first with a blue border, then the pinned cards.
  const { api, sandbox } = setup([]);
  const T = api.todayISO(), at = n => api.addDaysISO(T, n);
  api.items = [
    note('_priorities', 'Priorities'),
    note('pin',   'Pinned',        { pinned: true }),
    note('over',  'Overdue',       { due: at(-3) }),
    note('soon',  'Due in a week', { due: at(7) }),
    note('edge',  'Due in 13 days',{ due: at(13) }),
    note('far',   'Due in 20 days',{ due: at(20) }),
    note('plain', 'No due date'),
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

  eq(dashIds(), ['edge', 'over', 'pin', 'soon'], 'the dashboard shows pinned AND due-within-two-weeks cards, nothing else');

  api.digestVisible = true; api.renderList();
  const html = sandbox.document.getElementById('item-list').innerHTML;
  const cardClass = id => (html.match(new RegExp(`class="(card[^"]*)"[^>]*data-id="${id}"`)) || [])[1] || '';

  // A deadline card is marked with the blue dash-deadline border here — including overdue, which
  // would otherwise be red — while a plain pinned card is not.
  eq(/\bdash-deadline\b/.test(cardClass('soon')), true, 'an upcoming-deadline card gets the blue border');
  eq(/\bdash-deadline\b/.test(cardClass('over')), true, '...and so does an overdue one (blue wins over its red)');
  eq(/\bdash-deadline\b/.test(cardClass('pin')), false, 'a plain pinned card does not');
  eq(/\bpinned\b/.test(cardClass('pin')), true, 'the pinned card still carries the pinned class (its orange edge)');
  eq(/\bpinned\b/.test(cardClass('soon')), false, 'and a due-soon card does not get the pinned outline');

  // Deadline cards are ordered ahead of the pinned ones.
  const order = [...html.matchAll(/data-id="([^"]+)"/g)].map(m => m[1]).filter(id => !id.startsWith('_'));
  const pinIdx = order.indexOf('pin');
  eq(['over', 'soon', 'edge'].every(id => order.indexOf(id) < pinIdx), true,
     'every deadline card comes before the pinned card');
}

console.log('\nSpecial cards are not taggable or pinnable');
{
  const { api } = setup([note('_priorities', 'Priorities'), note('_strategy', 'Strategy'), note('n1', 'Normal')]);
  eq(api.taggable(api.items.find(i => i.id === '_strategy')), false, 'Strategy takes no tags');
  eq(api.taggable(api.items.find(i => i.id === '_priorities')), false, 'nor does Priorities');
  eq(api.taggable(api.items.find(i => i.id === 'n1')), true, 'a normal card still does');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
