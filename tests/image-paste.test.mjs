// Pasting a screenshot into a card: the image must land in knowledge-base/images/ as a real file
// and the card body must gain a markdown reference to it — on both backends (folder + GitHub).
// Also guards the "not our paste" cases, since the handler sits on document and sees every paste.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

// ---- fakes ----------------------------------------------------------------
// A clipboard File: name/type plus arrayBuffer(), which is all saveImageFile/fileToBase64 touch.
const PNG_BYTES = [0x89, 0x50, 0x4e, 0x47, 1, 2, 3];
function imgFile(name = 'image.png', type = 'image/png') {
  return { name, type, arrayBuffer: async () => new Uint8Array(PNG_BYTES).buffer };
}
// A paste event carrying `files`; `text` fills text/plain (a rich-text paste that happens to
// include an image).
function pasteEvent(files, text = '') {
  const e = {
    defaultPrevented: false,
    preventDefault() { e.defaultPrevented = true; },
    clipboardData: {
      files,
      items: files.map(f => ({ kind: 'file', type: f.type, getAsFile: () => f })),
      types: files.length ? ['Files'] : [],
      getData: t => (t === 'text/plain' ? text : ''),
    },
  };
  return e;
}

function makeFS() {
  const files = new Map();   // "dir/name" -> written value
  const dir = (path) => ({
    name: path.split('/').pop() || 'knowledge-base', kind: 'directory',
    async getDirectoryHandle(n) { return dir(path ? `${path}/${n}` : n); },
    async getFileHandle(n, opts) {
      const key = path ? `${path}/${n}` : n;
      if (!files.has(key)) {
        if (!opts?.create) { const e = new Error('NotFound'); e.name = 'NotFoundError'; throw e; }
        files.set(key, '');
      }
      return {
        kind: 'file',
        async getFile() { return { text: async () => String(files.get(key)) }; },
        async createWritable() {
          let buf = '';
          return { async write(chunk) { buf = chunk; }, async close() { files.set(key, buf); } };
        },
      };
    },
    async removeEntry(n) { files.delete(path ? `${path}/${n}` : n); },
    async queryPermission() { return 'granted'; },
  });
  return { files, root: dir('') };
}

const card = (id, content = '') => ({
  id, type: 'note', title: 'A card', tags: [], genes: [], content, date: '2026-08-01T00:00:00Z',
});
const imgKeys = fs => [...fs.files.keys()].filter(k => k.startsWith('images/'));
// The real #add-form ships with style="display:none"; the harness's fake elements start with an
// empty style object, so close the editor by hand wherever the card path is what's under test.
const closeEditor = sandbox => { sandbox.document.getElementById('add-form').style.display = 'none'; };

const ghCalls = [];
const fetchImpl = async (url, opts) => {
  ghCalls.push(`${(opts?.method || 'GET')} ${url}`);
  return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
};

// ---- desktop (folder) path ------------------------------------------------
console.log('\nPaste onto the expanded card (folder backend)');
{
  const { api, sandbox, toasts } = load({ fetchImpl });
  const fs = makeFS();
  sandbox.__setHandles(fs.root, await fs.root.getDirectoryHandle('entries'));
  api.ghRepoMode = false; api.readOnly = false;
  closeEditor(sandbox);

  const c = card('c1', 'body text');
  api.items = [c];
  api.expandedId = 'c1';

  const file = imgFile();
  const e = pasteEvent([file]);
  await api.imagePaste(e);

  eq(e.defaultPrevented, true, 'the paste is claimed (no browser default)');
  eq(imgKeys(fs).length, 1, 'one file written under images/');
  const fileName = imgKeys(fs)[0].slice('images/'.length);
  eq(/^[a-z0-9]+_image\.png$/.test(fileName), true, `unique name keeps the original: ${fileName}`);
  eq(fs.files.get(imgKeys(fs)[0]) === file, true, 'the pasted blob itself is what got written');
  eq(c.content, `body text\n\n![image.png](images/${fileName})`, 'markdown reference appended to the card body');
  eq(fs.files.get('entries/c1.md'), c.content, 'card body written to its .md file');
  eq(c.synced, false, 'card marked unsynced');
  eq(toasts.at(-1), '1 image added', 'toast confirms');
}

