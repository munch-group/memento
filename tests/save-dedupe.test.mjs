// Regression guard: pressing Save more than once while the first write is still in flight must not
// file duplicate cards.
//
// saveItem() writes the card to disk BEFORE it clears and hides the form, and it resets editingId
// to null on the way in. So during a slow write the form is still up, still filled in, and still
// clickable — and a second press takes the "new card" branch, because editingId no longer points
// at anything. Five presses on one slow write once produced five byte-identical copies of a card.
import { load } from './harness.mjs';

// ---- fake File System Access API, with a write we can hold open ----
function makeFS() {
  const files = new Map();
  let release, gate = new Promise(r => { release = r; });
  let gated = false;
  const dir = (path) => ({
    name: path.split('/').pop() || 'knowledge-base',
    kind: 'directory',
    async getDirectoryHandle(n) { return dir(path ? `${path}/${n}` : n); },
    async getFileHandle(n, opts) {
      const key = path ? `${path}/${n}` : n;
      if (!files.has(key)) {
        if (!opts?.create) { const e = new Error('NotFound'); e.name = 'NotFoundError'; throw e; }
        files.set(key, '');
      }
      return {
        kind: 'file',
        async getFile() { return { text: async () => files.get(key) }; },
        async createWritable() {
          let buf = '';
          return {
            async write(chunk) { buf = chunk; },
            async close() { if (gated) await gate; files.set(key, buf); },
          };
        },
      };
    },
    async removeEntry(n) { files.delete(path ? `${path}/${n}` : n); },
    async queryPermission() { return 'granted'; },
    [Symbol.asyncIterator]: async function* () {},
  });
  return {
    files, root: dir(''),
    hold() { gated = true; },
    async releaseAndSettle() { gated = false; release(); for (let i = 0; i < 50; i++) await Promise.resolve(); },
  };
}

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

const { api, sandbox } = load({ fetchImpl: async () => ({ ok: false, status: 500, json: async () => ({}), text: async () => '' }) });
const fs = makeFS();
api.ghRepoMode = false;
api.readOnly = false;
sandbox.__setHandles(fs.root, await fs.root.getDirectoryHandle('entries'));

const fill = (content, title) => {
  sandbox.document.getElementById('f-content').value = content;
  sandbox.document.getElementById('f-title').value = title;
  for (const id of ['f-genes', 'f-tags', 'f-source', 'f-due']) sandbox.document.getElementById(id).value = '';
};

console.log('\nDouble-submit while the save is in flight');
{
  api.items = [];
  api.selType('note');
  fill('permutation importance, not feature_importances_', 'Random forest with scikit-learn');

  fs.hold();                       // the disk write now blocks until we let it go
  const presses = [api.saveItem(), api.saveItem(), api.saveItem(), api.saveItem(), api.saveItem()];
  await fs.releaseAndSettle();
  await Promise.all(presses);

  eq(api.items.length, 1, 'five Save presses on one slow write create ONE card');
  eq(api.items[0]?.title, 'Random forest with scikit-learn', 'the one card is the one that was typed');
  const jsons = [...fs.files.keys()].filter(k => k.endsWith('.json'));
  eq(jsons.length, 1, 'exactly one .json on disk');
  eq([...fs.files.keys()].filter(k => k.endsWith('.md')).length, 1, 'exactly one .md on disk');
  eq(JSON.parse(fs.files.get(jsons[0])).id, api.items[0]?.id, 'the file on disk is the card in memory');
}

console.log('\nThe guard releases afterwards');
{
  eq(sandbox.document.getElementById('btn-form-save').disabled, false, 'Save button re-enabled once the write lands');

  // A genuinely separate, later save must still go through — the guard is per-press, not a latch.
  fill('a second, unrelated card', 'Second card');
  await api.saveItem();
  eq(api.items.length, 2, 'a later Save still creates its card');
  eq(api.items[1]?.title, 'Second card', 'and it is the second card');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
