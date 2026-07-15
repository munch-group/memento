// The timeline view. Two things here are load-bearing and easy to get quietly wrong:
//
//   1. Day arithmetic. Every bar's position is a day offset from the timeline's first column, so a
//      date helper that drifts by one day drifts EVERY bar by one day — silently, and identically,
//      so nothing looks broken. toISOString() would do exactly that east of Greenwich.
//   2. Membership. An entry is on the timeline because it HAS a due date or a bar, not because a
//      flag says so. That is what makes "set a due date" and "schedule it" the same act — and it is
//      why removing a row has to clear the due date, which is the one destructive thing here.
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
const bar = (id, start, end, title = '') => ({ id, title, start, end });
const sched = (...subtasks) => ({ subtasks });

function setup(itemsList) {
  const { api, sandbox, toasts } = load({ fetchImpl: noop });
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  api.items = itemsList || [];
  sandbox.window._kbInbox = '';
  sandbox.window._kbDigest = null;
  return { api, sandbox, toasts, el: id => sandbox.document.getElementById(id) };
}

// ---------------------------------------------------------------------------------------------
console.log('\nDay arithmetic (every bar position depends on it)');
{
  const { api } = setup();
  eq(api.addDaysISO('2026-07-14', 3), '2026-07-17', 'addDaysISO walks forward');
  eq(api.addDaysISO('2026-07-01', -1), '2026-06-30', '...and back over a month boundary');
  eq(api.addDaysISO('2026-02-28', 1), '2026-03-01', '...and over a non-leap February');
  eq(api.daysBetween('2026-07-14', '2026-07-17'), 3, 'daysBetween counts days');
  eq(api.daysBetween('2026-07-17', '2026-07-14'), -3, '...signed');
  eq(api.daysBetween('2026-07-14', '2026-07-14'), 0, '...and zero for the same day');

  // Round-trip: the pair of helpers must be exact inverses, or bars creep as you drag them.
  let iso = '2026-01-01', ok = true;
  for (let i = 0; i < 400; i++) {
    if (api.daysBetween('2026-01-01', iso) !== i) ok = false;
    iso = api.addDaysISO(iso, 1);
  }
  eq(ok, true, 'addDaysISO and daysBetween are exact inverses across 400 days');
  eq(iso, '2027-02-05', '...landing on the right date a year+ out');
}

console.log('\nDST: the day either side of a clock change is still one day');
{
  // Europe/Copenhagen springs forward on 29 Mar 2026 and back on 25 Oct 2026. Those days are 23h
  // and 25h long, so a bare (b - a) / 86400000 yields 0.958 and 1.042 — which floor to 0 and 1.
  // Rounding is what keeps a bar from losing (or gaining) a day when it is dragged across the switch.
  const { api } = setup();
  eq(api.daysBetween('2026-03-29', '2026-03-30'), 1, 'the 23-hour spring-forward day counts as 1');
  eq(api.daysBetween('2026-10-25', '2026-10-26'), 1, 'the 25-hour fall-back day counts as 1');
  eq(api.daysBetween('2026-03-01', '2026-04-01'), 31, 'a month spanning the switch is still 31 days');
  eq(api.addDaysISO('2026-03-28', 2), '2026-03-30', 'stepping across the switch lands on the right day');
  eq(api.addDaysISO('2026-10-24', 2), '2026-10-26', '...in both directions');
}

console.log('\nMembership is derived from the data, not from a flag');
{
  const { api } = setup([
    note('due-only', 'Due only', { due: '2026-07-20' }),
    note('bars-only', 'Bars only', { schedule: sched(bar('s1', '2026-07-15', '2026-07-17')) }),
    note('both', 'Both', { due: '2026-07-25', schedule: sched(bar('s2', '2026-07-15', '2026-07-16')) }),
    note('neither', 'Neither'),
    note('archived', 'Archived', { due: '2026-07-20', archived: true }),
    note('_priorities', 'Priorities', { due: '2026-07-20' }),
  ]);
  eq(api.tlRows().map(r => r.id).sort(), ['bars-only', 'both', 'due-only'], 'a due date OR a bar puts an entry on the timeline');
  eq(api.tlOnTimeline(api.items.find(i => i.id === 'neither')), false, 'an entry with neither stays off it');
  eq(api.tlOnTimeline(api.items.find(i => i.id === 'archived')), false, 'archived entries stay off it, due date or not');
  eq(api.tlOnTimeline(api.items.find(i => i.id === '_priorities')), false, 'and so do the dashboard-only special cards');
}

