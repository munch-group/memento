// Exercises the real GitHub write backend from memento.html against an in-memory fake of the
// GitHub Git Data API. Asserts the properties the design depends on: one atomic commit per save,
// debounce coalescing, delete semantics, conflict retry that cannot clobber, and bulk-save cost.
import { load } from './harness.mjs';

const REPO = 'munch-group/memento';
const ENTRIES = 'knowledge-base/entries';

function makeGitHub({ pushAccess = true } = {}) {
  let n = 0;
  const sha = p => `${p}${(++n).toString(16).padStart(6, '0')}`;
  const blobs = new Map();   // sha -> {content, encoding}
  const trees = new Map();   // sha -> Map(path -> blobSha)
  const commits = new Map(); // sha -> {tree, parents, message}
  const log = [];

  const emptyTree = sha('tree');
  trees.set(emptyTree, new Map());
  const root = sha('commit');
  commits.set(root, { tree: emptyTree, parents: [], message: 'root' });
  const refs = { main: root };

  const json = (status, body) => ({
    ok: status < 400, status, statusText: String(status),
    json: async () => body, text: async () => JSON.stringify(body),
  });

  const gh = {
    log, blobs, trees, commits, refs,
    // Simulate someone else (the Mac) pushing.
    externalCommit(path, content) {
      const bs = sha('blob'); blobs.set(bs, { content: btoa(content), encoding: 'base64' });
      const parent = refs.main;
      const t = new Map(trees.get(commits.get(parent).tree));
      t.set(path, bs);
      const ts = sha('tree'); trees.set(ts, t);
      const cs = sha('commit'); commits.set(cs, { tree: ts, parents: [parent], message: 'mac push' });
      refs.main = cs;
      return cs;
    },
    head() { return refs.main; },
    tipTree() { return trees.get(commits.get(refs.main).tree); },
    fileAt(path) {
      const bs = gh.tipTree().get(path);
      if (!bs) return undefined;
      const b = blobs.get(bs);
      return Buffer.from(b.content, 'base64').toString('utf8');
    },
    rawAt(path) {
      const bs = gh.tipTree().get(path);
      return bs ? Buffer.from(blobs.get(bs).content, 'base64') : undefined;
    },
    history() {
      const out = []; let c = refs.main;
      while (c && commits.get(c).parents.length) { out.push(commits.get(c)); c = commits.get(c).parents[0]; }
      return out;
    },
    counts() {
      const c = { blobs: 0, trees: 0, commits: 0, refPatch: 0, total: 0 };
      for (const r of log) {
        if (r.method === 'POST' && r.url.includes('/git/blobs')) c.blobs++;
        else if (r.method === 'POST' && r.url.includes('/git/trees')) c.trees++;
        else if (r.method === 'POST' && r.url.includes('/git/commits')) c.commits++;
        else if (r.method === 'PATCH' && r.url.includes('/git/refs/')) c.refPatch++;
        else continue;
        c.total++;
      }
      return c;
    },
  };

  const fetchImpl = async (url, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    log.push({ method, url });
    const body = opts.body ? JSON.parse(opts.body) : null;
    const base = `https://api.github.com/repos/${REPO}`;

    // Raw file fetches — the read path downloads each entry via its download_url.
    if (url.startsWith('https://raw.test/')) {
      const body = gh.fileAt(url.slice('https://raw.test/'.length));
      if (body === undefined) return json(404, { message: 'no such file' });
      return { ok: true, status: 200, statusText: '', text: async () => body, json: async () => JSON.parse(body) };
    }

    const path = url.startsWith(base) ? url.slice(base.length) : null;
    if (path === null) return json(404, { message: 'no route ' + url });

    // Directory listing + INBOX, as the read path expects them.
    if (method === 'GET' && path.startsWith('/contents/')) {
      const target = decodeURIComponent(path.slice('/contents/'.length).split('?')[0]);
      const tree = gh.tipTree();
      if (tree.has(target)) return { ok: true, status: 200, statusText: '', text: async () => gh.fileAt(target), json: async () => JSON.parse(gh.fileAt(target)) };
      const kids = [...tree.keys()].filter(p => p.startsWith(target + '/') && !p.slice(target.length + 1).includes('/'));
      if (!kids.length) return json(404, { message: 'not found: ' + target });
      return json(200, kids.map(p => ({ name: p.split('/').pop(), download_url: 'https://raw.test/' + p })));
    }

    if (method === 'GET' && path === '') return json(200, { permissions: { push: pushAccess } });

    let m;
    if (method === 'GET' && (m = path.match(/^\/git\/ref\/heads\/(.+)$/))) {
      return json(200, { object: { sha: refs[m[1]] } });
    }
    // The read path and the staleness check both ask for the branch tip this way.
    if (method === 'GET' && (m = path.match(/^\/commits\/([^/?]+)$/))) {
      return refs[m[1]] ? json(200, { sha: refs[m[1]] }) : json(404, { message: 'no such ref' });
    }
    if (method === 'GET' && (m = path.match(/^\/git\/commits\/(.+)$/))) {
      const c = commits.get(m[1]);
      return c ? json(200, { sha: m[1], tree: { sha: c.tree } }) : json(404, { message: 'no commit' });
    }
    if (method === 'POST' && path === '/git/blobs') {
      if (!pushAccess) return json(403, { message: 'Resource not accessible by personal access token' });
      const s = sha('blob'); blobs.set(s, { content: body.content, encoding: body.encoding });
      return json(201, { sha: s });
    }
    if (method === 'POST' && path === '/git/trees') {
      if (!trees.has(body.base_tree)) return json(422, { message: 'bad base_tree' });
      const t = new Map(trees.get(body.base_tree));
      for (const e of body.tree) {
        // GitHub: "Using both tree.sha and content will return an error."
        if (e.sha != null && e.content !== undefined) {
          return json(422, { message: 'sha and content are mutually exclusive' });
        }
        if (e.sha === null && e.content === undefined) { t.delete(e.path); continue; }
        if (e.content !== undefined) {
          // GitHub writes the blob for us from inline UTF-8 text.
          const bs = sha('blob');
          blobs.set(bs, { content: Buffer.from(e.content, 'utf8').toString('base64'), encoding: 'base64' });
          t.set(e.path, bs);
        } else {
          t.set(e.path, e.sha);
        }
      }
      const s = sha('tree'); trees.set(s, t);
      return json(201, { sha: s });
    }
    if (method === 'POST' && path === '/git/commits') {
      const s = sha('commit');
      commits.set(s, { tree: body.tree, parents: body.parents, message: body.message });
      return json(201, { sha: s });
    }
    if (method === 'PATCH' && (m = path.match(/^\/git\/refs\/heads\/(.+)$/))) {
      const branch = m[1];
      const c = commits.get(body.sha);
      // Fast-forward only (no force): the new commit's parent must be the current tip.
      if (c.parents[0] !== refs[branch]) {
        return json(422, { message: 'Update is not a fast forward' });
      }
      refs[branch] = body.sha;
      return json(200, { object: { sha: body.sha } });
    }
    return json(404, { message: 'unhandled ' + method + ' ' + path });
  };

  return { gh, fetchImpl };
}

