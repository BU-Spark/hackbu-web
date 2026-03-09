import { defineCollection, z } from 'astro:content';

const bounties = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    prize: z.number(),
    deadline: z.string(),
    tags: z.array(z.string()),
    status: z.enum(['open', 'claimed', 'completed', 'closed']),
    docLink: z.string().url().optional(),
  }),
});

export const collections = { bounties };
