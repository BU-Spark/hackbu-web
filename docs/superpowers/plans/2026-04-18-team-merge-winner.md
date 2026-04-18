# Team Merge + Team Winner Designation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins merge solo participants into teams from the dashboard, and designate a team (not just an individual) as a bounty winner with per-member leaderboard points.

**Architecture:** New admin-only `POST /api/admin/merge-team` endpoint handles all merge cases (new team or existing). `declare-winner` is extended to accept `winnerMembers[]` for per-member leaderboard credit. Dashboard gets checkbox + floating action bar for merging, and `data-members` attributes on team `<option>` elements for winner submission.

**Tech Stack:** Astro 4 (hybrid SSR), Mailchimp Marketing API v3, gray-matter, TypeScript, vanilla JS (dashboard scripts)

**Spec:** `docs/superpowers/specs/2026-04-18-team-merge-winner-design.md`

---

## Chunk 1: merge-team API endpoint

**Files:**
- Create: `src/pages/api/admin/merge-team.ts`

### Task 1: Create the merge-team API endpoint

- [ ] **Step 1: Create the file with auth + rate limit scaffolding**

Create `src/pages/api/admin/merge-team.ts`:

```typescript
export const prerender = false;

import type { APIRoute } from 'astro';
import mailchimp, { AUDIENCE_ID } from '../../../lib/mailchimp';
import crypto from 'node:crypto';
import { rateLimit, rateLimitResponse, getClientIp } from '../../../lib/rate-limit';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Auth check
  const adminKey = import.meta.env.ADMIN_KEY;
  const sessionCookie = cookies.get('hackbu-admin')?.value;
  if (!adminKey || !sessionCookie || sessionCookie !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(request);
  const rl = rateLimit(ip, { name: 'merge-team', limit: 10, windowSec: 60 });
  if (!rl.allowed) return rateLimitResponse(rl);

  let body: { slug?: string; emails?: string[]; existingTeamId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug, emails, existingTeamId } = body;

  if (!slug || !Array.isArray(emails) || emails.length < 1) {
    return new Response(JSON.stringify({ error: 'Missing required fields: slug, emails' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
    return new Response(JSON.stringify({ error: 'Invalid slug format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Determine team ID
  let teamId: string;

  if (existingTeamId) {
    // Validate team exists
    const teamTag = `team-group:${slug}:${existingTeamId}`;
    let teamFound = false;
    try {
      const res = await (mailchimp as any).lists.getListMembersInfo(AUDIENCE_ID, {
        count: 1000,
        status: 'subscribed',
        fields: ['members.tags'],
      });
      teamFound = (res.members || []).some((m: any) =>
        (m.tags || []).some((t: any) => t.name === teamTag)
      );
    } catch (err) {
      console.error('Failed to validate team:', err);
      return new Response(JSON.stringify({ error: 'Failed to validate existing team' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!teamFound) {
      return new Response(JSON.stringify({ error: 'Team not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    teamId = existingTeamId;
  } else {
    if (emails.length < 2) {
      return new Response(JSON.stringify({ error: 'Need at least 2 emails to form a new team' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    teamId = crypto.randomBytes(4).toString('hex');
  }

  // Apply tags to each email
  const errors: string[] = [];
  for (const email of emails) {
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    const tagsToUpdate: { name: string; status: string }[] = [
      { name: `team-group:${slug}:${teamId}`, status: 'active' },
      { name: `has-team:${slug}`, status: 'active' },
      { name: `solo:${slug}`, status: 'inactive' },
    ];

    // Deactivate any other team-group tags for this bounty
    try {
      const memberInfo = await (mailchimp as any).lists.getListMember(AUDIENCE_ID, subscriberHash, {
        fields: ['tags'],
      });
      const oldTeamTags = (memberInfo.tags || [])
        .filter((t: any) => t.name.startsWith(`team-group:${slug}:`) && t.name !== `team-group:${slug}:${teamId}`)
        .map((t: any) => ({ name: t.name, status: 'inactive' }));
      tagsToUpdate.push(...oldTeamTags);
    } catch {
      // Member may be new to this tag set — safe to continue
    }

    try {
      await (mailchimp as any).lists.updateListMemberTags(AUDIENCE_ID, subscriberHash, {
        tags: tagsToUpdate,
      });
    } catch (err: any) {
      const detail = err?.response?.body ? JSON.stringify(err.response.body) : String(err);
      console.error(`Failed to update tags for ${email}:`, detail);
      errors.push(email);
    }
  }

  if (errors.length > 0) {
    return new Response(JSON.stringify({ error: 'Some members failed to update', failed: errors }), {
      status: 207,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, teamId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 2: Run TypeScript check**

```bash
npm run check
```

Expected: no errors in `src/pages/api/admin/merge-team.ts`

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/admin/merge-team.ts
git commit -m "feat: add admin merge-team API endpoint"
```

