import { defineCollection, z } from 'astro:content';

const bounties = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    prize: z.number(),
    deadline: z.union([z.string(), z.date()]).transform((v) =>
      v instanceof Date ? v.toISOString().split('T')[0] : v
    ),
    tags: z.array(z.string()),
    status: z.enum(['open', 'completed', 'closed']),
    // Which track a bounty belongs to. `hackbu` is the BU IS&T collaboration —
    // one track among several, not the whole board. Defaults so existing
    // bounty files keep validating untouched.
    track: z.enum(['hackbu', 'spark', 'partner']).optional().default('hackbu'),
    sponsor: z.string().optional(),
    requirements: z
      .array(z.object({ text: z.string(), done: z.boolean().optional().default(false) }))
      .optional(),
    featured: z.boolean().optional().default(false),
    winner: z.string().optional(),
    winnerSubmission: z.string().optional(),
    docLink: z.string().optional(),
    repoLink: z.string().optional(),
    instructionsLink: z.string().optional(),
  }),
});

export const collections = { bounties };
