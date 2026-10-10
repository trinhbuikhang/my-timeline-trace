// Contrast audit for the colour tokens in src/d2/d2.css (docs/pharaoh-alone/04-spec-mau-dien-anh.md).
// pnpm colors  → prints every pair, exits 1 if a pair falls below its WCAG threshold. Runs before `astro build`.
import { readFileSync } from 'node:fs';
import { contrast, PAPER } from '../src/lib/color.mjs';

const css = readFileSync(new URL('../src/d2/d2.css', import.meta.url), 'utf8');

/** custom properties with hex values inside the first block whose selector text matches `sel` */
function block(sel) {
  // selectors start a line, so ':root[data-mood="ink"]' does not match inside a selector list
  const i = sel.startsWith('@') ? css.indexOf(sel + ' {') : css.indexOf('\n' + sel + ' {') + 1;
  if (i <= 0) throw new Error(`d2.css: no block "${sel}"`);
  const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i));
  const o = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)) o[m[1]] = m[2].toLowerCase();
  return o;
}

const light = block(':root');
const dark = { ...light, ...block(':root[data-theme="dark"]') };
const moodDark = block(':root[data-mood="ember"], :root[data-mood="ink"]');
const themes = {
  light,
  dark,
  'field (light)': { ...light, ...block(':root[data-mood="field"]:not([data-theme="dark"])') },
  'field (dark)': { ...dark, ...block('@media (prefers-color-scheme: dark) { :root[data-mood="field"]:not([data-theme="light"])') },
  ember: { ...light, ...moodDark, ...block(':root[data-mood="ember"]') },
  ink: { ...light, ...moodDark, ...block(':root[data-mood="ink"]') },
};

// [foreground tokens, background tokens, minimum ratio]
const RULES = [
  [['ink', 'ink-2', 'pencil', 'accent', 'pen', 'cool'], ['paper', 'sheet', 'band'], 4.5],
  [['gold'], ['paper', 'sheet'], 3],
  [['prop-ink', 'prop-ink-2', 'prop-blue', 'prop-pen'], ['prop-paper', 'prop-news'], 4.5],
  [['note-ink'], ['note'], 4.5],
  [['scope-ink', 'scope-prose', 'scope-dim', 'ph-1', 'ph-2', 'ph-3'], ['scope'], 4.5],
];

let bad = 0;
if (light.paper !== PAPER) { console.log(`✗ src/lib/color.mjs PAPER is ${PAPER} but --paper is ${light.paper}`); bad++; }
for (const [name, t] of Object.entries(themes)) {
  const rows = [];
  for (const [fgs, bgs, min] of RULES) for (const f of fgs) for (const b of bgs) {
    if (!t[f] || !t[b]) { rows.push(`  ? --${f} on --${b}: missing`); bad++; continue; }
    const r = contrast(t[f], t[b]);
    if (r < min) bad++;
    rows.push(`  ${r < min ? '✗' : '✓'} --${f} ${t[f]} on --${b} ${t[b]}: ${r.toFixed(2)} (≥ ${min})`);
  }
  console.log(`${name}\n${rows.join('\n')}`);
}
if (bad) { console.error(`\n${bad} colour pair(s) below WCAG AA. Fix the tokens in src/d2/d2.css.`); process.exit(1); }
console.log('\nall colour pairs pass');
