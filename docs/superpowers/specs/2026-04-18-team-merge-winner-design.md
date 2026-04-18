# Design: Admin Team Merge + Team Winner Designation

**Date:** 2026-04-18  
**Status:** Approved

---

## Problem

The admin dashboard has no way to:
1. Merge solo/ungrouped participants into a new team
2. Add a solo participant to an existing team
3. Designate a team (rather than an individual) as the bounty winner

All of these need to reflect properly in Mailchimp tags and the leaderboard.

---

## Approach

Single new API endpoint for merges. Small extension to the existing `declare-winner` endpoint for team winners. Dashboard JS handles checkboxes + action bar.

---

## Feature 1: Admin Team Merge

### API: `POST /api/admin/merge-team`

**Auth:** admin cookie (`hackbu-admin`) — same check as `declare-winner.ts`  
**Rate limit:** 10 req/min per IP

**Request body:**
```json
{
  "slug": "plate-gallery",
  "emails": ["pharaoh@bu.edu", "josec@bu.edu"],
  "existingTeamId": "c1965275"  // optional
}
```

**Logic:**
- If `existingTeamId` provided: validate at least one existing member has `team-group:<slug>:<existingTeamId>`, then add all `emails` to that team.
- If no `existingTeamId`: mint a new `teamId = crypto.randomBytes(4).toString('hex')`, use it for all `emails`.
- Per email:
  - `team-group:<slug>:<teamId>` → active
  - `has-team:<slug>` → active
  - `solo:<slug>` → inactive
  - Any existing `team-group:<slug>:*` tags → inactive (deactivate old groups)
- Runs one `setListMember` + one `updateListMemberTags` per email (same pattern as `respond.ts`).

**Response:** `{ success: true, teamId: string }`

### Dashboard UI

- Ungrouped/solo cards in the "Interested" section each get a **checkbox** (top-right corner of card).
- When ≥1 card is checked, a **floating action bar** appears below the ungrouped cards:
  - `N selected` count
  - **"Merge into new team"** button — enabled when ≥2 selected
  - **"Add to existing team ▾"** dropdown — lists existing `teamGroups` for this bounty by their IDs; enabled when ≥1 selected and ≥1 team exists
  - **"Clear"** button — deselects all
- On success: reload page (same pattern as winner declaration).

---

## Feature 2: Team Winner Designation

### API: `POST /api/declare-winner` (extended)

**New optional field in body:**
```json
{
  "slug": "plate-gallery",
  "winner": "Jack He & Luke Cooper",
  "winnerMembers": [
    { "name": "Jack He" },
    { "name": "Luke Cooper" }
  ],
  "winnerSubmission": "https://github.com/..."
}
```

**Logic:**
- If `winnerMembers` provided: loop and award +1 leaderboard point to each member name individually.
- `winner` string written to frontmatter as-is (`"Jack He & Luke Cooper"`).
- If no `winnerMembers` (individual winner): unchanged behavior — `winner` gets +1 directly.

### Dashboard UI

The winner `<select>` already renders team groups (lines 488–490 in `dashboard.astro`). Changes:
- Team options get a `data-members` attribute (JSON array of `{ name }` objects).
- The "Declare Winner" click handler reads `data-members` and includes `winnerMembers` in the POST body if present.
- `<optgroup>` labels added: "── Teams ──" and "── Individuals ──" for clarity.

### Content schema

No changes. `winner: z.string().optional()` handles `"Jack He & Luke Cooper"` naturally.

### Hall of Fame

No changes. `e.data.winner` is rendered as a plain string — multi-name strings display correctly as-is.

---

## Files to create/modify

| File | Change |
|------|--------|
| `src/pages/api/admin/merge-team.ts` | **New** — admin merge endpoint |
| `src/pages/api/declare-winner.ts` | **Modify** — accept `winnerMembers[]`, loop leaderboard points |
| `src/pages/dashboard.astro` | **Modify** — checkboxes, action bar JS, team optgroups with `data-members` |

---

## Out of scope

- Updating the `TEAMMATES` merge field in Mailchimp when admin merges (it's set at signup and not shown in any critical UI path).
- Removing a member from a team.
- Renaming teams.
