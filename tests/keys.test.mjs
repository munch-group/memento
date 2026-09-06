// The Esc ladder, and the one gesture that clears the search.
//
// Esc walks a ladder of transient state, most local first. A single press never touches the search
// box: everything on the ladder is state Esc itself put up, while a typed filter is the one thing
// on screen that costs real effort to reproduce. The exception — and the reason this file exists —
// is a deliberate double-tap, armed only by a press that had nothing to close. That arming rule is
// the whole safety story: the reflexive second Esc after dismissing a form or a bulk selection must
// not be able to take the filter with it.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✓ ${msg}`); } else { fail++; console.log(`  ✗ ${msg}`); } };

const noop = async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });
const note = (id, title) =>
  ({ id, type: 'note', title, tags: [], genes: [], content: 'body of ' + id, date: '2026-07-14T00:00:00Z' });

// `focused` puts the caret in the search box, the way it is the moment you finish typing a filter.
// `backLink` decides whether the title is showing a "← back" affordance, which is a rung of its own.
function setup({ query = 'pinned', focused = true, backLink = false } = {}) {
  const { api, sandbox, press, selectors } = load({ fetchImpl: noop });
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  api.mainView = 'list';   // renderList() draws the dashboard otherwise, and cards are the subject here
  api.items = [note('p1', 'Pinned'), note('n1', 'Normal'), note('n2', 'Normal 2')];
  const el = id => sandbox.document.getElementById(id);
  // The add form is the ladder's first rung, and in a fresh fake DOM every style.display is
  // undefined — which reads as "open". Shut it so tests that aren't about the form start below it.
  el('add-form').style.display = 'none';
  if (!backLink) selectors.set('#page-title [onclick]', null);
  const search = el('search-input');
  search.tagName = 'INPUT';
  search.value = query;
  if (focused) sandbox.document.activeElement = search;
  return { api, sandbox, el, search, esc: () => press('Escape') };
}

console.log('\nA single Esc leaves the search alone');
{
  const { search, esc, sandbox } = setup();
  const ev = esc();
  eq(search.value, 'pinned', 'Esc in the field keeps what you typed');
  ok(ev.defaultPrevented, 'the default is suppressed — type="search" would otherwise be emptied by the browser');
  eq(sandbox.document.activeElement, null, 'and focus is dropped, so the next Esc addresses the app');
}
{
  const { search, esc } = setup({ focused: false });
  esc();
  eq(search.value, 'pinned', 'Esc with focus elsewhere does not clear either');
}

console.log('\nEsc Esc clears it');
{
  const { search, esc, el } = setup();
  esc(); esc();
  eq(search.value, '', 'blur, then a second press, clears the search');
  ok(el('item-list').innerHTML.includes('Normal 2'), 'and the list is re-rendered without the filter');
}
{
  const { search, esc } = setup({ focused: false });
  esc(); esc();
  eq(search.value, '', 'it works from outside the field too');
}

console.log('\nBut only as one deliberate gesture');
{
  const { api, search, esc } = setup();
  esc();
  api.lastEscAt = Date.now() - (api.ESC_DBL_MS + 50);   // two unrelated presses, not a double-tap
  esc();
  eq(search.value, 'pinned', `presses more than ${api.ESC_DBL_MS}ms apart are not a double-tap`);
}
{
  const { search, esc } = setup({ query: '' });
  esc(); esc();
  eq(search.value, '', 'an empty search stays empty — the rung is a no-op, not a crash');
}

console.log('\nThe press that closes something is never half of the gesture');
{
  // The reflex this guards against: dismiss bulk mode, then hit Esc again out of habit.
  const { api, search, esc } = setup({ focused: false });
  api.toggleBulkMode();
  ok(api.bulkMode, 'bulk mode on');
  esc();
  eq(api.bulkMode, false, 'the first Esc leaves bulk mode');
  esc();
  eq(search.value, 'pinned', 'and the reflexive second Esc does NOT take the filter with it');
  esc();
  eq(search.value, '', 'once nothing is left to close, two presses clear it as usual');
}
{
  const { search, esc, el } = setup({ focused: false });
  el('add-form').style.display = '';
  esc();
  eq(el('add-form').style.display, 'none', 'the first Esc closes the add form');
  esc();
  eq(search.value, 'pinned', 'the filter survives the press after a form dismissal');
}
{
  // A "← back" link in the title is a navigation, and navigating counts as closing something.
  let clicks = 0;
  const { sandbox, search, esc } = setup({ focused: false, backLink: true });
  const back = sandbox.document.createElement('span');
  back.click = () => { clicks++; };
  sandbox.document.querySelector = sel => (sel === '#page-title [onclick]' ? back : null);
  esc();
  eq(clicks, 1, 'the first Esc follows the back link');
  esc();
  eq(search.value, 'pinned', 'and the press after a navigation does not clear the filter');
}

console.log('\nThe cheat-sheet teaches the gesture');
{
  // An undiscoverable shortcut is not a feature: the promise and its exception must both be on the
  // sheet, and the row for the exception has to survive edits to the one above it.
  const { api, sandbox } = setup({ focused: false });
  api.toggleKeyHelp();
  ok(api.keyHelpVisible(), 'cheat-sheet opens');
  const sheet = sandbox.document.__created.map(el => el.innerHTML).join('');
  ok(/<kbd>Esc<\/kbd>\s*<kbd>Esc<\/kbd>/.test(sheet), 'it lists Esc Esc as its own row');
  ok(/Clear the search/.test(sheet), 'and says that row clears the search');
  ok(/never the search/.test(sheet), 'while the single-Esc row still promises not to');
  api.toggleKeyHelp();
  eq(api.keyHelpVisible(), false, 'and it closes again');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
