// Generates poster HTML from the real lesson and vocab files, so the posters
// cannot drift from the site. One title poster, then one per vocab entry.
//
// Usage: node scripts/posters.mjs <lesson-slug>
// Output: posters/<lesson-slug>/NN-*.html — render to PNG with headless Chrome.

import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const slug = process.argv[2];
if (!slug) {
  console.error('usage: node scripts/posters.mjs <lesson-slug>');
  process.exit(1);
}

// Real YAML, not a hand-rolled reader. The first version stripped a leading or
// trailing quote independently, which silently ate the closing quote in
// `literally "grass"` — exactly the kind of corruption that reaches a printed
// poster unnoticed.
const parse = (raw) => {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] };
};

// Anything from content goes through here before it reaches the HTML.
const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

const lesson = parse(await readFile(path.join(ROOT, `src/content/lessons/${slug}.md`), 'utf8'));
const vocab = [];
for (const id of lesson.data.vocab) {
  vocab.push({ id, ...parse(await readFile(path.join(ROOT, `src/content/vocab/${id}.md`), 'utf8')).data });
}

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

const W = 1080;
const H = 1350;

// Terms step down as they lengthen — same rule the lesson page uses.
const termSize = (t) => (t.length >= 5 ? 170 : t.length === 4 ? 210 : t.length === 3 ? 260 : 330);

const shell = (inner) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px}
  body{background:${T.paper};color:${T.ink};
    font-family:'Inter',Helvetica,Arial,sans-serif;
    display:flex;flex-direction:column;padding:80px;overflow:hidden}
  .ja{font-family:'Noto Sans JP','Inter',sans-serif}
  .brand{font-weight:700;font-size:26px;letter-spacing:-.02em;text-transform:lowercase}
  .tag{background:${T.tag};color:${T.ink};font-size:20px;padding:6px 14px}
  .rule{height:1px;background:${T.rule}}
  .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:baseline;
    font-size:20px;color:${T.muted}}
</style></head><body>${inner}</body></html>`;

const head = `<div style="display:flex;justify-content:space-between;align-items:center">
  <span class="brand">madojapan</span>
  <span class="tag">${esc(lesson.data.category)}</span>
</div>
<div class="rule" style="margin:28px 0 0"></div>`;

const foot = (right) => `<div class="foot"><span>madojapan.pages.dev</span><span>${right}</span></div>`;

await rm(path.join(ROOT, 'posters', slug), { recursive: true, force: true });
await mkdir(path.join(ROOT, 'posters', slug), { recursive: true });

const files = [];

// 01 — the title poster
files.push([
  '01-title.html',
  shell(`${head}
  <h1 style="margin-top:auto;margin-bottom:auto;font-size:132px;line-height:.92;
    letter-spacing:-.04em;font-weight:700;text-transform:uppercase;color:${T.alert}">${esc(lesson.data.title)}</h1>
  ${foot(`${vocab.length} words`)}`),
]);

// one poster per word — term, then the two meanings side by side. Nothing else.
vocab.forEach((v, i) => {
  const n = String(i + 2).padStart(2, '0');
  const line = (label, value, colour) => `
    <div style="margin-top:44px">
      <p style="font-size:26px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
        color:${T.alert}">${label}</p>
      <p style="margin-top:8px;font-size:60px;line-height:1.15;font-weight:700;color:${colour}">${value}</p>
    </div>`;

  files.push([
    `${n}-${v.id}.html`,
    shell(`${head}
    <div style="margin-top:auto;text-align:center">
      ${v.reading !== v.term ? `<p class="ja" style="font-size:34px;color:${T.muted};letter-spacing:.18em">${esc(v.reading)}</p>` : ''}
      <div style="display:inline-block;background:${T.marker};padding:18px 34px 26px;margin-top:14px">
        <span class="ja" style="font-size:${termSize(v.term)}px;line-height:1;white-space:nowrap">${esc(v.term)}</span>
      </div>
      <p style="margin-top:22px;font-size:24px;color:${T.muted};letter-spacing:.22em;
        text-transform:uppercase">${esc(v.romaji)}</p>
    </div>
    <div style="margin-top:auto">
      ${line('In Japanese', esc(v.meaning), T.ink)}
      ${v.chineseMeaning ? line('In Chinese', esc(v.chineseMeaning), T.ink) : ''}
    </div>
    ${foot(`${i + 1} / ${vocab.length}`)}`),
  ]);
});

for (const [name, html] of files) {
  await writeFile(path.join(ROOT, 'posters', slug, name), html);
}
console.log(`[posters] ${files.length} files -> posters/${slug}/`);
files.forEach(([n]) => console.log('  ' + n));
