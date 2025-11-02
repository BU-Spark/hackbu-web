import { useState, useRef, useEffect } from 'react';

interface TerminalProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenWindow: (name: string) => void;
}

export function Terminal({ isOpen, onToggle, onOpenWindow }: TerminalProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Listen for command execution requests
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpenWithCommand = (e: CustomEvent) => {
      // Open terminal if closed
      if (!isOpen) {
        onToggle();
      }
      // Execute the command
      const cmd = e.detail;
      const [command, ...args] = cmd.trim().split(/\s+/);
      const fn = commands[command as keyof typeof commands];

      let result: string;
      if (!fn) {
        result = `Command not found: ${command}\nType 'help' for available commands`;
      } else {
        result = fn(args[0]);
      }

      setOutput((prev) => [...prev, `> ${cmd}`, result].filter(Boolean));
    };

    window.addEventListener('openTerminalWithCommand' as any, handleOpenWithCommand);

    return () => {
      window.removeEventListener('openTerminalWithCommand' as any, handleOpenWithCommand);
    };
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const commands = {
    help: () => [
      'Available commands:',
      '  apps                    list available apps',
      '  open <app>              open an app window',
      '  status                  show community stats',
      '  clear                   clear terminal',
      '',
      'Examples:',
      '  > apps',
      '  > open bounties',
      '  > open gallery',
    ].join('\n'),

    apps: () => [
      'Available apps:',
      '  bounties      💰 Browse open coding challenges',
      '  gallery       🚀 See student projects',
      '  leaderboard   🏆 Top contributors',
      '  events        📅 Upcoming meetups',
      '  about         ℹ️  Learn about HackBU',
      '',
      'Type \'open <name>\' to launch',
    ].join('\n'),

    open: (arg?: string) => {
      if (!arg) return 'Usage: open <app>\nRun \'apps\' to see available apps';

      const validApps = ['bounties', 'gallery', 'leaderboard', 'events', 'about'];
      if (!validApps.includes(arg)) {
        return `Unknown app: ${arg}\nRun \'apps\' to see available apps`;
      }

      onOpenWindow(arg);
      onToggle(); // Close terminal after opening app
      return `Opening ${arg}...`;
    },

    status: () => [
      'HackBU Community Status',
      '  Connected: ✓',
      '  Online builders: 187',
      '  Open bounties: 8',
      '  Total prizes: $1,625',
      '  Ping: 23ms',
    ].join('\n'),

    clear: () => {
      setOutput([]);
      return '';
    },
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const [command, ...args] = trimmed.split(/\s+/);
    const fn = commands[command as keyof typeof commands];

    let result: string;
    if (!fn) {
      result = `Command not found: ${command}\nType 'help' for available commands`;
    } else {
      result = fn(args[0]);
    }

    setOutput((prev) => [...prev, `> ${trimmed}`, result].filter(Boolean));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    }
  };

  return (
    <div
      className={`fixed top-14 left-0 right-0 z-50 px-4 transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div className="w-full max-w-7xl mx-auto h-96 bg-spark-black/95 border-4 border-b-0 border-spark-chartreuse rounded-b-lg flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 bg-spark-teal border-b-2 border-spark-chartreuse">
          <span className="font-mono font-bold text-spark-black">
            HackBU Terminal - Press ` to toggle
          </span>
          <button
            onClick={onToggle}
            className="text-spark-black hover:text-spark-black/70 font-mono font-bold text-lg"
            aria-label="Close terminal"
          >
            ✕
          </button>
        </div>

        <div
          ref={outputRef}
          className="flex-1 overflow-auto p-4 font-mono text-sm text-spark-chartreuse whitespace-pre-wrap"
        >
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-spark-teal/30">
          <span className="text-spark-chartreuse font-mono">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-spark-eggshell font-mono"
            placeholder="Type 'help' for commands..."
            aria-label="Terminal input"
          />
        </div>
      </div>
    </div>
  );
}
