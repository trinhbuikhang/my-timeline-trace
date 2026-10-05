import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Text written in Vietnamese first; English is an adaptation and may be missing. */
const localized = z.object({ vi: z.string(), en: z.string().optional() });

const lang = z.enum(['vi', 'en']);

/** Every story gets its own visual world. See src/styles/moods.css. */
export const MOODS = ['ink', 'dusk', 'paper', 'field', 'ember'] as const;

const stories = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    lang,
    translationKey: z.string(),
    date: z.coerce.date().optional(),
    category: z.enum(['LIFE', 'ENGINEERING', 'BUILDING', 'THOUGHTS', 'PEOPLE']),
    summary: z.string(),
    mood: z.enum(MOODS).default('ink'),
    /** Optional accent override for this story only. */
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    learned: z.array(z.string()).default([]),
    placeholder: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const systems = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/systems' }),
  schema: z.object({
    title: z.string(),
    lang,
    translationKey: z.string(),
    status: z.enum(['IDEA', 'BUILDING', 'WORKING', 'PAUSED', 'ARCHIVED']),
    year: z.number().int().optional(),
    problem: z.string(),
    stack: z.array(z.string()).default([]),
    links: z.object({ github: z.string().url().optional(), demo: z.string().url().optional() }).default({}),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    placeholder: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

/** Company work: high level only. No names, data, screenshots or architecture. */
const professional = defineCollection({
  loader: file('./src/content/professional.yaml'),
  schema: z.object({ title: localized, summary: localized }),
});

const trace = defineCollection({
  loader: file('./src/content/trace.yaml'),
  schema: z.object({
    year: z.number().int().nullable(),
    label: localized,
    kind: z.enum(['life', 'turning-point', 'place', 'work', 'future']),
    /** Links the node to years/<year>.md when that capsule exists. */
    capsule: z.boolean().default(false),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/now' }),
  schema: z.object({
    updated: z.string().regex(/^\d{4}-\d{2}$/),
    building: z.array(localized),
    exploring: z.array(localized),
    thinking: z.array(localized),
    question: localized,
  }),
});

/** Points on the hero globe. */
const places = defineCollection({
  loader: file('./src/content/places.yaml'),
  schema: z.object({
    name: localized,
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    kind: z.enum(['life', 'work', 'project']),
    since: z.number().int().optional(),
    /** 'country' coordinates are approximate centroids until a city is confirmed. */
    precision: z.enum(['country', 'city']),
  }),
});

/** The yearly time capsules that already live in ../years. */
const capsules = defineCollection({
  loader: glob({ pattern: '[0-9][0-9][0-9][0-9].md', base: '../years' }),
});

export const collections = { stories, systems, professional, trace, now, places, capsules };
