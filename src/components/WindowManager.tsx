import { useState, useEffect } from 'react';
import { Window } from './Window';
import { Terminal } from './Terminal';
import { TableRow } from './TableRow';
import { CardList } from './CardList';

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

  const openWindow = (id: string) => {
    // Always bring window to front (whether opening new or already open)
    setZIndices((prev) => ({ ...prev, [id]: nextZ }));
    setNextZ((z) => z + 1);

    if (!openWindows.includes(id)) {
      setOpenWindows((prev) => {
        // Limit to 4 windows
        if (prev.length >= 4) {
          const [oldest, ...rest] = prev;
          setZIndices((z) => {
            const { [oldest]: _, ...remaining } = z;
            return remaining;
          });
          return [...rest, id];
        }
        return [...prev, id];
      });
    }
  };

  const focusWindow = (id: string) => {
    setZIndices((prev) => ({ ...prev, [id]: nextZ }));
    setNextZ((z) => z + 1);
  };

  // Listen for events from dock and buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpenWindow = (e: CustomEvent) => {
      openWindow(e.detail);
    };

    const handleToggleTerminal = () => {
      setTerminalOpen((prev) => !prev);
    };

    window.addEventListener('openWindow' as any, handleOpenWindow);
    window.addEventListener('toggleTerminal' as any, handleToggleTerminal);

    return () => {
      window.removeEventListener('openWindow' as any, handleOpenWindow);
      window.removeEventListener('toggleTerminal' as any, handleToggleTerminal);
    };
  }, []);

  // Prepare data for tables
  const bountiesData = bounties.map((b) => ({
    title: b.title,
    prize: b.prize,
    deadline: b.deadline || 'TBD',
    tags: JSON.parse(b.tags),
  }));

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
          initialX={(typeof window !== 'undefined' ? window.innerWidth : 1920) / 2 - 250}
          initialY={(typeof window !== 'undefined' ? window.innerHeight : 1080) / 2 - 200}
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
          <TableRow
            columns={['Title', 'Prize', 'Deadline', 'Tags']}
            data={bountiesData}
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

      {/* Terminal */}
      <Terminal
        isOpen={terminalOpen}
        onToggle={() => setTerminalOpen(!terminalOpen)}
        onOpenWindow={openWindow}
      />
    </>
  );
}