// ---- test plumbing ----
let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const ok = (c, msg) => eq(!!c, true, msg);

async function setup(opts = {}) {
  const { gh, fetchImpl } = makeGitHub(opts);
  const { api, toasts } = load({ fetchImpl });
  api.ghRepoMode = true;
  await api.ghApplyWritePermission();
  return { gh, api, toasts };
}
const card = (id, content, extra = {}) => ({
  id, type: 'note', title: '', tags: [], genes: [], content, date: '2026-07-13T00:00:00Z', ...extra,
});

// ---- tests ----
console.log('\n1. one card save = ONE commit containing BOTH files');
{
  const { gh, api } = await setup();
  api.items = [card('abc123', 'hello **world**')];
  await api.saveEntryToFile(api.items[0]);
  await api.ghFlush();

  eq(gh.history().length, 1, 'exactly one commit');
  const changed = [...gh.tipTree().keys()].sort();
  eq(changed, [`${ENTRIES}/abc123.json`, `${ENTRIES}/abc123.md`], 'commit contains .json + .md');
  eq(gh.fileAt(`${ENTRIES}/abc123.md`), 'hello **world**', 'body written to .md');
  const meta = JSON.parse(gh.fileAt(`${ENTRIES}/abc123.json`));
  eq(meta.id, 'abc123', 'metadata written to .json');
  eq(meta.content, undefined, 'content stripped from .json (kb_io.py contract)');
  eq(gh.counts().commits, 1, 'only one commit object created');
}

console.log('\n2. rapid toggles coalesce into one commit (debounce)');
{
  const { gh, api } = await setup();
  const c = card('t1', 'body');
  api.items = [c];
  c.pinned = true;      await api.saveEntryToFile(c);
  c.archived = true;    await api.saveEntryToFile(c);
  c.connection = true;  await api.saveEntryToFile(c);
  c.synced = true;      await api.saveEntryToFile(c);
  eq(gh.counts().commits, 0, 'nothing committed while the debounce is open');
  await new Promise(r => setTimeout(r, api.GH_FLUSH_DELAY + 400));
  eq(gh.history().length, 1, 'four mutations -> one commit');
  const meta = JSON.parse(gh.fileAt(`${ENTRIES}/t1.json`));
  eq([meta.pinned, meta.archived, meta.connection, meta.synced], [true, true, true, true], 'last state won');
}

