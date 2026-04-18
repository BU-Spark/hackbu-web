import type { APIRoute } from 'astro';
import { rateLimit, rateLimitResponse, getClientIp } from '../../lib/rate-limit';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOUNTIES_DIR = path.resolve(__dirname, '../../content/bounties');
const LEADERBOARD_PATH = path.resolve(__dirname, '../../data/leaderboard.json');

const DIFFICULTY_BADGES: Record<string, string> = {
  Beginner: '🌱',
  Intermediate: '⚡',
  Advanced: '🔥',
};

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

  // Rate limit
  const ip = getClientIp(request);
  const rl = rateLimit(ip, { name: 'declare-winner', limit: 10, windowSec: 60 });
  if (!rl.allowed) return rateLimitResponse(rl);

  // Parse body
  let body: { slug?: string; winner?: string; winnerSubmission?: string; winnerMembers?: { name: string }[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug, winner, winnerSubmission, winnerMembers } = body;
  if (winnerMembers !== undefined && !Array.isArray(winnerMembers)) {
    return new Response(JSON.stringify({ error: 'winnerMembers must be an array' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!slug || !winner) {
    return new Response(JSON.stringify({ error: 'Missing required fields: slug, winner' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate slug to prevent path traversal
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
    return new Response(JSON.stringify({ error: 'Invalid slug format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Read bounty file
  const bountyPath = path.resolve(BOUNTIES_DIR, `${slug}.md`);
  if (!bountyPath.startsWith(BOUNTIES_DIR + path.sep)) {
    return new Response(JSON.stringify({ error: 'Invalid slug path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!fs.existsSync(bountyPath)) {
    return new Response(JSON.stringify({ error: 'Bounty not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const raw = fs.readFileSync(bountyPath, 'utf-8');
  const parsed = matter(raw);

  if (parsed.data.status !== 'open') {
    return new Response(JSON.stringify({ error: `Bounty is already ${parsed.data.status}` }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update frontmatter
  parsed.data.status = 'completed';
  parsed.data.winner = winner;
  if (winnerSubmission) {
    parsed.data.winnerSubmission = winnerSubmission;
  }

  // Read leaderboard (before writing anything, so we can fail early)
  let leaderboard: { name: string; points: number; badges: string; rank: number }[] = [];
  try {
    const raw = fs.readFileSync(LEADERBOARD_PATH, 'utf-8');
    leaderboard = JSON.parse(raw);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      leaderboard = [];
    } else {
      console.error('Failed to read leaderboard:', err);
      return new Response(JSON.stringify({ error: 'Leaderboard read failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Update leaderboard data
  const difficulty = parsed.data.difficulty || 'Intermediate';
  const badge = DIFFICULTY_BADGES[difficulty] || '⚡';

  // Award points to each winner (individual or all team members)
  const awardees = winnerMembers && winnerMembers.length > 0
    ? [...new Set(winnerMembers.map((m) => m.name).filter((n) => typeof n === 'string' && n.trim()))]
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

  leaderboard.sort((a, b) => b.points - a.points);
  leaderboard.forEach((e, i) => (e.rank = i + 1));

  // Write both files — bounty first, then leaderboard
  // If leaderboard write fails, restore the bounty file
  const bountyContent = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(bountyPath, bountyContent, 'utf-8');

  try {
    fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2) + '\n', 'utf-8');
  } catch (err) {
    // Rollback bounty file
    console.error('Failed to write leaderboard, rolling back bounty:', err);
    fs.writeFileSync(bountyPath, raw, 'utf-8');
    return new Response(JSON.stringify({ error: 'Failed to update leaderboard' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