---

## Chunk 2: extend declare-winner for team winners

**Files:**
- Modify: `src/pages/api/declare-winner.ts`

### Task 2: Accept winnerMembers and award per-member leaderboard points

- [ ] **Step 1: Update the body type and parsing**

In `src/pages/api/declare-winner.ts`, change the body type on line 35 from:

```typescript
let body: { slug?: string; winner?: string; winnerSubmission?: string };
```

to:

```typescript
let body: { slug?: string; winner?: string; winnerSubmission?: string; winnerMembers?: { name: string }[] };
```

- [ ] **Step 2: Destructure winnerMembers from body**

On line 45, change:

```typescript
const { slug, winner, winnerSubmission } = body;
```

to:

```typescript
const { slug, winner, winnerSubmission, winnerMembers } = body;
```

- [ ] **Step 3: Replace single-winner leaderboard update with a loop**

Find this block (around lines 114–123):

```typescript
  const existing = leaderboard.find((e) => e.name === winner);
  if (existing) {
    existing.points += 1;
    existing.badges += badge;
  } else {
    leaderboard.push({ name: winner, points: 1, badges: badge, rank: 0 });
  }
```

Replace it with:

```typescript
  // Award points to each winner (individual or all team members)
  const awardees = winnerMembers && winnerMembers.length > 0
    ? winnerMembers.map((m) => m.name)
    : [winner];

  for (const name of awardees) {
    const existing = leaderboard.find((e) => e.name === name);
    if (existing) {
      existing.points += 1;
      existing.badges += badge;
    } else {
      leaderboard.push({ name, points: 1, badges: badge, rank: 0 });
    }
  }
```

- [ ] **Step 4: Run TypeScript check**

```bash
npm run check
```

Expected: no errors in `src/pages/api/declare-winner.ts`

- [ ] **Step 5: Commit**

```bash
git add src/pages/api/declare-winner.ts
git commit -m "feat: award leaderboard points to each team member on win"
```

---

## Chunk 3: dashboard UI — checkboxes, action bar, team optgroups

**Files:**
- Modify: `src/pages/dashboard.astro`

This chunk has two sub-tasks: (A) merge checkboxes + action bar, (B) winner dropdown team optgroups.

### Task 3A: Add merge checkboxes and floating action bar

- [ ] **Step 1: Add CSS rules for the action bar to the `<style>` block**

In `dashboard.astro`, find the `<style>` block. Add these two rules just before the closing `</style>` tag (after the `.divider` rule, around line 238):

```css
.merge-card { position: relative; }
.merge-action-bar { display: none; }
.merge-action-bar.visible { display: flex !important; }
```

- [ ] **Step 2: Replace the full ungrouped IIFE block to add checkboxes + action bar**

Find the entire IIFE block that renders ungrouped cards (around lines 419–443). This is the full block to replace:

