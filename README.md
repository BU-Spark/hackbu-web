# HackBU Web

A desktop OS–themed site for HackBU built with Astro 4, React islands, and Tailwind CSS. Features a bounty board where students can express interest in projects, with Mailchimp integration for email follow-up and an admin dashboard for tracking responses.

## Stack

- **Astro 4** — hybrid mode (static pages + server API routes)
- **React** — interactive islands (WindowManager, BountyDetail, Terminal, etc.)
- **Tailwind CSS** — spark design system with dark/light theme support
- **Mailchimp** — contact management and email automation
- **Eventbrite API** — live event fetching with static JSON fallback
- **`@astrojs/netlify`** — SSR adapter (swap for Vercel or Node when needed)

## Project structure

```
src/
  content/bounties/   ← Markdown files, one per bounty (slug = filename)
  content/config.ts   ← Zod schema for bounty frontmatter
  pages/
    index.astro       ← Desktop OS landing page with boot sequence
    bounties/[slug].astro  ← Individual bounty detail page (standalone)
    hall-of-fame.astro     ← Completed bounties showcase
    dashboard.astro        ← Admin dashboard (cookie-auth, SSR)
    api/
      respond.ts      ← POST: register interest / team request → Mailchimp
      withdraw.ts     ← POST: remove tag from Mailchimp contact
      bounty-counts.ts ← GET: batch or single bounty interest counts
      events.ts       ← GET: live Eventbrite events
  components/
    WindowManager.tsx ← Main OS window system (bounties, events, about, etc.)
    BountyDetail.tsx  ← Bounty detail inside OS window
    BountyCard.tsx    ← Bounty card with live counts and loading states
    Window.tsx        ← Draggable/resizable window (auto-maximizes on mobile)
    Terminal.tsx      ← Drop-down terminal emulator
    Desktop.astro     ← Background, logo watermarks, schedule widget
    Dock.astro        ← Bottom dock with app launchers
    Topbar.astro      ← Top bar with clock, theme toggle, links
  lib/
    mailchimp.ts      ← Mailchimp client init
    rate-limit.ts     ← In-memory rate limiter for API routes
    deadline.ts       ← Deadline countdown utilities
    sounds.ts         ← UI sound effects
  data/               ← Static JSON (events, projects, leaderboard)
public/
  backgrounds/        ← Compressed background images (bg-1.jpg through bg-11.jpg)
  widget/             ← Weekly schedule graphic
  admin/              ← Decap CMS (non-technical bounty editing via /admin)
scripts/
  add-bounty.mjs      ← CLI to scaffold a new bounty markdown file
```

## Features

- **Desktop OS metaphor** — draggable/resizable windows, dock, terminal, boot sequence
- **Bounty board** — filterable card grid with search, difficulty/status filters, sort
- **Interest registration** — "I'm Interested" and "Looking for Teammates" flows
- **Live counts** — batch API fetches all bounty interest/team counts in one call
- **Admin dashboard** — cookie-authenticated, search/filter responses, CSV export
- **Rate limiting** — API routes throttled (10 req/min), login throttled (5 attempts/5 min)
- **Mobile responsive** — windows auto-maximize, touch-friendly dock, single-column cards
- **Dark/light theme** — toggle in topbar, persisted to localStorage
- **SEO** — Open Graph, Twitter Card, and meta description on all pages
- **Eventbrite integration** — live event fetching with static JSON fallback
- **`?open=` query param** — deep-link to open specific windows, skips boot sequence

## Setup

See [SETUP.md](./SETUP.md) for Mailchimp credentials, merge fields, and email automation configuration.

## Develop

```bash
npm install
cp .env.example .env   # fill in Mailchimp + Eventbrite credentials
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
| `/` | Desktop OS landing with boot sequence |
| `/bounties/[slug]` | Bounty detail page (static, standalone) |
| `/hall-of-fame` | Completed bounties and past winners |
| `/dashboard` | Admin dashboard (cookie-auth, SSR) |
| `/api/respond` | POST — register interest (rate-limited) |
| `/api/withdraw` | POST — withdraw interest (rate-limited) |
| `/api/bounty-counts` | GET — batch or single bounty counters |
| `/api/events` | GET — live Eventbrite events |
| `/admin` | Decap CMS editor |

## Deploy

See [SETUP.md](./SETUP.md#deploy) for Netlify, Vercel, and Node adapter instructions.
