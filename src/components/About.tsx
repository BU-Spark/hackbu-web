import aboutData from '../data/about.json';

export function About() {
  const { mission, sponsors, whatWeDo, howToJoin, team, faq, codeOfConduct } = aboutData;

  const openWindow = (windowId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openWindow', { detail: windowId }));
    }
  };

  return (
    <div className="overflow-auto h-full">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-spark-teal via-spark-teal to-spark-chartreuse/30 px-8 py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/backgrounds/DSC04485.jpg')] bg-cover bg-center"></div>
        <div className="relative z-10">
          <h1 className="font-display text-5xl text-spark-black mb-4 uppercase">
            About HackBU
          </h1>
          <p className="text-xl text-spark-black/80 max-w-3xl font-sans">
            {mission.statement}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8 space-y-12">
        {/* Sponsors */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            Our Sponsors
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6 hover:border-spark-chartreuse/50 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <h3 className="font-display text-2xl text-spark-eggshell uppercase">
                    {sponsor.name}
                  </h3>
                </div>
                <p className="text-spark-eggshell/80 text-sm font-sans mb-4">
                  {sponsor.description}
                </p>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-spark-chartreuse hover:text-spark-orange transition-colors text-sm font-mono"
                >
                  Learn more →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* What We Do */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            What We Do
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whatWeDo.map((item) => (
              <button
                key={item.title}
                onClick={() => openWindow(item.link)}
                className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6 hover:border-spark-chartreuse hover:bg-spark-teal/10 transition-all text-left group"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-display text-2xl text-spark-eggshell mb-3 uppercase group-hover:text-spark-chartreuse transition-colors">
                  {item.title}
                </h3>
                <p className="text-spark-eggshell/80 text-sm font-sans">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* How to Join */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            How to Join
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {howToJoin.steps.map((step) => (
              <div key={step.number} className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-spark-chartreuse flex items-center justify-center">
                  <span className="font-display text-2xl text-spark-black">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-xl text-spark-eggshell uppercase">
                  {step.title}
                </h3>
                <p className="text-spark-eggshell/80 text-sm font-sans">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <a
              href={howToJoin.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-spark-chartreuse text-spark-black font-display text-xl uppercase rounded-lg hover:bg-spark-orange transition-colors shadow-lg"
            >
              Join Our Discord
            </a>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6"
              >
                <h3 className="font-display text-xl text-spark-eggshell uppercase mb-2">
                  {member.name}
                </h3>
                <p className="text-spark-chartreuse text-sm font-mono mb-3">
                  {member.role}
                </p>
                <p className="text-spark-eggshell/80 text-sm font-sans">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faq.map((item, idx) => (
              <details
                key={idx}
                className="bg-spark-black/40 border-2 border-spark-teal/30 rounded-lg p-6 hover:border-spark-chartreuse/50 transition-colors group"
              >
                <summary className="font-display text-lg text-spark-eggshell uppercase cursor-pointer list-none flex items-center justify-between">
                  <span>{item.question}</span>
                  <span className="text-spark-chartreuse group-open:rotate-90 transition-transform">
                    ▶
                  </span>
                </summary>
                <p className="text-spark-eggshell/80 text-sm font-sans mt-4 pl-4 border-l-2 border-spark-chartreuse">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Code of Conduct */}
        <section>
          <h2 className="font-display text-3xl text-spark-chartreuse mb-6 uppercase">
            {codeOfConduct.title}
          </h2>
          <div className="bg-spark-black/40 border-2 border-spark-orange/50 rounded-lg p-6 space-y-4">
            <p className="text-spark-eggshell font-sans">{codeOfConduct.summary}</p>
            <div>
              <h3 className="font-display text-lg text-spark-chartreuse uppercase mb-2">
                Reporting
              </h3>
              <p className="text-spark-eggshell/80 text-sm font-sans">
                {codeOfConduct.reporting}
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg text-spark-chartreuse uppercase mb-2">
                Enforcement
              </h3>
              <p className="text-spark-eggshell/80 text-sm font-sans">
                {codeOfConduct.moderation}
              </p>
            </div>
          </div>
        </section>

        {/* CTAs Footer */}
        <section className="border-t-2 border-spark-teal/30 pt-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={howToJoin.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-spark-chartreuse text-spark-black font-display uppercase rounded hover:bg-spark-orange transition-colors"
            >
              Join Discord
            </a>
            <button
              onClick={() => openWindow('bounties')}
              className="px-6 py-3 bg-spark-teal text-spark-eggshell font-display uppercase rounded hover:bg-spark-teal/80 transition-colors"
            >
              Browse Bounties
            </button>
            <button
              onClick={() => openWindow('gallery')}
              className="px-6 py-3 bg-spark-black/60 border-2 border-spark-teal text-spark-eggshell font-display uppercase rounded hover:border-spark-chartreuse transition-colors"
            >
              View Projects
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