```astro
{(() => {
  const groupedEmails = new Set(Object.values(data.teamGroups).flat().map((r: any) => r.email));
  const ungrouped = data.interested.filter((r: any) => !groupedEmails.has(r.email));
  return ungrouped.length > 0 && (
    <div class="cards">
      {ungrouped.map((r: any) => (
        <div class="card">
          <div class="card-name">{r.name}</div>
          <div class="card-email">{r.email}</div>
          <div class="card-footer">
            {r.workingMode === 'solo' && <span class="badge badge-solo">Solo</span>}
            {r.workingMode === 'has-team' && <span class="badge badge-hasteam">Has team</span>}
            {r.workingMode === 'unknown' && <span class="badge badge-unknown">—</span>}
          </div>
          {r.teammates && (
            <div class="card-teammates">
              <strong>Teammates:</strong> {r.teammates}
            </div>
          )}
        </div>
      ))}
    </div>
  );
})()}
```

Replace with (cards get `merge-card` + checkbox; action bar is placed after the IIFE as a sibling, always in DOM):

```astro
{(() => {
  const groupedEmails = new Set(Object.values(data.teamGroups).flat().map((r: any) => r.email));
  const ungrouped = data.interested.filter((r: any) => !groupedEmails.has(r.email));
  return ungrouped.length > 0 && (
    <div class="cards">
      {ungrouped.map((r: any) => (
        <div class="card merge-card" data-email={r.email}>
          <input type="checkbox" class="merge-checkbox" style="position:absolute;top:0.6rem;right:0.6rem;accent-color:var(--teal);cursor:pointer;" />
          <div class="card-name">{r.name}</div>
          <div class="card-email">{r.email}</div>
          <div class="card-footer">
            {r.workingMode === 'solo' && <span class="badge badge-solo">Solo</span>}
            {r.workingMode === 'has-team' && <span class="badge badge-hasteam">Has team</span>}
            {r.workingMode === 'unknown' && <span class="badge badge-unknown">—</span>}
          </div>
          {r.teammates && (
            <div class="card-teammates">
              <strong>Teammates:</strong> {r.teammates}
            </div>
          )}
        </div>
      ))}
    </div>
  );
})()}
<div class="merge-action-bar" style="margin-top:0.75rem;background:#1a2a2a;border:1px solid var(--orange);border-radius:8px;padding:0.6rem 0.85rem;align-items:center;gap:0.75rem;flex-wrap:wrap;">
  <span class="merge-count" style="color:var(--orange);font-size:0.78rem;font-weight:600;">0 selected</span>
  <button class="merge-new-btn" style="padding:0.35rem 0.75rem;background:var(--orange);color:#0a0a0a;border:none;border-radius:6px;font-size:0.75rem;font-weight:700;cursor:pointer;" disabled>Merge into new team</button>
  <select class="merge-existing-select" style="padding:0.35rem 0.75rem;background:transparent;color:var(--orange);border:1px solid rgba(245,158,11,0.4);border-radius:6px;font-size:0.75rem;font-family:inherit;cursor:pointer;">
    <option value="">Add to existing team ▾</option>
    {Object.keys(data.teamGroups).map((tId) => (
      <option value={tId}>Team {tId}</option>
    ))}
  </select>
  <button class="merge-clear-btn" style="padding:0.35rem 0.75rem;background:transparent;color:var(--muted);border:1px solid var(--border);border-radius:6px;font-size:0.75rem;cursor:pointer;">Clear</button>
</div>
```

Note: The action bar lives as a sibling *after* the IIFE, not inside it — this keeps it always in the DOM (hidden by CSS) so JS can always find it via `.merge-action-bar`, regardless of whether ungrouped members exist.

- [ ] **Step 3: Add merge JS to the `<script is:inline>` block**

At the end of the existing `<script is:inline>` block (after the declare winner handler, before the closing `</script>`), add:

