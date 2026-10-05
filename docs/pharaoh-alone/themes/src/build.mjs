// Inlines land data + globe engine into each theme page.
// node docs/pharaoh-alone/themes/src/build.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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
writeFileSync(new URL('../d2-workbench.html', here), [
  D2_HEAD, '<style>', part('d2.css'), '</style>', '', part('top.html'), part('home.html'), part('foot.html'),
  D3.replace(core, d2Core).replace(land, d2Land), '<script>', part('main.js'), '</script>', '',
].join('\n'));
console.log('built d2-workbench (from site/src/d2)');
