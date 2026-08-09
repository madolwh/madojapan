import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
// z re-exported from astro:content is deprecated; astro/zod is the supported
// path and pins the same Zod version Astro validates against.
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({ base: './src/content/lessons', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    category: z.enum(['singlish', 'kanji', 'slang', 'philosophy', 'travel', 'speaking']),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    // Linked, never embedded — see hard rule 1.
    videoUrl: z.url().optional(),
    // Local file only — see hard rule 2. The path check keeps a CDN or
    // platform URL from quietly getting in here later.
    audioUrl: z.string().startsWith('/audio/').optional(),
    // NOTE: reference() type-checks the shape but does NOT verify the target
    // exists. A typo'd slug builds fine; getEntries() then logs a warning and
    // returns null for it. Guarding against that is still an open decision.
    vocab: z.array(reference('vocab')),
    publishedAt: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const vocab = defineCollection({
  loader: glob({ base: './src/content/vocab', pattern: '**/*.md' }),
  schema: z.object({
    term: z.string(),
    reading: z.string(),
    romaji: z.string(),
    meaning: z.string(),
    register: z.enum(['casual', 'polite', 'slang', 'formal']),
    singlishEquivalent: z.string().optional(),
    chineseNote: z.string().optional(),
  }),
});

export const collections = { lessons, vocab };
