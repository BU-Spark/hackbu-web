import { defineCollection, z } from 'astro:content';

const bounties = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    prize: z.number(),
    deadline: z.coerce.string(),
    tags: z.array(z.string()),
    status: z.enum(['open', 'completed', 'closed']),
    featured: z.boolean().optional().default(false),
    winner: z.string().optional(),
    winnerSubmission: z.union([z.string().url(), z.literal('')]).optional(),
    docLink: z.union([z.string().url(), z.literal('')]).optional(),
    repoLink: z.union([z.string().url(), z.literal('')]).optional(),
    instructionsLink: z.union([z.string().url(), z.literal('')]).optional(),
  }),
});

export const collections = { bounties };