```javascript
// Merge team logic
function updateMergeBar(slug) {
  const section = document.getElementById(slug);
  if (!section) return;
  const checked = section.querySelectorAll('.merge-checkbox:checked');
  const bar = section.querySelector('.merge-action-bar');
  const countEl = section.querySelector('.merge-count');
  const newBtn = section.querySelector('.merge-new-btn');
  const existingSelect = section.querySelector('.merge-existing-select');

  if (!bar || !countEl || !newBtn || !existingSelect) return;

  const n = checked.length;
  countEl.textContent = n + ' selected';

  if (n > 0) {
    bar.classList.add('visible');
  } else {
    bar.classList.remove('visible');
  }

  newBtn.disabled = n < 2;
  const hasTeams = existingSelect.options.length > 1;
  existingSelect.disabled = !hasTeams || n < 1;
}

// Checkbox change handler (delegated per bounty section)
document.querySelectorAll('.bounty-section').forEach(function(bountySection) {
  bountySection.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('merge-checkbox')) {
      const card = e.target.closest('.merge-card');
      if (card) {
        card.style.borderColor = e.target.checked ? 'var(--teal)' : '';
        card.style.borderWidth = e.target.checked ? '1.5px' : '';
      }
      updateMergeBar(bountySection.id);
    }
  });
});

async function doMerge(slug, emails, existingTeamId) {
  const payload = { slug: slug, emails: emails };
  if (existingTeamId) payload.existingTeamId = existingTeamId;

  const res = await fetch('/api/admin/merge-team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (res.ok) {
    alert('Team updated! Reloading...');
    location.reload();
  } else {
    alert('Error: ' + (data.error || 'Unknown error'));
  }
}

// "Merge into new team" button
document.querySelectorAll('.merge-new-btn').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    const bountySection = btn.closest('.bounty-section');
    if (!bountySection) return;
    const slug = bountySection.id;
    const emails = Array.from(bountySection.querySelectorAll('.merge-checkbox:checked'))
      .map(function(cb) { return cb.closest('.merge-card') && cb.closest('.merge-card').dataset.email; })
      .filter(Boolean);

    if (emails.length < 2) { alert('Select at least 2 people to form a team.'); return; }
    if (!confirm('Merge ' + emails.length + ' people into a new team for "' + slug + '"?')) return;

    btn.disabled = true;
    btn.textContent = 'Merging...';
    try {
      await doMerge(slug, emails, null);
    } catch (err) {
      alert('Network error: ' + err.message);
      btn.disabled = false;
      btn.textContent = 'Merge into new team';
    }
  });
});

// "Add to existing team" select
document.querySelectorAll('.merge-existing-select').forEach(function(sel) {
  sel.addEventListener('change', async function() {
    const teamId = sel.value;
    if (!teamId) return;
    const bountySection = sel.closest('.bounty-section');
    if (!bountySection) return;
    const slug = bountySection.id;
    const emails = Array.from(bountySection.querySelectorAll('.merge-checkbox:checked'))
      .map(function(cb) { return cb.closest('.merge-card') && cb.closest('.merge-card').dataset.email; })
      .filter(Boolean);

    if (emails.length < 1) { sel.value = ''; return; }
    if (!confirm('Add ' + emails.length + ' person(s) to Team ' + teamId + '?')) { sel.value = ''; return; }

    sel.disabled = true;
    try {
      await doMerge(slug, emails, teamId);
    } catch (err) {
      alert('Network error: ' + err.message);
      sel.disabled = false;
      sel.value = '';
    }
  });
});

// "Clear" button
document.querySelectorAll('.merge-clear-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const bountySection = btn.closest('.bounty-section');
    if (!bountySection) return;
    bountySection.querySelectorAll('.merge-checkbox:checked').forEach(function(cb) {
      cb.checked = false;
      const card = cb.closest('.merge-card');
      if (card) { card.style.borderColor = ''; card.style.borderWidth = ''; }
    });
    updateMergeBar(bountySection.id);
  });
});
```

- [ ] **Step 4: Run TypeScript check**

```bash
npm run check
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard.astro
git commit -m "feat: add merge checkboxes and action bar to dashboard"
```

---

### Task 3B: Team-aware winner dropdown with data-members

- [ ] **Step 1: Replace the winner `<select>` block with optgroups and data-members**

In `dashboard.astro`, find the winner `<select>` block (around lines 486–494):

