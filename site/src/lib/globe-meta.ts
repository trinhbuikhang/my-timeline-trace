import landDots from '../data/land-dots.json';
/** Server-side count of land points, so the page can print it without shipping the data twice. */
export const LAND_POINTS_COUNT = landDots.length / 2;
