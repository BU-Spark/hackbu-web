export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../lib/mailchimp';
import crypto from 'node:crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { first_name, last_name, email, bounty_slug, type, bounty_title, doc_link, repo_link, instructions_link, teammates, working_mode } = body;

    if (!first_name || !last_name || !email || !bounty_slug || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    const tag = type === 'interested' ? `interested:${bounty_slug}` : `team:${bounty_slug}`;

    // Format teammates string: "Name <email>, Name <email>"
    const teammatesStr = Array.isArray(teammates) && teammates.length > 0
      ? teammates.map((t: { name: string; email: string }) => `${t.name} <${t.email}>`).join(', ')
      : '';

    // Add or update the contact
    await (mailchimp as any).lists.setListMember(AUDIENCE_ID, subscriberHash, {
      email_address: email,
      status_if_new: 'subscribed',
      merge_fields: {
        FNAME: first_name,
        LNAME: last_name,
        BOUNTY: bounty_title || '',
        DOCLINK: doc_link || '',
        REPOLINK: repo_link || '',
        INSTRLINK: instructions_link || '',
        ...(teammatesStr ? { TEAMMATES: teammatesStr } : {}),
      },
    });

    // Add the primary tag + working mode tag (for interested submissions)
    const tagsToAdd: { name: string; status: string }[] = [{ name: tag, status: 'active' }];
    if (type === 'interested') {
      const modeTag = working_mode === 'team' ? `has-team:${bounty_slug}` : `solo:${bounty_slug}`;
      tagsToAdd.push({ name: modeTag, status: 'active' });
    }
    await (mailchimp as any).lists.updateListMemberTags(AUDIENCE_ID, subscriberHash, {
      tags: tagsToAdd,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('Respond API error:', err?.response?.body || err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
