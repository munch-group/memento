// Cmd/Ctrl+V outside a text field imports a clip into a new card. Regression: the import used to
// run from an async keydown handler, so its preventDefault() came too late and the browser's own
// paste dumped the raw "Clip to memento" JSON into the content field after the converted quote.
import { load } from './harness.mjs';

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.log(`  ✗ ${msg}\n      expected ${B}\n      actual   ${A}`); }
};

function pasteEvent(data) {
  const e = {
    defaultPrevented: false,
    preventDefault() { e.defaultPrevented = true; },
    clipboardData: { files: [], items: [], types: Object.keys(data), getData: t => data[t] || '' },
  };
  return e;
}
// htmlToMarkdown decodes entities through a <textarea>; the harness's fake elements don't, so give
// it one whose value echoes innerHTML (no entities in these fixtures).
// MyGene stand-in: answers a batch query from KNOWN (token -> hit count), like the real POST does.
const KNOWN = { TTLL10: 1, NAP1: 9, H2A: 2, H2B: 1, MECP2: 1 };
const myGene = { calls: [], fail: false };
async function fetchImpl(url, opts) {
  const q = decodeURIComponent(/q=([^&]*)/.exec(opts.body)[1]).split(',');
  myGene.calls.push({ url, q, body: opts.body });
  if (myGene.fail) return { ok: false, status: 503, json: async () => ({}) };
  const hits = q.flatMap(t => KNOWN[t] ? Array.from({ length: KNOWN[t] }, (_, i) => ({ query: t, symbol: t + '_' + i }))
                                        : [{ query: t, notfound: true }]);
  return { ok: true, status: 200, json: async () => hits };
}
const tick = () => new Promise(r => setTimeout(r, 0));
function setup() {
  myGene.calls.length = 0; myGene.fail = false;
  const ctx = load({ fetchImpl });
  const create = ctx.sandbox.document.createElement;
  ctx.sandbox.document.createElement = (...a) => {
    const el = create(...a);
    Object.defineProperty(el, 'value', { get() { return el.innerHTML; }, set(v) { el.innerHTML = v; } });
    return el;
  };
  ctx.sandbox.document.getElementById('add-form').style.display = 'none';
  return ctx;
}

const html = 'Spermatids decondense <a href="#bib23" name="bbib23"><span>[23]</span></a>. NAP1 too.';
const clip = { _kb_clip: true, content: 'Spermatids decondense [23]. NAP1 too.', html,
               source: 'https://example.org/paper', title: 'TTLL10 paper' };

console.log('\nStructured clip from the bookmarklet');
{
  const { api, sandbox, toasts } = setup();
  const $ = id => sandbox.document.getElementById(id);
  const e = pasteEvent({ 'text/plain': JSON.stringify(clip) });
  api.clipPaste(e);
  eq(e.defaultPrevented, true, 'paste claimed synchronously — no native paste of the JSON');
  const body = $('f-content').value;
  eq(body.includes('_kb_clip') || body.includes('{'), false, 'no raw JSON in the body');
  eq(body.startsWith('> Spermatids decondense'), true, 'body is the quoted markdown');
  eq($('f-source').value, clip.source, 'source filled');
  eq($('f-title').value, clip.title, 'title filled');
  eq(toasts.at(-1), 'Clip imported — edit and save', 'toast');
}

console.log('\nGenes found after a clip import');
{
  const { api, sandbox, toasts } = setup();
  const para = 'Glycylation of NAP1 modulates NAP1-histone interactions, including H2A/B exchange. '
    + 'TTLL10 is a protein polyglycylase. ScienceDirect. DNA and PCR. Decondense <a href="#bib23">[23]</a>.';
  const e = pasteEvent({ 'text/plain': JSON.stringify({ ...clip, html: para, title: 'TTLL10 is a polyglycylase' }) });
  api.clipPaste(e);
  await tick(); await tick();
  eq(myGene.calls.length, 1, 'one batch request to MyGene');
  eq(myGene.calls[0].url, 'https://mygene.info/v3/query', 'MyGene endpoint');
  eq(/scopes=symbol%2Calias/.test(myGene.calls[0].body) && /species=human/.test(myGene.calls[0].body), true,
     'symbol + alias scopes, human');
  eq(sandbox.document.getElementById('f-genes').value, 'TTLL10, NAP1, H2A, H2B',
     'symbols and aliases added as written, in order; H2A/B expanded; DNA/PCR dropped');
  eq(toasts.at(-1), 'Genes added: TTLL10, NAP1, H2A, H2B', 'toast lists them');
}