console.log('\n3. delete removes both files (tree entry sha:null)');
{
  const { gh, api } = await setup();
  api.items = [card('del1', 'x'), card('keep', 'y')];
  await api.saveToFile();
  await api.ghFlush();
  eq([...gh.tipTree().keys()].length, 4, 'four files present');

  api.items = api.items.filter(i => i.id !== 'del1');
  await api.deleteEntryFile('del1');
  await api.ghFlush();
  const left = [...gh.tipTree().keys()].sort();
  eq(left, [`${ENTRIES}/keep.json`, `${ENTRIES}/keep.md`], 'both files of del1 removed, keep untouched');
}

console.log('\n4. concurrent Mac push: retry on 422, and the Mac commit is NOT clobbered');
{
  const { gh, api } = await setup();
  api.items = [card('phone', 'from phone')];
  // Phone caches the head...
  api.headSha = gh.head();
  // ...then the Mac pushes an unrelated card.
  const macSha = gh.externalCommit(`${ENTRIES}/mac.md`, 'from mac');

  await api.saveEntryToFile(api.items[0]);
  await api.ghFlush();

  eq(api.error, null, 'flush succeeded after retry');
  eq(gh.counts().refPatch, 2, 'first ref update rejected, second accepted');
  eq(gh.fileAt(`${ENTRIES}/mac.md`), 'from mac', "the Mac's file survives");
  eq(gh.fileAt(`${ENTRIES}/phone.md`), 'from phone', "the phone's file landed");
  ok(gh.history().some(c => c.message === 'mac push'), 'Mac commit still in history (not force-overwritten)');
  eq(gh.commits.get(gh.head()).parents[0], macSha, 'phone commit is stacked ON TOP of the Mac commit');
}

console.log('\n5. bulk save of 526 entries = ONE commit (not 1052)');
{
  const { gh, api } = await setup();
  api.items = Array.from({ length: 526 }, (_, i) => card('e' + i, 'body ' + i));
  await api.saveToFile();
  await api.ghFlush();
  const c = gh.counts();
  eq(gh.history().length, 1, 'one commit');
  eq(c.commits, 1, 'one commit object');
  eq([...gh.tipTree().keys()].length, 1052, 'all 1052 files in that single commit');
  eq(c.blobs, 0, 'zero blob uploads — text content is inlined into the tree');
  ok(c.total < 500, `content-generating requests (${c.total}) stay under the 500/hour secondary limit`);
  // Spot-check that the content actually survived the chunked base_tree chaining.
  eq(gh.fileAt(`${ENTRIES}/e0.md`), 'body 0', 'first entry intact across tree chunks');
  eq(gh.fileAt(`${ENTRIES}/e525.md`), 'body 525', 'last entry intact across tree chunks');
  console.log(`      (blobs=${c.blobs} trees=${c.trees} commits=${c.commits} refPatch=${c.refPatch} total=${c.total})`);
}

console.log('\n6. image is committed as a binary blob alongside its card');
{
  const { gh, api } = await setup();
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex'); // PNG magic + header
  const b64 = png.toString('base64');
  api.items = [card('img1', 'see ![x](images/pic.png)')];
  api.ghEnqueueImage('pic.png', b64);
  await api.saveEntryToFile(api.items[0]);
  await api.ghFlush();

  eq(gh.history().length, 1, 'image + card in the SAME commit');
  const stored = gh.rawAt('knowledge-base/images/pic.png');
  ok(stored && stored.equals(png), 'image bytes round-trip intact (base64, not corrupted)');
}

console.log('\n7. a read-only token cannot write');
{
  const { gh, api, toasts } = await setup({ pushAccess: false });
  eq(api.canWrite, false, 'push access correctly detected as false');
  eq(api.readOnly, true, 'app falls back to read-only');
  api.items = [card('nope', 'x')];
  await api.saveEntryToFile(api.items[0]);
  await api.ghFlush();
  eq(gh.counts().commits, 0, 'no commit attempted');
  eq(api.queue.size, 0, 'nothing even queued');
}

console.log('\n8. UTF-8 (Danish/greek/emoji) survives the base64 round-trip');
{
  const { gh, api } = await setup();
  const text = 'Ø-værdi ≈ π · 𝛽 — æøå 🧬';
  api.items = [card('utf', text)];
  await api.saveEntryToFile(api.items[0]);
  await api.ghFlush();
  eq(gh.fileAt(`${ENTRIES}/utf.md`), text, 'content byte-identical after encode/decode');
}

