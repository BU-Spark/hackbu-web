# HackBU Website – Design Brief & Requirements

## 🌟 Project Overview

**HackBU** is a Boston University (BU) community of students who build tools *for* BU itself.  
Sponsored by **BU Information Services & Technology (IS&T)** and **BU Spark!**, HackBU connects students who want to improve campus systems through software — from web apps to data pipelines — while earning prizes, bounties, and recognition.

The goal of the website is to:
- Present HackBU as an *OS-like hub* for projects, bounties, and events.
- Reinforce BU Spark!’s brand personality — playful, tech-forward, and approachable.
- Integrate real-time leaderboards, project galleries, and Discord-based community links.
- Showcase IRL community events like **Syntax & Snax** and **Code & Tell**.

---

## 🧩 Site Architecture

### Core Sections
| Section | Purpose | Notes |
|----------|----------|-------|
| **Home / OS view** | “Desktop”-like hub with floating windows for Bounties, Gallery, Leaderboard, and Events. | Non-traditional UX; inspired by Vercel Ship and Ona .com. |
| **Gallery** | Visual cards for active and completed HackBU projects. | Should use Spark! photography rules — bright, authentic, collaborative scenes. |
| **Bounties** | Table of open coding challenges with prize, deadline, and tags. | Support live updates or Airtable/Notion sync later. |
| **Leaderboard** | Contributor ranking system. | Pulls data from GitHub, Discord, or custom API. |
| **Events** | Syntax & Snax, Code & Tell, hackathons. | Calendar integration optional. |
| **Community / Discord** | Invitation and onboarding page. | Should emphasize belonging and safety. |

---

## 🖥️ UX & Interaction Model

- Default interface: full-screen **Spark teal OS-style shell** with draggable windows and a boot animation.  
- Navigation: bottom dock (apps) + top status bar (theme toggle, terminal shortcut).  
- **Theme toggle**: switches between two Spark color inversions:
  - **Primary (default)** → Teal BG `#06B1A2`, Foreground `#D9EADF`
  - **Light mode** → BG `#D9EADF`, Deep teal text `#063E3A`, accents `#06B1A2`
- Include subtle motion, glow, and blur; avoid heavy 3-D or skeuomorphic effects.

---

## 🎨 Visual Design System  
(Based on BU Spark! Style Guide)

### Brand Purpose  
> “Help students find passion, find community, build skills, and have impact.”

### Core Traits  
Lovable, quirky, risk-taking yet reliable — *the magician who makes everyone better.*

### Primary Palette
| Name | HEX | Use |
|------|------|-----|
| **Teal** | `#00A99E` – `#06B1A2` | Primary brand / background |
| **Eggshell (Green-gray)** | `#E3EEE5` – `#D9EADF` | Foreground / light mode |
| **Chartreuse** | `#BFF13C` | Accent glow or call-to-action |
| **Orange** | `#FF572D` | Secondary accent for highlights |
| **Black / Dark Gray** | `#12110C / #2E2B28` | Text and depth framing |

### Typography
- **Headlines** → Bebas Neue (uppercase, tight letter spacing)  
- **Body copy** → Gotham or Montserrat (geometric, clean)  
- **Code / Terminal** → JetBrains Mono or monospace alternative  

### Graphic Motifs
- Ombre frames (teal → chartreuse → eggshell or orange)
- Light grid and code patterns (0s and 1s, concentric circles)
- Spark! cookie icons (optional for playful achievements)
- Photography: bright, candid, diverse, tech-in-context

---

## 🧠 Technical Requirements

| Category | Specification |
|-----------|---------------|
| **Framework** | Preferably **Astro** (simple, static + islands) → Fallback React + Vite if interactivity requires. |
| **Styling** | Tailwind CSS or PostCSS; respect Spark color tokens. |
| **Hosting** | Vercel or Netlify (supports theme switching, static assets). |
| **Fonts** | Import Bebas Neue & Montserrat via Google Fonts. |
| **Accessibility** | Maintain color contrast > 4.5:1; support keyboard navigation and reduced motion. |
| **Brand assets** | Use provided Spark logos (black/white + color), HackBU logo, and IS&T logo. |
| **Integration points** | Discord link, BU authentication (SAML optional), API endpoints for bounties & leaderboard. |

---

## 🧱 Variants Provided

You’ll find four prototype versions for reference:

```
./starter-site/
./starter-site-alt-1/
./starter-site-alt-2/
./starter-site-alt-3/
```

Each explores a different interaction metaphor (boot screen, dock nav, theme toggle, window stacking).  
The final design should **synthesize their best qualities** into a unified Spark-branded experience.

---

## 🤖 Prompt for a GenAI Website Builder

