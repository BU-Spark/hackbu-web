# HackBU site — Astro SSG

A static-first site built with Astro 4, React islands, Tailwind CSS, and Vite. Build-time data comes from JSON files under `src/data/`. There is no database required for build or deploy; the output is a static site.

## Stack

- Astro 4 (SSG)
- React islands for interactive components
- Tailwind CSS
- Vite dev server (file polling enabled for reliable HMR)

## Data model (static JSON)

- All pages use `src/data/*.json` at build time:
  - `events.json`, `projects.json`, `bounties.json`, `leaderboard.json`, `motd.json`, etc.
- To change site content, edit these JSON files and rebuild.
- No Prisma/SQLite is used at build time.

Notes:

- The old Prisma setup has been retired. The `prisma/` folder remains only as a deprecated placeholder and is excluded from TypeScript builds.

## Develop

- Install deps: `npm install`
- Start dev server: `npm run dev`
  - HMR is on; watcher is tuned to be light but reliable.

## Build

- Typecheck + build: `npm run build`
  - Output: `dist/` (static)

## Deploy

- Host on any static provider (e.g., Netlify/Vercel) using the build command:
  - `astro check && astro build`
- Serve the `dist/` directory.

## Routes of interest

- `/` — desktop-style landing page
- `/live` — "HackBU Live" demo/placeholder, uses `src/data/events.json`

## Back-end and dynamic features (future)

If you need dynamic behavior (auth, live updates, admin tools):

- Build a separate backend service or serverless API.
- Keep Astro’s SSG path free of DB dependencies.
- Fetch from that API at runtime from islands/components where needed.

## Contributing

- Prefer static JSON for any content rendered at build time.
- Don’t reintroduce Prisma or DB access into the SSG path.
- See `design-docs/` for broader goals and requirements.

## License

See `LICENSE`.
