// Writes src/d2/land.json: Natural Earth 110m land as one compact MultiPolygon
// (coordinates rounded to 0.1°), drawn as line art on the homepage globe.
// pnpm build:land
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'));
const geom = feature(topo, topo.objects.land).features[0].geometry;
const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

const r = (v) => Math.round(v * 10) / 10;
const coordinates = polys
  .map((poly) =>
    poly
      .map((ring) => ring.map(([x, y]) => [r(x), r(y)]).filter((p, i, a) => !i || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]))
      .filter((ring) => ring.length >= 4),
  )
  .filter((poly) => poly.length);

const out = JSON.stringify({ type: 'MultiPolygon', coordinates });
writeFileSync(new URL('../src/d2/land.json', import.meta.url), out);
console.log(`land.json: ${coordinates.length} polygons, ${(out.length / 1024).toFixed(1)} KB`);