```astro
<select class="winner-select" style="width:100%;padding:0.55rem 0.85rem;background:var(--surface);border:1px solid var(--border);color:var(--text);font-family:inherit;font-size:0.82rem;border-radius:8px;outline:none;">
  <option value="">Select winner...</option>
  {Object.entries(data.teamGroups).map(([tId, members]) => (
    <option value={`Team ${tId}`}>Team {tId} ({members.map((m: any) => m.name).join(', ')})</option>
  ))}
  {data.interested.map((r: any) => (
    <option value={r.name}>{r.name} ({r.email})</option>
  ))}
</select>
```

Replace with:

```astro
<select class="winner-select" style="width:100%;padding:0.55rem 0.85rem;background:var(--surface);border:1px solid var(--border);color:var(--text);font-family:inherit;font-size:0.82rem;border-radius:8px;outline:none;">
  <option value="">Select winner...</option>
  {Object.keys(data.teamGroups).length > 0 && (
    <optgroup label="Teams">
      {Object.entries(data.teamGroups).map(([tId, members]) => (
        <option
          value={members.map((m: any) => m.name).join(' & ')}
          data-members={JSON.stringify(members.map((m: any) => ({ name: m.name })))}
        >
          Team {tId} — {members.map((m: any) => m.name).join(', ')}
        </option>
      ))}
    </optgroup>
  )}
  <optgroup label="Individuals">
    {data.interested.map((r: any) => (
      <option value={r.name}>{r.name} ({r.email})</option>
    ))}
  </optgroup>
</select>
```

Key changes:
- `value` for team options is now `"Jack He & Luke Cooper"` (names joined with ` & `) — this is what gets written to the bounty frontmatter `winner` field.
- `data-members` carries `[{ name: "Jack He" }, { name: "Luke Cooper" }]` as JSON — read by the JS handler to send `winnerMembers` to the API.
- Uses `<optgroup>` elements (not disabled options) for proper semantic grouping. Teams group only renders when at least one team exists.

- [ ] **Step 2: Update the declare winner JS handler to send winnerMembers**

In the `<script is:inline>` block, find the declare winner click handler. Find this section:

```javascript
const winner = select?.value;
const winnerSubmission = urlInput?.value || '';

if (!winner) {
  alert('Please select a winner.');
  return;
}
```

Replace with:

```javascript
const winner = select?.value;
const selectedOption = select && select.options[select.selectedIndex];
const membersAttr = selectedOption ? selectedOption.getAttribute('data-members') : null;
const winnerMembers = membersAttr ? JSON.parse(membersAttr) : undefined;
const winnerSubmission = urlInput?.value || '';

if (!winner) {
  alert('Please select a winner.');
  return;
}
```

Then find the fetch body:

```javascript
body: JSON.stringify({ slug, winner, winnerSubmission: winnerSubmission || undefined }),
```

Replace with:

```javascript
body: JSON.stringify({
  slug,
  winner,
  winnerSubmission: winnerSubmission || undefined,
  ...(winnerMembers ? { winnerMembers } : {}),
}),
```

- [ ] **Step 3: Run TypeScript check**

```bash
npm run check
```

Expected: no errors

- [ ] **Step 4: Verify manually in dev server**

```bash
npm run dev
```

1. Go to `http://localhost:4321/dashboard` and log in.
2. In the "Interested" section, verify solo cards now have a checkbox in the top-right corner.
3. Check 2+ solo cards — confirm the action bar appears below with "N selected", "Merge into new team" (enabled), and "Add to existing team" dropdown.
4. Click "Merge into new team" — confirm the page reloads with those people grouped in a new orange-bordered team box.
5. In the "Declare Winner" dropdown, confirm team options appear under an "── Teams ──" optgroup showing `"Team XXXX — Name, Name"`, with individual options under a separate "── Individuals ──" optgroup.
6. Select a team winner and click "Declare Winner" — confirm the bounty flips to `completed`, the hall-of-fame page shows `"Name & Name"` as winner, and both members appear in the leaderboard with +1 point each.

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard.astro
git commit -m "feat: team-aware winner dropdown with per-member leaderboard points"
```
