import { useState, useEffect, useCallback } from 'react';
import { Window } from './Window';
import { Terminal } from './Terminal';
import { TableRow } from './TableRow';
import { CardList } from './CardList';
import { About } from './About';
import { Live } from './Live';
import { BountyDetail } from './BountyDetail';
import { BountyCard } from './BountyCard';
import { playOpen, playClose, playClick } from '../lib/sounds';
import { daysUntil } from '../lib/deadline';

function getNextWednesday(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 3=Wed
  let daysUntilWed = (3 - day + 7) % 7;
  if (daysUntilWed === 0) {
    // It's Wednesday — show today if before 6pm, otherwise next week
    if (now.getHours() >= 18) daysUntilWed = 7;
  }
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilWed);
  return next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function InnovationHours() {
  const dateStr = getNextWednesday();
  return (
    <div className="border border-spark-orange/30 rounded-lg p-4 mb-3 bg-spark-orange/5">
      <div className="flex items-start gap-3">
        <span className="text-lg">🔧</span>
        <div>
          <h3 className="font-display text-lg text-spark-orange">Tech Innovation Hours</h3>
          <p className="text-sm text-spark-eggshell/70 mt-1">
            {dateStr}, 4:00 – 6:00 PM — BU Spark!
          </p>
          <p className="text-xs text-spark-eggshell/40 mt-1 font-mono">Every Wednesday · Drop-in for guidance, resources &amp; building</p>
        </div>
      </div>
    </div>
  );
}

interface WindowManagerProps {
  bounties: any[];
  projects: any[];
  leaderboard: any[];
  events: any[];
  motd: string;
}

