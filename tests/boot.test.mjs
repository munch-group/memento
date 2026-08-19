// Boots the FULL inline script (including the Init section) the way a browser would, on both
// platforms. `node --check` proves the file parses; only this proves it actually starts.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const settle = () => new Promise(r => setTimeout(r, 60));

const REPO = 'munch-group/memento';

// A GitHub good enough for the boot path: repo permissions, HEAD, entries listing, raw files.
function ghFetch({ push = true } = {}) {
  const calls = [];
  return {
    calls,
    fetch: async (url, opts = {}) => {
      const method = (opts.method || 'GET').toUpperCase();
      calls.push(`${method} ${url}`);
      const j = (body, ok = true) => ({
        ok, status: ok ? 200 : 404, statusText: '',
        json: async () => body, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
      });
      if (url === `https://api.github.com/repos/${REPO}`) return j({ permissions: { push } });
      if (url.includes('/commits/main')) return j({ sha: 'head1' });
      // Listing via the Git Trees API (the Contents API caps a directory at 1000 files).
      if (url.includes('/git/trees/') && url.includes('knowledge-base/entries')) {
        return j({ truncated: false, tree: [{ path: 'a1.json', type: 'blob' }, { path: 'a1.md', type: 'blob' }] });
      }
      if (url.includes('/contents/knowledge-base/INBOX.md')) return j('inbox text');
      if (/entries\/a1\.json$/.test(url)) {
        return j({ id: 'a1', type: 'note', title: 'Card A', tags: [], genes: [], date: '2026-07-01T00:00:00Z' });
      }
      if (/entries\/a1\.md$/.test(url)) return j('card body');
      return j({}, false);
    },
  };
}

console.log('\nA. Desktop boot (Chrome, File System Access present)');
{
  const gh = ghFetch();
  const { api, persistCalls } = load({ fetchImpl: gh.fetch, full: true, hasFSAccess: true, pat: null });
  await settle();
  eq(api.ghRepoMode, false, 'stays on the local-folder backend');
  eq(api.readOnly, false, 'editable (File System Access available)');
  eq(gh.calls, [], 'boots without touching GitHub at all');
  eq(persistCalls.length, 1, 'requests persistent storage');
}

console.log('\nB. iOS boot (no File System Access, PAT with push access)');
{
  const gh = ghFetch({ push: true });
  const { api } = load({ fetchImpl: gh.fetch, full: true, hasFSAccess: false, pat: 'ghp_x' });
  await settle();
  eq(api.ghRepoMode, true, 'switches to the GitHub backend');
  eq(api.canWrite, true, 'push access detected');
  eq(api.readOnly, false, 'EDITABLE on iOS — the whole point of the change');
  eq(api.items.map(i => i.id), ['a1'], 'entries loaded from GitHub');
  eq(api.items[0].content, 'card body', 'body rehydrated from the sibling .md');
  eq(api.storageReady(), true, 'storage reports ready, so image drop / card creation are allowed');
}

console.log('\nC. iOS boot with a READ-ONLY token');
{
  const gh = ghFetch({ push: false });
  const { api } = load({ fetchImpl: gh.fetch, full: true, hasFSAccess: false, pat: 'ghp_ro' });
  await settle();
  eq(api.ghRepoMode, true, 'still loads entries');
  eq(api.canWrite, false, 'no push access');
  eq(api.readOnly, true, 'app degrades to read-only rather than failing on save');
}

// A returning iOS user boots from the IndexedDB cache, not from an empty one. That path used to
// end at showApp() without ever asking GitHub whether main had moved: visibilitychange, the only
// thing that called ghRefreshIfStale(), does not fire on load. So the phone opened on stale cards
// and stayed stale until you backgrounded the app and came back.
const warmCache = (sha) => ({
  gh_entries: [{ id: 'stale1', type: 'note', title: 'Stale card', tags: [], genes: [],
                 content: 'old body', date: '2026-06-01T00:00:00Z' }],
  gh_inbox: 'old inbox',
  gh_tree_sha: sha,
  gh_can_write: true,
});

console.log('\nD. iOS boot from a cache that is BEHIND main');
{
  const gh = ghFetch({ push: true });
  // Cache was built at head0; GitHub now reports head1.
  const { api } = load({ fetchImpl: gh.fetch, full: true, hasFSAccess: false, pat: 'ghp_x',
                         idbSeed: warmCache('head0') });
  await settle();
  eq(api.ghRepoMode, true, 'boots on the GitHub backend from cache');
  eq(gh.calls.some(c => c.includes('/commits/main')), true, 'checks HEAD on load, without waiting to be foregrounded');
  eq(api.items.map(i => i.id), ['a1'], 'stale cached card replaced by what is on GitHub now');
  eq(api.items[0].content, 'card body', 'fresh body fetched too');
}

console.log('\nE. iOS boot from a cache that is ALREADY current');
{
  const gh = ghFetch({ push: true });
  const { api } = load({ fetchImpl: gh.fetch, full: true, hasFSAccess: false, pat: 'ghp_x',
                         idbSeed: warmCache('head1') });   // same sha GitHub reports
  await settle();
  eq(api.items.map(i => i.id), ['stale1'], 'cache kept — nothing on GitHub moved');
  // The interactions sidecar still loads (it always did, and it is not part of the card cache);
  // what must NOT happen is a refetch of the entries listing — the expensive full reload.
  eq(gh.calls.filter(c => c.includes('/contents/knowledge-base/entries')).length, 0,
     'no entry refetch: the staleness check costs one request, not a full reload');
  eq(gh.calls.filter(c => c.includes('/commits/main')).length, 1, 'exactly one HEAD check');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
