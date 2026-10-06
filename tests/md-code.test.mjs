// Guards the fix for "Devcontainers on GenomeDK renders garbled".
//
// Root cause: md() pulled $…$ math out of the RAW markdown before marked ran, so it never saw code
// fences. Two '$' anywhere — `$HOME` in one code block, `$XDG_RUNTIME_DIR` 45 lines later — were
// paired into one "formula" that swallowed fence markers, and KaTeX rendered shell config as math.
// Fix: fenced blocks and inline code spans are set aside before math/[[ref]] extraction.
//
// Runs the real md() from memento.html with the vendored marked and KaTeX.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = new URL('..', import.meta.url).pathname;
const require = createRequire(import.meta.url);
const marked = require(path.join(ROOT, 'vendor/marked.min.js'));
const katex = require(path.join(ROOT, 'vendor/katex.min.js'));
const html = fs.readFileSync(path.join(ROOT, 'memento.html'), 'utf8');

const src = [
  html.slice(html.indexOf('function esc(s)'), html.indexOf('\n', html.indexOf('function esc(s)'))),
  html.slice(html.indexOf('const _mdCache'), html.indexOf('function truncateRendered')),
].join('\n');
const md = new Function('marked', 'katex', 'cardRefHtml',
  `let _mdFailed = null;\n${src}\nreturn s => { const out = md(s); if (_mdFailed) throw new Error(_mdFailed); return out; };`
)(marked, katex, (id, title) => `<ref ${id}>`);

let pass = 0, fail = 0;
const ok = (cond, msg, detail = '') => {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}${detail ? `\n      ${detail}` : ''}`); }
};
const katexCount = h => (h.match(/class="katex"/g) || []).length;
const unesc = h => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

console.log('\nThe Devcontainers card (condensed): $ in code is never math');
{
  const card = [
    'Step 2', '',
    '```', 'In your "$HOME/.ssh/config", add something like', '', 'Host myimage1~*',
    '  RemoteCommand singularity shell /path/to/image1.sif', '```', '',
    'Step 3', '',
    '```', '"remote.SSH.serverInstallPath": {', '  "myimage1~somehost": "~/.vscode-container/myimage1"', '}', '```', '',
    'On some systems you may also need to override $XDG_RUNTIME_DIR, since its default location', '',
    '```', '#!/bin/sh', 'export XDG_RUNTIME_DIR="${TMPDIR:-/tmp}/`whoami`/run"', 'exec shifter --image="$1"', '```', '',
    'I maintain cenv that handles $XDG_RUNTIME_DIR automatically.', '',
    '```', '$ ssh somehost', '$ kill -9 -1', '```',
  ].join('\n');
  const h = md(card);
  const text = unesc(h);
  ok(katexCount(h) === 0, 'no KaTeX in the output', `found ${katexCount(h)}`);
  ok((h.match(/<pre><code>/g) || []).length === 4, 'all four fenced blocks render as <pre><code>');
  for (const lit of ['"$HOME/.ssh/config"', '"${TMPDIR:-/tmp}/`whoami`/run"', '--image="$1"', '$ kill -9 -1', 'override $XDG_RUNTIME_DIR, since'])
    ok(text.includes(lit), `literal text kept: ${lit}`);
  ok(/<p>Step 3<\/p>/.test(h), '"Step 3" stays a paragraph between blocks (no fence swallowed)');
}

console.log('\nInline code');
{
  const h = md('Run `echo $A and $B` now.');
  ok(katexCount(h) === 0 && h.includes('<code>echo $A and $B</code>'), 'single-backtick span keeps $ literal');
  const h2 = md('Use ``a ` $b$ `` here.');
  // CommonMark strips one space per side only when BOTH sides have one, so the trailing space stays
  ok(katexCount(h2) === 0 && unesc(h2).includes('<code>a ` $b$ </code>'), 'double-backtick span (containing a backtick) keeps $ literal');
  const h3 = md('`[[abc|Title]]` and [[abc|Title]]');
  ok(h3.includes('<code>[[abc|Title]]</code>') && h3.includes('<ref abc>'), '[[ref]] inside code stays literal; outside it still becomes a chip');
}

console.log('\nFence variants');
{
  ok(katexCount(md('~~~\n$a$ and $b$\n~~~')) === 0, 'tilde fence protects $');
  ok(katexCount(md('````md\n```\n$a$\n```\n````')) === 0, 'longer outer fence containing a ``` line protects $');
  ok(katexCount(md('```\n$a$ b\nno closing fence')) === 0, 'unclosed fence protects to end of text (as marked treats it)');
  ok(katexCount(md('  ```\n$a$\n  ```')) === 0, 'indented (≤3 spaces) fence protects $');
}

console.log('\nMath outside code still renders');
{
  ok(katexCount(md('The rate is $x^2$ here.')) === 1, 'inline $x^2$');
  ok(katexCount(md('$$\\sum_i x_i$$')) === 1, 'display $$…$$');
  const h = md('Code `$PATH` then math $\\alpha$.\n\n```\n$HOME\n```\n\nand $\\beta$');
  ok(katexCount(h) === 2 && h.includes('<code>$PATH</code>'), 'code and math mixed: both math spans render, code stays literal');
  ok(katexCount(md('\\begin{align}a&=b\\end{align}')) === 1, 'LaTeX environment');
  ok(katexCount(md('Set $HOME first.\n\nThen $PATH too.')) === 0, 'inline $…$ never pairs across a blank line');
  ok(katexCount(md('a $x +\ny$ b')) === 1, 'inline $…$ may still wrap a single line break');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
