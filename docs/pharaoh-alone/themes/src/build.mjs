// Inlines land data + globe engine into each theme page.
// node docs/pharaoh-alone/themes/src/build.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fill, frontMatter, parseText, storyCards } from '../../../../site/src/lib/text.mjs';
const here = new URL('.', import.meta.url);
const land = readFileSync(new URL('land.json', here), 'utf8');
const core = readFileSync(new URL('globe-core.js', here), 'utf8');
const D3 = `<script src="https://cdn.jsdelivr.net/npm/d3-array@3.2.4/dist/d3-array.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/dist/d3-geo.min.js"></script>
<script>var LAND = ${land};\n${core}</script>`;
for (const name of ['a-drawing', 'b-gis', 'c-fieldbook', 'd-datasheet']) {
  if (!existsSync(new URL(`${name}.html`, here))) continue;
  const src = readFileSync(new URL(`${name}.html`, here), 'utf8');
  writeFileSync(new URL(`../${name}.html`, here), src.replace('<!--GLOBE-->', D3));
  console.log('built', name);
}

// D2 now lives in the site (site/src/d2); this assembles the same files into one self-contained preview page.
const d2 = new URL('../../../../site/src/d2/', here);
const part = (f) => readFileSync(new URL(f, d2), 'utf8');
const D2_HEAD = `<title>Pharaoh Alone · Workbench</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,400..900;1,100,400&family=Reddit+Mono:wght@400;500;600&family=Patrick+Hand&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400&display=swap">
<script>document.documentElement.classList.add('js'); document.documentElement.lang = 'vi';</script>`;
const d2Core = part('globe-core.js'), d2Land = part('land.json');
// the words come from the same Markdown as the site; the preview keeps both languages and swaps in place
const content = new URL('../../../../site/src/content/', here);
const files = {};
for (const lang of ['vi', 'en']) for (const f of readdirSync(new URL(`home/${lang}/`, content))) files[`${lang}/${f}`] = readFileSync(new URL(`home/${lang}/${f}`, content), 'utf8');
const text = parseText(files);
const story = (lang, f) => { const u = new URL(`stories/${lang}/${f}`, content); return existsSync(u) ? frontMatter(readFileSync(u, 'utf8')) : null; };
const stories = readdirSync(new URL('stories/vi/', content)).filter((f) => f.endsWith('.md')).map((f) => ({ slug: f.slice(0, -3), vi: story('vi', f), en: story('en', f) }))
  .filter((s) => !s.vi.draft).sort((a, b) => Number(!!a.vi.placeholder) - Number(!!b.vi.placeholder) || String(b.vi.date ?? '').localeCompare(String(a.vi.date ?? '')) || a.slug.localeCompare(b.slug)).slice(0, 3);
const report = { missing: [], unused: [] };
const page = fill([part('top.html'), part('home.html').replace('<!--stories-->', storyCards(stories, text, () => '#stories')).replace('href="stories/"', 'href="#stories"'), part('foot.html')].join(''), text, report);
if (report.missing.length) console.warn('untranslated:', report.missing.join(', '));
writeFileSync(new URL('../d2-workbench.html', here), [
  D2_HEAD, '<style>', part('d2.css'), '</style>', '', page,
  D3.replace(core, d2Core).replace(land, d2Land), '<script>', part('main.js'), '</script>', '',
].join('\n'));
console.log('built d2-workbench (from site/src/d2)');
