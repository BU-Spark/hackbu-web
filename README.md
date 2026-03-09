# HackBU Web

A desktop OS–themed site for HackBU built with Astro 4, React islands, and Tailwind CSS. Features a bounty board where students can express interest in projects, with Mailchimp integration for email follow-up.

## Stack

- **Astro 4** — hybrid mode (static pages + server API routes)
- **React** — interactive islands (WindowManager, BountyDetail, etc.)
- **Tailwind CSS** — spark design system
- **Mailchimp** — contact management and email automation
- **`@astrojs/node`** — SSR adapter (swap for Netlify/Vercel when deploying)

## Project structure

```
src/
  content/bounties/   ← Markdown files, one per bounty (slug = filename)
  content/config.ts   ← Zod schema for bounty frontmatter
  pages/
    index.astro       ← Desktop OS landing page
    bounties/[slug].astro  ← Individual bounty detail page
    api/
      respond.ts      ← POST: register interest / team request → Mailchimp
      withdraw.ts     ← POST: remove tag from Mailchimp contact
      bounty-counts.ts ← GET: live interested/team counts
  components/
    WindowManager.tsx ← Main OS window system
    BountyDetail.tsx  ← Bounty detail used in the OS window
  lib/
    mailchimp.ts      ← Mailchimp client init
  data/               ← Static JSON (events, projects, leaderboard, motd)
public/
  admin/              ← Decap CMS (non-technical bounty editing via /admin)
scripts/
  add-bounty.mjs      ← CLI to scaffold a new bounty markdown file
```

## Setup

See [SETUP.md](./SETUP.md) for Mailchimp credentials, merge fields, and email automation configuration.

## Develop

```bash
npm install
cp .env.example .env   # fill in Mailchimp credentials
npm run dev            # starts on http://localhost:4321
```

## Build

```bash
npm run build     # astro build (outputs to dist/)
npm run check     # astro type check (run separately)
```

## Add a bounty

```bash
npm run add-bounty        # interactive CLI
# or drop a .md file in src/content/bounties/
# or visit /admin on the deployed site (Decap CMS)
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Desktop OS landing |
| `/bounties/[slug]` | Bounty detail page (static) |
| `/api/respond` | POST — register interest (server) |
| `/api/withdraw` | POST — withdraw interest (server) |
| `/api/bounty-counts` | GET — live counters (server) |
| `/admin` | Decap CMS editor |

## Deploy

See [SETUP.md](./SETUP.md#deploy) for Netlify, Vercel, and Node adapter instructions.
