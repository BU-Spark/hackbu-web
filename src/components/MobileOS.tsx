import { useState, useEffect, useCallback } from 'react';
import { BountyDetail } from './BountyDetail';
import { BountyCard } from './BountyCard';
import { About } from './About';
import { CardList } from './CardList';
import { playClick } from '../lib/sounds';
import { daysUntil } from '../lib/deadline';

type Screen = 'home' | 'bounties' | 'bounty-detail' | 'about' | 'events' | 'hall-of-fame';

interface MobileOSProps {
  bounties: any[];
  projects: any[];
  leaderboard: any[];
  events: any[];
  motd: string;
}

function getNextWednesday(): string {
  const now = new Date();
  const day = now.getDay();
  let daysUntilWed = (3 - day + 7) % 7;
  if (daysUntilWed === 0 && now.getHours() >= 18) daysUntilWed = 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilWed);
  return next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function MobileOS({ bounties, projects, leaderboard, events, motd }: MobileOSProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [history, setHistory] = useState<Screen[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<any>(null);
  const [bountySearch, setBountySearch] = useState('');
  const [bountyFilter, setBountyFilter] = useState('');
  const [bountyCounts, setBountyCounts] = useState<Record<string, { interested: number; lookingForTeam: number }> | null>(null);
  const [liveEvents, setLiveEvents] = useState<any[] | null>(null);

  // Fetch bounty counts
  useEffect(() => {
    fetch('/api/bounty-counts')
      .then((res) => res.ok ? res.json() : {})
      .then((data) => setBountyCounts(data))
      .catch(() => setBountyCounts({}));
  }, []);

  // Fetch live events
  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events && data.events.length > 0) setLiveEvents(data.events);
      })
      .catch(() => {});
  }, []);

  // Deep link support
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoOpen = params.get('open');
    if (autoOpen === 'bounties') navigate('bounties');
    else if (autoOpen === 'events') navigate('events');
    else if (autoOpen === 'about') navigate('about');
  }, []);

  // Listen for openWindow events (from boot screen etc.)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const target = e.detail as string;
      if (target === 'bounties') navigate('bounties');
      else if (target === 'events') navigate('events');
      else if (target === 'about') navigate('about');
    };
    window.addEventListener('openWindow' as any, handler);
    return () => window.removeEventListener('openWindow' as any, handler);
  }, []);

  const navigate = useCallback((next: Screen, bounty?: any) => {
    playClick();
    setHistory((prev) => [...prev, screen]);
    setScreen(next);
    if (bounty) setSelectedBounty(bounty);
  }, [screen]);

  const goBack = useCallback(() => {
    playClick();
    const prev = [...history];
    const last = prev.pop() || 'home';
    setHistory(prev);
    setScreen(last);
  }, [history]);

  // Prepare bounties data
  const bountiesData = bounties.map((b) => {
    let tags: string[] = [];
    try {
      tags = typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags;
    } catch { tags = []; }
    return {
      title: b.title, status: b.status || 'open', difficulty: b.difficulty || '',
      prize: b.prize, deadline: b.deadline || 'TBD', tags, slug: b.slug,
      featured: b.featured || false, descriptionHtml: b.descriptionHtml || '',
      docLink: b.docLink || '', winner: b.winner || '', winnerSubmission: b.winnerSubmission || '',
    };
  });

  const filteredBounties = bountiesData
    .filter((b) => {
      const search = bountySearch.toLowerCase();
      const matchesSearch = !search || b.title.toLowerCase().includes(search) ||
        b.tags.some((t: string) => t.toLowerCase().includes(search));
      const matchesFilter = !bountyFilter || b.difficulty === bountyFilter || b.status === bountyFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return 0;
    });

  const featuredBounty = bountiesData.find((b) => b.featured && b.status === 'open');

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hackbu-theme', next);
  };

  const isLight = typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'light';

  // Screen title for chrome
  const screenTitles: Record<Screen, string> = {
    home: 'HACKBU OS',
    bounties: 'BOUNTIES',
    'bounty-detail': selectedBounty?.title || 'BOUNTY',
    about: 'ABOUT',
    events: 'EVENTS',
    'hall-of-fame': 'HALL OF FAME',
  };

  const showChrome = screen !== 'home';
  const activeTab = screen === 'home' ? 'home' : screen.startsWith('bounty') ? 'bounties' : screen === 'events' ? 'events' : 'home';

  return (
    <div className="fixed inset-0 flex flex-col bg-spark-black">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-spark-black border-b border-spark-teal/20">
        <span className="font-mono text-[10px] text-spark-teal/70 uppercase tracking-[0.2em]">HACKBU_OS v2.0</span>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="font-mono text-[10px] text-spark-teal/70 uppercase tracking-wider">
            {isLight ? '[ DARK ]' : '[ LITE ]'}
          </button>
          <div className="flex gap-0.5">
            {[1,2,3,4].map((i) => (
              <div key={i} className="w-1 h-2 bg-spark-teal/60 rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Window Chrome (non-home screens) */}
      {showChrome && (
        <div className="flex items-center justify-between px-3 py-2.5 bg-spark-black border-b border-spark-teal/30">
          <button onClick={goBack} className="flex items-center gap-1.5 text-spark-teal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="font-mono text-xs uppercase tracking-wider">Back</span>
          </button>
          <span className="font-mono text-xs text-spark-teal/60 uppercase tracking-[0.2em] truncate max-w-[50%]">
            {screenTitles[screen]}
          </span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-sm bg-[#28CA42]" />
            <div className="w-3 h-3 rounded-sm bg-[#FF5F57]" />
          </div>
        </div>
      )}

      {/* Screen Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* HOME SCREEN */}
        {screen === 'home' && (
          <div className="p-5 space-y-6">
            {/* Title */}
            <div className="pt-4 pb-2">
              <h1 className="font-display text-4xl text-spark-chartreuse tracking-widest" style={{ textShadow: '0 0 24px rgba(191,241,60,0.3)' }}>
                HACKBU OS
              </h1>
              <p className="font-mono text-xs text-spark-teal/60 uppercase tracking-[0.3em] mt-1">BU Spark! Bounty Board</p>
            </div>

            {/* 2x2 App Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('bounties')}
                className="flex flex-col items-center justify-center gap-2 p-5 border border-spark-teal/30 rounded-xl bg-spark-black hover:border-spark-teal/60 transition-colors active:scale-95"
              >
                <span className="text-3xl">$$$</span>
                <span className="font-mono text-xs text-spark-eggshell/70 uppercase tracking-wider">Bounties</span>
              </button>
              <button
                onClick={() => navigate('about')}
                className="flex flex-col items-center justify-center gap-2 p-5 border border-spark-teal/30 rounded-xl bg-spark-black hover:border-spark-teal/60 transition-colors active:scale-95"
              >
                <span className="text-3xl">&lt;/&gt;</span>
                <span className="font-mono text-xs text-spark-eggshell/70 uppercase tracking-wider">About</span>
              </button>
              <button
                onClick={() => navigate('events')}
                className="flex flex-col items-center justify-center gap-2 p-5 border border-spark-teal/30 rounded-xl bg-spark-black hover:border-spark-teal/60 transition-colors active:scale-95"
              >
                <span className="text-3xl">&#128197;</span>
                <span className="font-mono text-xs text-spark-eggshell/70 uppercase tracking-wider">Events</span>
              </button>
              <a
                href="/hall-of-fame"
                className="flex flex-col items-center justify-center gap-2 p-5 border border-spark-teal/30 rounded-xl bg-spark-black hover:border-spark-teal/60 transition-colors active:scale-95 no-underline"
              >
                <span className="text-3xl">&#9733;</span>
                <span className="font-mono text-xs text-spark-eggshell/70 uppercase tracking-wider">Hall of Fame</span>
              </a>
            </div>

            {/* Featured Bounty Widget */}
            {featuredBounty && (
              <button
                onClick={() => navigate('bounty-detail', featuredBounty)}
                className="w-full text-left p-4 rounded-xl border border-spark-teal/40 bg-gradient-to-br from-spark-teal/10 to-spark-chartreuse/5 space-y-2 active:scale-[0.98] transition-transform"
                style={{ boxShadow: '0 0 20px rgba(6,177,162,0.1)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-spark-teal uppercase tracking-[0.2em]">Featured Bounty</span>
                  <span className="px-2 py-0.5 bg-spark-chartreuse text-spark-black text-[10px] font-mono font-bold rounded uppercase">New</span>
                </div>
                <h3 className="font-display text-lg text-spark-chartreuse leading-snug">{featuredBounty.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl text-spark-orange">${featuredBounty.prize}</span>
                  <span className="font-mono text-xs text-spark-eggshell/50">{featuredBounty.difficulty}</span>
                </div>
              </button>
            )}

            {/* Innovation Hours mini card */}
            <div className="p-3 border border-spark-orange/20 rounded-lg bg-spark-orange/5">
              <div className="flex items-center gap-2">
                <span className="text-sm">&#128295;</span>
                <div>
                  <p className="font-mono text-xs text-spark-orange">Innovation Hours</p>
                  <p className="font-mono text-[10px] text-spark-eggshell/50">{getNextWednesday()}, 4-6 PM</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOUNTIES SCREEN */}
        {screen === 'bounties' && (
          <div className="p-4 space-y-3">
            {/* Submit bounty link */}
            <a
              href="https://airtable.com/app7XHhDfsNPzR7YD/shrtyXeNrcRyH0qG4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-dashed border-spark-chartreuse/60 rounded-lg text-spark-chartreuse font-display text-sm no-underline hover:border-solid transition-all"
            >
              <span>&#10022;</span> Submit a Bounty <span>&#10022;</span>
            </a>

            {/* Search */}
            <input
              type="text"
              placeholder="Search bounties..."
              value={bountySearch}
              onChange={(e) => setBountySearch(e.target.value)}
              className="w-full px-3 py-2 bg-spark-black/50 border border-spark-teal/40 rounded-lg text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-spark-chartreuse"
            />

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {['', 'open', 'Beginner', 'Intermediate', 'Advanced'].map((f) => (
                <button
                  key={f}
                  onClick={() => setBountyFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-colors ${
                    bountyFilter === f
                      ? 'bg-spark-teal text-spark-black'
                      : 'border border-spark-teal/30 text-spark-eggshell/60'
                  }`}
                >
                  {f || 'All'}
                </button>
              ))}
            </div>

            {/* Bounty list */}
            {filteredBounties.length === 0 ? (
              <p className="py-8 text-center text-sm text-spark-eggshell/40 font-mono">No bounties match your search.</p>
            ) : (
              <div className="space-y-3">
                {filteredBounties.map((b) => (
                  <div
                    key={b.slug}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('bounty-detail', b);
                    }}
                  >
                    <BountyCard
                      bounty={b}
                      counts={bountyCounts === null ? undefined : (bountyCounts[b.slug] ?? { interested: 0, lookingForTeam: 0 })}
                      href={`/bounties/${b.slug}`}
                      onClick={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOUNTY DETAIL SCREEN */}
        {screen === 'bounty-detail' && selectedBounty && (
          <div className="p-4">
            <BountyDetail bounty={selectedBounty} />
          </div>
        )}

        {/* ABOUT SCREEN */}
        {screen === 'about' && (
          <div>
            <About />
          </div>
        )}

        {/* EVENTS SCREEN */}
        {screen === 'events' && (
          <div className="p-4 space-y-3">
            {/* Innovation Hours */}
            <div className="border border-spark-orange/30 rounded-lg p-4 bg-spark-orange/5">
              <div className="flex items-start gap-3">
                <span className="text-lg">&#128295;</span>
                <div>
                  <h3 className="font-display text-lg text-spark-orange">Tech Innovation Hours</h3>
                  <p className="text-sm text-spark-eggshell/70 mt-1">{getNextWednesday()}, 4:00 - 6:00 PM</p>
                  <p className="text-xs text-spark-eggshell/40 mt-1 font-mono">Every Wednesday</p>
                </div>
              </div>
            </div>
            <CardList items={liveEvents || events} type="event" />
          </div>
        )}

        {/* HALL OF FAME SCREEN */}
        {screen === 'hall-of-fame' && (
          <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <span className="text-5xl">&#9733;</span>
            <p className="font-mono text-sm text-spark-eggshell/60 text-center">Redirecting to Hall of Fame...</p>
            {typeof window !== 'undefined' && (window.location.href = '/hall-of-fame') && null}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="mobile-bottom-nav fixed bottom-0 left-0 right-0 flex border-t-2 border-spark-teal/40 bg-spark-black z-50">
        {([
          { id: 'home' as const, label: 'HOME', icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )},
          { id: 'bounties' as const, label: 'BOUNTY', icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          )},
          { id: 'events' as const, label: 'EVENTS', icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          )},
        ]).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setHistory([]);
                setScreen(tab.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 font-mono text-[10px] uppercase tracking-[0.15em] transition-all ${
                isActive
                  ? 'text-spark-black bg-spark-teal shadow-[0_0_16px_rgba(6,177,162,0.3)]'
                  : 'text-spark-teal/60 hover:text-spark-teal'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
