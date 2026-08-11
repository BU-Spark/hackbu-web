export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../../lib/mailchimp';
import crypto from 'node:crypto';
import { rateLimit, rateLimitResponse, getClientIp } from '../../../lib/rate-limit';

export const POST: APIRoute = async ({ request, cookies }) => {
  const adminKey = import.meta.env.ADMIN_KEY;
  const sessionCookie = cookies.get('hackbu-admin')?.value;
  if (!adminKey || !sessionCookie || sessionCookie !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(request);
  const rl = rateLimit(ip, { name: 'remove-from-team', limit: 10, windowSec: 60 });
  if (!rl.allowed) return rateLimitResponse(rl);

  let body: { slug?: string; email?: string; teamId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug, email, teamId } = body;

  if (!slug || !email || !teamId) {
    return new Response(JSON.stringify({ error: 'Missing required fields: slug, email, teamId' }), {
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

  if (!/^[a-f0-9]{8}$/i.test(teamId)) {
    return new Response(JSON.stringify({ error: 'Invalid teamId format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

  try {
    await (mailchimp as any).lists.updateListMemberTags(AUDIENCE_ID, subscriberHash, {
      tags: [
        { name: `team-group:${slug}:${teamId}`, status: 'inactive' },
        { name: `has-team:${slug}`, status: 'inactive' },
        { name: `solo:${slug}`, status: 'active' },
      ],
    });
  } catch (err: any) {
    const detail = err?.response?.body ? JSON.stringify(err.response.body) : String(err);
    console.error(`Failed to remove ${email} from team ${teamId}:`, detail);
    return new Response(JSON.stringify({ error: 'Failed to update member tags', detail }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
