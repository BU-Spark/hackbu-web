#!/usr/bin/env node
import { existsSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOUNTIES_DIR = join(__dirname, '..', 'src', 'content', 'bounties');

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
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const description = await ask('Description: ');
  const docLink = await ask('Google Doc link (or leave blank): ');

  const filePath = join(BOUNTIES_DIR, `${slug}.md`);

  if (existsSync(filePath)) {
    console.log(`\n❌ A bounty with slug "${slug}" already exists.`);
    process.exit(1);
  }

  const frontmatter = [
    '---',
    `title: "${title.trim()}"`,
    `difficulty: ${difficulty}`,
    `prize: ${prize}`,
    `deadline: "${deadline.trim() || 'TBD'}"`,
    `tags: ${JSON.stringify(tags)}`,
    `status: open`,
    docLink.trim() ? `docLink: ${docLink.trim()}` : null,
    '---',
    '',
    description.trim(),
    '',
  ].filter(line => line !== null).join('\n');

  writeFileSync(filePath, frontmatter);
  console.log(`\n✅ Created ${filePath}`);
  console.log('Run `npm run dev` to see it live.\n');

  rl.close();
}

main();
