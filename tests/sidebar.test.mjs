// The collapsible sidebar. On the desktop \ (or the « / ☰ buttons) collapses it to zero width via
// .sb-collapsed on .layout, and the choice survives a reload. On a phone the same toggle drives the
// existing slide-in drawer (.open) instead, and stores nothing.
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
const note = (id, title) =>
  ({ id, type: 'note', title, tags: [], genes: [], content: 'body', date: '2026-07-14T00:00:00Z' });

// The fake DOM hands out a fresh element per querySelector call, so pin .layout to one element.
// Seeded before load, because the stored state is applied while the script loads.
function fakeLayout() {
  const c = new Set();
  return { classList: {
    contains: x => c.has(x),
    toggle(x, force) { const on = force === undefined ? !c.has(x) : !!force; on ? c.add(x) : c.delete(x); return on; },
  } };
}
function setup({ storage = {}, mobile = false } = {}) {
  const layout = fakeLayout();
  const ctx = load({ fetchImpl: noop, storage, selectorSeed: [['.layout', layout]] });
  ctx.sandbox.window.matchMedia = q => ({ matches: mobile && q.includes('max-width: 640px') });
  return { ...ctx, layout, el: id => ctx.sandbox.document.getElementById(id) };
}

console.log('\n\\ collapses and restores the sidebar on the desktop');
{
  const { press, layout, sandbox } = setup();
  const ev = press('\\', { code: 'Backslash' });
  ok(layout.classList.contains('sb-collapsed'), '\\ collapses it');
  ok(ev.defaultPrevented, '...and swallows the key');
  eq(sandbox.localStorage.getItem('sb_collapsed'), '1', '...and remembers that');
  press('\\', { code: 'Backslash' });
  ok(!layout.classList.contains('sb-collapsed'), 'a second \\ brings it back');
  eq(sandbox.localStorage.getItem('sb_collapsed'), '0', '...and remembers that too');
}
{
  const { press, layout } = setup();
  press('\\', { code: 'Digit7', shiftKey: true, altKey: true });
  ok(layout.classList.contains('sb-collapsed'), 'matched by character: ⇧⌥7 on a Danish Mac works');
}
{
  const { press, layout } = setup();
  press('\\', { code: 'Backslash', metaKey: true });
  ok(!layout.classList.contains('sb-collapsed'), '⌘\\ is left to the browser');
}
{
  const { press, layout, sandbox, el } = setup();
  const search = el('search-input');
  search.tagName = 'INPUT';
  sandbox.document.activeElement = search;
  const ev = press('\\', { code: 'Backslash' });
  ok(!layout.classList.contains('sb-collapsed'), 'typing \\ into a field does not toggle');
  ok(!ev.defaultPrevented, '...and the character reaches the field');
}

console.log('\nThe collapsed state survives a reload');
{
  const { layout } = setup({ storage: { sb_collapsed: '1' } });
  ok(layout.classList.contains('sb-collapsed'), 'stored "1" starts collapsed');
}
{
  const { layout } = setup({ storage: { sb_collapsed: '0' } });
  ok(!layout.classList.contains('sb-collapsed'), 'stored "0" starts expanded');
}

console.log('\nThe card columns are recounted after the width changes');
{
  const { api, press, el } = setup();
  api.ghRepoMode = true; api.canWrite = true; api.readOnly = false;
  api.mainView = 'list';
  api.items = [note('a1', 'Alpha card')];
  el('item-list').innerHTML = '';
  press('\\', { code: 'Backslash' });
  eq(el('item-list').innerHTML, '', 'not immediately — the width is still animating');
  await new Promise(r => setTimeout(r, 300));
  ok(el('item-list').innerHTML.includes('Alpha card'), 're-rendered once the transition has settled');
}

console.log('\nOn a phone the same toggle drives the drawer');
{
  const { api, layout, el, sandbox } = setup({ mobile: true });
  api.toggleSidebar();
  ok(el('sidebar').classList.contains('open'), 'it opens the slide-in drawer');
  ok(!layout.classList.contains('sb-collapsed'), '...and leaves the desktop collapse alone');
  eq(sandbox.localStorage.getItem('sb_collapsed'), null, '...and stores nothing');
  api.toggleSidebar();
  ok(!el('sidebar').classList.contains('open'), 'again closes it');
}

console.log('\nMarkup');
{
  const src = readFileSync(new URL('../memento.html', import.meta.url), 'utf8');
  ok(/class="sb-title sb-title-toggle" onclick="toggleSidebar\(\)"/.test(src), 'clicking anywhere in the "Memento" title box collapses it');
  ok(!/sb-collapse-btn"[^>]*onclick/.test(src), '...and the « inside it is only a cue, so one click toggles once');
  ok(src.includes('class="sb-menu-btn" onclick="toggleSidebar()"'), 'the ☰ button goes through the same toggle');
  const { api, sandbox } = setup();
  api.toggleKeyHelp();
  const overlay = sandbox.document.__created.find(el => el.innerHTML.includes('key-help'));
  ok(overlay && overlay.innerHTML.includes('<kbd>\\</kbd>') && overlay.innerHTML.includes('Hide / show the sidebar'),
     'the cheat-sheet lists \\');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
