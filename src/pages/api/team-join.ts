export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../lib/mailchimp';
import crypto from 'node:crypto';
import { rateLimit, rateLimitResponse, getClientIp } from '../../lib/rate-limit';

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, { name: 'team-join', limit: 10, windowSec: 60 });
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await request.json();
    const { first_name, last_name, email, bounty_slug, team_id } = body;

    if (!first_name || !last_name || !email || !bounty_slug || !team_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Validate team exists by checking if anyone has the team-group tag
    const teamTag = `team-group:${bounty_slug}:${team_id}`;
    const allRes = await (mailchimp as any).lists.getListMembersInfo(AUDIENCE_ID, {
      count: 1000,
      status: 'subscribed',
      fields: ['members.tags', 'members.email_address'],
    });
    const teamMembers = (allRes.members || []).filter((m: any) =>
      (m.tags || []).some((t: any) => t.name === teamTag)
    );
    if (teamMembers.length === 0) {
      return new Response(JSON.stringify({ error: 'Team not found' }), { status: 404 });
    }

    // Create/update the contact
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    await (mailchimp as any).lists.setListMember(AUDIENCE_ID, subscriberHash, {
      email_address: email,
      status_if_new: 'subscribed',
      status: 'subscribed',
      merge_fields: {
        FNAME: first_name,
        LNAME: last_name,
      },
    });

    // Add tags
    await (mailchimp as any).lists.updateListMemberTags(AUDIENCE_ID, subscriberHash, {
      tags: [
        { name: `interested:${bounty_slug}`, status: 'active' },
        { name: `has-team:${bounty_slug}`, status: 'active' },
        { name: teamTag, status: 'active' },
      ],
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    const detail = err?.response?.body ? JSON.stringify(err.response.body) : String(err);
    console.error('Team join API error:', detail);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
