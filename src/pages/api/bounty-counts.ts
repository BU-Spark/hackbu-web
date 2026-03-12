export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../lib/mailchimp';

export const GET: APIRoute = async ({ url }) => {
  try {
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug parameter' }), { status: 400 });
    }

    // Fetch all members and count by tag (same approach as dashboard — reliable)
    let allMembers: any[] = [];
    try {
      const res = await (mailchimp as any).lists.getListMembersInfo(AUDIENCE_ID, {
        count: 1000,
        status: 'subscribed',
        fields: ['members.email_address', 'members.tags'],
      });
      allMembers = res.members || [];
    } catch (e) {
      console.error('Failed to fetch members for counts:', e);
    }

    const interested = allMembers.filter((m: any) =>
      (m.tags || []).some((t: any) => t.name === `interested:${slug}`)
    ).length;

    const lookingForTeam = allMembers.filter((m: any) =>
      (m.tags || []).some((t: any) => t.name === `team:${slug}`)
    ).length;

    return new Response(JSON.stringify({ interested, lookingForTeam }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Bounty counts API error:', err?.response?.body || err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
