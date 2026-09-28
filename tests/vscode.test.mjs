// "Open in VS Code" on a card. The button renders only when basePath is set, and basePath lived
// in per-origin IndexedDB read from exactly one boot path (tryRestoreHandle). Two ways to lose it:
// move the app to a new origin (file:// -> the local server), or boot on the GitHub backend, which
// never read it at all. Either way the button disappeared with no trace anywhere in the UI.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  ✓ ${msg}`); } else { fail++; console.log(`  ✗ ${msg}`); } };

const noop = async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' });
const DEFAULT = '/Users/kmt/memento/knowledge-base';
const note = { id: 'n1', type: 'note', title: 'A card', tags: [], genes: [], content: 'body',
               date: '2026-07-14T00:00:00Z' };

// The button only exists on expanded chrome, which is what previewMode 'full' gives every card.
function cardHtml(api) { api.setPreviewMode('rendered'); return api.renderCard(note, true); }

console.log('\nA. Local origin, nothing stored: the path is seeded');
{
  const { api, sandbox } = load({ fetchImpl: noop, hostname: 'localhost' });
  await api.initBasePath();
  eq(api.basePath, DEFAULT, 'basePath falls back to the repo default');
  ok(cardHtml(api).includes("openInVSCode('n1')"), 'the card draws its VS button');
  api.updateVSCodeRow();
  ok(sandbox.document.getElementById('vscode-row').innerHTML.includes('VS Code ✓'),
     'the sidebar reports the path is set');
}

console.log('\nB. 127.0.0.1 and file:// count as local too');
{
  const a = load({ fetchImpl: noop, hostname: '127.0.0.1' });
  await a.api.initBasePath();
  eq(a.api.basePath, DEFAULT, '127.0.0.1 — the origin memento.sh actually opens');
  const b = load({ fetchImpl: noop, hostname: '', protocol: 'file:' });
  await b.api.initBasePath();
  eq(b.api.basePath, DEFAULT, 'file:// — where the app lived before it got its own server');
}

console.log('\nC. A stored path always wins over the default');
{
  const { api } = load({ fetchImpl: noop, hostname: 'localhost', idbSeed: { basePath: '/elsewhere/kb' } });
  await api.initBasePath();
  eq(api.basePath, '/elsewhere/kb', 'what was saved in promptBasePath() is what is used');
}

console.log('\nD. The default is NOT written back to storage');
{
  // Persisting it would freeze today's constant into the store and quietly outlive any later
  // change to it. Only an explicit choice gets saved.
  const { api } = load({ fetchImpl: noop, hostname: 'localhost' });
  await api.initBasePath();
  eq(await api.idbGet('basePath'), undefined, 'storage stays empty until the path is set by hand');
}

console.log('\nE. Off the serving machine there is no VS Code to open');
{
  const { api, sandbox } = load({ fetchImpl: noop, hostname: 'munch-group.github.io' });
  await api.initBasePath();
  eq(api.basePath, '', 'no path seeded');
  ok(!cardHtml(api).includes('openInVSCode'), 'and no dead button on the card');
  api.updateVSCodeRow();
  ok(sandbox.document.getElementById('vscode-row').innerHTML.includes('Set path for VS Code'),
     'the sidebar offers to set one instead');
}

console.log('\nF. Boot resolves the path on BOTH backends');
{
  // Desktop / File System Access.
  const fsa = load({ fetchImpl: noop, full: true, hasFSAccess: true, pat: null, hostname: 'localhost' });
  await new Promise(r => setTimeout(r, 60));
  eq(fsa.api.basePath, DEFAULT, 'local-folder boot');

  // GitHub backend. This is the one that never read basePath at all: the read lived inside
  // tryRestoreHandle(), which only the File System Access boot calls.
  const gh = load({ fetchImpl: noop, full: true, hasFSAccess: false, pat: null, hostname: 'localhost',
                    idbSeed: { basePath: '/stored/kb' } });
  await new Promise(r => setTimeout(r, 60));
  eq(gh.api.basePath, '/stored/kb', 'GitHub boot reads the stored path too');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