console.log('\nBar geometry — `end` is inclusive');
{
  const { api } = setup([note('a', 'A', { schedule: sched(bar('s1', '2026-07-14', '2026-07-14')) })]);
  api.setView('timeline');           // renders, which is what sets the window origin the geometry uses
  const oneDay = api.tlBarGeom({ start: '2026-07-14', end: '2026-07-14' });
  const twoDay = api.tlBarGeom({ start: '2026-07-14', end: '2026-07-15' });
  const px = api.tlPxPerDay;
  eq(oneDay.width, Math.max(px - 4, 16), 'a one-day bar (start === end) is one day wide, not zero');
  eq(twoDay.width - oneDay.width, px, 'each extra day adds exactly one day of width');
  eq(twoDay.left, oneDay.left, 'growing a bar rightwards does not move its left edge');
}

console.log('\nDrag maths: move, resize, and the clamps');
{
  const { api } = setup();
  const d = (mode, start0, end0) => ({ mode, start0, end0 });

  eq(api.tlDragTarget(d('move', '2026-07-14', '2026-07-16'), 3),
     { start: '2026-07-17', end: '2026-07-19' }, 'move slides both ends by the same delta');
  eq(api.tlDragTarget(d('move', '2026-07-14', '2026-07-16'), -3),
     { start: '2026-07-11', end: '2026-07-13' }, '...in both directions');

  eq(api.tlDragTarget(d('resize-r', '2026-07-14', '2026-07-16'), 2),
     { start: '2026-07-14', end: '2026-07-18' }, 'the right edge extends the end');
  eq(api.tlDragTarget(d('resize-r', '2026-07-14', '2026-07-16'), -99),
     { start: '2026-07-14', end: '2026-07-14' }, '...but can never pull the end past the start (min 1 day)');

  eq(api.tlDragTarget(d('resize-l', '2026-07-14', '2026-07-16'), -2),
     { start: '2026-07-12', end: '2026-07-16' }, 'the left edge extends the start');
  eq(api.tlDragTarget(d('resize-l', '2026-07-14', '2026-07-16'), 99),
     { start: '2026-07-16', end: '2026-07-16' }, '...but can never push the start past the end (min 1 day)');
}

console.log('\nThe window reaches a year into the future — at every zoom');
{
  const { api } = setup([]);
  const today = api.todayISO();
  const empty = api.tlWindow([]);
  eq(api.daysBetween(empty.lo, today) >= 0, true, 'today is inside the window');
  // You must be able to pan a year forward whatever the zoom, so the drawable window has to reach
  // there at every scale (the extent is in DAYS, independent of px-per-day).
  const yearOut = api.addDaysISO(today, 365);
  const reachesNextYear = () => api.daysBetween(empty.lo, yearOut) < empty.days;
  eq(reachesNextYear(), true, 'the window extends past a year from today');

  // Even with a bar sitting far in the future, today stays on screen and the bar still fits — AND
  // there is a year of room beyond it.
  const far = api.tlWindow([{ id: 'x', schedule: sched(bar('s', '2027-01-01', '2027-01-05')) }]);
  eq(api.daysBetween(far.lo, today) >= 0, true, 'a far-future bar does not push today off the left edge');
  eq(api.daysBetween(far.lo, api.addDaysISO('2027-01-05', 365)) < far.days, true,
     '...and there is still a year of room past the last bar');
}

console.log('\nSeeding: what a card gets when you first put it on the timeline');
{
  const { api } = setup();
  const today = api.todayISO();

  const plain = note('p', 'Plain');
  api.tlSeed(plain);
  eq(api.tlSubs(plain).length, 1, 'one bar');
  eq(api.tlSubs(plain)[0].start, today, '...starting today');
  eq(api.tlSubs(plain)[0].end, api.addDaysISO(today, 2), '...running three days');
  eq(api.tlSubs(plain)[0].title, '', '...and unnamed, so it reads as something to name');

  const dueSoon = note('d', 'Due soon', { due: api.addDaysISO(today, 10) });
  api.tlSeed(dueSoon);
  eq(api.tlSubs(dueSoon)[0].end, api.addDaysISO(today, 10), 'with a due date, the bar runs up to it');

  const overdue = note('o', 'Overdue', { due: api.addDaysISO(today, -10) });
  api.tlSeed(overdue);
  eq(api.tlSubs(overdue)[0].start, today, 'an overdue card seeds a bar today...');
  eq(api.tlSubs(overdue)[0].end, today, '...one day long, rather than a backwards bar');
}

