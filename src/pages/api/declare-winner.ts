export const prerender = false;

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
  let body: { slug?: string; winner?: string; winnerSubmission?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug, winner, winnerSubmission } = body;
  if (!slug || !winner) {
    return new Response(JSON.stringify({ error: 'Missing required fields: slug, winner' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Read bounty file
  const bountyPath = path.join(BOUNTIES_DIR, `${slug}.md`);
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

  // Write bounty file back
  const updated = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(bountyPath, updated, 'utf-8');

  // Update leaderboard
  const difficulty = parsed.data.difficulty || 'Intermediate';
  const badge = DIFFICULTY_BADGES[difficulty] || '⚡';

  let leaderboard: { name: string; points: number; badges: string; rank: number }[] = [];
  try {
    leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_PATH, 'utf-8'));
  } catch {
    leaderboard = [];
  }

  const existing = leaderboard.find((e) => e.name === winner);
  if (existing) {
    existing.points += 1;
    existing.badges += badge;
  } else {
    leaderboard.push({ name: winner, points: 1, badges: badge, rank: 0 });
  }

  // Recalculate ranks
  leaderboard.sort((a, b) => b.points - a.points);
  leaderboard.forEach((e, i) => (e.rank = i + 1));

  fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2) + '\n', 'utf-8');

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
