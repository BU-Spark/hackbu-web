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
    featured?: boolean;
    winner?: string;
    winnerSubmission?: string;
  };
  onClick: () => void;
  counts?: { interested: number; lookingForTeam: number };
}

const statusColors: Record<string, string> = {
  open: 'bg-green-500/20 text-green-300 border-green-500/30 status-open',
  completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-500/20 text-green-300 difficulty-beginner',
  Intermediate: 'bg-yellow-500/20 text-yellow-300 difficulty-intermediate',
  Advanced: 'bg-red-500/20 text-red-300',
};

export function BountyCard({ bounty, onClick, counts }: BountyCardProps) {
  const loading = counts === undefined;
  const interested = counts?.interested ?? 0;
  const team = counts?.lookingForTeam ?? 0;
  const dl = deadlineLabel(bounty.deadline);

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col gap-3 p-4 bg-spark-black border rounded-xl cursor-pointer hover:border-spark-chartreuse/60 hover:bg-spark-teal/5 transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,230,29,0.08)] ${bounty.featured ? 'border-spark-chartreuse/50 ring-1 ring-spark-chartreuse/20' : 'border-spark-teal/30'}`}
    >
      {bounty.featured && (
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-spark-chartreuse text-spark-black text-[10px] font-mono font-bold rounded uppercase tracking-wider">
          Featured
        </span>
      )}
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

      {/* Winner badge for completed bounties */}
      {bounty.status === 'completed' && bounty.winner && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/15 border border-purple-500/30 rounded text-xs font-mono text-purple-300">
          <span>🏆</span>
          <span>{bounty.winner}</span>
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
            {loading ? <span className="w-3 h-3 rounded bg-spark-chartreuse/20 animate-pulse" /> : interested}
          </span>
          {/* Team */}
          <span className="inline-flex items-center gap-1 text-xs font-mono text-spark-orange/70" title="Looking for teammates">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {loading ? <span className="w-3 h-3 rounded bg-spark-orange/20 animate-pulse" /> : team}
          </span>
        </div>
      </div>
    </div>
  );
}
