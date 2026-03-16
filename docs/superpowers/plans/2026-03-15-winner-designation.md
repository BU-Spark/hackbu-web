# Winner Designation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to declare bounty winners from the dashboard, updating the bounty file, leaderboard, and triggering Hall of Fame inclusion.

**Architecture:** New `POST /api/declare-winner` endpoint reads/writes bounty `.md` frontmatter using `gray-matter` and updates `leaderboard.json`. Dashboard gets a per-bounty "Declare Winner" form with client-side JS for submission. No new components — all changes in existing files + one new API route.

**Tech Stack:** Astro SSR API route, gray-matter (npm), existing rate-limit and cookie auth patterns.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/pages/api/declare-winner.ts` | Create | API endpoint: auth, validate, update .md + leaderboard |
| `src/pages/dashboard.astro` | Modify | Add "Declare Winner" UI per bounty section |
| `src/data/leaderboard.json` | Modify | Clear placeholders, becomes API-managed |
| `package.json` | Modify | Add `gray-matter` dependency |

---

## Chunk 1: API Endpoint + Leaderboard

### Task 1: Install gray-matter

- [ ] **Step 1:** Install dependency
```bash
npm install gray-matter
```

- [ ] **Step 2:** Commit
```bash
git add package.json package-lock.json
git commit -m "chore: add gray-matter for frontmatter parsing"
```

### Task 2: Clear placeholder leaderboard

- [ ] **Step 1:** Replace `src/data/leaderboard.json` with `[]`

- [ ] **Step 2:** Commit
```bash
git add src/data/leaderboard.json
git commit -m "chore: clear placeholder leaderboard data"
```

### Task 3: Create `/api/declare-winner` endpoint

**Files:** Create `src/pages/api/declare-winner.ts`

- [ ] **Step 1:** Create the endpoint with:
  - `export const prerender = false`
  - Cookie auth check (read `hackbu-admin` cookie, compare to `ADMIN_KEY` env)
  - Rate limiting (10 req/min, `declare-winner` name)
  - Request body validation: `slug` (required), `winner` (required), `winnerSubmission` (optional)
  - Read bounty `.md` file with `gray-matter`
  - Validate bounty exists and `status === 'open'`
  - Update frontmatter: `status: 'completed'`, `winner`, `winnerSubmission`
  - Write file back with `gray-matter.stringify()`
  - Read `leaderboard.json`, update/add winner entry (+1 point, append badge)
  - Recalculate ranks, write leaderboard back
  - Badge mapping: Beginner→🌱, Intermediate→⚡, Advanced→🔥

- [ ] **Step 2:** Test manually with curl in dev

- [ ] **Step 3:** Commit
```bash
git add src/pages/api/declare-winner.ts
git commit -m "feat: add declare-winner API endpoint"
```

## Chunk 2: Dashboard UI

### Task 4: Add "Declare Winner" form to dashboard

**Files:** Modify `src/pages/dashboard.astro`

- [ ] **Step 1:** In the server-side script block, also pass bounty status into `bountyData` so the template knows which bounties are open vs completed.

- [ ] **Step 2:** For each bounty section, add a "Declare Winner" form below the respondent cards:
  - Only shown when bounty status is `open`
  - Dropdown `<select>` populated with team groups and individual names from that bounty's respondents
  - Optional text input for submission URL
  - Submit button styled like existing dashboard buttons
  - Confirmation dialog via `confirm()` before fetch
  - Client-side `fetch('/api/declare-winner', ...)` with JSON body
  - Success: show alert + reload page; Error: show alert with message

- [ ] **Step 3:** For completed bounties, show a "Winner: X" badge instead of the form

- [ ] **Step 4:** Test manually in dev: log in, declare a winner, verify page reloads with winner shown

- [ ] **Step 5:** Commit
```bash
git add src/pages/dashboard.astro
git commit -m "feat: add declare-winner UI to admin dashboard"
```

## Chunk 3: Verification

### Task 5: End-to-end verification

- [ ] **Step 1:** Start dev server, log into dashboard
- [ ] **Step 2:** Declare a winner for a test bounty
- [ ] **Step 3:** Verify bounty `.md` frontmatter updated
- [ ] **Step 4:** Verify `leaderboard.json` has new entry
- [ ] **Step 5:** Verify Hall of Fame page shows the winner
- [ ] **Step 6:** Verify bounty card shows winner badge
- [ ] **Step 7:** Revert test changes to bounty file, commit any fixes
