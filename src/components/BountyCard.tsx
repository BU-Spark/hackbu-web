import { useEffect, useState } from 'react';
import { deadlineLabel } from '../lib/deadline';

interface BountyCardProps {
  bounty: {
    title: string;
    status: string;
    difficulty: string;
    prize: number;
    deadline: string;
    tags: string[];
    slug: string;
  };
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  open: 'bg-green-500/20 text-green-300 border-green-500/30',
  completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-500/20 text-green-300',
  Intermediate: 'bg-yellow-500/20 text-yellow-300',
  Advanced: 'bg-red-500/20 text-red-300',
};

export function BountyCard({ bounty, onClick }: BountyCardProps) {
  const [interested, setInterested] = useState(0);
  const [team, setTeam] = useState(0);
  const dl = deadlineLabel(bounty.deadline);

  useEffect(() => {
    fetch(`/api/bounty-counts?slug=${encodeURIComponent(bounty.slug)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setInterested(d.interested || 0);
          setTeam(d.lookingForTeam || 0);
        }
      })
      .catch(() => {});
  }, [bounty.slug]);

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col gap-3 p-4 bg-spark-black border border-spark-teal/30 rounded-xl cursor-pointer hover:border-spark-chartreuse/60 hover:bg-spark-teal/5 transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,230,29,0.08)]"
    >
      {/* Header row: status + difficulty */}
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-mono uppercase border ${statusColors[bounty.status] || ''}`}>
          {bounty.status}
        </span>
        {bounty.difficulty && (
          <span className={`px-2 py-0.5 rounded text-xs font-mono ${difficultyColors[bounty.difficulty] || ''}`}>
            {bounty.difficulty}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-base text-spark-eggshell group-hover:text-spark-chartreuse transition-colors leading-snug">
        {bounty.title}
      </h3>

      {/* Prize — hero text */}
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold text-spark-orange">${bounty.prize}</span>
        <span className="text-xs font-mono text-spark-eggshell/40">prize</span>
      </div>

      {/* Tags */}
      {bounty.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {bounty.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-spark-teal/15 border border-spark-teal/25 rounded text-xs font-mono text-spark-eggshell/80">
              {tag}
            </span>
          ))}
          {bounty.tags.length > 4 && (
            <span className="px-1.5 py-0.5 text-xs font-mono text-spark-eggshell/40">+{bounty.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer: deadline countdown + counters */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-spark-teal/15">
        <span className={`text-xs font-mono ${dl.cls}`}>{dl.text}</span>
        <div className="flex items-center gap-2">
          {/* Interested */}
          <span className="inline-flex items-center gap-1 text-xs font-mono text-spark-chartreuse/70" title="Interested">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {interested}
          </span>
          {/* Team */}
          <span className="inline-flex items-center gap-1 text-xs font-mono text-spark-orange/70" title="Looking for teammates">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {team}
          </span>
        </div>
      </div>
    </div>
  );
}
