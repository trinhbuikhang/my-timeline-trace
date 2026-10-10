// Colour helpers shared by the build (story accent check) and scripts/colors.mjs (contrast audit).
// Plain ESM so Node scripts can import it without a TypeScript step.

/** '#rrggbb' → [r, g, b] in 0..255 */
export function rgb(hex) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
}

/** WCAG 2.x relative luminance */
export function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours */
export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Hue in degrees (0..360) */
export function hue(hex) {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

/** The light paper colour a story accent must read on (keep in step with --paper in d2.css). */
export const PAPER = '#f3ece0';
/** Story accents stay inside the amber-brown family: brown-gold to earth red. */
export const ACCENT_HUES = [20, 50];

/** Returns the accent if it fits the palette and reads as text on paper, otherwise null and a reason. */
export function checkAccent(hex) {
  const h = hue(hex), c = contrast(hex, PAPER);
  if (h < ACCENT_HUES[0] || h > ACCENT_HUES[1]) return { ok: null, why: `hue ${h.toFixed(0)}° is outside ${ACCENT_HUES.join('–')}°` };
  if (c < 4.5) return { ok: null, why: `contrast ${c.toFixed(2)} on ${PAPER} is below 4.5` };
  return { ok: hex, why: '' };
}
