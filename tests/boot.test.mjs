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
      if (url.includes('/contents/knowledge-base/entries')) {
        return j([{ name: 'a1.json', download_url: 'https://raw.example/a1.json' }]);
      }
      if (url.includes('/contents/knowledge-base/INBOX.md')) return j('inbox text');
      if (url === 'https://raw.example/a1.json') {
        return j({ id: 'a1', type: 'note', title: 'Card A', tags: [], genes: [], date: '2026-07-01T00:00:00Z' });
      }
      if (url === 'https://raw.example/a1.md') return j('card body');
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

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