console.log('\nCandidate tokens');
{
  const { api } = setup();
  const c = t => [...api.geneCandidates(t)];
  eq(c('NAP1-histone, H2A/B and H2A/H2B, TTLL10.'), ['NAP1', 'H2A', 'H2B', 'TTLL10'], 'slash shorthand and plain pairs');
  eq(c('ScienceDirect McDonald mRNA DNAse I'), [], 'mixed-case words and single letters skipped');
  eq(c('See [ref](https://x.org/MECP2) https://doi.org/ABC1 doi:10.1/XYZ9\n\n[23]: https://Q.org/FOX2'), [],
     'link targets, URLs, DOIs and footnote definitions skipped');
  eq(c('S0014579308002020 MECP2 MECP2'), ['MECP2'], 'over-long tokens dropped, duplicates once');
}

console.log('\nFind button');
{
  const { api, sandbox, toasts } = setup();
  const $ = id => sandbox.document.getElementById(id);
  $('add-form').style.display = '';
  $('f-title').value = 'Rett'; $('f-content').value = 'MECP2 and TTLL10 again'; $('f-genes').value = 'mecp2';
  await api.findGenesInForm();
  eq($('f-genes').value, 'mecp2, TTLL10', 'merged case-insensitively with what is already there');
  eq(toasts.at(-1), 'Genes added: TTLL10', 'toast');
  await api.findGenesInForm();
  eq(toasts.at(-1), 'Genes already listed', 'second press: nothing new');

  $('f-content').value = 'DNA and PCR only';  $('f-genes').value = ''; $('f-title').value = '';
  await api.findGenesInForm();
  eq([$('f-genes').value, toasts.at(-1)], ['', 'No gene names found'], 'no hits');

  $('f-content').value = 'lower case only';
  const n = myGene.calls.length;
  await api.findGenesInForm();
  eq([myGene.calls.length, toasts.at(-1)], [n, 'No all-caps words to check'], 'no candidates: no request');

  $('f-content').value = 'TTLL10'; myGene.fail = true;
  await api.findGenesInForm();
  eq([$('f-genes').value, toasts.at(-1)], ['', 'Gene lookup failed — MyGene 503'], 'lookup failure is reported, field untouched');
  myGene.fail = false;

  // The answer arrives after the user opened a different card: don't write into it.
  const p = api.findGenesInForm();
  api.editingId = 'other';
  await p;
  eq($('f-genes').value, '', 'stale answer dropped when the form moved on');
  api.editingId = null;
}

console.log('\nOrdinary rich-text copy');
{
  const { api, sandbox, toasts } = setup();
  const e = pasteEvent({ 'text/plain': 'plain', 'text/html': '<p>Some <em>MECP2</em> text</p>' });
  api.clipPaste(e);
  eq(e.defaultPrevented, true, 'paste claimed');
  eq(sandbox.document.getElementById('f-content').value, '> Some *MECP2* text', 'converted from HTML');
  eq(toasts.at(-1), 'Clip imported from HTML — add source and save', 'toast');
}

console.log('\nPastes that are not ours');
{
  const { api, sandbox } = setup();
  const json = JSON.stringify(clip);
  sandbox.document.activeElement = { tagName: 'TEXTAREA' };
  let e = pasteEvent({ 'text/plain': json });
  api.clipPaste(e);
  eq(e.defaultPrevented, false, 'typing in a field: browser pastes normally');
  sandbox.document.activeElement = null;

  e = pasteEvent({ 'text/plain': 'just text' });
  api.clipPaste(e);
  eq(e.defaultPrevented, false, 'plain text with no HTML falls through');

  sandbox.document.getElementById('app-area').style.display = 'none';
  e = pasteEvent({ 'text/plain': json });
  api.clipPaste(e);
  eq(e.defaultPrevented, false, 'app hidden (login screen) falls through');
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
