// @ts-nocheck
// The home page text lives in Markdown: src/content/home/vi/*.md (written by Khang) and
// src/content/home/en/*.md (the translation, same "## key" names). This module turns the
// D2 template (src/d2/*.html) plus that text into the bilingual markup the rest of the
// pipeline already understands: Vietnamese in the element, English in data-en.
// It is plain JS so the standalone preview build (docs/pharaoh-alone/themes/src/build.mjs)
// can use it from Node as well as Astro.
//
// Template hooks:
//   data-t="slug.key"   element filled with one line of text
//   data-tp="slug.key"  placeholder <p> replaced by one <p> per paragraph (> = big line)
//   data-tl="slug.key"  <ul>/<ol> filled from "- item" lines (**item** = in progress)
//   data-ta="slug.key"  becomes aria-label (+ data-en-aria)
//   data-tj="k1 k2 …"   <script type="application/json"> filled with { key: [vi, en] } for main.js
// slug is the file name without its number: 06-2022.md → "2022".

/** { 'vi/06-2022.md': '...' , 'en/06-2022.md': '...' } → { vi: {'2022.key': raw}, en: {...}, where: {'2022.key': 'vi/06-2022.md'} } */
export function parseText(files) {
  const out = { vi: {}, en: {}, where: {} };
  for (const [path, src] of Object.entries(files)) {
    const m = /(vi|en)\/(?:\d+-)?([^/]+)\.md$/.exec(path);
    if (!m) continue;
    const [, lang, slug] = m;
    const body = src.replace(/\r/g, '').replace(/<!--[\s\S]*?-->/g, '');
    let key = null;
    let buf = [];
    const flush = () => {
      if (key) out[lang][`${slug}.${key}`] = buf.join('\n').trim();
      if (key && lang === 'vi') out.where[`${slug}.${key}`] = `vi/${path.split('/').pop()}`;
    };
    for (const line of body.split('\n')) {
      const h = /^##\s+(\S+)\s*$/.exec(line);
      if (h) { flush(); key = h[1]; buf = []; } else if (/^#\s/.test(line)) { flush(); key = null; } else if (key) buf.push(line);
    }
    flush();
  }
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');

const WIDGETS = { 'khoang-cach': '<span class="circ" id="dist">—</span>' };

/** One line of Markdown-ish text → HTML. */
export function inline(s) {
  return esc(s.replace(/\s*\n\s*/g, ' ').trim())
    .replace(/_{3,}/g, '\u0000')
    .replace(/\*\*(.+?)\*\*/g, '<span class="circ">$1</span>')
    .replace(/(^|[\s(“"'‘])_(.+?)_(?=$|[\s.,;:!?)”"'’…])/g, '$1<span class="scrib">$2</span>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\{([\w-]+)\}/g, (all, w) => WIDGETS[w] ?? all)
    .replace(/\u0000/g, '<u>&nbsp;?&nbsp;</u>');
}

/** Plain text for canvas labels: markers dropped. */
export const plain = (s) => s.replace(/\s*\n\s*/g, ' ').replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|\s)_(.+?)_/g, '$1$2').trim();

const paras = (s) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const items = (s) => s.split('\n').map((l) => /^\s*[-*]\s+(.*)$/.exec(l)?.[1]).filter(Boolean);

/** Template + text → bilingual HTML. Missing English falls back to Vietnamese and is reported. */
export function fill(html, text, report = { missing: [], unused: [] }) {
  const used = new Set();
  const get = (k) => {
    used.add(k);
    const vi = text.vi[k];
    if (vi === undefined) {
      const [slug, key] = k.split('.');
      throw new Error(`Thiếu mục "## ${key}" trong file vi/…-${slug}.md (trang web cần nó). Missing text key ${k}.`);
    }
    let en = text.en[k];
    if (en === undefined || en === '') { report.missing.push(k); en = vi; }
    return { vi, en };
  };

  html = html.replace(/<p data-tp="([^"]+)"><\/p>/g, (_, k) => {
    const { vi, en } = get(k);
    const v = paras(vi), e = paras(en);
    return v.map((p, i) => {
      const big = /^>\s?/.test(p);
      const ep = (e[i] ?? p).replace(/^>\s?/, '');
      return `<p class="rv d${Math.min(i + 1, 3)}${big ? ' big' : ''}" data-en="${attr(inline(ep))}">${inline(p.replace(/^>\s?/, ''))}</p>`;
    }).join('\n');
  });

  html = html.replace(/<(ul|ol)([^>]*?)\sdata-tl="([^"]+)"([^>]*)><\/\1>/g, (_, tag, a, k, b) => {
    const { vi, en } = get(k);
    const v = items(vi), e = items(en);
    return `<${tag}${a}${b}>` + v.map((it, i) => {
      const doing = /^\*\*(.+)\*\*$/.exec(it);
      const ei = (e[i] ?? it).replace(/^\*\*(.+)\*\*$/, '$1');
      return `<li${doing ? ' class="doing"' : ''} data-en="${attr(inline(ei))}">${inline(doing ? doing[1] : it)}</li>`;
    }).join('') + `</${tag}>`;
  });

  html = html.replace(/<([a-zA-Z][\w-]*)([^>]*?)\sdata-t="([^"]+)"([^>]*)><\/\1>/g, (_, tag, a, k, b) => {
    const { vi, en } = get(k);
    return `<${tag}${a}${b} data-en="${attr(inline(en))}">${inline(vi)}</${tag}>`;
  });

  html = html.replace(/\sdata-ta="([^"]+)"/g, (_, k) => {
    const { vi, en } = get(k);
    return ` aria-label="${attr(plain(vi))}" data-en-aria="${attr(plain(en))}"`;
  });

  html = html.replace(/(<script[^>]*?)\sdata-tj="([^"]+)"([^>]*)><\/script>/g, (_, a, keys, b) => {
    const o = {};
    for (const k of keys.trim().split(/\s+/)) {
      const { vi, en } = get(k);
      const list = items(vi).length ? [items(vi).map(plain), items(en).map(plain)] : null;
      o[k] = list ?? [plain(vi), plain(en)];
    }
    return `${a}${b}>${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
  });

  for (const k of Object.keys(text.vi)) if (!used.has(k)) report.unused.push(k);
  return html;
}

/** Story cards for the home page. stories: [{ slug, vi: {title, category, placeholder}, en?: {title} }] */
export function storyCards(stories, text, linkFor) {
  const WAVES = ['sine', 'square', 'damped'];
  const t = (k) => ({ vi: text.vi[k] ?? '', en: text.en[k] || text.vi[k] || '' });
  return stories.map((s, i) => {
    const label = t(s.vi.placeholder ? 'cau-chuyen.chua-viet' : 'cau-chuyen.doc-bai');
    const enTitle = s.en?.title ?? s.vi.title;
    return `<a class="an rv${i % 4 ? ` d${i % 4}` : ''}" href="${linkFor(s)}" data-wave="${WAVES[i % 3]}" data-ch="${i + 1}"><canvas aria-hidden="true"></canvas>`
      + `<span class="meta"><span>${esc(s.vi.category)}</span><span>CH${i + 1}</span></span>`
      + `<h3 data-en="${attr(esc(enTitle))}">${esc(s.vi.title)}</h3>`
      + `<span class="hand red" data-en="${attr(inline(label.en))}">${inline(label.vi)}</span></a>`;
  }).join('\n      ');
}

/** Minimal front matter reader (key: value / key: "value") for the Node preview build. */
export function frontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  const o = {};
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv) o[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
  if (o.placeholder !== undefined) o.placeholder = o.placeholder === 'true';
  if (o.draft !== undefined) o.draft = o.draft === 'true';
  return o;
}