console.log('\n9. auto-refresh on returning to the app (this is what replaced the Reload button)');
{
  const { gh, api } = await setup();
  api.items = [card('a', 'here')];
  await api.saveEntryToFile(api.items[0]);   // actually commit it, so a reload can find it
  await api.ghFlush();

  // Nothing changed since -> no reload, and no wasted work.
  const before = gh.log.length;
  await api.ghRefreshIfStale();
  eq(gh.log.length, before + 1, 'costs exactly one request when main has not moved');
  eq(api.items.map(i => i.id), ['a'], 'and does not reload');

  // The Mac pushes -> the phone picks it up by itself, with no button and no tap.
  gh.externalCommit(`${ENTRIES}/mac.json`, JSON.stringify({ id: 'mac', type: 'note', title: 'from mac', tags: [], genes: [], date: '2026-07-14T00:00:00Z' }));
  gh.externalCommit(`${ENTRIES}/mac.md`, 'body from the mac');
  await api.ghRefreshIfStale();
  eq(api.items.map(i => i.id).sort(), ['a', 'mac'], 'a push from the Mac is pulled in automatically');
  eq(api.items.find(i => i.id === 'mac').content, 'body from the mac', 'with its body rehydrated from the sibling .md');
}

console.log('\n10. auto-refresh must never discard unsaved work');
{
  const { gh, api } = await setup();
  api.items = [card('p', 'typed on the phone, not yet committed')];
  await api.saveEntryToFile(api.items[0]);        // queued, still inside the 2s debounce
  eq(api.queue.size > 0, true, 'an edit is pending');

  gh.externalCommit(`${ENTRIES}/mac.md`, 'meanwhile, the mac pushed');
  const before = gh.log.length;
  await api.ghRefreshIfStale();
  eq(gh.log.length, before, 'refresh is skipped entirely while a write is pending');
  eq(api.queue.size > 0, true, 'the pending edit survives — it is not reloaded away');
}

console.log('\n11. GitHub mode loads the gene sidecar (iOS: no folder, sidecar lives in the repo, not next to the page)');
{
  let ixCalls = 0, allowNet = true;
  const sidecar = { genes: { A: {}, B: {} }, edges: [{ a: 'A', b: 'B', t: 'Activation', dir: 'ab' }], complex_edges: [] };
  const fetchImpl = async (url, opts = {}) => {
    if (/contents\/knowledge-base\/interactions\.json\?ref=main/.test(url)) {
      ixCalls++;
      if (!allowNet) return { ok: false, status: 500, json: async () => ({}), text: async () => '' };
      return { ok: true, status: 200, json: async () => sidecar, text: async () => JSON.stringify(sidecar) };
    }
    return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
  };
  const { api } = load({ fetchImpl, pat: 'ghp_x' });
  api.ghRepoMode = true; api.headSha = 'sha-1';

  await api.loadInteractions();
  ok(api.interactions && api.interactions.edges.length === 1, 'the sidecar loads from the repo in GitHub mode');
  eq(api.interactions.edges[0].dir, 'ab', 'direction survives the GitHub load');
  eq(ixCalls, 1, 'one contents-API request');

  // a second load at the same commit sha is served from the IndexedDB cache — no re-download
  allowNet = false; api.interactions = null;
  await api.loadInteractions();
  ok(api.interactions && api.interactions.edges.length === 1, 'a second load at the same sha comes from cache');
  eq(ixCalls, 1, 'the ~1-2MB sidecar is not re-downloaded when nothing changed');

  // a new commit sha busts the cache
  allowNet = true; api.interactions = null; api.headSha = 'sha-2';
  await api.loadInteractions();
  eq(ixCalls, 2, 'a new commit sha re-downloads the sidecar');
  ok(api.interactions && api.interactions.edges.length === 1, 're-download succeeds');
}

console.log('\n12. iOS reopen (fresh page load, cache already warm): stale-check costs one request, not three');
{
  const { gh, api } = await setup();
  api.items = [card('a', 'here')];
  await api.saveEntryToFile(api.items[0]);   // commits, and mirrors gh_tree_sha/gh_entries into IDB
  await api.ghFlush();

  // iOS reloaded the page: JS module state resets (headSha back to null) but IndexedDB survives.
  api.headSha = null;

  const seeded = await api.tryLoadFromGitHubCache();
  eq(seeded, true, 'boots from the IndexedDB cache');
  ok(api.headSha, 'headSha is seeded from the cached tree sha, not left null');
  // tryLoadFromGitHubCache() kicks off its own loadInteractions() without awaiting it (a pre-existing
  // fire-and-forget); let that settle before measuring, or its requests land in the wrong window.
  await new Promise(r => setTimeout(r, 0));

  // Nothing changed on GitHub since -> the first foreground check should be exactly one request,
  // same as any other unchanged-main check. Before the fix, a null headSha always read as "stale",
  // forcing a full ghLoadEntries() (write-permission check + a second, redundant HEAD fetch).
  const before = gh.log.length;
  await api.ghRefreshIfStale();
  eq(gh.log.length, before + 1, 'costs exactly one request on the first foreground after a cache boot');
  eq(api.items.map(i => i.id), ['a'], 'and does not reload');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
