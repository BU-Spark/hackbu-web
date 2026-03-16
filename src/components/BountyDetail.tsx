import { useState, useEffect } from 'react';
import { deadlineLabel } from '../lib/deadline';

interface BountyDetailProps {
  bounty: {
    title: string;
    status: string;
    difficulty: string;
    prize: number;
    deadline: string;
    tags: string[];
    slug: string;
    descriptionHtml?: string;
    docLink?: string;
    winner?: string;
    winnerSubmission?: string;
  };
}

const STORAGE_KEY = 'hackbu-bounty-responses';

function getResponses(): Record<string, Record<string, any>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function hasResponded(slug: string, type: string): boolean {
  const responses = getResponses();
  return !!(responses[slug] && responses[slug][type]);
}

function saveResponse(slug: string, type: string, data: any) {
  const responses = getResponses();
  if (!responses[slug]) responses[slug] = {};
  responses[slug][type] = { ...data, timestamp: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function removeResponse(slug: string, type: string) {
  const responses = getResponses();
  if (responses[slug]) {
    delete responses[slug][type];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function getStoredData(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('hackbu-user-data') || '{}');
  } catch {
    return {};
  }
}

export function BountyDetail({ bounty }: BountyDetailProps) {
  const [modalType, setModalType] = useState<string | null>(null);
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [interestedDone, setInterestedDone] = useState(false);
  const [teamDone, setTeamDone] = useState(false);
  const [workingMode, setWorkingMode] = useState<'solo' | 'team'>('solo');
  const [teammates, setTeammates] = useState<{ name: string; email: string }[]>([{ name: '', email: '' }]);
  const [agreeNotify, setAgreeNotify] = useState(false);
  const [agreeHours, setAgreeHours] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState<string | null>(null);
  const [nextStepsDismissed, setNextStepsDismissed] = useState(false);

  const [interestedCount, setInterestedCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interested = hasResponded(bounty.slug, 'interested');
    const team = hasResponded(bounty.slug, 'looking-for-team');
    setInterestedDone(interested);
    setTeamDone(team);
    setNextStepsDismissed(!interested && !team);
    const responses = getResponses();
    const storedTeamId = responses[bounty.slug]?.interested?.teamId;
    setTeamId(storedTeamId ?? null);
    fetchCounts();
  }, [bounty.slug]);

  function showToast(msg: string, isError = false) {
    setToast({ msg, error: isError });
    setTimeout(() => setToast(null), 4000);
  }

  async function fetchCounts() {
    try {
      const res = await fetch(`/api/bounty-counts?slug=${encodeURIComponent(bounty.slug)}`);
      if (res.ok) {
        const data = await res.json();
        setInterestedCount(data.interested || 0);
        setTeamCount(data.lookingForTeam || 0);
      }
    } catch {}
  }

  const statusColors: Record<string, string> = {
    open: 'bg-green-500/30 text-green-300',
    completed: 'bg-purple-500/30 text-purple-300',
    closed: 'bg-gray-500/30 text-gray-400',
  };

  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-green-500/30 text-green-300',
    Intermediate: 'bg-yellow-500/30 text-yellow-300',
    Advanced: 'bg-red-500/30 text-red-300',
  };

  // Restore persisted form state on mount
  useEffect(() => {
    const stored = getStoredData();
    if (stored.fname) setFname(stored.fname);
    if (stored.lname) setLname(stored.lname);
    if (stored.email) setEmail(stored.email);
    if (stored.workingMode) setWorkingMode(stored.workingMode as 'solo' | 'team');
  }, []);

  function openModal(type: string) {
    setFormError('');
    setAgreeNotify(false);
    setAgreeHours(false);
    setConfirmWithdraw(null);
    setModalType(type);
  }

  async function handleSubmit() {
    if (!fname.trim() || !lname.trim()) {
      setFormError('Please enter your first and last name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    // Require acknowledgements on interested form
    if (modalType === 'interested') {
      if (!agreeNotify) { setFormError('Please agree to bounty notifications.'); return; }
      if (!agreeHours) { setFormError('Please acknowledge Innovation Hours.'); return; }
    }

    // Validate teammates if team mode selected (on interested form)
    const validTeammates = modalType === 'interested' && workingMode === 'team'
      ? teammates.filter(t => t.name.trim() || t.email.trim())
      : [];
    for (const t of validTeammates) {
      if (!t.name.trim()) { setFormError('Please enter a name for each teammate.'); return; }
      if (!t.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email.trim())) {
        setFormError('Please enter a valid email for each teammate.'); return;
      }
    }

    localStorage.setItem('hackbu-user-data', JSON.stringify({
      fname: fname.trim(), lname: lname.trim(), email: email.trim(), workingMode,
    }));

    const submittedType = modalType!;
    saveResponse(bounty.slug, submittedType, { fname: fname.trim(), lname: lname.trim(), email: email.trim() });
    if (submittedType === 'interested') setInterestedDone(true);
    if (submittedType === 'looking-for-team') setTeamDone(true);
    if (typeof umami !== 'undefined') umami.track('bounty-signup', { bounty: bounty.slug, type: submittedType });

    setModalType(null);
    setNextStepsDismissed(false);

    try {
      const res = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: fname.trim(),
          last_name: lname.trim(),
          email: email.trim(),
          bounty_slug: bounty.slug,
          type: modalType,
          bounty_title: bounty.title,
          doc_link: bounty.docLink || '',
          teammates: validTeammates.map(t => ({ name: t.name.trim(), email: t.email.trim() })),
          working_mode: modalType === 'interested' ? workingMode : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.teamId) {
          setTeamId(data.teamId);
          // Re-save with teamId
          saveResponse(bounty.slug, submittedType, { fname: fname.trim(), lname: lname.trim(), email: email.trim(), teamId: data.teamId });
        } else {
          setTeamId(null);
        }
      } else {
        showToast('Server error — your info is saved locally. Please try again later.', true);
      }
    } catch {
      showToast('No connection — saved locally. Please try again when online.', true);
    }
    fetchCounts();
  }

  async function handleWithdraw(type: string) {
    const responses = getResponses();
    const data = responses[bounty.slug]?.[type];
    const withdrawEmail = data?.email || getStoredData().email;

    removeResponse(bounty.slug, type);
    if (type === 'interested') { setInterestedDone(false); setTeamId(null); }
    if (type === 'looking-for-team') setTeamDone(false);
    showToast('Withdrawn.');

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: withdrawEmail, bounty_slug: bounty.slug, type }),
      });
      if (!res.ok) showToast('Could not sync withdrawal — will retry on next visit.', true);
    } catch {
      showToast('No connection — withdrawal saved locally.', true);
    }
    fetchCounts();
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-lg font-mono text-sm shadow-xl border ${
          toast.error
            ? 'bg-red-900/90 border-red-500/60 text-red-200'
            : 'bg-spark-black/95 border-spark-chartreuse/60 text-spark-chartreuse'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Counters */}
      <div className="flex gap-2 justify-end">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-spark-chartreuse/10 border border-spark-chartreuse/30 rounded-full text-xs font-mono text-spark-chartreuse" title="Interested">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {interestedCount}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-spark-orange/10 border border-spark-orange/30 rounded-full text-xs font-mono text-spark-orange" title="Looking for Teammates">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {teamCount}
        </span>
      </div>

      {/* Status badge */}
      <span className={`inline-block px-3 py-1 rounded text-xs font-mono uppercase ${statusColors[bounty.status?.toLowerCase()] || ''}`}>
        {bounty.status}
      </span>

      <h2 className="font-display text-2xl text-spark-chartreuse">{bounty.title}</h2>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="px-3 py-1 bg-spark-orange text-spark-black rounded-lg font-semibold">${bounty.prize}</span>
        {(() => {
          const dl = deadlineLabel(bounty.deadline);
          return (
            <span className={`px-3 py-1 border border-spark-teal/50 rounded-lg font-mono ${dl.cls}`}>
              {dl.text}
            </span>
          );
        })()}
        {bounty.difficulty && (
          <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${difficultyColors[bounty.difficulty] || ''}`}>
            {bounty.difficulty}
          </span>
        )}
      </div>

      {bounty.tags && bounty.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {bounty.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-spark-teal/15 border border-spark-teal/30 rounded text-xs font-mono text-spark-eggshell/90">
              {tag}
            </span>
          ))}
        </div>
      )}

      {bounty.descriptionHtml && (
        <div className="border-t border-spark-teal/20 pt-4">
          <h3 className="font-display text-lg text-spark-chartreuse mb-2">Description</h3>
          <div
            className="text-sm text-spark-eggshell/80 leading-relaxed prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: bounty.descriptionHtml }}
          />
        </div>
      )}

      {/* Winner section for completed bounties */}
      {bounty.status === 'completed' && bounty.winner && (
        <div className="border-t border-spark-teal/20 pt-4">
          <h3 className="font-display text-lg text-purple-300 mb-2">🏆 Winner</h3>
          <div className="flex items-center gap-3">
            <span className="text-spark-eggshell font-semibold">{bounty.winner}</span>
            {bounty.winnerSubmission && (
              <a
                href={bounty.winnerSubmission}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-spark-chartreuse hover:text-spark-chartreuse/80 underline transition-colors"
              >
                View Submission
              </a>
            )}
          </div>
        </div>
      )}

      {/* Next Steps after registration */}
      {(interestedDone || teamDone) && !nextStepsDismissed && (
        <div className="border border-spark-chartreuse/40 rounded-lg p-4 bg-spark-chartreuse/5 space-y-3 action-panel">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-spark-chartreuse">You're registered!</h3>
            <button onClick={() => setNextStepsDismissed(true)} className="text-spark-eggshell/40 hover:text-spark-eggshell/70 transition-colors text-lg leading-none">×</button>
          </div>
          <div className="text-sm text-spark-eggshell/70 space-y-2 font-mono">
            <p>Here's what to expect:</p>
            {interestedDone && (
              <div className="space-y-1.5">
                <p className="text-spark-chartreuse text-xs uppercase tracking-wider">Interest registered</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>You should receive an <span className="text-spark-chartreuse">email with instructions</span> shortly.</li>
                  <li>If not, contact <a href="mailto:kzingade@bu.edu" className="text-spark-teal hover:underline">kzingade@bu.edu</a> or <a href="mailto:buspark@bu.edu" className="text-spark-teal hover:underline">buspark@bu.edu</a>.</li>
                  <li>In the meantime, review the <span className="text-spark-chartreuse">project brief</span> below to get started.</li>
                </ol>
              </div>
            )}
            {interestedDone && teamDone && (
              <hr className="border-spark-teal/20" />
            )}
            {teamDone && (
              <div className="space-y-1.5">
                <p className="text-spark-orange text-xs uppercase tracking-wider">Team search active</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>You'll receive an <span className="text-spark-chartreuse">email with a Discord invite</span> to connect with other teammates.</li>
                  <li>If not, contact <a href="mailto:kzingade@bu.edu" className="text-spark-teal hover:underline">kzingade@bu.edu</a> or <a href="mailto:buspark@bu.edu" className="text-spark-teal hover:underline">buspark@bu.edu</a>.</li>
                  <li>Once you've found a team, come back and click <span className="text-spark-chartreuse">I'm Interested</span> to register together.</li>
                </ol>
              </div>
            )}
          </div>
          {teamId && (
            <div className="space-y-2 pt-1 border-t border-spark-teal/20">
              <p className="text-sm text-spark-eggshell/70 font-mono">Share this link with your teammates:</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${bounty.slug}?team=${teamId}`}
                  className="flex-1 px-3 py-2 bg-spark-black border border-spark-teal/40 rounded text-xs text-spark-eggshell/80 font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/join/${bounty.slug}?team=${teamId}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-2 bg-spark-teal/20 border border-spark-teal/40 rounded text-xs font-mono text-spark-teal hover:bg-spark-teal/30 transition-colors whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
          {bounty.docLink && (
            <a
              href={bounty.docLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-spark-chartreuse text-spark-black rounded-lg font-semibold hover:bg-spark-chartreuse/80 transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              View Project Brief
            </a>
          )}
        </div>
      )}

      {/* Get Involved */}
      <div className="border-t border-spark-teal/20 pt-4">
        <h3 className="font-display text-lg text-spark-chartreuse mb-2">Get Involved</h3>
        <div className="flex flex-wrap gap-3 items-start">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => interestedDone ? setConfirmWithdraw('interested') : openModal('interested')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                interestedDone
                  ? 'bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30'
                  : 'bg-spark-chartreuse text-spark-black hover:bg-spark-chartreuse/80'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {interestedDone ? 'Withdraw Interest' : "I'm Interested"}
            </button>
            {confirmWithdraw === 'interested' && (
              <div className="flex items-center gap-2 pl-1">
                <span className="text-spark-eggshell/60 text-xs font-mono">Confirm withdraw?</span>
                <button onClick={() => { handleWithdraw('interested'); setConfirmWithdraw(null); }} className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-300 rounded text-xs hover:bg-green-500/30 transition-colors">Yes</button>
                <button onClick={() => setConfirmWithdraw(null)} className="px-2 py-0.5 border border-spark-teal/40 text-spark-eggshell/60 rounded text-xs hover:bg-spark-teal/10 transition-colors">Cancel</button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => teamDone ? setConfirmWithdraw('looking-for-team') : openModal('looking-for-team')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                teamDone
                  ? 'bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30'
                  : 'bg-spark-orange text-spark-black hover:bg-spark-orange/80'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {teamDone ? 'Withdraw Team Request' : 'Looking for Teammates'}
            </button>
            {confirmWithdraw === 'looking-for-team' && (
              <div className="flex items-center gap-2 pl-1">
                <span className="text-spark-eggshell/60 text-xs font-mono">Confirm withdraw?</span>
                <button onClick={() => { handleWithdraw('looking-for-team'); setConfirmWithdraw(null); }} className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-300 rounded text-xs hover:bg-green-500/30 transition-colors">Yes</button>
                <button onClick={() => setConfirmWithdraw(null)} className="px-2 py-0.5 border border-spark-teal/40 text-spark-eggshell/60 rounded text-xs hover:bg-spark-teal/10 transition-colors">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal (inline) */}
      {modalType && (
        <div className="border border-spark-teal/40 rounded-lg p-4 bg-spark-black/80 space-y-3 max-h-[65vh] overflow-y-auto">
          <h3 className="font-display text-lg text-spark-chartreuse">
            {modalType === 'interested' ? "I'm Interested" : 'Looking for Teammates'}
          </h3>
          <p className="text-spark-eggshell/60 text-sm">Fill in your details so the organizers can reach out to you.</p>
          <input
            type="text" value={fname}
            onChange={(e) => { setFname(e.target.value); setFormError(''); }}
            placeholder="First Name"
            className="w-full px-3 py-2 bg-spark-black border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
            autoFocus
          />
          <input
            type="text" value={lname}
            onChange={(e) => { setLname(e.target.value); setFormError(''); }}
            placeholder="Last Name"
            className="w-full px-3 py-2 bg-spark-black border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
          />
          <input
            type="email" value={email}
            onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
            placeholder="you@example.com"
            className="w-full px-3 py-2 bg-spark-black border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
          />
          {email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && !email.trim().toLowerCase().endsWith('@bu.edu') && (
            <p className="text-yellow-400/80 text-xs font-mono">Heads up: this program is for BU students. Make sure this is your BU email.</p>
          )}

          {/* Team composition */}
          {(modalType === 'interested' || modalType === 'looking-for-team') && (
            <div className="space-y-2 pt-1">
              <p className="text-spark-eggshell/60 text-xs font-mono">Working arrangement</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWorkingMode('solo')}
                  className={`flex-1 px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                    workingMode === 'solo'
                      ? 'bg-spark-chartreuse text-spark-black'
                      : 'border border-spark-teal/40 text-spark-eggshell/60 hover:bg-spark-teal/10'
                  }`}
                >
                  {modalType === 'looking-for-team' ? 'Just me' : 'Solo / looking for team'}
                </button>
                <button
                  type="button"
                  onClick={() => setWorkingMode('team')}
                  className={`flex-1 px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                    workingMode === 'team'
                      ? 'bg-spark-orange text-spark-black'
                      : 'border border-spark-teal/40 text-spark-eggshell/60 hover:bg-spark-teal/10'
                  }`}
                >
                  {modalType === 'looking-for-team' ? 'Partial team, need more' : 'Already have a team'}
                </button>
              </div>

              {workingMode === 'team' && (
                <div className="space-y-2 pt-1">
                  <p className="text-spark-eggshell/60 text-xs font-mono">Teammate details</p>
                  {teammates.map((tm, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={tm.name}
                        onChange={(e) => {
                          const updated = teammates.map((t, j) => j === i ? { ...t, name: e.target.value } : t);
                          setTeammates(updated);
                          setFormError('');
                        }}
                        placeholder={`Teammate ${i + 1} Name`}
                        className="flex-1 px-3 py-2 bg-spark-black border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
                      />
                      <input
                        type="email"
                        value={tm.email}
                        onChange={(e) => {
                          const updated = teammates.map((t, j) => j === i ? { ...t, email: e.target.value } : t);
                          setTeammates(updated);
                          setFormError('');
                        }}
                        placeholder="email@bu.edu"
                        className="flex-1 px-3 py-2 bg-spark-black border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
                      />
                      {teammates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setTeammates(teammates.filter((_, j) => j !== i))}
                          className="text-spark-eggshell/40 hover:text-red-400 transition-colors text-lg leading-none px-1"
                          title="Remove teammate"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {teammates.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setTeammates([...teammates, { name: '', email: '' }])}
                      className="text-spark-chartreuse/70 text-xs font-mono hover:text-spark-chartreuse transition-colors"
                    >
                      + Add teammate
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Acknowledgement checkboxes — only on "I'm Interested" */}
          {modalType === 'interested' && (
            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeNotify}
                  onChange={(e) => { setAgreeNotify(e.target.checked); setFormError(''); }}
                  className="mt-0.5 accent-spark-chartreuse shrink-0"
                />
                <span className="text-xs font-mono text-spark-eggshell/70 group-hover:text-spark-eggshell/90 transition-colors">
                  I agree to be notified when new bounties are released.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeHours}
                  onChange={(e) => { setAgreeHours(e.target.checked); setFormError(''); }}
                  className="mt-0.5 accent-spark-chartreuse shrink-0"
                />
                <span className="text-xs font-mono text-spark-eggshell/70 group-hover:text-spark-eggshell/90 transition-colors">
                  I acknowledge that Spark!'s Innovation Hours (Wed 4–6pm) are available for assistance, guidance, resources, or a place to build.
                </span>
              </label>
            </div>
          )}

          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setModalType(null); setFormError(''); }}
              className="px-4 py-1.5 border border-spark-teal/40 text-spark-eggshell/70 rounded text-sm hover:bg-spark-teal/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-spark-chartreuse text-spark-black rounded text-sm font-semibold hover:bg-spark-chartreuse/80 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Project Doc */}
      <div className="border-t border-spark-teal/20 pt-4">
        <h3 className="font-display text-lg text-spark-chartreuse mb-2">Project Description</h3>
        {bounty.docLink ? (
          <a
            href={bounty.docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-spark-chartreuse text-spark-black rounded-lg font-semibold hover:bg-spark-chartreuse/80 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            View Project Description Doc
          </a>
        ) : (
          <p className="text-spark-eggshell/40 italic text-sm">No project description document linked yet.</p>
        )}
      </div>
    </div>
  );
}
