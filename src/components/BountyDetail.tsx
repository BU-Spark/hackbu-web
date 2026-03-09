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
  const [year, setYear] = useState('');
  const [yearOther, setYearOther] = useState('');
  const [formError, setFormError] = useState('');
  const [interestedDone, setInterestedDone] = useState(false);
  const [teamDone, setTeamDone] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setInterestedDone(hasResponded(bounty.slug, 'interested'));
    setTeamDone(hasResponded(bounty.slug, 'looking-for-team'));
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

  function openModal(type: string) {
    const stored = getStoredData();
    setFname(stored.fname || '');
    setLname(stored.lname || '');
    setEmail(stored.email || '');
    setYear(stored.year || '');
    setYearOther(stored.yearOther || '');
    setFormError('');
    setModalType(type);
  }

  async function handleSubmit() {
    const yearValue = year === 'Other' ? yearOther.trim() : year;
    if (!fname.trim() || !lname.trim()) {
      setFormError('Please enter your first and last name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!yearValue) {
      setFormError('Please select your year.');
      return;
    }

    localStorage.setItem('hackbu-user-data', JSON.stringify({
      fname: fname.trim(), lname: lname.trim(), email: email.trim(), year, yearOther: yearOther.trim()
    }));

    saveResponse(bounty.slug, modalType!, { fname: fname.trim(), lname: lname.trim(), email: email.trim(), year: yearValue });
    if (modalType === 'interested') setInterestedDone(true);
    if (modalType === 'looking-for-team') setTeamDone(true);
    setModalType(null);
    showToast('Registered! Check your email shortly.');

    try {
      const res = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: fname.trim(),
          last_name: lname.trim(),
          email: email.trim(),
          year: yearValue,
          bounty_slug: bounty.slug,
          type: modalType,
          bounty_title: bounty.title,
          doc_link: bounty.docLink || '',
        }),
      });
      if (!res.ok) showToast('Saved locally — sync will retry on next visit.', true);
    } catch {
      showToast('No connection — saved locally and will sync when online.', true);
    }
    fetchCounts();
  }

  async function handleWithdraw(type: string) {
    const responses = getResponses();
    const data = responses[bounty.slug]?.[type];
    const withdrawEmail = data?.email || getStoredData().email;

    removeResponse(bounty.slug, type);
    if (type === 'interested') setInterestedDone(false);
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

      {/* Get Involved */}
      <div className="border-t border-spark-teal/20 pt-4">
        <h3 className="font-display text-lg text-spark-chartreuse mb-2">Get Involved</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => interestedDone ? handleWithdraw('interested') : openModal('interested')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
              interestedDone
                ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                : 'bg-spark-chartreuse text-spark-black hover:bg-spark-chartreuse/80'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {interestedDone ? 'Withdraw Interest' : "I'm Interested"}
          </button>
          <button
            onClick={() => teamDone ? handleWithdraw('looking-for-team') : openModal('looking-for-team')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
              teamDone
                ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                : 'bg-spark-orange text-spark-black hover:bg-spark-orange/80'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {teamDone ? 'Withdraw Team Request' : 'Looking for Teammates'}
          </button>
        </div>
      </div>

      {/* Form Modal (inline) */}
      {modalType && (
        <div className="border border-spark-teal/40 rounded-lg p-4 bg-spark-black/80 space-y-3">
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
          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); setFormError(''); }}
            className="w-full px-3 py-2 bg-spark-black border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
          >
            <option value="">Select Year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Masters">Masters</option>
            <option value="PhD">PhD</option>
            <option value="Other">Other</option>
          </select>
          {year === 'Other' && (
            <input
              type="text" value={yearOther}
              onChange={(e) => { setYearOther(e.target.value); setFormError(''); }}
              placeholder="Specify your year..."
              className="w-full px-3 py-2 bg-spark-black border border-spark-teal/40 rounded text-sm text-white font-mono focus:outline-none focus:border-spark-chartreuse"
            />
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
