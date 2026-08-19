// Regression guard: the GitHub listing must not silently lose cards once the entries folder grows
// past 1000 files.
//
// The Contents API caps a directory listing at 1000 entries and truncates with no error and no
// flag. entries/ holds a .json and a .md per card, so at ~500 cards the cap started biting and iOS
// quietly loaded only the first 500. Ids are Date.now().toString(36), so they sort chronologically
// — the half that got cut was the NEWEST half. That is why the phone was "never up to date".
import { load } from './harness.mjs';

const REPO = 'munch-group/memento';
const HEAD = 'sha_head';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

// 700 cards -> 1400 files, comfortably past the Contents cap. Ids ascend like real ones do.
const N = 700;
const ids = Array.from({ length: N }, (_, i) => 'm' + String(i).padStart(6, '0'));

function ghFetch() {
  const calls = [];
  const j = (body, ok = true) => ({
    ok, status: ok ? 200 : 404, statusText: '',
    json: async () => body, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  });
  return {
    calls,
    fetch: async (url, opts = {}) => {
      calls.push(`${(opts.method || 'GET').toUpperCase()} ${url}`);
      if (url === `https://api.github.com/repos/${REPO}`) return j({ permissions: { push: true } });
      if (url.includes('/commits/main')) return j({ sha: HEAD });
      // The Trees API: every file, no cap, pinned to the commit sha.
      if (url.includes(`/git/trees/${HEAD}:knowledge-base/entries`)) {
        return j({
          truncated: false,
          tree: ids.flatMap(id => [
            { path: `${id}.json`, type: 'blob' },
            { path: `${id}.md`, type: 'blob' },
          ]),
        });
      }
      // The Contents API is what the bug used. If the app calls it, fail loudly rather than
      // silently serving a truncated list.
      if (url.includes('/contents/knowledge-base/entries')) return j([], false);
      if (url.includes('/contents/knowledge-base/INBOX.md')) return j('inbox');
      const m = url.match(/entries\/(m\d+)\.(json|md)$/);
      if (m) {
        return m[2] === 'json'
          ? j({ id: m[1], type: 'note', title: m[1], tags: [], genes: [], date: '2026-08-01T00:00:00Z' })
          : j(`body ${m[1]}`);
      }
      return j({}, false);
    },
  };
}

console.log('\nEntries folder past the Contents API 1000-file cap');
{
  const gh = ghFetch();
  const { api } = load({ fetchImpl: gh.fetch, full: true, hasFSAccess: false, pat: 'ghp_x' });
  // 1400 mocked fetches in batches of 20; give the chain room to drain.
  for (let i = 0; i < 400; i++) await new Promise(r => setTimeout(r, 1));

  eq(api.items.length, N, `all ${N} cards load, not the first 500`);

  // The newest ids sort last, and those are exactly the ones the old code dropped.
  const loaded = new Set(api.items.map(i => i.id));
  eq(ids.slice(-5).every(id => loaded.has(id)), true, 'the NEWEST cards are present (the ones the cap used to cut)');
  eq(ids.slice(0, 5).every(id => loaded.has(id)), true, 'the oldest cards are still present too');

  eq(gh.calls.some(c => c.includes('/git/trees/')), true, 'listing comes from the Trees API');
  eq(gh.calls.some(c => c.includes('/contents/knowledge-base/entries')), false,
     'the capped Contents endpoint is not used for the listing');
  eq(gh.calls.some(c => c.includes(`/git/trees/${HEAD}:`)), true, 'listing is pinned to the commit sha it checked');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
