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

// `focusCell` is the per-load holder behind document.activeElement. Only blur() is wired to it, on
// purpose: the Esc handler blurs the search box and the next Esc must see the focus actually gone.
// focus() stays a no-op — making it live would hand insertImagesAtCaret a "focused" textarea with
// no selectionStart, which is a different test's problem and not this one's to invent.
function fakeEl(focusCell) {
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
    scrollIntoView(){}, focus(){}, click(){},
    blur(){ if (focusCell && focusCell.el === el) focusCell.el = null; },
    querySelector(){ return fakeEl(focusCell); }, querySelectorAll(){ return []; },
    getAttribute(k){ return k in this.attrs ? this.attrs[k] : null; },
    setAttribute(k, v){ this.attrs[k] = String(v); },
    closest(){ return null; },
insertBefore(){}, contains(){ return false; },
  };
  return el;
}

// Minimal in-memory IndexedDB good enough for idbOpen/idbPut/idbGet. `seed` pre-populates the
// store, so a test can boot the way a returning iOS user does: with a warm cache already on disk.
function fakeIndexedDB(seed) {
  const stores = new Map();
  // Seeding here (rather than after open) also means the store already exists, so the upgrade path
  // never fires and never wipes what we just put in.
  if (seed) stores.set('h', new Map(Object.entries(seed)));
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

export function load({ fetchImpl, pat = 'ghp_test', full = false, hasFSAccess = false, frames = false,
                       idbSeed = null, hostname = '', protocol = 'http:' }) {
  const store = new Map(pat ? [['gh_pat', pat]] : []);
  const toasts = [];
  const created = [];        // every element the script builds, so tests can inspect popup markup
  const byId = new Map();    // stable per id, so what the app renders into an element persists
  // The app's keyboard shortcuts hang off a document-level keydown listener. A no-op
  // addEventListener swallowed it, so key handling was the one part of the UI no test could drive;
  // keep the handlers so press() below can deliver a synthetic event to the real code.
  const listeners = new Map();
  const focusCell = { el: null };
  const selectors = new Map();
  const doc = {
    getElementById: id => { if (!byId.has(id)) byId.set(id, fakeEl(focusCell)); return byId.get(id); },
    // Permissive by default (any selector matches a fresh element), because most callers only poke
    // at what they find. A test that needs a selector to match NOTHING — the real DOM's answer for
    // an absent element, and the difference between "there is a back link" and "there isn't" —
    // registers it in `selectors`.
    querySelector: sel => (selectors.has(sel) ? selectors.get(sel) : fakeEl(focusCell)),
    querySelectorAll: () => [],
    createElement: () => { const el = fakeEl(focusCell); created.push(el); return el; },
    // Note: the capture flag is recorded nowhere, so capture and bubble listeners for a type all
    // fire in registration order. Real capture listeners that call stopPropagation() (keyHelpKey,
    // tagEditorKey) do NOT shadow the app's main keydown handler here the way they do in a browser.
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      const l = listeners.get(type) || [];
      const i = l.indexOf(fn);
      if (i >= 0) l.splice(i, 1);
    },
    body: fakeEl(focusCell), documentElement: fakeEl(focusCell),
    // Settable by tests, and cleared by the app's own blur(). Defaults to null — the same falsiness
    // as the undefined it replaces, so tests that don't care about focus are unaffected.
    get activeElement(){ return focusCell.el; },
    set activeElement(v){ focusCell.el = v; },
    visibilityState: 'visible',
    __created: created,
  };
  const win = {
    addEventListener() {}, removeEventListener() {},
    // hostname/protocol decide whether initBasePath() seeds the VS Code path: it only does so
    // on the machine that serves the repo. Default '' = neither, i.e. no seeding.
    location: { search: '', pathname: '/', hostname, protocol }, history: { replaceState() {} },
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
    indexedDB: fakeIndexedDB(idbSeed),
    // Removing a timeline row clears the entry's due date, so it asks first. Tests flip this to
    // false to prove the refusal is honoured.
    confirm: () => true,
    fetch: fetchImpl,
    marked: { parse: s => s, setOptions() {}, use() {} },
    katex: { renderToString: () => '', render: () => {} },
    URL: { createObjectURL: () => 'blob:fake', revokeObjectURL() {} },
    // showApp() -> applyClipParams() reads the query string. Without this the boot path threw
    // and the throw was swallowed by ghLoadEntries' catch, so boot tests passed over a crash.
    URLSearchParams,
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
  // Deliver a synthetic event to the real document-level handlers. Returns the event, so a test can
  // assert on defaultPrevented. The keydown handler is async but only awaits inside the paste
  // branch; every key path this drives runs to completion synchronously.
  const fire = (type, props = {}) => {
    const ev = { type, defaultPrevented: false, ...props };
    ev.preventDefault = () => { ev.defaultPrevented = true; };
    ev.stopPropagation = () => {};
    for (const fn of [...(listeners.get(type) || [])]) fn(ev);
    return ev;
  };
  const press = (key, props = {}) => {
    const code = /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : key;
    return fire('keydown', { code, ...props, key });
  };
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
      loadInteractions,
      set readOnly(v){ readOnly = v; },
      get readOnly(){ return readOnly; },
      set canWrite(v){ ghCanWrite = v; },
      get canWrite(){ return ghCanWrite; },
      ghFlush, ghScheduleFlush, saveEntryToFile, deleteEntryFile, saveToFile,
      ghEnqueueEntry, ghEnqueueImage, ghEnqueueInbox, splitEntry, ghApplyWritePermission,
      ghCommitMessage, fileToBase64, ghChunkTree,
      loadFromFile, reloadNow, storageReady, ghRefreshIfStale, ghLoadEntries, tryLoadFromGitHubCache, idbGet, idbPut, SORTS,
      openTagEditor, toggleCardTag, closeTagEditor, renderTagEditor,
      toggleBulkMode, bulkToggle, bulkClear, bulkRender, bulkPin, bulkArchive, bulkDelete,
      openBulkTagPicker, toggleBulkTag, closeBulkTagPicker,
      openBulkTypePicker, bulkSetType, closeBulkTypePicker,
      get bulkIds(){ return [..._bulkIds].sort(); },
      get bulkMode(){ return bulkMode; },
      get tagUniverse(){ return _tagUniverse; },
      get tagEditorId(){ return _tagEditorId; },
      digestHeads, renderGhIssuesCard, ghIssuesToggle, ghRefreshAllIssues, createSpecialCard, taggable, renderList, renderFilters, dueSoon, scheduleOverlapsToday,
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
      tlOpenCard, tlCloseCard, tlRenderCardPanel,
      get tlCardId(){ return tlCardId; }, set tlCardId(v){ tlCardId = v; },
      cardToTimeline, openCardFocused, backFromFocus, focusCard,
      toggleLinkMode, exitLinkMode, insertCardRef, grNodeDown, renderLinkBanner,
      grPanDown, grMove: _grMove, grUp: _grUp,
      get linkMode(){ return linkMode; },
      set editingId(v){ editingId = v; },
      get expandedId(){ return expandedId; }, set expandedId(v){ expandedId = v; },
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
      get highlightInputGenes(){ return [...highlightInputGenes].sort(); },
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
      // Genes view (M1)
      renderGenes, geBuildModel, geNature, geChromClass, geIdSafe, geEdgeShown, geEdgesHtml, geHeadClear,
      geShownCount, geComputeDrawn, geStep, geInitPositions, geSizeLayout,
      setGeNature, setGeMinBelief, setGeMinEv, setGeShowComplex, setGeSimpleEdges, setGeShowNeighbours, geSelect, geClearSelection, geApplyFilter, geRelayout, geCardOff,
      initBasePath, updateVSCodeRow,
      get basePath(){ return basePath; }, set basePath(v){ basePath = v; },
      renderCard, geThoughtCards, setGeCardPanel, geRenderCardPanel, toggleCard, updateCardInPlace,
      geSpikes, geSyncSpikes, geSyncSpikeNodes, get geSpikeSet(){ return [..._geSpikes].sort(); },
      getVisibleItems, cardIdFromQuery,
      set interactions(v){ interactions = v; }, get interactions(){ return interactions; },
      get geNodes(){ return _geNodes; }, get geEdges(){ return _geEdges; }, get geDrawn(){ return _geDrawn; },
      get geMechEdges(){ return _geMechEdges; }, get gePos(){ return _gePos; },
      get geSelIds(){ return [..._geSelIds].sort(); }, get geLastSel(){ return _geLastSel; },
      get geIsolated(){ return _geIsolated; },
      get geNatures(){ return geNatures === null ? null : [...geNatures].sort(); }, get geMinBelief(){ return geMinBelief; },
      get geMinEv(){ return geMinEv; }, get geShowComplex(){ return geShowComplex; },
      get geSimpleEdges(){ return geSimpleEdges; },
      get geShowNeighbours(){ return geShowNeighbours; },
      get geNeighboursRevealed(){ return [..._geNeighboursRevealed].sort(); },
      get geCardPanel(){ return geCardPanel; },
      get geZoom(){ return _geZoom; }, get gePan(){ return _gePan; },
      set geSpacing(v){ geSpacing = v; },
      geZoomFit, toggleKeyHelp, keyHelpVisible,
      // Layout cache (persisted settled positions, so a reopen can skip resimulating from scratch)
      geLayoutSig, geApplyLayoutCache, geSaveLayoutCache, GE_CACHE_SETTLE_FRAMES,
      get geBaseSig(){ return _geBaseSig; },
      get geLayoutCache(){ return _geLayoutCache; }, set geLayoutCache(v){ _geLayoutCache = v; },
      get geAlpha(){ return _geAlpha; },
      // M2 live expansion
      geExpand, geParseIndra, geStmtAgents, geThin, geGroundChrom, geMergeExpansion,
      gePromoteGhost, geUpdateAction, geActionExpand, geActionAdd, geAddGene, geMergeAddGene, GE_GHOST_CAP,
      geIsSetCard, geAdoptLiveGene, geFetchGeneInfo, geFormatGeneInfo, geLiveDocsU,
      geneSetCards, geneSetChecked, geneSetLabel, geneSetGenesU, toggleGeneSetHighlight,
      openGeneSetPicker, renderGeneSetPicker, closeGeneSetPicker, geneSetPickerVisible,
      get geAdopted(){ return _geAdopted; },
      get selectedType(){ return selectedType; },
      get geExpanded(){ return [..._geExpanded].sort(); },
      get geExpanding(){ return _geExpanding; },
      geTestResetExpanded: () => { _geExpanded = new Set(); },
      // M3 refresh-all + freeze
      geRefreshAll, geMergeNodeEdges, geFreeze, geBuildFrozen, geWriteInteractions,
      geIsLive, geDerive, geRefreshDerived, geGenes, geBuildSidecar, geSaveNow, geAutoRun, geAutoResolve, geAutoIndra,
      geAfterLoad, gePoolMerge, geMyGeneResolve, geAutoText, geCardScope, geRenderCardPanel,
      get geAuto(){ return _geAuto; },
      setGeSetMax, get geSetMax(){ return geSetMax; },
      geNodeScale, set geZoomRaw(v){ _geZoom = v; }, set geFitZoomRaw(v){ _geFitZoom = v; },
      get geRefreshing(){ return _geRefreshing; },
      set geRefreshCancel(v){ _geRefreshCancel = v; },
      // The sidebar Sort menu drives the timeline's order too, so the tests reach for it directly.
      setSort,
      get sortKey(){ return sortKey; },
      get sortAsc(){ return sortAsc; },
      setDashboard, toggleDigest, setPreviewMode, togglePreviews, applyPreviewMode,
      setConnFilter, setArchiveFilter, clearAllFilters, setFilter, setTagFilter, scopedItems,
      deriveFacetsFromSearchText, syncSearchTextFromFacets, applyView, captureView, hasActiveView, describeView,
      syncViewBookmark, viewMenuItems, viewMenuLabel, pickViewMenu,
      excludedFacets,
      normalizeLegacyTypes, get TYPES(){ return TYPES; },
      get activeViewId(){ return activeViewId; },
      get activeTags(){ return [...activeTags].sort(); },
      get activeTypes(){ return [...activeTypes].sort(); },
      get previewMode(){ return previewMode; },
      get connFilter(){ return connFilter; },
      get archiveFilter(){ return archiveFilter; },
      // Images (drop + paste)
      imageFileName, saveImageFile, insertImagesAtCaret, appendImagesToCard, clipboardImages, imagePaste, clipPaste, geneCandidates, findGeneNames, findGenesInForm,
      cardDrop, contentDrop,
      set ghEditMode(v){ ghEditMode = v; },
      togglePinnedCard, renderPinnedCards,
      get pinnedCardIds(){ return [...pinnedCardIds].sort(); },
      GH_FLUSH_DELAY,
      // Esc Esc clears the search; a test fakes a slow second press by backdating lastEscAt.
      ESC_DBL_MS,
      get lastEscAt(){ return _lastEscAt; }, set lastEscAt(v){ _lastEscAt = v; },
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
  return { api: sandbox.__api, toasts, sandbox, persistCalls, flushFrames, fire, press, selectors };
}
