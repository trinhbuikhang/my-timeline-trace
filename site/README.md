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

**Words and layout are separate.** Khang writes Vietnamese in `src/content/home/vi/*.md`, one file per section, with one `## key` per piece of text. `src/content/home/en/*.md` holds the English, under the same keys. The guide for editing, in Vietnamese, is `src/content/HUONG-DAN.md`.

The layout is theme D2, kept as plain files in `src/d2/`:

| File | What |
|---|---|
| `top.html`, `home.html`, `foot.html` | Templates. Elements carry hooks instead of words: `data-t` (one line), `data-tp` (paragraphs), `data-tl` (list), `data-ta` (aria-label), `data-tj` (JSON for the script). |
| `d2.css` | All styles |
| `main.js`, `globe-core.js` | Page script (canvases, demos, globe). Plain ES5, no imports, so the standalone preview can inline them. Canvas words come from `word('slug.key')`, which reads the `#d2-text` JSON. |
| `entry.ts` | Loads d3-geo and `land.json`, then the two scripts |

At build time, `src/lib/text.mjs` fills the templates with bilingual markup: Vietnamese in the element, English in `data-en`. `src/lib/d2.ts` then keeps one language per page (`/vi/`, `/en/`).

- A missing English key falls back to Vietnamese and logs a build warning.
- A missing Vietnamese key fails the build with a message naming the file.

`node ../docs/pharaoh-alone/themes/src/build.mjs` assembles the same templates and text into one self-contained preview page, `docs/pharaoh-alone/themes/d2-workbench.html`.

**Translating:** run `pnpm text` to list what is untranslated, changed since translation, or a mistyped key. After translating, run `pnpm text:mark`. It stores a hash of each translated Vietnamese text in `src/content/.translated.json`.

**Stories:** each Vietnamese post is `src/content/stories/vi/<slug>.md`, and its English version is `stories/en/<slug>.md`. Language and pairing come from the folder and file name.

- The home page shows the three newest posts.
- `/[lang]/stories/` lists them all, and `/[lang]/stories/<slug>/` shows one.
- English falls back to the Vietnamese original, with a note.

The other collections below are not wired into the D2 home page yet. They are kept for the section pages (M2/M3).

## Updating content

| What | Where |
|---|---|
| NOW | add `src/content/now/YYYY-MM.yaml` (the newest file wins; older ones become the archive) |
| Trace milestones | `src/content/trace.yaml` |
| Places on the globe | `src/content/places.yaml` |
| Systems | `src/content/systems/{vi,en}/<slug>.md` |
| Stories | `src/content/stories/vi/<slug>.md` (English: `stories/en/<slug>.md`) — see `src/content/HUONG-DAN.md` |
| Home page words | `src/content/home/vi/*.md` (English: `home/en/`) |
| Product family (robots) | `src/content/lineage.yaml` — add the year and a one-sentence `note` |
| Professional work | `src/content/professional.yaml` (high level only) |
| Yearly capsules | `../years/YYYY.md` (unchanged, read at build time) |

A translation is linked to its original by the same `translationKey`. English is optional: Vietnamese-only entries still show in the English site, labelled.
Entries with `placeholder: true` are marked as such and never counted in archive stats.