console.log('\nTwo images at once');
{
  const { api, sandbox, toasts } = load({ fetchImpl });
  const fs = makeFS();
  sandbox.__setHandles(fs.root, await fs.root.getDirectoryHandle('entries'));
  api.ghRepoMode = false; api.readOnly = false;
  closeEditor(sandbox);
  const c = card('c2');
  api.items = [c]; api.expandedId = 'c2';

  await api.imagePaste(pasteEvent([imgFile('one.png'), imgFile('two.jpg', 'image/jpeg')]));
  eq(imgKeys(fs).length, 2, 'both files written');
  eq((c.content.match(/!\[/g) || []).length, 2, 'both references appended');
  eq(toasts.at(-1), '2 images added', 'toast is plural');
}

console.log('\nNameless clipboard blob');
{
  const { api, sandbox } = load({ fetchImpl });
  const fs = makeFS();
  sandbox.__setHandles(fs.root, await fs.root.getDirectoryHandle('entries'));
  api.ghRepoMode = false; api.readOnly = false;
  closeEditor(sandbox);
  const c = card('c3');
  api.items = [c]; api.expandedId = 'c3';

  await api.imagePaste(pasteEvent([{ name: '', type: 'image/png', arrayBuffer: async () => new Uint8Array(PNG_BYTES).buffer }]));
  const fileName = imgKeys(fs)[0].slice('images/'.length);
  eq(/^[a-z0-9]+_pasted\.png$/.test(fileName), true, `extension recovered from the MIME type: ${fileName}`);
  eq(c.content.includes(`](images/${fileName})`), true, 'reference points at the stored file');
}

console.log('\nPaste while the editor is open');
{
  const { api, sandbox, toasts } = load({ fetchImpl });
  const fs = makeFS();
  sandbox.__setHandles(fs.root, await fs.root.getDirectoryHandle('entries'));
  api.ghRepoMode = false; api.readOnly = false;
  const c = card('c4', 'saved body');
  api.items = [c]; api.expandedId = 'c4';

  const form = sandbox.document.getElementById('add-form');
  form.style.display = '';                       // editor open
  const ta = sandbox.document.getElementById('f-content');
  ta.value = 'abcdef';
  ta.selectionStart = ta.selectionEnd = 3;       // caret in the middle
  sandbox.document.activeElement = ta;

  await api.imagePaste(pasteEvent([imgFile()]));
  const fileName = imgKeys(fs)[0].slice('images/'.length);
  eq(ta.value, `abc\n\n![image.png](images/${fileName})def`, 'reference spliced in at the caret');
  eq(ta.selectionStart, 3 + `\n\n![image.png](images/${fileName})`.length, 'caret left after the reference');
  eq(c.content, 'saved body', 'the expanded card is untouched while the editor has focus');
  eq(fs.files.has('entries/c4.md'), false, 'nothing saved to disk — Save does that');
  eq(toasts.at(-1), '1 image added', 'toast confirms');
  sandbox.document.activeElement = null;
  form.style.display = 'none';
}

console.log('\nPastes that are not ours');
{
  const { api, sandbox } = load({ fetchImpl });
  const fs = makeFS();
  sandbox.__setHandles(fs.root, await fs.root.getDirectoryHandle('entries'));
  api.ghRepoMode = false; api.readOnly = false;
  closeEditor(sandbox);
  const c = card('c5', 'body');
  api.items = [c]; api.expandedId = 'c5';

  const untouched = async (e, msg) => {
    await api.imagePaste(e);
    eq([e.defaultPrevented, imgKeys(fs).length, c.content], [false, 0, 'body'], msg);
  };

  await untouched(pasteEvent([]), 'plain text paste falls through');
  await untouched(pasteEvent([{ name: 'notes.md', type: 'text/markdown', arrayBuffer: async () => new ArrayBuffer(0) }]),
                  'a non-image file falls through');
  await untouched(pasteEvent([imgFile()], 'some copied text'),
                  'rich-text paste carrying an inline image stays a text paste');

  // Typing in the search box with no editor open: not a card paste.
  sandbox.document.activeElement = { tagName: 'INPUT' };
  await untouched(pasteEvent([imgFile()]), 'paste into another field falls through');
  sandbox.document.activeElement = null;

  // No expanded card, editor closed — nowhere to put it.
  api.expandedId = null;
  await untouched(pasteEvent([imgFile()]), 'no editor and no expanded card falls through');
  api.expandedId = 'c5';

  api.readOnly = true;
  await untouched(pasteEvent([imgFile()]), 'read-only session falls through');
  api.readOnly = false;

  // Generated cards are rewritten on every sync, so an image pasted onto one would vanish.
  const digest = { id: '_digest', type: '_digest', markdown: 'generated' };
  api.items = [c, digest];
  api.expandedId = '_digest';
  await untouched(pasteEvent([imgFile()]), 'the digest card falls through');
  eq(digest.content, undefined, 'nothing written onto the generated card');
  api.items = [c];
  api.expandedId = 'c5';

  // A GitHub card's editor hides the content field, so there is nowhere to insert.
  api.ghEditMode = true;
  sandbox.document.getElementById('add-form').style.display = '';
  await untouched(pasteEvent([imgFile()]), 'GitHub-card editor falls through');
  sandbox.document.getElementById('add-form').style.display = 'none';
  api.ghEditMode = false;
}

console.log('\nNo storage connected');
{
  const { api, sandbox, toasts } = load({ fetchImpl });
  api.ghRepoMode = false; api.readOnly = false;
  closeEditor(sandbox);
  const c = card('c6', 'body');
  api.items = [c]; api.expandedId = 'c6';

  const e = pasteEvent([imgFile()]);
  await api.imagePaste(e);
  eq(e.defaultPrevented, true, 'the paste is still claimed (nothing sensible to fall back to)');
  eq(c.content, 'body', 'card untouched');
  eq(toasts.at(-1), 'Connect a folder first to enable image paste', 'told what to do');
}

// ---- GitHub path ----------------------------------------------------------
console.log('\nPaste on the GitHub backend');
{
  const { api, sandbox } = load({ fetchImpl });
  api.ghRepoMode = true; api.readOnly = false; api.canWrite = true;
  closeEditor(sandbox);
  const c = card('g1', 'body');
  api.items = [c]; api.expandedId = 'g1';

  await api.imagePaste(pasteEvent([imgFile()]));

  const paths = [...api.queue.keys()];
  const imgPath = paths.find(p => p.includes('/images/'));
  eq(!!imgPath, true, `image queued for commit: ${imgPath}`);
  const fileName = imgPath?.split('/').pop();
  eq(imgPath, `knowledge-base/images/${fileName}`, 'queued under knowledge-base/images/');
  eq(api.queue.get(imgPath).b64, Buffer.from(PNG_BYTES).toString('base64'), 'queued as base64 of the image bytes');
  eq(c.content, `body\n\n![image.png](images/${fileName})`, 'reference appended to the card body');
  eq(paths.includes('knowledge-base/entries/g1.json') && paths.includes('knowledge-base/entries/g1.md'), true,
     'the card itself is queued too, so body + image land in one commit');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
