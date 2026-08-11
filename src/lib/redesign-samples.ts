/**
 * Sample bounties for the /redesign preview ONLY.
 *
 * These deliberately do NOT live in src/content/bounties/ — anything added there
 * shows up on the live board. They exist so the preview has enough inventory to
 * judge the grid, the track filters, and the Hall of Fame. Every one renders
 * with a SAMPLE marker, and their detail pages have the interest actions
 * disabled so nobody writes a Mailchimp tag for a bounty that doesn't exist.
 *
 * Delete this file (and the three `SAMPLES` imports) when the redesign ships.
 */
export interface Sample {
  slug: string;
  title: string;
  prize: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  deadline: string;
  tags: string[];
  status: 'open' | 'completed' | 'closed';
  track: 'hackbu' | 'spark' | 'partner';
  featured?: boolean;
  winner?: string;
  sponsor?: string;
  brief: string;
  requirements?: { text: string; done?: boolean }[];
}

export const SAMPLES: Sample[] = [
  {
    slug: 'sample-terrier-transit',
    title: 'Terrier Transit Live Tracker',
    prize: 750,
    difficulty: 'Advanced',
    deadline: '2026-08-16',
    tags: ['React', 'GTFS-RT', 'Maps', 'WebSockets'],
    status: 'open',
    track: 'hackbu',
    featured: true,
    brief:
      'Build a real-time tracker for the BU Shuttle using the IS&T GTFS-realtime feed. Students should see live bus positions, ETAs per stop, and service alerts — fast enough to check while walking to the stop.',
    requirements: [
      { text: 'Live map of shuttle positions (<10s latency)', done: true },
      { text: 'Per-stop ETA list with walking-time offset', done: true },
      { text: 'Service alert banner from the GTFS alerts feed' },
      { text: 'Mobile-first, loads under 2s on campus wifi' },
    ],
  },
  {
    slug: 'sample-dining-menu-api',
    title: 'Dining Menu API Integration',
    prize: 500,
    difficulty: 'Intermediate',
    deadline: '2026-09-22',
    tags: ['TypeScript', 'API', 'Caching'],
    status: 'open',
    track: 'hackbu',
    brief:
      'Wrap the dining hall menu feed in a clean, cached API students can actually build on, with per-hall filtering and allergen flags.',
    requirements: [
      { text: 'Typed endpoints for halls, meals, and allergens', done: true },
      { text: 'Response cache with a documented TTL' },
      { text: 'Published OpenAPI schema' },
    ],
  },
  {
    slug: 'sample-project-gallery',
    title: 'Project Gallery Redesign',
    prize: 300,
    difficulty: 'Beginner',
    deadline: '2026-09-30',
    tags: ['Astro', 'CSS', 'Design'],
    status: 'open',
    track: 'spark',
    brief:
      'Rebuild the Spark! project gallery so past student work is actually browsable — filter by semester, tech, and client.',
  },
  {
    slug: 'sample-nonprofit-data-explorer',
    title: 'Open Data Explorer for a Boston Nonprofit',
    prize: 600,
    difficulty: 'Advanced',
    deadline: '2026-10-15',
    tags: ['React', 'Data viz', 'Civic'],
    status: 'open',
    track: 'partner',
    sponsor: 'Community partner',
    brief:
      'A Boston nonprofit has eleven years of program data trapped in spreadsheets. Give their staff a way to read it without hiring an analyst.',
  },
  {
    slug: 'sample-course-planner',
    title: 'Course Planner Extension',
    prize: 350,
    difficulty: 'Intermediate',
    deadline: '2026-04-30',
    tags: ['Browser extension', 'Scraping'],
    status: 'completed',
    track: 'hackbu',
    winner: 'Maya Chen',
    brief: 'A browser extension that overlays prerequisite chains onto the course registration UI.',
  },
  {
    slug: 'sample-events-api-fallback',
    title: 'Events API Fallback',
    prize: 200,
    difficulty: 'Beginner',
    deadline: '2026-05-12',
    tags: ['Node', 'Reliability'],
    status: 'completed',
    track: 'spark',
    winner: 'Priya Krishnan',
    brief: 'Keep the events page useful when the Eventbrite API is down or rate-limited.',
  },
];