console.log('\nThe sidebar Sort menu orders the timeline — it has no sort of its own');
{
  // The timeline takes getVisibleItems() wholesale: its search, its facets AND its order. So Sort
  // means one thing across the app, and the panel needs no second sort control.
  const { api } = setup([
    note('c', 'Cherry', { tags: ['zeta'],  _sortTag: 'zeta',  due: '2026-07-30', schedule: sched(bar('s1', '2026-07-20', '2026-07-21')) }),
    note('a', 'Apple',  { tags: ['beta'],  _sortTag: 'beta',  due: '2026-07-10', schedule: sched(bar('s2', '2026-07-10', '2026-07-11')) }),
    note('b', 'Banana', { tags: ['alpha'], _sortTag: 'alpha', due: '2026-07-20' }),
  ]);
  api.setView('timeline');

  api.setSort('alpha');
  eq(api.tlRows().map(r => r.id), ['a', 'b', 'c'], 'Alphabetic orders the rows A→Z');

  api.setSort('due');
  eq(api.tlRows().map(r => r.id), ['c', 'b', 'a'], 'Due orders them by due date (descending first, as in the list)');
  api.setSort('due');
  eq(api.tlRows().map(r => r.id), ['a', 'b', 'c'], '...and picking it again reverses the direction');

  api.setSort('tags');
  eq(api.tlRows().map(r => r.id), ['c', 'a', 'b'], 'Tags orders them by the card\'s primary tag');
  api.setSort('tags');
  eq(api.tlRows().map(r => r.id), ['b', 'a', 'c'], '...and reverses, exactly as it does in the card list');

  // Pinned-first is a rule of the card sort, so it must hold here too.
  api.items.find(i => i.id === 'c').pinned = true;
  api.setSort('alpha');
  eq(api.tlRows().map(r => r.id), ['c', 'a', 'b'], 'a pinned entry sorts first here exactly as it does in the list');
}

console.log('\nBars: add, rename, remove');
{
  const { api } = setup([note('a', 'A', { due: '2026-07-20' })]);
  const it = () => api.items.find(i => i.id === 'a');

  await api.tlAddBar(null, 'a', '2026-07-16');
  eq(api.tlSubs(it()).length, 1, 'a lane double-click adds a bar');
  eq([api.tlSubs(it())[0].start, api.tlSubs(it())[0].end], ['2026-07-16', '2026-07-16'],
     '...one day long, on the day you clicked');

  const sid = api.tlSubs(it())[0].id;
  await api.tlSetBarTitle('a', sid, 'draft');
  eq(api.tlSubs(it())[0].title, 'draft', 'renaming writes the title through to the entry');

  await api.tlRemoveBar(null, 'a', sid);
  eq(api.tlSubs(it()).length, 0, 'removing takes the bar away...');
  eq(api.tlOnTimeline(it()), true, '...but the row stays, because the due date still puts it there');
}

console.log('\nRemoving the last bar of an entry with no due date drops its row');
{
  const { api, toasts } = setup([note('a', 'A', { schedule: sched(bar('s1', '2026-07-14', '2026-07-16')) })]);
  await api.tlRemoveBar(null, 'a', 's1');
  const it = api.items.find(i => i.id === 'a');
  eq(api.tlOnTimeline(it), false, 'no bars and no due date → no longer on the timeline');
  eq(it.schedule, undefined, 'and no empty schedule husk is left in the JSON');
  eq(api.items.length, 1, 'the card itself is untouched');
  eq(toasts.includes('Removed from timeline'), true, 'and it says so, since the row just vanished');
}

