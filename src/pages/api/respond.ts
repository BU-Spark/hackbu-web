export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../lib/mailchimp';
import crypto from 'node:crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { first_name, last_name, email, bounty_slug, type, bounty_title, doc_link, repo_link, instructions_link, teammates, working_mode } = body;

    if (!first_name || !last_name || !email || !bounty_slug || !type) {
      const missing = { first_name: !!first_name, last_name: !!last_name, email: !!email, bounty_slug: !!bounty_slug, type: !!type };
      console.error('Missing required fields:', missing, 'body:', body);
      return new Response(JSON.stringify({ error: 'Missing required fields', missing }), { status: 400 });
    }

    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    const tag = type === 'interested' ? `interested:${bounty_slug}` : `team:${bounty_slug}`;

    // Format teammates string: "Name <email>, Name <email>"
    const teammatesStr = Array.isArray(teammates) && teammates.length > 0
      ? teammates.map((t: { name: string; email: string }) => `${t.name} <${t.email}>`).join(', ')
      : '';

    console.log('Mailchimp config: audience=', AUDIENCE_ID, 'hash=', subscriberHash, 'tag=', tag);

    // Add or update the contact
    const memberRes = await (mailchimp as any).lists.setListMember(AUDIENCE_ID, subscriberHash, {
      email_address: email,
      status_if_new: 'subscribed',
      status: 'subscribed',
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
    console.log('setListMember result:', JSON.stringify(memberRes).slice(0, 200));

    // Add the primary tag + working mode tag (for interested submissions)
    const tagsToAdd: { name: string; status: string }[] = [{ name: tag, status: 'active' }];
    if (working_mode) {
      const modeTag = working_mode === 'team' ? `has-team:${bounty_slug}` : `solo:${bounty_slug}`;
      tagsToAdd.push({ name: modeTag, status: 'active' });
    }
    const tagRes = await (mailchimp as any).lists.updateListMemberTags(AUDIENCE_ID, subscriberHash, {
      tags: tagsToAdd,
    });
    console.log('updateListMemberTags result:', JSON.stringify(tagRes));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    const detail = err?.response?.body ? JSON.stringify(err.response.body) : String(err);
    console.error('Respond API error:', detail);
    return new Response(JSON.stringify({ error: 'Internal server error', detail }), { status: 500 });
  }
};
