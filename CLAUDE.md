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
- Working mode tags: `solo:<slug>` or `has-team:<slug>`
- Counts fetched via `lists.getListMembersInfo` + client-side tag filtering (reliable, ~1–2s)
- Email sending is handled by Mailchimp Automations triggered on tag addition
- Merge fields needed: `BOUNTY`, `DOCLINK`, `TEAMMATES` (create manually in Mailchimp)

**Eventbrite** — live event fetching via `/api/events` with static JSON fallback.
- Requires `EVENTBRITE_TOKEN` env var
- Org ID `13250579290` is hardcoded in `src/pages/api/events.ts`
- `WindowManager.tsx` fetches on mount, falls back to `src/data/events.json`

**Rate Limiting** — in-memory rate limiter in `src/lib/rate-limit.ts`.
- Write endpoints (respond, withdraw): 10 req/min per IP
- Admin login: 5 attempts per 5 min per IP
- Resets on cold start (serverless); good enough for burst protection

**Admin Dashboard** — `/dashboard` with cookie-based auth.
- `hackbu-admin` cookie, httpOnly, secure, sameSite strict, 4hr maxAge
- Fetches all Mailchimp members, groups by bounty tags
- CSV export (client-side), search/filter, light mode support

**Theme System** — uses `[data-theme="light"]` attribute selectors, NOT Tailwind `dark:` prefix.
- Theme stored in `localStorage('hackbu-theme')`
- Init script runs before paint to prevent flash
- Dashboard uses custom CSS vars + `[data-theme="light"]` overrides

**Mobile** — windows auto-maximize on `< 768px`, dock wraps with larger touch targets.
- Bounty cards single-column on mobile
- Schedule widget and logos hidden on mobile
- Boot screen scales down title and padding

## Key files

| File | Purpose |
|------|---------|
| `src/content/config.ts` | Bounty Zod schema |
| `src/content/bounties/*.md` | One file per bounty |
| `src/lib/mailchimp.ts` | Mailchimp client |
| `src/lib/rate-limit.ts` | In-memory rate limiter |
| `src/pages/api/respond.ts` | Register interest API (rate-limited) |
| `src/pages/api/withdraw.ts` | Withdraw interest API (rate-limited) |
| `src/pages/api/bounty-counts.ts` | Batch or single bounty count API |
| `src/pages/api/events.ts` | Eventbrite live events API |
| `src/pages/bounties/[slug].astro` | Bounty detail page (standalone) |
| `src/pages/hall-of-fame.astro` | Completed bounties showcase |
| `src/pages/dashboard.astro` | Admin dashboard (SSR, cookie-auth) |
| `src/components/BountyDetail.tsx` | Bounty detail inside OS window |
| `src/components/BountyCard.tsx` | Bounty card with live counts |
| `src/components/WindowManager.tsx` | Main OS window system |
| `src/components/Window.tsx` | Draggable/resizable window |
| `src/components/Desktop.astro` | Background, logos, schedule widget |
| `src/components/Dock.astro` | Bottom dock with app launchers |
| `public/admin/config.yml` | Decap CMS config |
| `.env` | Mailchimp + Eventbrite credentials (never commit) |
| `SETUP.md` | Mailchimp setup + deploy guide |

## Conventions

- **Tailwind only** — no inline styles, no CSS modules (dashboard.astro is an exception with scoped `<style>`)
- **No `slug` in frontmatter** — slug comes from filename via Astro content collections
- **Optimistic UI** — localStorage is updated immediately; API calls happen async
- **Toast feedback** — use `showToast(msg, isError)` for user-visible API results
- **`?open=` deep links** — `/?open=bounties` skips boot and opens a window; back buttons use this
- **Batch API calls** — `bounty-counts` supports no-slug mode returning all counts; WindowManager fetches once
- **No adapter lock-in** — `@astrojs/netlify` is the current adapter; swap to `@astrojs/vercel` or `@astrojs/node` when needed

## Do not

- Add `slug:` field to bounty frontmatter — Astro reserves it and will throw
- Import from `src/data/bounties.json` — it was deleted; use `getCollection('bounties')`
- Put DB logic in static/prerendered pages — keep SSR-only code inside API routes or behind `prerender = false`
- Commit `.env` — it contains real API keys
- Use `overflow-hidden` on Window container — resize handles are positioned outside at negative offsets
- Use Tailwind `dark:` prefix for theming — use `[data-theme="light"]` selectors instead
- Make individual API calls per bounty card — use the batch endpoint
