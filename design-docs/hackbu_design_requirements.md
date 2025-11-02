# HackBU Website – Design Brief & Requirements

## 🌟 Project Overview

**HackBU** is a Boston University (BU) community of students who build tools _for_ BU itself.
Sponsored by **BU Information Services & Technology (IS&T)** and **BU Spark!**, HackBU connects students who want to improve campus systems through software — from web apps to data pipelines — while earning prizes, bounties, and recognition.

The goal of the website is to:

- Present HackBU as an _OS-like hub_ for projects, bounties, and events.
- Reinforce BU Spark!’s brand personality — playful, tech-forward, and approachable.
- Integrate real-time leaderboards, project galleries, and Discord-based community links.
- Showcase IRL community events like **Syntax & Snax** and **Code & Tell**.

---

## 🧩 Site Architecture

### Core Sections

| Section                 | Purpose                                                                                  | Notes                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Home / OS view**      | “Desktop”-like hub with floating windows for Bounties, Gallery, Leaderboard, and Events. | Non-traditional UX; inspired by Vercel Ship and Ona .com.                      |
| **Gallery**             | Visual cards for active and completed HackBU projects.                                   | Should use Spark! photography rules — bright, authentic, collaborative scenes. |
| **Bounties**            | Table of open coding challenges with prize, deadline, and tags.                          | Support live updates or Airtable/Notion sync later.                            |
| **Leaderboard**         | Contributor ranking system.                                                              | Pulls data from GitHub, Discord, or custom API.                                |
| **Events**              | Syntax & Snax, Code & Tell, hackathons.                                                  | Calendar integration optional.                                                 |
| **Community / Discord** | Invitation and onboarding page.                                                          | Should emphasize belonging and safety.                                         |

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

Lovable, quirky, risk-taking yet reliable — _the magician who makes everyone better._

### Primary Palette

| Name                      | HEX                   | Use                             |
| ------------------------- | --------------------- | ------------------------------- |
| **Teal**                  | `#00A99E` – `#06B1A2` | Primary brand / background      |
| **Eggshell (Green-gray)** | `#E3EEE5` – `#D9EADF` | Foreground / light mode         |
| **Chartreuse**            | `#BFF13C`             | Accent glow or call-to-action   |
| **Orange**                | `#FF572D`             | Secondary accent for highlights |
| **Black / Dark Gray**     | `#12110C / #2E2B28`   | Text and depth framing          |

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

| Category                     | Specification                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Framework**                | Preferably **Astro** (static site generation + islands) — React islands for interactive windows.             |
| **Styling**                  | Tailwind CSS or PostCSS; respect Spark color tokens.                                                         |
| **Hosting**                  | Netlify or Vercel (static hosting; no server required for MVP).                                              |
| **Fonts**                    | Import Bebas Neue & Montserrat via Google Fonts.                                                             |
| **Accessibility**            | Maintain color contrast > 4.5:1; support keyboard navigation and reduced motion.                             |
| **Brand assets**             | Use provided Spark logos (black/white + color), HackBU logo, and IS&T logo.                                  |
| **Data (MVP)**               | Build-time uses static JSON snapshots under `src/data/*.json` (no DB required for SSG).                      |
| **Backend (optional later)** | Add API or Supabase/Postgres only for dynamic features (auth, XP, quests) — keep SSG path DB-free.           |
| **Integration points**       | Discord link; optional BU authentication (Google OAuth / SAML) for write actions when backend is introduced. |

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
> Combine the personality of _Vercel Ship_ with the interactivity of _Ona.com_, keeping Spark’s quirky-but-reliable tone.
> Reference the four prototype folders (`starter-site`, `starter-site-alt-1..3`) for layout and behavior.
> Generate two responsive versions — **primary (teal BG)** and **inverted (light BG)** — with a toggle between them.
> Output a minimal Astro or React project scaffold using Tailwind CSS tokens for colors and gradients consistent with the attached BU Spark! style guide.”

---

## 🧭 About Page (New)

**Purpose**: Explain who we are, why HackBU exists, and how to get involved — for students, staff, and external partners.

**Core Blocks**

- **Mission & Promise**: One-paragraph statement mapping to Spark!’s brand purpose (passion, community, skills, impact).
- **Sponsors**: BU IS&T + BU Spark! (logos, 1–2 line blurbs, link to program pages).
- **What We Do**: 3-up cards: _Bounties_, _Projects_, _Events_. Each card links to the relevant app window/route.
- **How to Join**: Discord invite → onboarding → pick a track (Web, Data, Infra, UX) → first-issue flow.
- **Governance & Safety**: Code of conduct, reporting path, moderation policy, accessibility commitments.
- **Team & Roles**: Spark staff leads, student maintainers, IS&T advisory reps; quick bios and contact channel.
- **FAQ**: Eligibility, time commitment, IP/licensing defaults, how prizes/bounties work, how to propose a project.

