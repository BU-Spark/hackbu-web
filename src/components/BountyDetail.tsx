import { useState } from 'react';

interface BountyDetailProps {
  bounty: {
    title: string;
    status: string;
    difficulty: string;
    prize: number;
    deadline: string;
    tags: string[];
    slug: string;
    description?: string;
    docLink?: string;
  };
}

export function BountyDetail({ bounty }: BountyDetailProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [interested, setInterested] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(`bounty-interest-${bounty.slug}`);
    return saved === 'true';
  });

  const statusColors: Record<string, string> = {
    open: 'bg-green-500/30 text-green-300',
    claimed: 'bg-yellow-500/30 text-yellow-300',
    completed: 'bg-purple-500/30 text-purple-300',
    closed: 'bg-gray-500/30 text-gray-400',
  };

  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-green-500/30 text-green-300',
    Intermediate: 'bg-yellow-500/30 text-yellow-300',
    Advanced: 'bg-red-500/30 text-red-300',
  };

  const handleInterest = () => {
    setShowEmailModal(true);
  };

  const handleSubmitInterest = () => {
    if (email) {
      localStorage.setItem(`bounty-interest-${bounty.slug}`, 'true');
      setInterested(true);
      setShowEmailModal(false);
      setEmail('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded text-xs font-mono uppercase ${statusColors[bounty.status?.toLowerCase()] || ''}`}>
          {bounty.status}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-display text-2xl text-spark-chartreuse">{bounty.title}</h2>

      {/* Info row */}
      <div className="flex flex-wrap gap-4 text-sm font-mono">
        <span className="text-spark-orange font-semibold">${bounty.prize}</span>
        <span className="text-spark-eggshell/60">Deadline: {bounty.deadline}</span>
        <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[bounty.difficulty] || ''}`}>
          {bounty.difficulty}
        </span>
      </div>

      {/* Tags */}
      {bounty.tags && bounty.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {bounty.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-spark-teal/30 rounded text-xs font-mono">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {bounty.description && (
        <div className="border-t border-spark-teal/30 pt-4">
          <p className="text-sm text-spark-eggshell/80 leading-relaxed">{bounty.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {bounty.docLink && (
          <a
            href={bounty.docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-spark-teal/20 border border-spark-teal rounded text-sm font-mono text-spark-eggshell hover:bg-spark-teal/30 transition-colors"
          >
            View Project Doc
          </a>
        )}
        {!interested ? (
          <button
            onClick={handleInterest}
            className="px-4 py-2 bg-spark-chartreuse/20 border border-spark-chartreuse rounded text-sm font-mono text-spark-chartreuse hover:bg-spark-chartreuse/30 transition-colors"
          >
            I'm Interested
          </button>
        ) : (
          <span className="px-4 py-2 bg-green-500/20 border border-green-500 rounded text-sm font-mono text-green-300">
            ✓ Interest Registered
          </span>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="border border-spark-teal/40 rounded-lg p-4 bg-spark-black/80 space-y-3">
          <p className="text-sm font-mono text-spark-eggshell/80">Enter your email to register interest:</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 bg-spark-black/50 border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmitInterest}
              className="px-4 py-1.5 bg-spark-chartreuse text-spark-black rounded text-sm font-mono font-semibold hover:bg-spark-chartreuse/80 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={() => setShowEmailModal(false)}
              className="px-4 py-1.5 bg-gray-600 text-white rounded text-sm font-mono hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
