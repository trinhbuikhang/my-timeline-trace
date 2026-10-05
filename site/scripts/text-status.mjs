// Which Vietnamese text has no English yet, or changed since it was translated?
//   pnpm text          → list what needs translating (and key typos)
//   pnpm text:mark     → after translating: remember the current Vietnamese as translated
// The memory is src/content/.translated.json: a short hash of each Vietnamese text at the time it was translated.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { frontMatter, parseText } from '../src/lib/text.mjs';

const content = new URL('../src/content/', import.meta.url);
const d2 = new URL('../src/d2/', import.meta.url);
const ledgerUrl = new URL('.translated.json', content);
const ledger = existsSync(ledgerUrl) ? JSON.parse(readFileSync(ledgerUrl, 'utf8')) : {};
const hash = (s) => createHash('sha1').update(s.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 10);
const read = (rel) => readFileSync(new URL(rel, content), 'utf8');
const list = (rel) => (existsSync(new URL(rel, content)) ? readdirSync(new URL(rel, content)).filter((f) => f.endsWith('.md')) : []);

const files = {};
for (const lang of ['vi', 'en']) for (const f of list(`home/${lang}/`)) files[`${lang}/${f}`] = read(`home/${lang}/${f}`);
const text = parseText(files);

// every source item: id → { vi text, has English?, where }
const items = new Map();
for (const [k, vi] of Object.entries(text.vi)) items.set(`home:${k}`, { vi, en: !!text.en[k], where: `${text.where[k]} → ## ${k.split('.').slice(1).join('.')}` });
for (const f of list('stories/vi/')) {
  const src = read(`stories/vi/${f}`);
  if (frontMatter(src).placeholder) continue;
  items.set(`story:${f}`, { vi: src, en: existsSync(new URL(`stories/en/${f}`, content)), where: `stories/vi/${f}` });
}

if (process.argv.includes('--mark')) {
  let n = 0;
  for (const [id, it] of items) if (it.en) { ledger[id] = hash(it.vi); n++; }
  for (const id of Object.keys(ledger)) if (!items.has(id)) delete ledger[id];
  writeFileSync(ledgerUrl, JSON.stringify(Object.fromEntries(Object.entries(ledger).sort()), null, 1) + '\n');
  console.log(`Đã ghi nhận ${n} mục là đã dịch.`);
  process.exit(0);
}

const missing = [], changed = [];
for (const [id, it] of items) {
  if (!it.en) missing.push(it.where);
  else if (ledger[id] !== hash(it.vi)) changed.push(it.where);
}

// keys the template asks for vs keys the Markdown has
const used = new Set();
for (const f of ['top.html', 'home.html', 'foot.html']) {
  const html = readFileSync(new URL(f, d2), 'utf8');
  for (const m of html.matchAll(/data-t[pla]?="([^"]+)"/g)) used.add(m[1]);
  for (const m of html.matchAll(/data-tj="([^"]+)"/g)) m[1].split(/\s+/).forEach((k) => used.add(k));
}
for (const k of ['cau-chuyen.chua-viet', 'cau-chuyen.doc-bai']) used.add(k);
const unknown = Object.keys(text.vi).filter((k) => !used.has(k)).map((k) => `${text.where[k]} → ## ${k.split('.').slice(1).join('.')}`);
const absent = [...used].filter((k) => text.vi[k] === undefined);
const orphanEn = Object.keys(text.en).filter((k) => text.vi[k] === undefined);

const show = (title, a) => a.length && console.log(`\n${title} (${a.length})\n` + a.map((s) => '  ' + s).join('\n'));
show('Chưa có bản tiếng Anh', missing);
show('Tiếng Việt đã sửa sau lần dịch trước', changed);
show('Trang web không dùng mục này (sai tên "## ..."?)', unknown);
show('Trang web cần nhưng không tìm thấy trong vi/', absent);
show('Bản tiếng Anh có mục không còn trong tiếng Việt', orphanEn);
if (!missing.length && !changed.length && !unknown.length && !absent.length && !orphanEn.length) console.log('Mọi chữ đều đã có bản tiếng Anh, khớp với tiếng Việt hiện tại.');
