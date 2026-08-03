import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// Collections are wired up here but intentionally left without a `schema`.
// The Zod schemas for lessons and vocab are defined in CLAUDE.md and get
// added in the content-model step, alongside the first real lesson files.

const lessons = defineCollection({
  loader: glob({ base: './src/content/lessons', pattern: '**/*.md' }),
});

const vocab = defineCollection({
  loader: glob({ base: './src/content/vocab', pattern: '**/*.md' }),
});

export const collections = { lessons, vocab };
