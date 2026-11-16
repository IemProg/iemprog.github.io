import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    /** Exactly one primary topic: research, building or life (see TAGS in src/lib/posts.ts). */
    tags: z
      .array(z.string())
      .default([])
      .refine((t) => t.length === 1 && ['research', 'building', 'life'].includes(t[0]), {
        message: 'Posts need exactly one tag: "research", "building" or "life".',
      }),
    draft: z.boolean().default(false),
    /** Where the post first appeared, if it was cross-posted. */
    originalUrl: z.string().url().optional(),
  }),
});

export const collections = { posts };