export function WindowManager({
  bounties,
  projects,
  leaderboard,
  events,
  motd,
}: WindowManagerProps) {
  const [openWindows, setOpenWindows] = useState<string[]>(['motd']); // Start with MOTD open
  const [zIndices, setZIndices] = useState<Record<string, number>>({
    motd: 10,
  });
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [nextZ, setNextZ] = useState(11);
  const [bountySearch, setBountySearch] = useState('');
  const [bountyDiffFilter, setBountyDiffFilter] = useState('');
  const [bountyStatusFilter, setBountyStatusFilter] = useState('');
  const [bountySort, setBountySort] = useState('newest');
  const [selectedBounty, setSelectedBounty] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<any[] | null>(null);

  const openWindow = useCallback((id: string) => {
    // Always bring window to front (whether opening new or already open)
    setZIndices((prev) => {
      const currentMax = Math.max(...Object.values(prev), 10);
      return { ...prev, [id]: currentMax + 1 };
    });
    setNextZ((z) => z + 1);

    setOpenWindows((prev) => {
      if (!prev.includes(id)) {
        playOpen();
        return [...prev, id];
      }
      return prev;
    });
  }, []);

  const focusWindow = useCallback((id: string) => {
    setZIndices((prev) => {
      const currentMax = Math.max(...Object.values(prev), 10);
      return { ...prev, [id]: currentMax + 1 };
    });
    setNextZ((z) => z + 1);
  }, []);

  const closeWindow = useCallback((id: string) => {
    playClose();
    setOpenWindows((prev) => prev.filter((windowId) => windowId !== id));
    setZIndices((prev) => {
      const newIndices = { ...prev };
      delete newIndices[id];
      return newIndices;
    });
  }, []);

  // Fetch live events from Eventbrite API
  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events && data.events.length > 0) {
          setLiveEvents(data.events);
        }
      })
      .catch(() => {}); // Fall back to static events
  }, []);

  // Check for ?open= query param on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const autoOpen = params.get('open');
    if (autoOpen) {
      openWindow(autoOpen);
    }
  }, [openWindow]);

  // Listen for events from dock and buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpenWindow = (e: CustomEvent) => {
      openWindow(e.detail);
    };

    const handleCloseWindow = (e: CustomEvent) => {
      closeWindow(e.detail);
    };

    const handleToggleTerminal = () => {
      setTerminalOpen((prev) => !prev);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close the focused (topmost) window
        const topWindow = Object.entries(zIndices).reduce((max, [id, z]) =>
          z > (zIndices[max] || 0) ? id : max
        , '');
        if (topWindow && openWindows.includes(topWindow)) {
          closeWindow(topWindow);
        }
      }
    };

    window.addEventListener('openWindow' as any, handleOpenWindow);
    window.addEventListener('closeWindow' as any, handleCloseWindow);
    window.addEventListener('toggleTerminal' as any, handleToggleTerminal);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('openWindow' as any, handleOpenWindow);
      window.removeEventListener('closeWindow' as any, handleCloseWindow);
      window.removeEventListener('toggleTerminal' as any, handleToggleTerminal);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openWindow, closeWindow, openWindows, zIndices]);

  // Prepare data for tables
  const bountiesData = bounties.map((b) => {
    let tags: string[] = [];
    try {
      tags = typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags;
    } catch (e) {
      console.error('Failed to parse bounty tags:', e);
      tags = [];
    }
    return {
      title: b.title,
      status: b.status || 'open',
      difficulty: b.difficulty || '',
      prize: b.prize,
      deadline: b.deadline || 'TBD',
      tags,
      slug: b.slug,
      featured: b.featured || false,
      winner: b.winner || '',
      winnerSubmission: b.winnerSubmission || '',
    };
  });

  const leaderboardData = leaderboard.map((l) => ({
    rank: l.rank || '#',
    name: l.name,
    points: l.points,
    badges: l.badges,
  }));

  // Find the focused window (highest z-index)
  const focusedWindow = Object.entries(zIndices).reduce((max, [id, z]) =>
    z > (zIndices[max] || 0) ? id : max
  , 'motd');

  return (
    <>
      {/* MOTD Window */}
      {openWindows.includes('motd') && (
        <Window
          title="Message of the Day"
          id="motd"
          initialX={80}
          initialY={80}
          onFocus={() => focusWindow('motd')}
          zIndex={zIndices.motd}
          isFocused={focusedWindow === 'motd'}
        >
          <pre className="font-mono text-sm text-spark-chartreuse whitespace-pre">
            {motd}
          </pre>
        </Window>
      )}

      {/* Bounties Window */}
      {openWindows.includes('bounties') && (
        <Window
          title="💰 Bounties"
          id="bounties"
          initialX={120}
          initialY={120}
          onFocus={() => focusWindow('bounties')}
          zIndex={zIndices.bounties}
          isFocused={focusedWindow === 'bounties'}
        >
          <div className="mb-4">
            <a
              href="https://airtable.com/app7XHhDfsNPzR7YD/shrtyXeNrcRyH0qG4"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-spark-chartreuse/20 to-spark-teal/20 border-2 border-dashed border-spark-chartreuse/60 rounded-lg text-spark-chartreuse font-display text-base hover:border-solid hover:border-spark-chartreuse hover:from-spark-chartreuse/30 hover:to-spark-teal/30 hover:shadow-[0_0_20px_rgba(168,230,29,0.15)] transition-all duration-200"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">✦</span>
              <span>Submit a Bounty</span>
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">✦</span>
            </a>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search bounties..."
              value={bountySearch}
              onChange={(e) => setBountySearch(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-1.5 bg-spark-black/50 border border-spark-teal/40 rounded text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-spark-chartreuse"
            />
            <select
              value={bountyStatusFilter}
              onChange={(e) => setBountyStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-spark-black/50 border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={bountyDiffFilter}
              onChange={(e) => setBountyDiffFilter(e.target.value)}
              className="px-3 py-1.5 bg-spark-black/50 border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={bountySort}
              onChange={(e) => setBountySort(e.target.value)}
              className="px-3 py-1.5 bg-spark-black/50 border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
            >
              <option value="newest">Newest</option>
              <option value="prize-desc">Highest Prize</option>
              <option value="deadline-asc">Closest Deadline</option>
            </select>
          </div>
          {(() => {
            const search = bountySearch.toLowerCase();
            const filtered = bountiesData
              .filter((b) => {
                const matchesSearch = !search ||
                  b.title.toLowerCase().includes(search) ||
                  (Array.isArray(b.tags) && b.tags.some((t: string) => t.toLowerCase().includes(search)));
                const matchesDiff = !bountyDiffFilter || b.difficulty === bountyDiffFilter;
                const matchesStatus = !bountyStatusFilter || b.status === bountyStatusFilter;
                return matchesSearch && matchesDiff && matchesStatus;
              })
              .sort((a, b) => {
                // Featured bounties always come first
                if (a.featured !== b.featured) return a.featured ? -1 : 1;
                if (bountySort === 'prize-desc') return (b.prize || 0) - (a.prize || 0);
                if (bountySort === 'deadline-asc') {
                  const da = daysUntil(a.deadline) ?? 9999;
                  const db = daysUntil(b.deadline) ?? 9999;
                  return da - db;
                }
                return 0; // newest = original order
              });

            if (filtered.length === 0) {
              return (
                <p className="py-8 text-center text-sm text-spark-eggshell/40 font-mono">
                  No bounties match your search.
                </p>
              );
            }

            return (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((b) => (
                  <BountyCard
                    key={b.slug}
                    bounty={b}
                    onClick={() => {
                      playClick();
                      const full = bounties.find((bx: any) => bx.slug === b.slug);
                      if (full) {
                        let tags: string[] = [];
                        try { tags = typeof full.tags === 'string' ? JSON.parse(full.tags) : full.tags; }
                        catch { tags = []; }
                        setSelectedBounty({ ...full, tags });
                        openWindow('bounty-detail');
                      }
                    }}
                  />
                ))}
              </div>
            );
          })()}
        </Window>
      )}

      {/* Gallery Window */}
      {openWindows.includes('gallery') && (
        <Window
          title="🚀 Gallery"
          id="gallery"
          initialX={360}
          initialY={160}
          onFocus={() => focusWindow('gallery')}
          zIndex={zIndices.gallery}
          isFocused={focusedWindow === 'gallery'}
        >
          <CardList items={projects} type="project" />
        </Window>
      )}

      {/* Leaderboard Window */}
      {openWindows.includes('leaderboard') && (
        <Window
          title="🏆 Leaderboard"
          id="leaderboard"
          initialX={220}
          initialY={220}
          onFocus={() => focusWindow('leaderboard')}
          zIndex={zIndices.leaderboard}
          isFocused={focusedWindow === 'leaderboard'}
        >
          <TableRow
            columns={['#', 'Name', 'Points', 'Badges']}
            data={leaderboardData}
          />
        </Window>
      )}

      {/* Events Window */}
      {openWindows.includes('events') && (
        <Window
          title="📅 Events"
          id="events"
          initialX={500}
          initialY={120}
          onFocus={() => focusWindow('events')}
          zIndex={zIndices.events}
          isFocused={focusedWindow === 'events'}
        >
          <InnovationHours />
          <CardList items={liveEvents || events} type="event" />
        </Window>
      )}

      {/* About Window */}
      {openWindows.includes('about') && (
        <Window
          title="ℹ️ About HackBU"
          id="about"
          initialX={150}
          initialY={100}
          onFocus={() => focusWindow('about')}
          zIndex={zIndices.about}
          isFocused={focusedWindow === 'about'}
        >
          <About />
        </Window>
      )}

      {/* Live Window */}
      {openWindows.includes('live') && (
        <Window
          title="📡 HackBU Live"
          id="live"
          initialX={180}
          initialY={80}
          onFocus={() => focusWindow('live')}
          zIndex={zIndices.live}
          isFocused={focusedWindow === 'live'}
        >
          <Live events={events} />
        </Window>
      )}

      {/* Bounty Detail Window */}
      {openWindows.includes('bounty-detail') && selectedBounty && (
        <Window
          title={`💰 ${selectedBounty.title}`}
          id="bounty-detail"
          initialX={200}
          initialY={100}
          onFocus={() => focusWindow('bounty-detail')}
          zIndex={zIndices['bounty-detail']}
          isFocused={focusedWindow === 'bounty-detail'}
        >
          <BountyDetail bounty={selectedBounty} />
        </Window>
      )}

      {/* Terminal */}
      <Terminal
        isOpen={terminalOpen}
        onToggle={() => setTerminalOpen(!terminalOpen)}
        onOpenWindow={openWindow}
      />
    </>
  );
}
