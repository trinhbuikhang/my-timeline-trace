# pharaohalone.com

Astro site for **Pharaoh Alone**. Plan and backlog: [`../docs/pharaoh-alone/`](../docs/pharaoh-alone/).

```bash
pnpm install
pnpm dev          # http://localhost:4321/vi/
pnpm build        # static output in dist/
pnpm check        # type check
pnpm build:globe  # regenerate src/data/land-dots.json (only when changing the dot density)
```

## Updating content

| What | Where |
|---|---|
| NOW | add `src/content/now/YYYY-MM.yaml` (the newest file wins; older ones become the archive) |
| Trace milestones | `src/content/trace.yaml` |
| Places on the globe | `src/content/places.yaml` |
| Systems | `src/content/systems/{vi,en}/<slug>.md` |
| Stories | `src/content/stories/{vi,en}/<slug>.md(x)` — pick a `mood` |
| Professional work | `src/content/professional.yaml` (high level only) |
| Yearly capsules | `../years/YYYY.md` (unchanged, read at build time) |

A translation is linked to its original by the same `translationKey`. English is optional: Vietnamese-only entries still show in the English site, labelled.
Entries with `placeholder: true` are marked as such and never counted in archive stats.