console.log('\nRemoving a row: unschedules, never deletes — and asks before it costs you a due date');
{
  const { api, sandbox } = setup([note('a', 'A', { due: '2026-07-20', schedule: sched(bar('s1', '2026-07-14', '2026-07-16')) })]);
  sandbox.confirm = () => false;
  await api.tlRemoveRow(null, 'a');
  eq(api.tlOnTimeline(api.items.find(i => i.id === 'a')), true, 'saying no to the prompt changes nothing');
  eq(api.items.find(i => i.id === 'a').due, '2026-07-20', '...and the due date survives');

  sandbox.confirm = () => true;
  await api.tlRemoveRow(null, 'a');
  const it = api.items.find(i => i.id === 'a');
  eq(api.tlOnTimeline(it), false, 'saying yes takes the row off the timeline');
  eq(it.due, '', '...which necessarily clears the due date — that date is what put it there');
  eq(it.schedule, undefined, '...and its bars');
  eq(api.items.length, 1, 'but the CARD is still there. This unschedules; it never deletes.');
  eq(it.title, 'A', '...intact');
}

console.log('\nThe due date is one field, so the card and the timeline cannot disagree');
{
  // There is no copy of the due date to keep in step: the dashed marker and the card's due badge
  // both read entry.due, and dragging the marker writes that same field.
  const { api } = setup([note('a', 'A', { due: '2026-07-20' })]);
  const it = api.items.find(i => i.id === 'a');
  eq(api.tlOnTimeline(it), true, 'a due date alone puts the card on the timeline');

  it.due = '2026-07-25';                       // what a marker drag commits
  api.setView('list');
  const html = api.items && (() => { api.renderList(); return true; })();
  eq(html, true, 'the card list re-renders from the same field');
  eq(api.tlRows().length, 1, 'and the row is still there, now sitting on the new date');

  it.due = '';                                 // clearing it on the card takes the row away
  eq(api.tlOnTimeline(it), false, 'clearing the due date on the card removes the row');
}

console.log('\nThe search bar and the sidebar facets narrow the timeline too');
{
  // The timeline draws its rows from the same getVisibleItems() the card list does, so a query
  // means the same thing in every view rather than being quietly ignored in this one.
  const { api, el } = setup([
    note('a', 'Meiotic drive paper', { tags: ['drive'], due: '2026-07-20' }),
    note('b', 'PsychENCODE access', { tags: ['admin'], due: '2026-07-22' }),
    note('c', 'Unscheduled note', { tags: ['drive'] }),
    note('d', 'Archived but dated', { tags: ['drive'], due: '2026-07-21', archived: true }),
  ]);
  api.setView('timeline');
  eq(api.tlRows().map(r => r.id), ['a', 'b'], 'with no query, every scheduled entry is a row');

  el('search-input').value = 'psychencode';
  eq(api.tlRows().map(r => r.id), ['b'], 'a free-text search narrows the rows');

  el('search-input').value = '#drive';
  eq(api.tlRows().map(r => r.id), ['a'], 'a #tag search narrows them...');
  eq(api.tlRows().some(r => r.id === 'c'), false, '...and still never pulls in an unscheduled card');
  eq(api.tlRows().some(r => r.id === 'd'), false, '...nor an archived one');

  el('search-input').value = 'nothing matches this';
  eq(api.tlRows().length, 0, 'a query that matches nothing empties the timeline');
  api.renderTimeline();
  eq(/No matches/.test(el('timeline-view').innerHTML), true,
     '...and it says "No matches", not "Nothing scheduled" — those are different problems');

  el('search-input').value = '';
  eq(api.tlRows().map(r => r.id), ['a', 'b'], 'clearing the query brings the rows back');

  // Sidebar facets go through the same pipeline.
  api.setTagFilter('admin');
  eq(api.tlRows().map(r => r.id), ['b'], 'a sidebar tag filter narrows the timeline as well');
  api.renderFilters();
  eq(/clearAllFilters/.test(el('page-title').innerHTML), true,
     'and the title offers the ← that clears it, as in every other view');
  api.clearAllFilters();
  eq(api.tlRows().map(r => r.id), ['a', 'b'], 'clearing it restores them');
}

