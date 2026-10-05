// Page script for the D2 home page: hand the globe engine and the page script the globals they were written against.
import { geoDistance, geoEquirectangular, geoGraticule, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import land from './land.json';

const w = window as unknown as Record<string, unknown>;
w.d3 = { geoDistance, geoEquirectangular, geoGraticule, geoGraticule10, geoInterpolate, geoOrthographic, geoPath };
w.LAND = land;
// both are classic scripts (no exports) so the standalone preview can inline them unchanged
// @ts-ignore TS2306
import('./globe-core.js')
  // @ts-ignore TS2306
  .then(() => import('./main.js'));
