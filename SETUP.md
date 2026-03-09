# HackBU Web — Setup Guide

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```
MAILCHIMP_API_KEY=        # Mailchimp API key (Account > Extras > API Keys)
MAILCHIMP_SERVER_PREFIX=  # e.g. us21  (the prefix in your API key after the dash)
MAILCHIMP_AUDIENCE_ID=    # Audience > Settings > Audience name and defaults > Audience ID
```

## Mailchimp Setup

### 1. Create Merge Fields

In your Mailchimp Audience go to **Settings → Audience fields and *|MERGE|* tags** and add:

| Field label | Tag       | Type |
|-------------|-----------|------|
| Year        | `YEAR`    | Text |
| Bounty      | `BOUNTY`  | Text |
| Doc Link    | `DOCLINK` | Text |

### 2. Email Automation (Congrats Email)

To send a congratulations email when someone registers interest:

1. Go to **Automations → Classic Automations → Create**
2. Choose **Tag added** as the trigger
3. Set tag to `interested:*` (one automation per bounty, or use a catch-all)
4. Design your email using the merge fields:
   - `*|FNAME|*` — first name
   - `*|BOUNTY|*` — bounty title
   - `*|DOCLINK|*` — link to the project description doc
5. Suggested subject: `Congrats on taking on *|BOUNTY|*!`
6. Suggested body: mention Innovation Hours, buspark@bu.edu, Code and Tell

> Note: The "Looking for Teammates" tag (`team:*`) does **not** trigger an email — that is intentional.

## Adding a Bounty

### Option A — Markdown file (recommended for developers)

Drop a `.md` file in `src/content/bounties/`. The filename (minus `.md`) becomes the URL slug.

```md
---
title: My Bounty
difficulty: Beginner
prize: 100
deadline: "2026-06-30"
tags: ["Web", "API"]
status: open
docLink: https://docs.google.com/...
---

Description of the bounty goes here.
```

### Option B — CLI script

```bash
npm run add-bounty
```

### Option C — Decap CMS (non-technical)

Visit `/admin` on the deployed site. Requires the `repo` in `public/admin/config.yml` to be set to your GitHub repo. Users authenticate via GitHub OAuth.

## Deploy

### Netlify (recommended)
1. Replace `@astrojs/node` with `@astrojs/netlify` in `astro.config.mjs`
2. Push to GitHub and connect the repo in Netlify
3. Add env vars in Netlify Dashboard → Site Settings → Environment Variables
4. The `netlify.toml` handles build settings automatically

### Vercel
1. Replace `@astrojs/node` with `@astrojs/vercel` in `astro.config.mjs`
2. Push to GitHub and import the repo in Vercel
3. Add env vars in Vercel Dashboard → Project → Settings → Environment Variables
4. The `vercel.json` handles build settings automatically

### Self-hosted / Node
Keep `@astrojs/node` as-is. After `npm run build`, run:
```bash
node dist/server/entry.mjs
```

## Adapter Swap

When switching platforms, update `astro.config.mjs`:

```js
// Netlify
import netlify from '@astrojs/netlify';
adapter: netlify()

// Vercel
import vercel from '@astrojs/vercel/serverless';
adapter: vercel()

// Node (self-hosted)
import node from '@astrojs/node';
adapter: node({ mode: 'standalone' })
```

Install the corresponding package:
```bash
npm install @astrojs/netlify    # or
npm install @astrojs/vercel
```
