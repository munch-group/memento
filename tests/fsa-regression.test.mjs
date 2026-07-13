// Regression guard for the DESKTOP path. Kasper keeps using Chrome + the File System Access API,
// so the refactor must leave that behaviour bit-for-bit intact: same .json/.md pair contract,
// same folder layout, and — critically — the GitHub code must never fire when a folder is open.
import { load } from './harness.mjs';

// ---- fake File System Access API ----
function makeFS() {
  const files = new Map();   // "dir/name" -> string | Uint8Array
  const dir = (path) => {
    const handle = {
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
          async getFile() {
            const v = files.get(key);
            return { text: async () => (typeof v === 'string' ? v : Buffer.from(v).toString('utf8')) };
          },
          async createWritable() {
            let buf = '';
            return {
              async write(chunk) { buf = chunk; },
              async close() { files.set(key, buf); },
            };
          },
        };
      },
      async removeEntry(n) { files.delete(path ? `${path}/${n}` : n); },
      async queryPermission() { return 'granted'; },
      [Symbol.asyncIterator]: async function* () {
        const prefix = path ? path + '/' : '';
        for (const key of [...files.keys()]) {
          if (!key.startsWith(prefix)) continue;
          const rest = key.slice(prefix.length);
          if (rest.includes('/')) continue;
          yield [rest, await handle.getFileHandle(rest)];
        }
      },
    };
    return handle;
  };
  return { files, root: dir('') };
}

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

// Any GitHub call at all during desktop use is a bug.
const ghCalls = [];
const fetchImpl = async (url, opts) => {
  ghCalls.push(`${(opts?.method || 'GET')} ${url}`);
  return { ok: false, status: 500, statusText: 'should not be called', json: async () => ({}), text: async () => '' };
};

const { api, sandbox } = load({ fetchImpl });
const fs = makeFS();

// Drive the desktop backend directly through the seam's dispatchers.
const ctx = api;
ctx.ghRepoMode = false;
ctx.readOnly = false;

// Inject the folder handles the way connectFolder() would.
sandbox.__setHandles(fs.root, await fs.root.getDirectoryHandle('entries'));

const card = (id, content, extra = {}) => ({
  id, type: 'note', title: '', tags: [], genes: [], content, date: '2026-07-13T00:00:00Z', ...extra,
});

console.log('\nDesktop (File System Access) path');
{
  const c = card('abc123', '# heading\n\nbody with æøå 🧬');
  ctx.items = [c];
  await ctx.saveEntryToFile(c);

  eq(fs.files.has('entries/abc123.json'), true, 'writes entries/<id>.json');
  eq(fs.files.has('entries/abc123.md'), true, 'writes entries/<id>.md');
  eq(fs.files.get('entries/abc123.md'), '# heading\n\nbody with æøå 🧬', 'body goes to .md verbatim');

  const meta = JSON.parse(fs.files.get('entries/abc123.json'));
  eq(meta.content, undefined, 'content stripped from .json (kb_io.py contract)');
  eq(meta.id, 'abc123', 'metadata retained in .json');
  eq(fs.files.get('entries/abc123.json').includes('\n  "id"'), true, 'json still pretty-printed (2-space indent)');
}

{
  // _digest keeps its body in `markdown`, not `content` — the one special case.
  const d = { id: '_digest', type: '_digest', markdown: 'digest body' };
  await ctx.saveEntryToFile(d);
  eq(fs.files.get('entries/_digest.md'), 'digest body', '_digest body written from `markdown`');
  eq(JSON.parse(fs.files.get('entries/_digest.json')).markdown, undefined, '_digest markdown stripped from .json');
}

{
  await ctx.deleteEntryFile('abc123');
  eq(fs.files.has('entries/abc123.json'), false, 'delete removes .json');
  eq(fs.files.has('entries/abc123.md'), false, 'delete removes .md');
}

{
  // Round-trip: what we wrote is what loadFromFile() reads back.
  const c = card('rt1', 'round trip');
  ctx.items = [c];
  await ctx.saveEntryToFile(c);
  ctx.items = [];
  await ctx.loadFromFile();
  const back = ctx.items.find(i => i.id === 'rt1');
  eq(!!back, true, 'entry read back from disk');
  eq(back?.content, 'round trip', 'content rehydrated from the sibling .md');
}

eq(ghCalls, [], 'NO GitHub requests made anywhere on the desktop path');
eq(ctx.queue.size, 0, 'GitHub queue stays empty on the desktop path');

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
