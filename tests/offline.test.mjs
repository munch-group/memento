// Guards the fix for "markdown doesn't render on iOS".
//
// Root cause: marked/katex were loaded from cdn.jsdelivr.net. When that host is unreachable —
// a content blocker or DNS filter on the phone, Lockdown Mode, or just no signal — both globals
// are undefined, md() throws, and its `catch { out = esc(s) }` silently renders RAW markdown
// while the rest of the app works. Nothing in the UI says anything is wrong.
//
// So: no runtime dependency on a third-party CDN for anything load-bearing.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const html = fs.readFileSync(path.join(ROOT, 'memento.html'), 'utf8');

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

console.log('\nNo load-bearing CDN dependency');
{
  // Scripts decide whether the app works at all — none may come from a third party.
  const scripts = [...html.matchAll(/<script[^>]*\bsrc=["']([^"']+)["']/g)].map(m => m[1]);
  const remoteScripts = scripts.filter(s => /^https?:\/\//.test(s));
  eq(remoteScripts, [], 'no <script src> points at a remote host');
  eq(scripts.includes('vendor/marked.min.js'), true, 'marked is vendored');
  eq(scripts.includes('vendor/katex.min.js'), true, 'katex is vendored');

  // Stylesheets: KaTeX's CSS is load-bearing for math layout. Google Fonts is not — a missing
  // webfont silently falls back to -apple-system, so it stays remote by choice.
  const sheets = [...html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/g)].map(m => m[1]);
  const remoteSheets = sheets.filter(s => /^https?:\/\//.test(s) && !s.includes('fonts.googleapis.com'));
  eq(remoteSheets, [], 'no load-bearing stylesheet is remote (Google Fonts is allowed: it degrades)');
}

console.log('\nVendored files are present and real');
{
  for (const [file, min] of [['vendor/marked.min.js', 20000], ['vendor/katex.min.js', 100000], ['vendor/katex.min.css', 10000]]) {
    const p = path.join(ROOT, file);
    const size = fs.existsSync(p) ? fs.statSync(p).size : 0;
    eq(size > min, true, `${file} exists and is > ${min / 1000}KB (${(size / 1000).toFixed(0)}KB)`);
  }
  // marked must actually define the global the app calls (marked.parse).
  const marked = fs.readFileSync(path.join(ROOT, 'vendor/marked.min.js'), 'utf8');
  eq(/\bparse\b/.test(marked), true, 'vendored marked exposes parse()');
}

console.log('\nEvery font KaTeX asks for is on disk');
{
  const css = fs.readFileSync(path.join(ROOT, 'vendor/katex.min.css'), 'utf8');
  const refs = [...new Set([...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map(m => m[1].replace(/["']/g, '')))];
  const missing = refs.filter(r => !fs.existsSync(path.join(ROOT, 'vendor', r)));
  eq(refs.length > 10, true, `katex.min.css references ${refs.length} woff2 fonts`);
  eq(missing, [], 'all referenced woff2 fonts are vendored (none would 404)');
}

console.log('\nmd() cannot be taken down by one bad formula');
{
  // The KaTeX call must be individually guarded, or a single missing/blown-up formula sends the
  // whole card through the outer catch and back to raw text.
  const mdFn = html.slice(html.indexOf('function md(s)'), html.indexOf('function truncateRendered'));
  const katexCall = mdFn.indexOf('katex.renderToString');
  const guardBefore = mdFn.lastIndexOf('try {', katexCall);
  const outerTry = mdFn.indexOf('try {');
  eq(guardBefore > outerTry, true, 'katex.renderToString sits inside its own try/catch, not just the outer one');
  eq(/h\.replace\(id, \(\) =>/.test(mdFn), true, "math is spliced in with a function replacer ('$' stays literal)");
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