**Design Notes**

- Use a full-bleed hero with teal-to-eggshell gradient and a subtle skyline watermark.
- Pull quotes from student builders; include candid photos (follow Spark style guide).
- Keep CTAs persistent: _Join Discord_, _Browse Bounties_, _Submit a Project_.

**Routing**

- `/about` top-level route + tile on the OS desktop opens an _About_ window with the same content.

---

## 📺 Streaming Show: Concept & Requirements (New)

**Working Title**: _(see name brainstorm below)_

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

- Primary: YouTube Live (archived playlists: _API Tours_, _Ship Rooms_, _Live Bounties_).
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
- **hackbu: insider** _(or **insiders**)_

**Also consider**

- HackBU Live
- Spark Ship Room
- Build @ BU
- Campus Infra, Unboxed
- The API Arcade
- Level Up @ Spark _(callback to Level Up Hour)_
- Terrier Builders Live
- Fix-It Fridays _(bounty episodes)_

> Pick 1–2 finalists; we’ll design lower-thirds and a stream bumper accordingly.

---

## 🔧 Additional Requirements Updates

1. **About Page CMS**: Provide editable markdown or CMS fields for Mission, Sponsors, Team, FAQ.
2. **Episode System**: Add content types for Episodes and Quests in Supabase (or a flat JSON store at first).
3. **Auth**: BU-only Google OAuth (restrict to `@bu.edu` domain via hosted domain / allowlist); permit arbitrary display names (editable in profile). Optional Discord OAuth for community features; anonymous session with CAPTCHA allowed for read-only browsing. Tie all identifiable actions (check-in, quests) to authenticated users.
4. **Accessibility**: All streams require live captions; archive VODs with corrected subtitles.
5. **Analytics**: Track episode interactions (check-ins, quest CTA clicks) and attribute XP to users.

---

## 🧪 Acceptance Criteria (delta)

- `/about` renders with Mission, Sponsors, Join, Governance, Team, FAQ and meets contrast/ALT text guidelines.
- `/live` auto-detects live stream, displays episode info, and exposes quest CTA components.
- **Auth**: Only `@bu.edu` Google accounts can sign in; display names can be arbitrary; non-BU users are blocked from write actions (quests/check-ins/submissions).
- Leaderboard increments points based on `checkin` and quest completion events.
- Gallery entries link to relevant VODs and episode tags.
- Theme toggle applies consistently across About and Live routes/windows.

---

## 🧱 Build‑Ready Checklist (SSG-first, static JSON)

Goal: Ship a locally runnable MVP with Astro + Tailwind using static JSON data at build-time. Keep an easy migration path to a backend (Supabase/Postgres or custom API) for dynamic features later — without introducing a DB dependency into the SSG path.

### Stack

- Astro (UI + routes) with React islands for interactive windows
- Tailwind (Spark tokens in `tailwind.config.ts`)
- Static JSON snapshots in `src/data/` for bounties, projects, events, leaderboard, motd, etc.
- Optional later: Auth.js (Google OAuth restricted to `@bu.edu`) when server/API is added

### Folder structure (current)

```
src/
  pages/          # /, /about, /live, /projects/[slug]
  components/     # OS windows, Dock, StatusBar, etc.
  data/           # canonical build data (JSON)
  lib/            # helpers (no DB required for SSG)
public/
tailwind.config.mjs
astro.config.mjs
```

### Data model (MVP)

`src/data/*.json` contains arrays/objects for the desktop windows and routes. Example:

```json
// src/data/bounties.json
[
  {
    "title": "Fix course-scheduler API",
    "prize": 200,
    "deadline": "2025-11-20",
    "tags": ["Web", "Infra"]
  }
]
```

Pages import these JSON files directly; during SSG they’re bundled, so Netlify/Vercel builds don’t require a database.

### Dynamic features later (non-blocking)

When ready to add check-ins, quests, XP, or profiles:

- Stand up an API (Serverless or Supabase) with auth gating (e.g., `@bu.edu` Google accounts).
- Keep SSG DB-free by fetching dynamic data only on the client or via incremental endpoints; avoid touching the DB from Astro’s build pipeline.
- Replace or augment JSON as needed; keep JSON as fallback/demo data.

### Minimal components to wire now

- `DesktopOS` windows/dock/theme toggle
- `About` route/window (static content or Markdown)
- `Live` route/window (placeholder player; uses static events/episodes JSON)

### Access states (once backend exists)

- Not signed in → read-only UI
- Signed in (non-bu) → blocked from write actions
- Signed in (bu.edu) → write actions enabled (check-ins, quest claims)

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

1. Install deps and run: dev → build → preview (no DB required)
2. Deploy to Netlify/Vercel as a static site; builds succeed without a database
3. Introduce a backend later for dynamic features without changing the SSG flow
