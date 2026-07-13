// Loads the REAL inline script from memento.html into a stubbed browser environment, so the
// storage backends can be exercised against a mock GitHub API and a mock filesystem. Nothing is
// copy-pasted from the app: the tests run the shipping code.
import fs from 'node:fs';
import vm from 'node:vm';

const HTML = new URL('../memento.html', import.meta.url);

function extractInlineJs(full = false) {
  const src = fs.readFileSync(HTML, 'utf8');
  const blocks = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (blocks.length !== 1) throw new Error(`expected 1 inline script, got ${blocks.length}`);
  const js = blocks[0];
  if (full) return js;   // includes the boot section
  // Drop the boot section: it kicks off real loads. We drive the functions directly.
  const init = js.indexOf('// --- Init ---');
  if (init === -1) throw new Error('init marker not found');
  return js.slice(0, init);
}

function fakeEl() {
  const el = {
    style: {}, innerHTML: '', textContent: '', value: '', dataset: {},
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    addEventListener(){}, removeEventListener(){}, appendChild(){}, remove(){},
    scrollIntoView(){}, focus(){}, blur(){}, click(){},
    querySelector(){ return fakeEl(); }, querySelectorAll(){ return []; },
    getAttribute(){ return null; }, setAttribute(){}, closest(){ return null; },
insertBefore(){}, contains(){ return false; },
  };
  return el;
}

// Minimal in-memory IndexedDB good enough for idbOpen/idbPut/idbGet.
function fakeIndexedDB() {
  const stores = new Map();
  return {
    open() {
      const req = {};
      queueMicrotask(() => {
        const db = {
          createObjectStore(n) { stores.set(n, new Map()); },
          transaction(name) {
            const store = stores.get(name) || (stores.set(name, new Map()), stores.get(name));
            const tx = {
              objectStore() {
                return {
                  put(val, key) { store.set(key, val); queueMicrotask(() => tx.oncomplete && tx.oncomplete()); return {}; },
                  get(key) { const r = {}; queueMicrotask(() => { r.result = store.get(key); r.onsuccess && r.onsuccess(); }); return r; },
                };
              },
            };
            return tx;
          },
        };
        if (!stores.has('h')) { req.result = db; req.onupgradeneeded && req.onupgradeneeded({ target: { result: db } }); }
        req.result = db;
        req.onsuccess && req.onsuccess({ target: { result: db } });
      });
      return req;
    },
  };
}

export function load({ fetchImpl, pat = 'ghp_test', full = false, hasFSAccess = false }) {
  const store = new Map(pat ? [['gh_pat', pat]] : []);
  const toasts = [];
  const doc = {
    getElementById: () => fakeEl(),
    querySelector: () => fakeEl(),
    querySelectorAll: () => [],
    createElement: () => fakeEl(),
    addEventListener() {}, body: fakeEl(), documentElement: fakeEl(),
    visibilityState: 'visible',
  };
  const win = {
    addEventListener() {}, removeEventListener() {},
    location: { search: '', pathname: '/' }, history: { replaceState() {} },
    innerWidth: 1200,
    showDirectoryPicker: hasFSAccess ? async () => { throw new Error('not used'); } : undefined,
  };
  const persistCalls = [];
  const sandbox = {
    document: doc, window: win,
    navigator: {
      storage: { persist: async () => { persistCalls.push(1); return true; } },
      clipboard: { writeText: async () => {} },
    },
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
    },
    indexedDB: fakeIndexedDB(),
    fetch: fetchImpl,
    marked: { parse: s => s, setOptions() {}, use() {} },
    katex: { renderToString: () => '', render: () => {} },
    URL: { createObjectURL: () => 'blob:fake', revokeObjectURL() {} },
    setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
    console, TextEncoder, TextDecoder, btoa, atob, Date, Math, JSON, Promise, Map, Set,
    __toasts: toasts,
  };
  sandbox.globalThis = sandbox;
  win.document = doc;

  const js = extractInlineJs(full);
  // Expose the internals we want to assert on.
  const epilogue = `
    ;globalThis.__api = {
      get queue(){ return _ghQueue; },
      get headSha(){ return _ghHeadSha; },
      set headSha(v){ _ghHeadSha = v; },
      get error(){ return _ghError; },
      get items(){ return items; },
      set items(v){ items = v; },
      set ghRepoMode(v){ ghRepoMode = v; },
      get ghRepoMode(){ return ghRepoMode; },
      set readOnly(v){ readOnly = v; },
      get readOnly(){ return readOnly; },
      set canWrite(v){ ghCanWrite = v; },
      get canWrite(){ return ghCanWrite; },
      ghFlush, ghScheduleFlush, saveEntryToFile, deleteEntryFile, saveToFile,
      ghEnqueueEntry, ghEnqueueImage, ghEnqueueInbox, splitEntry, ghApplyWritePermission,
      ghCommitMessage, fileToBase64, ghChunkTree,
      loadFromFile, storageReady,
      GH_FLUSH_DELAY,
    };
    globalThis.__setHandles = (dh, eh) => { dirHandle = dh; entriesHandle = eh; };
  `;
  // showToast writes to the DOM; make it observable instead.
  const patched = js.replace(
    /function showToast\(/,
    'function showToast(m){ __toasts.push(m); return; }\nfunction __unused_showToast('
  );
  vm.createContext(sandbox);
  vm.runInContext(patched + epilogue, sandbox, { filename: 'memento-inline.js' });
  return { api: sandbox.__api, toasts, sandbox, persistCalls };
}