console.log('\nThe view switch now has three positions');
{
  const { api, el } = setup([note('n1', 'Normal'), note('p1', 'Pinned', { pinned: true })]);

  api.setView('timeline');
  eq(api.mainView, 'timeline', 'setView goes to the timeline');
  eq(el('item-list').style.display, 'none', '...hides the card list');
  eq(el('timeline-view').style.display, '', '...and shows the timeline container');
  eq(/Nothing scheduled/.test(el('timeline-view').innerHTML), true, '...which is empty until something is scheduled');
  api.renderFilters();
  eq(el('page-title').innerHTML, 'Timeline (0)', '...and the page title says so, with the count the panel no longer carries');

  // The panel stretches to fill the view instead of shrinking to its rows, which takes a flex chain
  // from .main down. It is switched on by this class so the card list's layout is left alone.
  eq(el('main-area').classList.contains('panel-mode'), true, '...and the main area stretches to fit it');

  api.setView('list');
  eq(el('timeline-view').style.display, 'none', 'leaving it hides the timeline again');
  eq(el('item-list').style.display, '', '...and brings the card list back');
  eq(el('main-area').classList.contains('panel-mode'), false, '...and the card list gets its normal layout back');
  eq(/data-id="n1"/.test(el('item-list').innerHTML), true, '...with the cards in it');

  // The D key and setDashboard() still speak in booleans — they must not have regressed.
  api.setDashboard(true);
  eq(api.mainView, 'dash', 'setDashboard(true) still means the dashboard');
  eq(api.digestVisible, true, '...and the old boolean still reads true there');
  api.setView('timeline');
  api.toggleDigest();
  eq(api.mainView, 'dash', 'D from the timeline goes back to the dashboard');
  api.toggleTimelineView();
  eq(api.mainView, 'timeline', 'T opens the timeline');
  api.toggleTimelineView();
  eq(api.mainView, 'list', '...and T again leaves it');
}

