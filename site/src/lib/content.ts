import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

const visible = (e: { data: { draft?: boolean } }) => !(import.meta.env.PROD && e.data.draft);

/**
 * Entries in `lang`; missing English translations fall back to the Vietnamese
 * original, flagged so the UI can label it.
 */
async function localizedList<C extends 'stories' | 'systems'>(collection: C, lang: Lang) {
  const all = (await getCollection(collection)).filter(visible) as CollectionEntry<C>[];
  const byKey = new Map<string, CollectionEntry<C>>();
  for (const e of all) {
    const existing = byKey.get(e.data.translationKey);
    if (e.data.lang === lang || !existing) byKey.set(e.data.translationKey, e);
  }
  return [...byKey.values()]
    .filter((e) => e.data.lang === lang || e.data.lang === 'vi')
    .map((entry) => ({ entry, fallback: entry.data.lang !== lang }));
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
    getCollection('stories', (e) => !e.data.placeholder && !e.data.draft && e.data.lang === 'vi'),
    getCollection('systems', (e) => e.data.lang === 'vi'),
    getCollection('capsules'),
  ]);
  return { stories: stories.length, systems: systems.length, capsules: capsules.length };
}

export const archiveId = (prefix: 'SYS' | 'STR' | 'LAB' | 'TRC', n: number | string) =>
  `PA·${prefix}·${typeof n === 'number' ? String(n).padStart(3, '0') : n}`;

export const readingMinutes = (body = '') => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
