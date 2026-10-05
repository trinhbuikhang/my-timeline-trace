// Precomputes the dot-matrix land layer for the hero globe.
// Run once (or when changing STEP): node scripts/build-land-dots.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';

const STEP = 1.6; // degrees between rows
const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);

const dots = [];
for (let lat = -84; lat <= 84; lat += STEP) {
  // Roughly equal-area spacing: fewer dots towards the poles.
  const lonStep = STEP / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (geoContains(land, [lon, lat])) dots.push(Math.round(lon * 10), Math.round(lat * 10));
  }
}

writeFileSync(new URL('../src/data/land-dots.json', import.meta.url), JSON.stringify(dots));
console.log(`land dots: ${dots.length / 2}`);
