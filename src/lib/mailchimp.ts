import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: import.meta.env.MAILCHIMP_API_KEY,
  server: import.meta.env.MAILCHIMP_SERVER_PREFIX,
});

export const AUDIENCE_ID = import.meta.env.MAILCHIMP_AUDIENCE_ID;

export default mailchimp;