> **Prompt:**  
> “You are designing a non-traditional OS-style website for **HackBU**, a BU Spark!-sponsored community of student developers improving BU systems.  
> Use the **BU Spark! color palette** (Teal #00A99E / #06B1A2, Eggshell #E3EEE5 / #D9EADF, Chartreuse #BFF13C, Orange #FF572D) and typographic system (Bebas Neue + Montserrat).  
> Combine the personality of *Vercel Ship* with the interactivity of *Ona.com*, keeping Spark’s quirky-but-reliable tone.  
> Reference the four prototype folders (`starter-site`, `starter-site-alt-1..3`) for layout and behavior.  
> Generate two responsive versions — **primary (teal BG)** and **inverted (light BG)** — with a toggle between them.  
> Output a minimal Astro or React project scaffold using Tailwind CSS tokens for colors and gradients consistent with the attached BU Spark! style guide.”


---

## 🧭 About Page (New)

**Purpose**: Explain who we are, why HackBU exists, and how to get involved — for students, staff, and external partners.

**Core Blocks**
- **Mission & Promise**: One-paragraph statement mapping to Spark!’s brand purpose (passion, community, skills, impact).
- **Sponsors**: BU IS&T + BU Spark! (logos, 1–2 line blurbs, link to program pages).
- **What We Do**: 3-up cards: *Bounties*, *Projects*, *Events*. Each card links to the relevant app window/route.
- **How to Join**: Discord invite → onboarding → pick a track (Web, Data, Infra, UX) → first-issue flow.
- **Governance & Safety**: Code of conduct, reporting path, moderation policy, accessibility commitments.
- **Team & Roles**: Spark staff leads, student maintainers, IS&T advisory reps; quick bios and contact channel.
- **FAQ**: Eligibility, time commitment, IP/licensing defaults, how prizes/bounties work, how to propose a project.

**Design Notes**
- Use a full-bleed hero with teal-to-eggshell gradient and a subtle skyline watermark.
- Pull quotes from student builders; include candid photos (follow Spark style guide).
- Keep CTAs persistent: *Join Discord*, *Browse Bounties*, *Submit a Project*.

**Routing**
- `/about` top-level route + tile on the OS desktop opens an *About* window with the same content.

---

## 📺 Streaming Show: Concept & Requirements (New)

**Working Title**: *(see name brainstorm below)*

**Format Options**
- **API Tours**: 20–30 min deep dives on BU/partner APIs; live demos + code-along snippets.
- **Ship Rooms**: 15–20 min lightning interviews with HackBU teams (what problem, what stack, what’s next).
- **Live Bounties**: 30–45 min “pair-build” on an open bounty; viewers submit PRs during stream.
- **Office Hours**: 30 min Q&A; rotating mentors from IS&T and Spark.

**Cadence**
- Weekly during the semester (8–10 episodes/term). Publish a seasonal calendar aligned to Syntax & Snax and Code & Tell.

**Gamification Hooks**
- **Stream XP**: Chat command (`!checkin`) awards points tied to site leaderboard.
- **Quests**: Episode-specific quests (e.g., “fork repo + open first issue” = +25 pts).
- **Achievement Badges**: “API Explorer,” “First PR Live,” “Mentor Assist,” shown on user profiles and leaderboard.
- **Raffles**: Automatic entry for viewers completing quests; prizes from IS&T bounty funds or swag.

**Distribution**
- Primary: YouTube Live (archived playlists: *API Tours*, *Ship Rooms*, *Live Bounties*). 
- Simulcast: Twitch and Discord Stage; Discord bot posts episode cards + `/remind`.

**Tech Stack**
- OBS + StreamElements overlays; scene pack in Spark colors (teal/eggshell/chartreuse accents).
- Lower-thirds that pull GitHub/username + project name from a Google Sheet or Supabase table.
- On-screen CTA components (QR to bounty, shortlinks, Discord invite).

**Site Integration**
- `/live` route that:
  - Detects live status; swaps hero to embedded player + live chat.
  - Shows episode card, quests, and **Join Discord** button.
  - After the stream: auto-moves to the Gallery with highlights and links to repos.

**Data Model Additions**
- `episodes(id, title, slug, type, start_at, duration, guests[], repo_urls[], quest_ids[], vod_url)`
- `quests(id, title, description, points, start_at, end_at, episode_id)`
- `checkins(user_id, episode_id, ts)`

**KPIs**
- Live CCU, total watch time, quest completions, PRs created during stream, Discord joins, returning viewers.

---

## 🏷️ Show Name Brainstorm (shortlist)

**Top candidates**
- **hackbu: unboxed**
- **hackbu: insider** *(or **insiders**)*

**Also consider**
- HackBU Live
- Spark Ship Room
- Build @ BU
- Campus Infra, Unboxed
- The API Arcade
- Level Up @ Spark *(callback to Level Up Hour)*
- Terrier Builders Live
- Fix-It Fridays *(bounty episodes)*

> Pick 1–2 finalists; we’ll design lower-thirds and a stream bumper accordingly.

---

## 🔧 Additional Requirements Updates

1) **About Page CMS**: Provide editable markdown or CMS fields for Mission, Sponsors, Team, FAQ.  
2) **Episode System**: Add content types for Episodes and Quests in Supabase (or a flat JSON store at first).  
3) **Auth**: BU-only Google OAuth (restrict to `@bu.edu` domain via hosted domain / allowlist); permit arbitrary display names (editable in profile). Optional Discord OAuth for community features; anonymous session with CAPTCHA allowed for read-only browsing. Tie all identifiable actions (check-in, quests) to authenticated users.  
4) **Accessibility**: All streams require live captions; archive VODs with corrected subtitles.  
5) **Analytics**: Track episode interactions (check-ins, quest CTA clicks) and attribute XP to users.

