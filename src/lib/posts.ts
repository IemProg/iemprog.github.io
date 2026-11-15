import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function readingTime(body = ''): number {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 230));
}

export function formatDate(d: Date, style: 'long' | 'short' = 'long'): string {
  return d.toLocaleDateString('en-GB', {
    day: style === 'long' ? 'numeric' : undefined,
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
