# my-timeline-trace

Two things live in this repo:

1. **The time capsule** (repo root): `years/YYYY.md`, one file per year. `scripts/build_timeline.py` rebuilds `README.md` from them, and `.github/workflows/main.yml` runs it every 1 January and copies `README.md` to the profile repo `trinhbuikhang/trinhbuikhang`. Don't edit the generated parts of `README.md` by hand.
2. **pharaohalone.com** (`site/`): an Astro site, theme D2 ("the datasheet on a workbench"). Plan, backlog and settled decisions are in `docs/pharaoh-alone/`. This is where almost all work happens.

The repo is **public**. Everything pushed is published.

## Commands

Run from `site/` (pnpm 11, Node 24):

```bash
pnpm install
pnpm dev          # http://localhost:4321/vi/
pnpm build        # static output in dist/
pnpm check        # type check
pnpm text         # what needs translating, and mistyped "## key" names
pnpm text:mark    # after translating: record the current Vietnamese as translated
pnpm build:land   # regenerate src/d2/land.json (globe coastline)
```

`node docs/pharaoh-alone/themes/src/build.mjs` (from the repo root) rebuilds the standalone preview `docs/pharaoh-alone/themes/d2-workbench.html` from the same templates and text. Rebuild it when the templates or home text change.

There are no tests. A change is verified by `pnpm build` passing and by looking at the page.

## Who writes what

- **Khang writes Vietnamese only**: `site/src/content/home/vi/*.md` and `site/src/content/stories/vi/*.md`. His guide is `site/src/content/HUONG-DAN.md`. Keep it accurate when the format changes.
- **Claude writes the English** in the parallel `en/` folders, when Khang asks ("dịch giúp"). Run `pnpm text` to see exactly which keys changed, translate those, then `pnpm text:mark`. Never run `text:mark` for keys that were not actually translated: it hides them from the next `pnpm text`.
- His Vietnamese is his own voice, and much of it is personal. When asked to check it, fix clear typos and broken structure and report them. Don't rewrite the wording or the tone.
- Talk to Khang in Vietnamese.

## How the home page is built

Words and layout are separate.

- Text: one Markdown file per section, one `## key` per piece of text. The slug is the file name without its number (`06-2022.md` → `2022`), so a key is `2022.tieu-de`.
- Layout: `site/src/d2/` holds `top.html`, `home.html`, `foot.html`, `d2.css`, `main.js`, `globe-core.js`. Template elements carry hooks instead of words: `data-t` (one line), `data-tp` (paragraphs), `data-tl` (list), `data-ta` (aria-label), `data-tj` (JSON for `main.js`, read with `word('slug.key')`).
- `site/src/lib/text.mjs` fills the templates at build time: Vietnamese in the element, English in `data-en`. `site/src/lib/d2.ts` then keeps one language per page (`/vi/`, `/en/`).

Things that follow from this:

- A missing Vietnamese key **fails the build**. A missing English key falls back to Vietnamese with a warning.
- Adding, renaming or removing a key means changing the template, both `vi/` and `en/` files, and `HUONG-DAN.md` together.
- In `data-tp` text, paragraphs are separated by a **blank line**. Single line breaks are joined into one paragraph.
- English paragraphs and list items are matched to the Vietnamese ones **by position**. If Khang adds or reorders paragraphs, the English page shows the wrong text beside them until it is retranslated.
- `main.js` and `globe-core.js` are plain ES5 with no imports, because the standalone preview inlines them.
- `hd-*` keys are drawn on a canvas. Long text wraps but crowds the drawing.

## Rules

- **Company work stays high level.** No employer product names, customers, data, screenshots or internal architecture anywhere on the site (decision of 05/10/2026 in `docs/pharaoh-alone/01-analysis-and-design.md`: PaveVision / PaveFlow are company projects, described by field only). Check this before every push, including in text Khang wrote himself, and ask him before publishing a name.
- Load the `ui-invariants` skill before changing templates, CSS or anything visual.
- Commit `site/pnpm-lock.yaml` with dependency changes. `site/dist/`, `site/.astro/` and `node_modules/` are ignored.