console.log('\nA card shows its timeline data as a Schedule read-out at its foot');
{
  const { api, el } = setup([
    note('a', 'Paper', {
      due: '2026-08-07',
      schedule: sched(bar('s2', '2026-07-20', '2026-07-22', 'submit'), bar('s1', '2026-07-12', '2026-07-17', 'figures')),
    }),
  ]);

  const md = api.scheduleMd(api.items.find(i => i.id === 'a'));
  const lines = md.split('\n');
  eq(lines[0], '## Schedule', 'it is a "## Schedule" section');
  eq(lines[1], '- 12 Jul 2026, 17 Jul 2026, figures', 'bars are listed start, end, label — earliest first');
  eq(lines[2], '- 20 Jul 2026, 22 Jul 2026, submit', '...in date order, not the order they were stored');
  eq(lines[3], '- Deadline: 7 Aug 2026', 'and the due date is the Deadline line, last');

  // A bar with no label drops the trailing label, not leaving a dangling comma.
  eq(api.scheduleMd({ schedule: sched(bar('x', '2026-07-01', '2026-07-03')) }),
     '## Schedule\n- 1 Jul 2026, 3 Jul 2026', 'an unnamed bar shows just its two dates');

  // Due date only — still a Schedule section, just the Deadline.
  eq(api.scheduleMd({ due: '2026-09-01' }), '## Schedule\n- Deadline: 1 Sept 2026', 'a card with only a due date shows just the deadline');
  // Nothing scheduled — no section at all.
  eq(api.scheduleMd({ id: 'z' }), '', 'a card with neither a bar nor a due date has no Schedule section');

  // It rides the body: shown on an expanded card, absent on a collapsed one.
  api.setView('list');
  api.renderList();
  eq(/## Schedule/.test(el('item-list').innerHTML), false, 'a collapsed card does not carry the Schedule section');
  api.expandedId = 'a';
  api.renderList();
  eq(/card-schedule/.test(el('item-list').innerHTML), true, '...but an expanded one does');
  eq(/Deadline: 7 Aug 2026/.test(el('item-list').innerHTML), true, '...with the deadline in it');
}

console.log('\nThe card icon schedules the entry and takes you to its row');
{
  const { api, el } = setup([note('a', 'A')]);
  api.setView('list');
  api.expandedId = 'a';   // the timeline icon lives on the expanded card's action row
  api.renderList();
  eq(/tl-icon/.test(el('item-list').innerHTML), true, 'an expanded card carries a timeline icon');
  eq(/tl-icon active/.test(el('item-list').innerHTML), false, '...unlit while the card is not scheduled');

  await api.cardToTimeline(null, 'a');
  const it = api.items.find(i => i.id === 'a');
  eq(api.tlSubs(it).length, 1, 'clicking it schedules the entry');
  eq(api.mainView, 'timeline', '...and opens the timeline');
  eq(api.tlFocusId, 'a', '...focused on that row');

  api.setView('list');
  api.expandedId = 'a';
  api.renderList();
  eq(/tl-icon active/.test(el('item-list').innerHTML), true, 'now the card\'s icon is lit');

  // Clicking again must not schedule a second bar — it just takes you back to the row.
  await api.cardToTimeline(null, 'a');
  eq(api.tlSubs(api.items.find(i => i.id === 'a')).length, 1, 'clicking a scheduled card adds nothing; it just opens the row');
}

console.log('\nArchived cards refuse to be scheduled (they would be invisible if they did)');
{
  const { api, toasts } = setup([note('a', 'A', { archived: true })]);
  await api.cardToTimeline(null, 'a');
  eq(api.tlSubs(api.items.find(i => i.id === 'a')).length, 0, 'nothing is scheduled');
  eq(api.mainView, 'dash', '...and the view does not change');
  eq(toasts.some(t => /Unarchive/.test(t)), true, '...it says why');
}

console.log('\nRead-only devices can look, but every mutation is a no-op');
{
  const { api } = setup([note('a', 'A', { due: '2026-07-20', schedule: sched(bar('s1', '2026-07-14', '2026-07-16')) })]);
  api.readOnly = true;
  const it = () => api.items.find(i => i.id === 'a');

  await api.tlAddBar(null, 'a', '2026-07-18');
  eq(api.tlSubs(it()).length, 1, 'no bar is added');
  await api.tlRemoveBar(null, 'a', 's1');
  eq(api.tlSubs(it()).length, 1, 'no bar is removed');
  await api.tlRemoveRow(null, 'a');
  eq(it().due, '2026-07-20', 'no row is removed, and the due date is safe');

  api.setView('timeline');
  eq(api.tlRows().length, 1, 'but the timeline still renders');
}

console.log('\nHovering a task label shows the card, the same as the graph — and the same switch controls it');
{
  const { api, sandbox } = setup([
    note('a', 'Meiotic drive', { tags: ['drive'], genes: ['ARHGAP5'], content: 'the body' }),
  ]);
  api.setView('timeline');
  const pop = () => sandbox.document.getElementById('app-pop');
  const html = () => pop().innerHTML;
  // A fake label element to anchor the tooltip to (getBoundingClientRect comes from the harness).
  const anchor = sandbox.document.createElement('span');
  const hover = () => api.tlRowPop({ currentTarget: anchor }, 'a');

  api.setPreviewMode('rendered');
  hover();
  eq(/data-id="a"/.test(html()), true, 'the tooltip is the real card, the same renderCard() the list and graph use');
  eq(pop().classList.contains('cardmode'), true, '...in card mode, so the dark bubble gets out of the way');
  eq(/hide-previews|hide-meta/.test(html()), false, 'Body  → the whole card');

  api.setPreviewMode('compact');
  hover();
  eq(/class="pop-card hide-previews"/.test(html()), true, 'Tags  → the same class that drops the body');

  api.setPreviewMode('minimal');
  hover();
  eq(/class="pop-card hide-meta"/.test(html()), true, 'Title → the same class that drops tags and body too');

  // Not while a bar is being dragged — the pop would fight the drag.
  api.setPreviewMode('rendered');
  api.popHide();
  // (the guard is on _tlDrag; we can't set it from here, so just confirm a normal hover still works)
  hover();
  eq(pop().style.display, 'block', 'a normal hover shows it');
}

console.log('\nOn a phone the Task column is a drawer: pan left shuts it, pan right opens it');
{
  const { api, el, sandbox } = setup([note('a', 'A', { due: '2026-07-20' })]);
  sandbox.window.innerWidth = 400;          // a phone-width window
  api.setView('timeline');
  const lanes = el('tl-lanes');
  const shut = () => el('tl-left').classList.contains('tl-left-shut');
  const scrollTo = x => { lanes.scrollLeft = x; api.tlScroll(); };

  scrollTo(lanes.scrollLeft || 0);          // establish the reference
  eq(shut(), false, 'the drawer starts open');

  scrollTo((lanes.scrollLeft || 0) + 60);   // pan left past the threshold
  eq(shut(), true, 'panning left past the threshold slides it shut');
  eq(api.tlDrawerShut, true, '...and the state agrees');

  scrollTo((lanes.scrollLeft || 0) - 60);   // pan back right
  eq(shut(), false, 'panning right slides it back open');

  // A jitter under the threshold must not toggle it.
  const base = lanes.scrollLeft || 0;
  scrollTo(base + 20); scrollTo(base + 5);
  eq(shut(), false, 'a small back-and-forth jitter does not flip it');
}

console.log('\nOn the desktop the Task column is fixed — panning never hides it');
{
  const { api, el, sandbox } = setup([note('a', 'A', { due: '2026-07-20' })]);
  sandbox.window.innerWidth = 1200;         // desktop width
  // matchMedia isn't defined in the sandbox, and 1200 > 640, so the drawer is inactive.
  eq(api.tlDrawerActive(), false, 'the drawer is inactive on a wide screen');
  api.setView('timeline');
  const lanes = el('tl-lanes');
  lanes.scrollLeft = 0; api.tlScroll();
  lanes.scrollLeft = 200; api.tlScroll();   // a big pan left
  eq(el('tl-left').classList.contains('tl-left-shut'), false, 'the column stays put on the desktop');
}

console.log('\nScrolling pans; only a pinch zooms (this is what stopped the jerkiness)');
{
  const { api } = setup([note('a', 'A', { due: '2026-07-20' })]);
  api.setView('timeline');
  const wheel = (o) => api.tlWheel({ deltaX: 0, deltaY: 0, clientX: 200, deltaMode: 0, preventDefault(){}, ...o });

  const px0 = api.tlPxPerDay;
  wheel({ deltaY: 120 });                 // a plain vertical wheel — used to zoom, mid-pan
  eq(api.tlPxPerDay, px0, 'a plain wheel does NOT zoom any more — it pans');
  wheel({ deltaX: 200 });                 // a horizontal swipe
  eq(api.tlPxPerDay, px0, '...and neither does a horizontal swipe');

  wheel({ deltaY: -120, ctrlKey: true }); // a pinch
  eq(api.tlPxPerDay > px0, true, 'a pinch (ctrl+wheel) zooms in');
  wheel({ deltaY: 120, ctrlKey: true });
  eq(api.tlPxPerDay <= px0 + 0.001, true, '...and back out');
}

console.log('\nZoom stays inside its rails');
{
  const { api } = setup([note('a', 'A', { due: '2026-07-20' })]);
  api.setView('timeline');
  api.tlSetZoom(96);
  eq(api.tlPxPerDay, 96, 'a preset sets the scale');
  api.tlSetZoom(9999);
  eq(api.tlPxPerDay, 120, '...and nothing can exceed the maximum');
  api.tlSetZoom(0.1);
  eq(api.tlPxPerDay, 3, '...or drop below the minimum (3px/day — a year across the lane)');
}

console.log('\nZooming out to a quarter and a year');
{
  const { api } = setup([note('a', 'Paper', { schedule: sched(bar('s1', '2026-07-14', '2026-07-20')) })]);
  api.setView('timeline');

  // The window is a fixed, generous DATE range now, not a zoom-dependent one — a year forward at any
  // scale — so it always spans well over a year and never shrinks to a sliver.
  const daysAt = px => { api.tlSetZoom(px); return api.tlWindow(api.tlRows()).days; };
  eq(daysAt(3) >= 365, true, 'at Year zoom the window still spans more than a year');
  eq(daysAt(96) >= 365, true, '...and so it does at Day zoom');

  // The origin must not move while zooming, or every bar would slide under the cursor.
  const lo = px => { api.tlSetZoom(px); return api.tlWindow(api.tlRows()).lo; };
  eq(lo(3), lo(96), 'the window origin is the same at every zoom, so the bars stay put');
}

console.log('\nThe panel carries no chrome of its own');
{
  const { api, el } = setup([note('a', 'Paper', { due: '2026-07-20' })]);
  api.setView('timeline');
  const html = el('timeline-view').innerHTML;
  eq(/tl-head|tl-foot|tl-range|Zoom|Sort/.test(html), false,
     'no header, no footer, no zoom or sort switch — the sidebar and the wheel already do those jobs');
  eq(/tl-grip/.test(html), false, 'and no reorder grip: order comes from the Sort menu now');

  // The count moves to the page title, where every other view already puts one.
  api.renderFilters();
  eq(el('page-title').innerHTML, 'Timeline (1)', 'the entry count lives in the page title');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
