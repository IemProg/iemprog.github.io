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

/** Primary topics for essays. Each post carries exactly one of these as `tags[0]`. */
export const TAGS = [
  { id: 'research', label: 'Research' },
  { id: 'building', label: 'Building' },
  { id: 'life', label: 'Life' },
] as const;

export type TagId = (typeof TAGS)[number]['id'];

export function primaryTag(post: Post): (typeof TAGS)[number] | undefined {
  return TAGS.find((t) => t.id === post.data.tags[0]);
}
