import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // Drafts never reach the feed — unlike the dev server, a feed is pulled by
  // readers and cannot be un-published once fetched.
  const lessons = await getCollection('lessons', ({ data }) => !data.draft);
  lessons.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return rss({
    title: 'madojapan',
    description: 'Short Japanese lessons with a Singlish and Chinese-speaker angle.',
    site: context.site!,
    items: lessons.map((lesson) => ({
      title: lesson.data.title,
      description: lesson.data.summary,
      pubDate: lesson.data.publishedAt,
      link: `/lessons/${lesson.data.slug}/`,
      categories: [lesson.data.category, lesson.data.level],
    })),
    customData: '<language>en</language>',
  });
}
