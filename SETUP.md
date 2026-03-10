# HackBU Web — Setup Guide

## Current Status

- ✅ `.env` filled with Mailchimp credentials
- ✅ Mailchimp merge fields created: `BOUNTY`, `DOCLINK`
- ✅ One bounty exists: `src/content/bounties/plate-gallery.md`
- ✅ API routes wired: `/api/respond`, `/api/withdraw`, `/api/bounty-counts`
- ✅ Card grid UI with filters, sort, deadline countdown, live counters
- ⏳ Mailchimp email automation — optional, set up in dashboard
- ⏳ More bounties need to be added
- ⏳ Deploy to Netlify/Vercel

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
MAILCHIMP_API_KEY=        # Account > Extras > API Keys
MAILCHIMP_SERVER_PREFIX=  # e.g. us21 (suffix after dash in API key)
MAILCHIMP_AUDIENCE_ID=    # Audience > Settings > Audience name and defaults
```

---

## Mailchimp Setup

### Merge Fields

Audience → Settings → Audience fields and *|MERGE|* tags — create these custom fields:

| Field label | Merge tag        | Type | Used for |
|-------------|------------------|------|----------|
| Bounty      | `*|BOUNTY|*`     | Text | Bounty title in emails |
| Doc Link    | `*|DOCLINK|*`    | Text | Link to project brief in emails |
| Teammates   | `*|TEAMMATES|*`  | Text | Comma-separated teammate names + emails (set when submitter already has a team) |

> Do NOT mark any of these as Required. Leave default value blank.
>
> `TEAMMATES` is only populated when the user selects "Already have a team" on the I'm Interested form. Format: `Name <email>, Name <email>`.

### Email Automation (optional but recommended)

Sends a welcome email when a student clicks "I'm Interested":

1. **Automations → Classic Automations → Create**
2. Trigger: **Tag added**
3. Tag name: `interested:plate-gallery` *(repeat for each bounty slug)*
4. Design the email — suggested merge tags:
   - `*|FNAME|*` — student's first name
   - `*|BOUNTY|*` — bounty title
   - `*|DOCLINK|*` — link to project brief doc
5. Suggested subject: `You're in — *|BOUNTY|* awaits!`
6. Body: welcome, mention Innovation Hours, next steps, contact buspark@bu.edu

> The `team:<slug>` tag does NOT trigger an email — intentional.
> You need one automation per bounty slug (e.g. `interested:plate-gallery`, `interested:my-other-bounty`).

### Testing the Full Flow

1. `npm run dev`
2. Open `http://localhost:4321`, click the Bounties dock icon
3. Click a bounty card → opens detail window
4. Click "I'm Interested" → fill name + email → Submit
5. Check Mailchimp → All Contacts — contact should appear with `BOUNTY` and `DOCLINK` populated
6. Check contact's Tags — should have `interested:plate-gallery`
7. The heart counter on the card updates on next page load (Mailchimp tag search is ~1–2s, expected)

---

## Adding Bounties

### Option A — Markdown file (recommended)

Drop a `.md` file in `src/content/bounties/`. The filename (minus `.md`) becomes the URL slug.

```md
---
title: My Bounty Title
difficulty: Beginner          # Beginner | Intermediate | Advanced
prize: 150                    # number, USD
deadline: "2026-06-30"        # YYYY-MM-DD
tags: ["Web", "React", "API"]
status: open                  # open | completed | closed
docLink: https://docs.google.com/...   # optional
---

Full description of the bounty goes here. Supports **markdown**.

What to build, acceptance criteria, any helpful context.
```

**Important:** Do NOT add `slug:` to frontmatter — Astro derives it from the filename automatically.

After adding the file, `npm run dev` will hot-reload it. For production, redeploy.

If you add a new bounty, also create a Mailchimp automation for `interested:<new-slug>` if you want the welcome email to fire for it.

### Option B — CLI script

```bash
npm run add-bounty
```

Interactive prompts to scaffold the `.md` file.

### Option C — Decap CMS (non-technical editors)

Visit `/admin` on the deployed site. Authenticates via GitHub OAuth.

Requires updating `public/admin/config.yml` — set `repo:` to your GitHub org/repo name before deploying.

---

## Bounty Status Lifecycle

Edit the `status:` field in the `.md` file to update a bounty:

| Status      | Meaning |
|-------------|---------|
| `open`      | Active, accepting interest |
| `completed` | Winner chosen, bounty closed successfully |
| `closed`    | Cancelled or expired without completion |

---

## Bounty Frontmatter Reference

```md
---
title: string               # required — display name
difficulty: Beginner        # required — Beginner | Intermediate | Advanced
prize: 200                  # required — integer USD
deadline: "2026-06-30"      # required — YYYY-MM-DD string
tags: ["tag1", "tag2"]      # required — array of skill/tech strings
status: open                # required — open | completed | closed
docLink: https://...        # optional — URL to Google Doc / Notion brief
---
```

---

## Deploy

### Netlify (recommended)

1. Swap adapter in `astro.config.mjs`:
   ```js
   import netlify from '@astrojs/netlify';
   adapter: netlify(),
   ```
2. Install: `npm install @astrojs/netlify`
3. Push to GitHub, connect repo in Netlify dashboard
4. Add the three env vars in **Netlify → Site Settings → Environment Variables**:
   - `MAILCHIMP_API_KEY`
   - `MAILCHIMP_SERVER_PREFIX`
   - `MAILCHIMP_AUDIENCE_ID`
5. `netlify.toml` handles build command and publish dir automatically

### Vercel

1. Swap adapter:
   ```js
   import vercel from '@astrojs/vercel/serverless';
   adapter: vercel(),
   ```
2. Install: `npm install @astrojs/vercel`
3. Push to GitHub, import repo in Vercel dashboard
4. Add env vars in **Vercel → Project → Settings → Environment Variables**
5. `vercel.json` handles build settings

### Self-hosted / Node

Keep `@astrojs/node` as-is:
```bash
npm run build
node dist/server/entry.mjs
```

---

## Adapter Swap Reference

```js
// Netlify
import netlify from '@astrojs/netlify';
adapter: netlify()

// Vercel
import vercel from '@astrojs/vercel/serverless';
adapter: vercel()

// Node (local / self-hosted)
import node from '@astrojs/node';
adapter: node({ mode: 'standalone' })
```

---

## Dev Commands

```bash
npm run dev          # start dev server at http://localhost:4321
npm run build        # production build (no type check)
npm run check        # TypeScript type check (run separately)
npm run add-bounty   # interactive CLI to add a new bounty .md file
```

---

## Pending / Future Work

### High priority
- [ ] Add remaining bounties as `.md` files in `src/content/bounties/`
- [ ] Set up Mailchimp automations for each bounty slug (`interested:<slug>`)
- [ ] Deploy to Netlify or Vercel with env vars configured

### Medium priority (researched, not yet built)
- [ ] `featured: true` frontmatter field — pins/highlights bounty at top of card grid
- [ ] `track` field (e.g. "AI", "Web", "Design") — adds category filter tab to bounty window
- [ ] Past winners on completed bounties — add `winner` + `winnerSubmission` to frontmatter, show in detail view
- [ ] Structured deliverables field — `deliverables` array in frontmatter, shown prominently in detail view

### Lower priority
- [ ] Decap CMS — set `repo: your-org/hackbu-web` in `public/admin/config.yml`
- [ ] Hall of Fame page (`/hall-of-fame`) showing past winners across all bounties
- [ ] Leaderboard populated with real data (currently placeholder in `src/data/leaderboard.json`)
