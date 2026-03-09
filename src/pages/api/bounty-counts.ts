export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../lib/mailchimp';

async function countMembersWithTag(tagName: string): Promise<number> {
  try {
    // Search for members with this tag using the search endpoint
    const response = await (mailchimp as any).searchMembers.search(`tag:${tagName}`);
    return response?.exact_matches?.total_items || 0;
  } catch {
    // Fallback: list all tags and find the one we want
    try {
      const tagsResponse = await (mailchimp as any).lists.tagSearch(AUDIENCE_ID, tagName);
      const tag = tagsResponse?.tags?.find((t: any) => t.name === tagName);
      return tag?.member_count || 0;
    } catch {
      return 0;
    }
  }
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug parameter' }), { status: 400 });
    }

    const [interested, lookingForTeam] = await Promise.all([
      countMembersWithTag(`interested:${slug}`),
      countMembersWithTag(`team:${slug}`),
    ]);

    return new Response(JSON.stringify({ interested, lookingForTeam }), { status: 200 });
  } catch (err: any) {
    console.error('Bounty counts API error:', err?.response?.body || err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
