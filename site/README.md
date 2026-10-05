# pharaohalone.com

Astro site for **Pharaoh Alone**, theme D2 (the datasheet on a workbench). Plan and backlog: [`../docs/pharaoh-alone/`](../docs/pharaoh-alone/).

```bash
pnpm install
pnpm dev          # http://localhost:4321/vi/
pnpm build        # static output in dist/
pnpm check        # type check
pnpm build:land   # regenerate src/d2/land.json (globe coastline, Natural Earth 110m)
```

## How the home page is built

The home page is theme D2, kept as plain files in `src/d2/`:

| File | What |
|---|---|
| `top.html`, `home.html`, `foot.html` | Markup, written once in both languages: Vietnamese in the element, English in `data-en` (and `data-en-aria` for `aria-label`). Never nest two `data-en` elements. |
| `d2.css` | All styles |
| `main.js`, `globe-core.js` | Page script (canvases, demos, globe). Plain ES5, no imports, so the standalone preview can inline them |
| `entry.ts` | Loads d3-geo and `land.json`, then the two scripts |

At build time `src/lib/d2.ts` keeps one language per page (`/vi/`, `/en/`) and drops the other, so each page is fully in its own language without JavaScript.
`node ../docs/pharaoh-alone/themes/src/build.mjs` assembles the same files into one self-contained preview page, `docs/pharaoh-alone/themes/d2-workbench.html`.

Most home page copy is in `home.html` for now. The collections below are not wired into the D2 home page yet; they are kept for the section pages (M2/M3).

## Updating content

| What | Where |
|---|---|
| NOW | add `src/content/now/YYYY-MM.yaml` (the newest file wins; older ones become the archive) |
| Trace milestones | `src/content/trace.yaml` |
| Places on the globe | `src/content/places.yaml` |
| Systems | `src/content/systems/{vi,en}/<slug>.md` |
| Stories | `src/content/stories/{vi,en}/<slug>.md(x)` — pick a `mood` (it sets the scope waveform) |
| Product family (robots) | `src/content/lineage.yaml` — add the year and a one-sentence `note` |
| Professional work | `src/content/professional.yaml` (high level only) |
| Yearly capsules | `../years/YYYY.md` (unchanged, read at build time) |

A translation is linked to its original by the same `translationKey`. English is optional: Vietnamese-only entries still show in the English site, labelled.
Entries with `placeholder: true` are marked as such and never counted in archive stats.
