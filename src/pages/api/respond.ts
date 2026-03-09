export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../lib/mailchimp';
import crypto from 'node:crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { first_name, last_name, email, year, bounty_slug, type, bounty_title, doc_link } = body;

    if (!first_name || !last_name || !email || !year || !bounty_slug || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    const tag = type === 'interested' ? `interested:${bounty_slug}` : `team:${bounty_slug}`;

    // Add or update the contact
    await (mailchimp as any).lists.setListMember(AUDIENCE_ID, subscriberHash, {
      email_address: email,
      status_if_new: 'subscribed',
      merge_fields: {
        FNAME: first_name,
        LNAME: last_name,
        YEAR: year,
        BOUNTY: bounty_title || '',
        DOCLINK: doc_link || '',
      },
    });

    // Add the tag
    await (mailchimp as any).lists.updateListMemberTags(AUDIENCE_ID, subscriberHash, {
      tags: [{ name: tag, status: 'active' }],
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('Respond API error:', err?.response?.body || err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
