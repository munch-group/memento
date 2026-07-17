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
  const classes = new Set();   // a real classList: the preview modes are expressed as classes on #item-list
  const el = {
    // renderList() derives its column count from offsetWidth; without a number it computes NaN.
    offsetWidth: 1200, offsetHeight: 800, offsetParent: null,
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    style: {}, innerHTML: '', textContent: '', value: '', dataset: {}, attrs: {},
    classList: {
      add(...c) { c.forEach(x => classes.add(x)); },
      remove(...c) { c.forEach(x => classes.delete(x)); },
      contains(c) { return classes.has(c); },
      toggle(c, force) {
        const on = force === undefined ? !classes.has(c) : !!force;
        on ? classes.add(c) : classes.delete(c);
        return on;
      },
    },
    get className() { return [...classes].join(' '); },
    childNodes: [], children: [], firstChild: null, nodeType: 1,   // truncateRendered() walks these
    addEventListener(){}, removeEventListener(){}, appendChild(){}, remove(){},
    scrollIntoView(){}, focus(){}, blur(){}, click(){},
    querySelector(){ return fakeEl(); }, querySelectorAll(){ return []; },
    getAttribute(k){ return k in this.attrs ? this.attrs[k] : null; },
    setAttribute(k, v){ this.attrs[k] = String(v); },
    closest(){ return null; },
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

export function load({ fetchImpl, pat = 'ghp_test', full = false, hasFSAccess = false, frames = false }) {
  const store = new Map(pat ? [['gh_pat', pat]] : []);
  const toasts = [];
  const created = [];        // every element the script builds, so tests can inspect popup markup
  const byId = new Map();    // stable per id, so what the app renders into an element persists
  const doc = {
    getElementById: id => { if (!byId.has(id)) byId.set(id, fakeEl()); return byId.get(id); },
    querySelector: () => fakeEl(),
    querySelectorAll: () => [],
    createElement: () => { const el = fakeEl(); created.push(el); return el; },
    addEventListener() {}, removeEventListener() {}, body: fakeEl(), documentElement: fakeEl(),
    visibilityState: 'visible',
    __created: created,
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
    // Removing a timeline row clears the entry's due date, so it asks first. Tests flip this to
    // false to prove the refusal is honoured.
    confirm: () => true,
    fetch: fetchImpl,
    marked: { parse: s => s, setOptions() {}, use() {} },
    katex: { renderToString: () => '', render: () => {} },
    URL: { createObjectURL: () => 'blob:fake', revokeObjectURL() {} },
    Event: class { constructor(type) { this.type = type; } stopPropagation() {} preventDefault() {} },
    setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
    console, TextEncoder, TextDecoder, btoa, atob, Date, Math, JSON, Promise, Map, Set,
    __toasts: toasts,
  };
  // Frames are opt-in, and default to absent on purpose: the view code treats a frameless world as
  // "no animation is possible, so land on the final state now" (see grRelax / grTick / tlZoomBy),
  // and that is exactly what most tests want — the settled layout, no pumping. Ask for frames only
  // to assert on what happens BETWEEN them; then nothing runs until flushFrames() says so, since
  // nothing here paints to schedule it.
  let rafId = 0;
  const framesDue = new Map();
  if (frames) {
    sandbox.requestAnimationFrame = fn => { framesDue.set(++rafId, fn); return rafId; };
    sandbox.cancelAnimationFrame = id => framesDue.delete(id);
  }
  const flushFrames = () => {
    const due = [...framesDue.values()];
    framesDue.clear();
    for (const fn of due) fn(Date.now());
    return due.length;
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
      loadFromFile, storageReady, ghRefreshIfStale, SORTS,
      openTagEditor, toggleCardTag, closeTagEditor, renderTagEditor,
      get tagUniverse(){ return _tagUniverse; },
      get tagEditorId(){ return _tagEditorId; },
      digestHeads, createSpecialCard, taggable, renderList, renderFilters, dueSoon,
      SPECIAL_CARDS, SPECIAL_IDS,
      // digestVisible became the tri-state mainView when the timeline arrived; kept here as a
      // derived view so the existing control-bar tests still speak in booleans.
      set digestVisible(v){ mainView = v ? 'dash' : 'list'; },
      get digestVisible(){ return mainView === 'dash'; },
      get mainView(){ return mainView; },
      set mainView(v){ mainView = v; },
      setView, toggleTimelineView, toggleGraphView,
      // Timeline
      dayFromISO, isoFromDay, todayISO, addDaysISO, daysBetween,
      tlOnTimeline, tlRows, tlSubs, tlAnchor, tlWindow, tlSeed, tlBarGeom, tlDragTarget, tlRowLayout,
      saveItem, selType,
      renderTimeline, tlAddBar, tlRemoveBar, tlRemoveRow, tlSetBarTitle, tlSetZoom,
      tlShowPop, tlRowPop, popHide, popOut, popIn, get popPinned(){ return _popPinned; },
      tlClampZoom, tlWheel, tlWindow, scheduleMd, fmtSchedDay,
      tlScroll, tlToggleDrawer,
      get tlMin(){ return _tlMin; },
      cardToTimeline, openCardFocused, backFromFocus, focusCard,
      toggleLinkMode, exitLinkMode, insertCardRef, grNodeDown, renderLinkBanner,
      grPanDown, grMove: _grMove, grUp: _grUp,
      get linkMode(){ return linkMode; },
      set editingId(v){ editingId = v; },
      set expandedId(v){ expandedId = v; },
      get tlPxPerDay(){ return tlPxPerDay; },
      get tlFocusId(){ return tlFocusId; },
      // Graph
      renderGraph, grNodes, grEdges, grPairs, grRefs, grIsConn, grRelayout, grStop,
      grVisibleIds, grShownCount, grApplyFilter, grMoveNode, grRelaxStep, grRelaxSettle, grShowPop,
      grToggleSelect, grTinted, get grSelIds(){ return _grSelIds; },
      grPopCancel, GR_POP_DELAY, setGrPopDelay, get grPopDelay(){ return grPopDelay; },
      setGrLinkBy, setGrSpacing, setGrWeb, grWebPaths, grWebBuckets, grEdgeAlpha, GR_WEB_BUCKETS, updateHighlightSet, grTerms,
      get grWeb(){ return grWeb; },
      get grSpacing(){ return grSpacing; },
      get grLinkBy(){ return grLinkBy; },
      set grLinkBy(v){ grLinkBy = v; },   // plain set, no rebuild — tests pick the mode they need
      get highlightGenes(){ return highlightGenes; },
      get grHome(){ return _grHome; },
      get grPos(){ return _grPos; },
      get grW(){ return _grW; },
      get grHW(){ return _grHW; },
      get grHH(){ return _grHH; },
      grNodeDims,
      get grSim(){ return _grSim; },
      get grPan(){ return _grPan; },
      get grZoom(){ return _grZoom; },
      get grH(){ return _grH; },
      get grAlpha(){ return _grAlpha; },
      // The sidebar Sort menu drives the timeline's order too, so the tests reach for it directly.
      setSort,
      get sortKey(){ return sortKey; },
      get sortAsc(){ return sortAsc; },
      setDashboard, toggleDigest, setPreviewMode, togglePreviews, applyPreviewMode,
      setConnFilter, setArchiveFilter, clearAllFilters, setFilter, setTagFilter, scopedItems,
      get activeTags(){ return [...activeTags].sort(); },
      get activeTypes(){ return [...activeTypes].sort(); },
      get previewMode(){ return previewMode; },
      get connFilter(){ return connFilter; },
      get archiveFilter(){ return archiveFilter; },
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
  return { api: sandbox.__api, toasts, sandbox, persistCalls, flushFrames };
}