---

## 🧪 Acceptance Criteria (delta)

- `/about` renders with Mission, Sponsors, Join, Governance, Team, FAQ and meets contrast/ALT text guidelines.
- `/live` auto-detects live stream, displays episode info, and exposes quest CTA components.
- **Auth**: Only `@bu.edu` Google accounts can sign in; display names can be arbitrary; non-BU users are blocked from write actions (quests/check-ins/submissions).
- Leaderboard increments points based on `checkin` and quest completion events.
- Gallery entries link to relevant VODs and episode tags.
- Theme toggle applies consistently across About and Live routes/windows.


---

## 🧱 Build‑Ready Checklist (with SQLite for dev)

**Goal:** Ship a locally runnable MVP with **Astro + Tailwind** and **SQLite** for data during development, while keeping an easy migration path to Postgres/Supabase for production.

### Stack
- **Astro** (UI + routes) with islands for interactive windows
- **Tailwind** (Spark tokens in `tailwind.config.ts`)
- **SQLite** (dev DB) via **Prisma ORM** (easy swap to Postgres later)
- **Auth**: Google OAuth gated to `@bu.edu` via **Auth.js** (Core) using Prisma adapter + SQLite

### Folder structure
```
apps/web/               # Astro app
  src/
    pages/              # /, /about, /live, /project/[slug], /bounty/[id], /profile
    components/
    lib/
      db.ts             # Prisma client
      auth.ts           # Auth.js (Google provider) + bu.edu gate
    data/               # seed JSON for bounties, projects, events, episodes, quests
  prisma/
    schema.prisma       # SQLite models (dev)
  public/
    brand/              # logos & style elements
  tailwind.config.ts
  .env.local
```

### 1) Prisma schema (SQLite dev)
```prisma
// apps/web/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // file:./dev.db
}

model User {
  id           String  @id @default(cuid())
  email        String  @unique
  displayName  String
  discordId    String?
  createdAt    DateTime @default(now())
  sessions     Session[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expires   DateTime
  createdAt DateTime @default(now())
}

model Bounty {
  id        String   @id @default(cuid())
  title     String
  prize     Int
  deadline  DateTime?
  tags      String    // comma-separated for SQLite simplicity
  status    String    @default("open")
  createdAt DateTime  @default(now())
}

model Submission {
  id        String   @id @default(cuid())
  bountyId  String
  userId    String
  url       String
  notes     String?
  status    String   @default("submitted")
  createdAt DateTime @default(now())
}

model Points {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  reason    String
  source    String
  createdAt DateTime @default(now())
}

model Project {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  summary   String
  badges    String?   // comma-separated
  repoUrl   String?
  demoUrl   String?
  createdAt DateTime  @default(now())
}

model Event {
  id        String   @id @default(cuid())
  title     String
  startsAt  DateTime
  location  String
  streamUrl String?
  createdAt DateTime @default(now())
}

model Episode {
  id        String   @id @default(cuid())
  title     String
  type      String   // api_tour | ship_room | live_bounty | office_hours
  startsAt  DateTime
  vodUrl    String?
  guests    String?  // comma-separated
  createdAt DateTime @default(now())
}

model Quest {
  id        String   @id @default(cuid())
  episodeId String
  title     String
  points    Int
  startsAt  DateTime
  endsAt    DateTime?
}
```

**Dev DB URL** in `.env.local`:
```
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="change-me"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 2) Auth.js Core (Google, bu.edu gate)
```ts
// apps/web/src/lib/auth.ts
import { PrismaClient } from '@prisma/client';
import { Auth } from '@auth/core';
import Google from '@auth/core/providers/google';

