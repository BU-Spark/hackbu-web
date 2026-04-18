export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../../lib/mailchimp';
import crypto from 'node:crypto';
import { rateLimit, rateLimitResponse, getClientIp } from '../../../lib/rate-limit';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Auth check
  const adminKey = import.meta.env.ADMIN_KEY;
  const sessionCookie = cookies.get('hackbu-admin')?.value;
  if (!adminKey || !sessionCookie || sessionCookie !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(request);
  const rl = rateLimit(ip, { name: 'merge-team', limit: 10, windowSec: 60 });
  if (!rl.allowed) return rateLimitResponse(rl);

  let body: { slug?: string; emails?: string[]; existingTeamId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug, emails, existingTeamId } = body;

  if (!slug || !Array.isArray(emails) || emails.length < 1) {
    return new Response(JSON.stringify({ error: 'Missing required fields: slug, emails' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
    return new Response(JSON.stringify({ error: 'Invalid slug format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Determine team ID
  let teamId: string;

  if (existingTeamId) {
    // Validate team exists
    const teamTag = `team-group:${slug}:${existingTeamId}`;
    let teamFound = false;
    try {
      const res = await (mailchimp as any).lists.getListMembersInfo(AUDIENCE_ID, {
        count: 1000,
        status: 'subscribed',
        fields: ['members.tags'],
      });
      teamFound = (res.members || []).some((m: any) =>
        (m.tags || []).some((t: any) => t.name === teamTag)
      );
    } catch (err) {
      console.error('Failed to validate team:', err);
      return new Response(JSON.stringify({ error: 'Failed to validate existing team' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!teamFound) {
      return new Response(JSON.stringify({ error: 'Team not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    teamId = existingTeamId;
  } else {
    if (emails.length < 2) {
      return new Response(JSON.stringify({ error: 'Need at least 2 emails to form a new team' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    teamId = crypto.randomBytes(4).toString('hex');
  }

  // Apply tags to each email
  const errors: string[] = [];
  for (const email of emails) {
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    const tagsToUpdate: { name: string; status: string }[] = [
      { name: `team-group:${slug}:${teamId}`, status: 'active' },
      { name: `has-team:${slug}`, status: 'active' },
      { name: `solo:${slug}`, status: 'inactive' },
    ];

    // Deactivate any other team-group tags for this bounty
    try {
      const memberInfo = await (mailchimp as any).lists.getListMember(AUDIENCE_ID, subscriberHash, {
        fields: ['tags'],
      });
      const oldTeamTags = (memberInfo.tags || [])
        .filter((t: any) => t.name.startsWith(`team-group:${slug}:`) && t.name !== `team-group:${slug}:${teamId}`)
        .map((t: any) => ({ name: t.name, status: 'inactive' }));
      tagsToUpdate.push(...oldTeamTags);
    } catch {
      // Member may be new to this tag set — safe to continue
    }

    try {
      await (mailchimp as any).lists.updateListMemberTags(AUDIENCE_ID, subscriberHash, {
        tags: tagsToUpdate,
      });
    } catch (err: any) {
      const detail = err?.response?.body ? JSON.stringify(err.response.body) : String(err);
      console.error(`Failed to update tags for ${email}:`, detail);
      errors.push(email);
    }
  }

  if (errors.length > 0) {
    return new Response(JSON.stringify({ error: 'Some members failed to update', failed: errors }), {
      status: 207,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, teamId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
