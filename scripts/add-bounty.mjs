#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOUNTIES_PATH = join(__dirname, '..', 'src', 'data', 'bounties.json');

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log('\n🎯 Add a new bounty\n');

  const title = await ask('Title: ');
  if (!title.trim()) { console.log('Title is required.'); process.exit(1); }

  const slug = await ask(`Slug [${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}]: `)
    || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const difficultyInput = await ask('Difficulty (1=Beginner, 2=Intermediate, 3=Advanced): ');
  const difficultyMap = { '1': 'Beginner', '2': 'Intermediate', '3': 'Advanced' };
  const difficulty = difficultyMap[difficultyInput] || 'Beginner';

  const prize = Number(await ask('Prize ($): '));
  if (isNaN(prize)) { console.log('Prize must be a number.'); process.exit(1); }

  const deadline = await ask('Deadline (YYYY-MM-DD): ');
  const tagsRaw = await ask('Tags (comma-separated): ');
  const tags = JSON.stringify(tagsRaw.split(',').map(t => t.trim()).filter(Boolean));
  const description = await ask('Description: ');
  const docLink = await ask('Google Doc link (or leave blank): ');

  const bounties = JSON.parse(readFileSync(BOUNTIES_PATH, 'utf-8'));

  if (bounties.some(b => b.slug === slug)) {
    console.log(`\n❌ A bounty with slug "${slug}" already exists.`);
    process.exit(1);
  }

  bounties.push({
    title: title.trim(),
    slug,
    difficulty,
    prize,
    deadline: deadline.trim() || 'TBD',
    tags,
    status: 'open',
    description: description.trim(),
    docLink: docLink.trim(),
  });

  writeFileSync(BOUNTIES_PATH, JSON.stringify(bounties, null, 2) + '\n');
  console.log(`\n✅ Added "${title.trim()}" (${bounties.length} total bounties)`);
  console.log('Run `npm run build` or `npm run dev` to see it live.\n');

  rl.close();
}

main();