const prisma = new PrismaClient();

export const auth = Auth({
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID!,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET!,
      // Optional: hd: 'bu.edu' hint; enforce server-side below
    })
  ],
  session: { strategy: 'database' },
  callbacks: {
    async signIn({ user, profile }) {
      const email = (user?.email || '').toLowerCase();
      if (!email.endsWith('@bu.edu')) return false; // hard gate
      // upsert user + default displayName
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, displayName: email.split('@')[0] }
      });
      return true;
    }
  },
  secret: import.meta.env.AUTH_SECRET
});
```

A minimal Astro endpoint wrapper (example):
```ts
// apps/web/src/pages/api/auth/[...auth].ts
import { auth } from '../../../lib/auth';
export const ALL = auth; // exposes GET/POST for the Auth.js handler
```

### 3) Seed data (JSON) & script
`src/data/*.json` (bounties, projects, events, episodes, quests). Example:
```json
// src/data/bounties.json
[
  {"title":"Fix course-scheduler API","prize":200,"deadline":"2025-11-20","tags":"Web,Infra"},
  {"title":"Build campus bus tracker","prize":150,"deadline":"2025-11-28","tags":"Data,Mobile"},
  {"title":"Improve course search UI","prize":100,"deadline":"2025-12-05","tags":"Web,UX"}
]
```
Seed script:
```ts
// apps/web/scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import bounties from '../src/data/bounties.json';
import projects from '../src/data/projects.json';
import events from '../src/data/events.json';
import episodes from '../src/data/episodes.json';
import quests from '../src/data/quests.json';

const prisma = new PrismaClient();
(async () => {
  await prisma.bounty.createMany({ data: bounties.map(b=>({
    title: b.title, prize: b.prize,
    deadline: b.deadline ? new Date(b.deadline) : null,
    tags: b.tags
  }))});
  await prisma.project.createMany({ data: projects });
  await prisma.event.createMany({ data: events.map(e=>({...e, startsAt:new Date(e.startsAt)})) });
  await prisma.episode.createMany({ data: episodes.map(e=>({...e, startsAt:new Date(e.startsAt)})) });
  await prisma.quest.createMany({ data: quests.map(q=>({...q, startsAt:new Date(q.startsAt), endsAt:q.endsAt?new Date(q.endsAt):null})) });
  console.log('Seed complete');
  process.exit(0);
})();
```

### 4) Scripts
```json
// apps/web/package.json (relevant scripts)
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "db:migrate": "prisma migrate dev --name init",
    "db:generate": "prisma generate",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

### 5) Components to wire now
- `DesktopOS.astro` (windows/dock/theme toggle)
- `About.astro` (static content first; pulls from Markdown or JSON)
- `LiveNow.astro` (placeholder player + next episode card; check-in button disabled until auth wired)
- `ProfileSettings.astro` (display name field; save to `User.displayName`)

### 6) Migrate to Postgres later
- Change `datasource db.provider` to `postgresql` and `DATABASE_URL` to your Supabase Postgres URL.
- Run `prisma migrate deploy` in CI; preserve the same models (optional: convert tag strings → string[]).

### 7) Gate write actions (server)
- API endpoints that mutate (`/api/checkin`, `/api/quests/claim`, `/api/submission`) must verify session and `email.endsWith('@bu.edu')`.
- Read endpoints can remain public for now.

### 8) Minimal access states
- Not signed in → dock/windows show data; actions show a sign-in modal.
- Signed in (non-bu) → immediately signed out with message: “HackBU requires a BU account.”
- Signed in (bu.edu) → actions enabled; display name editable.

---

## 🔌 Quick Tailwind token include (recap)
```ts
// tailwind.config.ts (extend)
colors: {
  spark: {
    teal: '#06B1A2',
    tealDark: '#048F84',
    eggshell: '#D9EADF',
    eggshellAlt: '#E3EEE5',
    chartreuse: '#BFF13C',
    orange: '#FF572D',
    ink: '#063E3A',
    black: '#12110C'
  }
},
fontFamily: {
  display: ['"Bebas Neue"', 'system-ui', 'sans-serif'],
  sans: ['Montserrat', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
}
```

---

### ✅ Ready to build
With this checklist, you can:
1) `pnpm i` → `pnpm db:generate` → `pnpm db:migrate` → `pnpm db:seed` → `pnpm dev`
2) Sign in via Google; only `@bu.edu` proceeds; set display name on `/profile`.
3) Swap SQLite → Postgres by flipping the Prisma datasource when you’re ready to deploy.

