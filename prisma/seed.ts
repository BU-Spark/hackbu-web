import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.mOTD.deleteMany();
  await prisma.event.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.project.deleteMany();
  await prisma.bounty.deleteMany();

  // Create bounties
  const bounties = await prisma.bounty.createMany({
    data: [
      {
        title: 'Fix course-scheduler API endpoints',
        prize: 200,
        deadline: '2025-11-20',
        tags: JSON.stringify(['Web', 'Backend', 'API']),
        status: 'open',
      },
      {
        title: 'Build campus bus tracker mobile app',
        prize: 350,
        deadline: '2025-11-28',
        tags: JSON.stringify(['Mobile', 'React Native', 'Data']),
        status: 'open',
      },
      {
        title: 'Improve dining hall menu search UX',
        prize: 150,
        deadline: '2025-12-05',
        tags: JSON.stringify(['Web', 'Frontend', 'UX']),
        status: 'open',
      },
      {
        title: 'Create BU events aggregator bot',
        prize: 100,
        deadline: '2025-12-12',
        tags: JSON.stringify(['Discord', 'Bot', 'API']),
        status: 'open',
      },
      {
        title: 'Build room availability checker',
        prize: 250,
        deadline: '2025-12-18',
        tags: JSON.stringify(['Web', 'Data', 'Scraping']),
        status: 'open',
      },
      {
        title: 'Design new HackBU merch templates',
        prize: 75,
        deadline: '2025-11-30',
        tags: JSON.stringify(['Design', 'Figma']),
        status: 'open',
      },
      {
        title: 'Optimize student org directory database',
        prize: 180,
        deadline: '2025-12-08',
        tags: JSON.stringify(['Database', 'Backend', 'Performance']),
        status: 'open',
      },
      {
        title: 'Add dark mode to BU course planner',
        prize: 120,
        deadline: '2025-12-15',
        tags: JSON.stringify(['Web', 'CSS', 'Frontend']),
        status: 'open',
      },
    ],
  });

  // Create projects
  const projects = await prisma.project.createMany({
    data: [
      {
        slug: 'terrier-transit',
        name: 'TerrierTransit',
        badge: '🏆 Code & Tell Winner',
        desc: 'Real-time BU shuttle tracking with next-bus predictions',
        links: JSON.stringify([
          { label: 'Demo', url: '/projects/terrier-transit' },
          { label: 'GitHub', url: 'https://github.com/bu-spark/terrier-transit' },
        ]),
      },
      {
        slug: 'bu-menu-optimizer',
        name: 'BU Menu Optimizer',
        badge: '🔧 Utility Tool',
        desc: 'Allergen-aware dining hall menu search and meal planning',
        links: JSON.stringify([
          { label: 'Demo', url: '/projects/bu-menu-optimizer' },
          { label: 'GitHub', url: 'https://github.com/bu-spark/menu-optimizer' },
        ]),
      },
      {
        slug: 'spark-shift-bot',
        name: 'Spark Shift Bot',
        badge: '💬 Discord Bot',
        desc: 'Automated front desk scheduling and shift-swap helper',
        links: JSON.stringify([
          { label: 'GitHub', url: 'https://github.com/bu-spark/shift-bot' },
        ]),
      },
      {
        slug: 'bu-course-graph',
        name: 'BU Course Graph',
        badge: '📊 Data Viz',
        desc: 'Interactive prerequisite and course dependency visualizer',
        links: JSON.stringify([
          { label: 'Demo', url: '/projects/bu-course-graph' },
          { label: 'GitHub', url: 'https://github.com/bu-spark/course-graph' },
        ]),
      },
      {
        slug: 'campus-events-api',
        name: 'Campus Events API',
        badge: '🔌 API',
        desc: 'Unified API aggregating events from BU departments and orgs',
        links: JSON.stringify([
          { label: 'Docs', url: '/projects/campus-events-api' },
          { label: 'GitHub', url: 'https://github.com/bu-spark/events-api' },
        ]),
      },
      {
        slug: 'study-spot-finder',
        name: 'Study Spot Finder',
        badge: '📍 Location Tool',
        desc: 'Find open study spaces on campus with crowd-sourced occupancy',
        links: JSON.stringify([
          { label: 'Demo', url: '/projects/study-spot-finder' },
          { label: 'GitHub', url: 'https://github.com/bu-spark/study-spots' },
        ]),
      },
    ],
  });

  // Create leaderboard entries
  const leaderboard = await prisma.leaderboardEntry.createMany({
    data: [
      { name: 'mvoong', points: 245, badges: '🥇🏗️💻', rank: 1 },
      { name: 'langdon', points: 180, badges: '💡🎤🔥', rank: 2 },
      { name: 'spark_team', points: 165, badges: '🧠⚡', rank: 3 },
      { name: 'alex_codes', points: 140, badges: '🚀💯', rank: 4 },
      { name: 'data_wizard', points: 125, badges: '📊✨', rank: 5 },
    ],
  });

  // Create events (including live stream events)
  const events = await prisma.event.createMany({
    data: [
      {
        title: 'Syntax & Snax',
        when: 'Thursday 4pm',
        where: 'Spark! Space, 2nd Floor CDS',
      },
      {
        title: 'Code & Tell',
        when: 'Last Wednesday 6:30pm',
        where: 'Spark! Space, 2nd Floor CDS',
      },
      {
        title: 'HackBU Office Hours',
        when: 'Thursdays 5-6:30pm',
        where: 'Spark! Space, 2nd Floor CDS',
      },
      {
        title: 'HackBU Live',
        when: 'Thursday 4pm',
        where: 'Online - YouTube Live',
        streamUrl: 'https://youtube.com/@buspark',
      },
    ],
  });

  // Create MOTD
  await prisma.mOTD.create({
    data: {
      content: `╔════════════════════════════════════════╗
║  Welcome to HackBU OS v1.0            ║
║  Message of the Day                    ║
╠════════════════════════════════════════╣
║                                        ║
║  🎯 8 open bounties • $1,625 in prizes ║
║  🏆 Top builder: mvoong (245 pts)      ║
║  📅 Next: Syntax & Snax (Thu 4pm)      ║
║                                        ║
║  💡 Tip: Windows are draggable!        ║
║                                        ║
║  Type \`apps\` or use dock below ↓       ║
╚════════════════════════════════════════╝`,
      active: true,
    },
  });

  console.log('✅ Seed complete!');
  console.log(`   - ${bounties.count} bounties`);
  console.log(`   - ${projects.count} projects`);
  console.log(`   - ${leaderboard.count} leaderboard entries`);
  console.log(`   - ${events.count} events (including streaming)`);
  console.log('   - 1 MOTD');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
