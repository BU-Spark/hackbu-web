import { useState, useEffect, useCallback } from 'react';
import { Window } from './Window';
import { Terminal } from './Terminal';
import { TableRow } from './TableRow';
import { CardList } from './CardList';
import { About } from './About';
import { Live } from './Live';

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
  const [bountyFilter, setBountyFilter] = useState('');

  const openWindow = useCallback((id: string) => {
    // Always bring window to front (whether opening new or already open)
    setZIndices((prev) => {
      const currentMax = Math.max(...Object.values(prev), 10);
      return { ...prev, [id]: currentMax + 1 };
    });
    setNextZ((z) => z + 1);

    setOpenWindows((prev) => {
      if (!prev.includes(id)) {
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
    setOpenWindows((prev) => prev.filter((windowId) => windowId !== id));
    setZIndices((prev) => {
      const newIndices = { ...prev };
      delete newIndices[id];
      return newIndices;
    });
  }, []);

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

    window.addEventListener('openWindow' as any, handleOpenWindow);
    window.addEventListener('closeWindow' as any, handleCloseWindow);
    window.addEventListener('toggleTerminal' as any, handleToggleTerminal);

    return () => {
      window.removeEventListener('openWindow' as any, handleOpenWindow);
      window.removeEventListener('closeWindow' as any, handleCloseWindow);
      window.removeEventListener('toggleTerminal' as any, handleToggleTerminal);
    };
  }, [openWindow, closeWindow]);

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
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Search bounties..."
              value={bountySearch}
              onChange={(e) => setBountySearch(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-spark-black/50 border border-spark-teal/40 rounded text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-spark-chartreuse"
            />
            <select
              value={bountyFilter}
              onChange={(e) => setBountyFilter(e.target.value)}
              className="px-3 py-1.5 bg-spark-black/50 border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <TableRow
            columns={['Title', 'Status', 'Difficulty', 'Prize', 'Deadline', 'Tags']}
            data={bountiesData.filter((b) => {
              const search = bountySearch.toLowerCase();
              const matchesSearch = !search ||
                b.title.toLowerCase().includes(search) ||
                (Array.isArray(b.tags) && b.tags.some((t: string) => t.toLowerCase().includes(search)));
              const matchesDifficulty = !bountyFilter || b.difficulty === bountyFilter;
              return matchesSearch && matchesDifficulty;
            })}
            onRowClick={(row) => {
              if (row.slug) {
                window.location.href = `/bounties/${row.slug}`;
              }
            }}
          />
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
          <CardList items={events} type="event" />
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

      {/* Terminal */}
      <Terminal
        isOpen={terminalOpen}
        onToggle={() => setTerminalOpen(!terminalOpen)}
        onOpenWindow={openWindow}
      />
    </>
  );
}
