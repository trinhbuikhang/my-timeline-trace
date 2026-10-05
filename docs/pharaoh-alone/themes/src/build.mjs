// Inlines land data + globe engine into each theme page.
// node docs/pharaoh-alone/themes/src/build.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url);
const land = readFileSync(new URL('land.json', here), 'utf8');
const core = readFileSync(new URL('globe-core.js', here), 'utf8');
const D3 = `<script src="https://cdn.jsdelivr.net/npm/d3-array@3.2.4/dist/d3-array.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/dist/d3-geo.min.js"></script>
<script>var LAND = ${land};\n${core}</script>`;
for (const name of ['a-drawing', 'b-gis', 'c-fieldbook']) {
  if (!existsSync(new URL(`${name}.html`, here))) continue;
  const src = readFileSync(new URL(`${name}.html`, here), 'utf8');
  writeFileSync(new URL(`../${name}.html`, here), src.replace('<!--GLOBE-->', D3));
  console.log('built', name);
}
