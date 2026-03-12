export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../lib/mailchimp';
import crypto from 'node:crypto';
import { rateLimit, rateLimitResponse, getClientIp } from '../../lib/rate-limit';

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, { name: 'withdraw', limit: 10, windowSec: 60 });
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await request.json();
    const { email, bounty_slug, type } = body;

    if (!email || !bounty_slug || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    const tag = type === 'interested' ? `interested:${bounty_slug}` : `team:${bounty_slug}`;

    // Remove the primary tag + any working mode tags (don't delete the contact)
    const tagsToRemove: { name: string; status: string }[] = [{ name: tag, status: 'inactive' }];
    if (type === 'interested') {
      tagsToRemove.push({ name: `solo:${bounty_slug}`, status: 'inactive' });
      tagsToRemove.push({ name: `has-team:${bounty_slug}`, status: 'inactive' });
    }
    await (mailchimp as any).lists.updateListMemberTags(AUDIENCE_ID, subscriberHash, {
      tags: tagsToRemove,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('Withdraw API error:', err?.response?.body || err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
