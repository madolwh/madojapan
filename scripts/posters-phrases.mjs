// Phrase posters. Same brand as scripts/posters.mjs, different shape: whole
// sentences wrap and sit at a readable size, where single vocab terms are set
// enormous and never wrap.
//
// Usage: node scripts/posters-phrases.mjs <set>
// Reads posters/<set>/source.yml, writes posters/<set>/NN-*.html

import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const set = process.argv[2];
if (!set) {
  console.error('usage: node scripts/posters-phrases.mjs <set>');
  process.exit(1);
}

const dir = path.join(ROOT, 'posters', set);
const src = YAML.parse(await readFile(path.join(dir, 'source.yml'), 'utf8'));

const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

// Brand tokens, lifted from src/styles/global.css.
const T = {
  paper: '#ffffff',
  ink: '#0a0a0a',
  muted: '#71717a',
  rule: '#e4e4e7',
  alert: '#d90000',
  marker: '#ffea93',
  tag: '#8db355',
};

const shell = (inner) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1080px;height:1350px}
  body{background:${T.paper};color:${T.ink};
    font-family:'Inter',Helvetica,Arial,sans-serif;
    display:flex;flex-direction:column;padding:80px;overflow:hidden}
  .ja{font-family:'Noto Sans JP','Inter',sans-serif}
  .brand{font-weight:700;font-size:26px;letter-spacing:-.02em;text-transform:lowercase}
  .tag{background:${T.tag};color:${T.ink};font-size:20px;padding:6px 14px}
  .rule{height:1px;background:${T.rule}}
  .label{font-size:26px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${T.alert}}
  .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:baseline;
    font-size:20px;color:${T.muted}}
</style></head><body>${inner}</body></html>`;

const head = `<div style="display:flex;justify-content:space-between;align-items:center">
  <span class="brand">madojapan</span>
  <span class="tag">${esc(src.tag ?? 'speaking')}</span>
</div>
<div class="rule" style="margin:28px 0 0"></div>`;

const foot = (right) =>
  `<div class="foot"><span>madojapan.pages.dev</span><span>${esc(right)}</span></div>`;

// Clear previous HTML but leave any rendered PNGs alone.
for (const f of await readdir(dir)) {
  if (f.endsWith('.html')) await unlink(path.join(dir, f));
}

const files = [];
const total = src.phrases.length;

files.push([
  '01-title.html',
  shell(`${head}
  <h1 style="margin-top:auto;margin-bottom:auto;font-size:126px;line-height:.92;
    letter-spacing:-.04em;font-weight:700;text-transform:uppercase;color:${T.alert}">${esc(src.title)}</h1>
  ${foot(`${total} lines`)}`),
]);

src.phrases.forEach((p, i) => {
  const n = String(i + 2).padStart(2, '0');
  files.push([
    `${n}-line.html`,
    shell(`${head}
    <div style="margin-top:auto">
      <p class="label">${String(i + 1).padStart(2, '0')}</p>
      <p class="ja" style="margin-top:26px;font-size:70px;line-height:1.45;font-weight:700">${esc(p.ja)}</p>
      <p style="margin-top:24px;font-size:27px;color:${T.muted};letter-spacing:.04em">${esc(p.romaji)}</p>
    </div>
    <div style="margin-top:auto">
      <p style="font-size:46px;line-height:1.3;font-weight:700">${esc(p.en)}</p>
      ${p.note ? `<p style="margin-top:20px;font-size:28px;line-height:1.45;color:${T.muted}">${esc(p.note)}</p>` : ''}
    </div>
    ${foot(`${i + 1} / ${total}`)}`),
  ]);
});

if (src.closer) {
  files.push([
    `${String(total + 2).padStart(2, '0')}-closer.html`,
    shell(`${head}
    <div style="margin-top:auto;margin-bottom:auto">
      <p class="ja" style="font-size:64px;line-height:1.3;color:${T.muted}">${esc(src.closer.question)}</p>
      <p class="ja" style="margin-top:28px;font-size:74px;line-height:1.62;font-weight:700">
        <span style="background:${T.marker};padding:10px 18px 16px;
          -webkit-box-decoration-break:clone;box-decoration-break:clone">${esc(src.closer.answer)}</span>
      </p>
      <p style="margin-top:40px;font-size:42px;line-height:1.3;font-weight:700;color:${T.alert}">${esc(src.closer.english)}</p>
    </div>
    ${foot('')}`),
  ]);
}

for (const [name, html] of files) await writeFile(path.join(dir, name), html);
console.log(`[posters] ${files.length} files -> posters/${set}/`);
files.forEach(([n]) => console.log('  ' + n));
