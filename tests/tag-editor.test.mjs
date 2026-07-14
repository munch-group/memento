// The quick tag editor: add/remove a card's tags from the card, without opening the edit form.
// Its defining constraint is that it can only ever move EXISTING tags between the two boxes —
// it must never be able to coin a new tag (or a typo'd near-duplicate of one).
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

const noop = async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });
const card = (id, tags) => ({ id, type: 'note', title: id, tags, genes: [], content: 'b', date: '2026-07-14T00:00:00Z' });
const ev = { stopPropagation() {} };

function setup(readOnly = false) {
  const { api, sandbox } = load({ fetchImpl: noop });
  api.ghRepoMode = true;
  api.canWrite = !readOnly;
  api.readOnly = readOnly;
  api.items = [
    card('a1', ['LoF', 'Baboons']),
    card('b2', ['SMBE26']),
    card('c3', []),
    card('d4', ['Solo']),          // 'Solo' is used by exactly one card
  ];
  return { api, sandbox };
}

console.log('\nOpening the editor');
{
  const { api, sandbox } = setup();
  api.openTagEditor(ev, 'c3');
  eq(api.tagEditorId, 'c3', 'targets the card that was clicked');
  eq(api.tagUniverse, ['Baboons', 'LoF', 'SMBE26', 'Solo'], 'universe = every tag in use, sorted');

  // The popup markup is the guarantee: no field to type into means no way to invent a tag.
  const overlay = sandbox.document.__created.at(-1);
  eq(/<input|<textarea/i.test(overlay.innerHTML), false, 'popup contains NO text input — new tags cannot be created');
  eq(/te-on|te-off/.test(overlay.innerHTML), true, 'popup has both boxes');
  api.closeTagEditor();
}

console.log('\nMoving tags between the boxes');
{
  const { api } = setup();
  api.openTagEditor(ev, 'c3');
  const c3 = () => api.items.find(i => i.id === 'c3');

  await api.toggleCardTag('LoF');
  eq(c3().tags, ['LoF'], 'tapping an available tag adds it to the card');
  await api.toggleCardTag('SMBE26');
  eq(c3().tags, ['LoF', 'SMBE26'], 'a second tag adds alongside the first');
  await api.toggleCardTag('LoF');
  eq(c3().tags, ['SMBE26'], 'tapping a tag on the card removes it');
  eq(api.tagUniverse.includes('LoF'), true, 'the removed tag is still offered in Available');
  api.closeTagEditor();
}

console.log("\nRemoving a tag's last remaining use");
{
  // If the universe were recomputed live, removing 'Solo' from its only card would make it vanish
  // from the picker and you could not put it back. The open-time snapshot prevents that.
  const { api } = setup();
  api.openTagEditor(ev, 'd4');
  eq(api.tagUniverse.includes('Solo'), true, 'Solo is in the universe to begin with');
  await api.toggleCardTag('Solo');
  eq(api.items.find(i => i.id === 'd4').tags, [], 'Solo removed from its only card');
  eq(api.tagUniverse.includes('Solo'), true, 'Solo remains available, so it can be put back');
  await api.toggleCardTag('Solo');
  eq(api.items.find(i => i.id === 'd4').tags, ['Solo'], 'and it goes back on');
  api.closeTagEditor();
}

console.log('\nEdits persist through the storage seam');
{
  const { api } = setup();
  api.openTagEditor(ev, 'c3');
  await api.toggleCardTag('LoF');
  const queued = [...api.queue.keys()].sort();
  eq(queued, ['knowledge-base/entries/c3.json', 'knowledge-base/entries/c3.md'],
     'the card is queued for commit (both files), not left only in memory');
  const meta = JSON.parse(api.queue.get('knowledge-base/entries/c3.json').text);
  eq(meta.tags, ['LoF'], 'the committed .json carries the new tags');
  api.closeTagEditor();
}

console.log('\nRead-only');
{
  const { api } = setup(true);
  api.openTagEditor(ev, 'c3');
  eq(api.tagEditorId, null, 'the editor refuses to open when the app is read-only');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
