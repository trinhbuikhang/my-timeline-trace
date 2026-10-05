import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

const visible = (e: { data: { draft?: boolean } }) => !(import.meta.env.PROD && e.data.draft);

/**
 * Entries in `lang`; missing English translations fall back to the Vietnamese
 * original, flagged so the UI can label it.
 */
type Entry = { id: string; data: { lang?: Lang; translationKey?: string } };
/** Folder and file name stand in for front matter: stories/vi/foo.md → lang vi, key foo. */
export const entryLang = (e: Entry): Lang => e.data.lang ?? (e.id.split('/')[0] as Lang);
export const entryKey = (e: Entry): string => e.data.translationKey ?? e.id.split('/').slice(1).join('/');

async function localizedList<C extends 'stories' | 'systems'>(collection: C, lang: Lang) {
  const all = (await getCollection(collection)).filter(visible) as CollectionEntry<C>[];
  const byKey = new Map<string, CollectionEntry<C>>();
  for (const e of all) {
    const existing = byKey.get(entryKey(e));
    if (entryLang(e) === lang || !existing) byKey.set(entryKey(e), e);
  }
  return [...byKey.values()]
    .filter((e) => entryLang(e) === lang || entryLang(e) === 'vi')
    .map((entry) => ({ entry, fallback: entryLang(entry) !== lang }));
}

/** Every story pair, Vietnamese first: { slug, vi, en } — the shape the home page cards use. */
export async function getStoryPairs() {
  const all = (await getCollection('stories')).filter(visible);
  const pairs = new Map<string, { slug: string; vi?: CollectionEntry<'stories'>; en?: CollectionEntry<'stories'> }>();
  for (const e of all) {
    const slug = entryKey(e);
    const p = pairs.get(slug) ?? { slug };
    p[entryLang(e)] = e;
    pairs.set(slug, p);
  }
  return [...pairs.values()]
    .filter((p): p is { slug: string; vi: CollectionEntry<'stories'>; en?: CollectionEntry<'stories'> } => !!p.vi)
    .sort((a, b) => Number(!!a.vi.data.placeholder) - Number(!!b.vi.data.placeholder) || (b.vi.data.date?.getTime() ?? 0) - (a.vi.data.date?.getTime() ?? 0) || a.slug.localeCompare(b.slug));
}

export const getStories = async (lang: Lang) =>
  (await localizedList('stories', lang)).sort(
    (a, b) => (b.entry.data.date?.getTime() ?? 0) - (a.entry.data.date?.getTime() ?? 0),
  );

export const getSystems = async (lang: Lang) =>
  (await localizedList('systems', lang)).sort((a, b) => a.entry.data.order - b.entry.data.order);

export async function getNow() {
  const all = await getCollection('now');
  return all.sort((a, b) => b.data.updated.localeCompare(a.data.updated))[0];
}

/** Real counts only — placeholders never count as archive entries. */
export async function getArchiveStats() {
  const [stories, systems, capsules] = await Promise.all([
    getCollection('stories', (e) => !e.data.placeholder && !e.data.draft && entryLang(e) === 'vi'),
    getCollection('systems', (e) => entryLang(e) === 'vi'),
    getCollection('capsules'),
  ]);
  return { stories: stories.length, systems: systems.length, capsules: capsules.length };
}

export const archiveId = (prefix: 'SYS' | 'STR' | 'LAB' | 'TRC', n: number | string) =>
  `PA·${prefix}·${typeof n === 'number' ? String(n).padStart(3, '0') : n}`;

export const readingMinutes = (body = '') => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
