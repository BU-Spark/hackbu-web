interface LiveProps {
  events: any[];
}

export function Live({ events }: LiveProps) {
  const openWindow = (windowId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openWindow', { detail: windowId }));
    }
  };

  // Find the streaming event for schedule info
  const streamEvent = events.find(e => e.streamUrl);
  const streamTime = streamEvent?.when || 'Check Discord for schedule';

  // Placeholder data - will be replaced with real Episode data from database later
  const upcomingEpisodes = [
    {
      title: "API Tour: BU Dining Services API",
      type: "api_tour",
      date: "TBA",
      description: "Deep dive into BU's dining API with live code demos"
    },
    {
      title: "Ship Room: TerrierTransit Team",
      type: "ship_room",
      date: "TBA",
      description: "Interview with the team building BU's transit tracker"
    },
    {
      title: "Live Bounty: Build a Discord Bot",
      type: "live_bounty",
      date: "TBA",
      description: "Pair programming session building a bot together"
    }
  ];

  const typeEmoji: Record<string, string> = {
    api_tour: "🎙️",
    ship_room: "🚀",
    live_bounty: "💻",
    office_hours: "🤝"
  };

  return (
    <div className="overflow-auto h-full">
      {/* Demo Placeholder Badge */}
      <div className="px-8 pt-6">
        <div className="inline-flex items-center gap-2 text-spark-eggshell/90 bg-spark-black/50 border-2 border-spark-orange/50 rounded-md px-3 py-2">
          <span className="text-lg">⚠️</span>
          <span className="font-sans text-sm"><strong>Demo Placeholder:</strong> This Live view is for demo purposes only and not the final streaming page.</span>
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-spark-teal via-spark-teal to-spark-orange/30 px-8 py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/backgrounds/DSC04485.jpg')] bg-cover bg-center"></div>
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">📡</div>
          <h1 className="font-display text-5xl text-spark-black mb-4 uppercase">
            No Stream Right Now
          </h1>
          <p className="text-xl text-spark-black/80 max-w-2xl mx-auto font-sans">
            Check back during <strong>HackBU Live</strong> ({streamTime})<br />
            or follow us on Discord for stream notifications
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 space-y-12">
        {/* What is This? */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            About the Show
          </h2>
          <div className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6">
            <p className="text-spark-eggshell font-sans mb-4">
              HackBU Live is our weekly streaming show where we build, learn, and collaborate together.
              Watch live coding sessions, meet project teams, and participate in real-time quests for points.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <h3 className="font-display text-xl text-spark-chartreuse uppercase">
                  🎙️ API Tours
                </h3>
                <p className="text-spark-eggshell/80 text-sm font-sans">
                  20-30 min deep dives on BU and partner APIs with live demos
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl text-spark-chartreuse uppercase">
                  🚀 Ship Rooms
                </h3>
                <p className="text-spark-eggshell/80 text-sm font-sans">
                  Lightning interviews with HackBU teams about their projects
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl text-spark-chartreuse uppercase">
                  💻 Live Bounties
                </h3>
                <p className="text-spark-eggshell/80 text-sm font-sans">
                  Pair programming sessions where viewers can submit PRs live
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl text-spark-chartreuse uppercase">
                  🤝 Office Hours
                </h3>
                <p className="text-spark-eggshell/80 text-sm font-sans">
                  Q&A sessions with rotating mentors from IS&T and Spark!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Shows */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            Upcoming Shows
          </h2>
          <div className="space-y-4">
            {upcomingEpisodes.map((episode, idx) => (
              <div
                key={idx}
                className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6 hover:border-spark-chartreuse/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{typeEmoji[episode.type]}</div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-spark-eggshell uppercase mb-2">
                      {episode.title}
                    </h3>
                    <p className="text-spark-chartreuse text-sm font-mono mb-3">
                      {episode.date}
                    </p>
                    <p className="text-spark-eggshell/80 text-sm font-sans">
                      {episode.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Participate */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            How to Participate
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6">
              <div className="text-3xl mb-3">👀</div>
              <h3 className="font-display text-xl text-spark-eggshell uppercase mb-3">
                Watch Live
              </h3>
              <p className="text-spark-eggshell/80 text-sm font-sans">
                Join us on YouTube Live or Twitch during scheduled streams. Chat with the community and ask questions in real-time.
              </p>
            </div>
            <div className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="font-display text-xl text-spark-eggshell uppercase mb-3">
                Complete Quests
              </h3>
              <p className="text-spark-eggshell/80 text-sm font-sans">
                Each episode has optional quests (like "fork the repo" or "submit a PR"). Complete them for leaderboard points and badges.
              </p>
            </div>
            <div className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-display text-xl text-spark-eggshell uppercase mb-3">
                Join Discord
              </h3>
              <p className="text-spark-eggshell/80 text-sm font-sans">
                Get notified when we go live, discuss episodes, and use chat commands like !checkin to earn stream XP.
              </p>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <section className="border-t-2 border-spark-teal/30 pt-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://discord.gg/hackbu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-spark-chartreuse text-spark-black font-display text-xl uppercase rounded-lg hover:bg-spark-orange transition-colors shadow-lg"
            >
              Join Discord for Notifications
            </a>
            <button
              onClick={() => openWindow('events')}
              className="px-6 py-3 bg-spark-teal text-spark-eggshell font-display uppercase rounded hover:bg-spark-teal/80 transition-colors"
            >
              View All Events
            </button>
            <button
              onClick={() => openWindow('leaderboard')}
              className="px-6 py-3 bg-spark-black/60 border-2 border-spark-teal text-spark-eggshell font-display uppercase rounded hover:border-spark-chartreuse transition-colors"
            >
              View Leaderboard
            </button>
          </div>
        </section>

        {/* Note */}
          <section>
            <div className="bg-spark-black/40 border-2 border-spark-orange/40 rounded-lg p-6">
              <p className="text-spark-eggshell/90 text-sm font-sans text-center">
                <strong>Demo placeholder:</strong> The full Live experience will include an embedded player, real-time episode details, and active quests.
                For now, this page is a demo and will be replaced by the production streaming page.
                Check back during HackBU Live ({streamTime}) for the full experience!
              </p>
            </div>
          </section>
      </div>
    </div>
  );
}
