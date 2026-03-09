# CLAUDE.md — HackBU Web

This file tells Claude Code how to work in this repo.

## Commands

```bash
npm run dev       # start dev server (http://localhost:4321), HMR via file polling
npm run build     # astro build only (no type check, faster)
npm run check     # astro type check (run separately when needed)
npm run add-bounty  # interactive CLI to scaffold a new bounty .md file
```

## Architecture

**Hybrid mode** — most pages are prerendered (static), API routes are server-rendered.

- `output: 'hybrid'` in `astro.config.mjs`
- Any page/route that needs SSR must have `export const prerender = false`
- API routes in `src/pages/api/` are all server-rendered
- All other pages are static by default

**Content Collections** — bounties live in `src/content/bounties/*.md`.
- The filename (minus `.md`) is the slug — do not put `slug:` in frontmatter
- Schema is defined in `src/content/config.ts` with Zod
- Adding a new bounty = dropping a `.md` file, no code changes needed

**Mailchimp** — used for contact management, not a transactional mailer.
- Each contact gets tags like `interested:plate-gallery` or `team:plate-gallery`
- Counts are fetched from Mailchimp tag search (slow, ~1–2s, that's expected)
- Email sending is handled by Mailchimp Automations triggered on tag addition
- Merge fields needed: `YEAR`, `BOUNTY`, `DOCLINK` (create manually in Mailchimp)

## Key files

| File | Purpose |
|------|---------|
| `src/content/config.ts` | Bounty Zod schema |
| `src/content/bounties/*.md` | One file per bounty |
| `src/lib/mailchimp.ts` | Mailchimp client |
| `src/pages/api/respond.ts` | Register interest API |
| `src/pages/api/withdraw.ts` | Withdraw interest API |
| `src/pages/api/bounty-counts.ts` | Live counter API |
| `src/pages/bounties/[slug].astro` | Bounty detail page (standalone) |
| `src/components/BountyDetail.tsx` | Bounty detail inside OS window |
| `src/components/WindowManager.tsx` | Main OS window system |
| `public/admin/config.yml` | Decap CMS config |
| `.env` | Mailchimp credentials (never commit) |
| `SETUP.md` | Mailchimp setup + deploy guide |

## Conventions

- **Tailwind only** — no inline styles, no CSS modules
- **No `slug` in frontmatter** — slug comes from filename via Astro content collections
- **Optimistic UI** — localStorage is updated immediately; API calls happen async
- **Toast feedback** — use `showToast(msg, isError)` for user-visible API results
- **No adapter lock-in** — `@astrojs/node` is the current adapter; swap to `@astrojs/netlify` or `@astrojs/vercel` when deploying

## Do not

- Add `slug:` field to bounty frontmatter — Astro reserves it and will throw
- Import from `src/data/bounties.json` — it was deleted; use `getCollection('bounties')`
- Put DB logic in static/prerendered pages — keep SSR-only code inside API routes or behind `prerender = false`
- Commit `.env` — it contains real API keys
