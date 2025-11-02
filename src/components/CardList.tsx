interface CardListProps {
  items: Array<{
    name?: string;
    title?: string;
    badge?: string;
    desc?: string;
    when?: string;
    where?: string;
    links?: string; // JSON string
  }>;
  type?: 'project' | 'event';
}

export function CardList({ items, type = 'project' }: CardListProps) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const links = item.links ? JSON.parse(item.links) : [];

        if (type === 'event') {
          return (
            <div
              key={idx}
              className="border border-spark-teal/40 rounded-lg p-4 hover:border-spark-chartreuse transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-display text-lg text-spark-chartreuse">
                    {item.title}
                  </h3>
                  <p className="text-sm text-spark-eggshell/70 mt-1">
                    {item.when} — {item.where}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        // Project card
        return (
          <div
            key={idx}
            className="border border-spark-teal/40 rounded-lg p-4 hover:border-spark-chartreuse transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-lg text-spark-eggshell">
                    {item.name}
                  </h3>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 bg-spark-teal/30 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-spark-eggshell/80 mb-3">{item.desc}</p>
                <div className="flex gap-3">
                  {links.map((link: { label: string; url: string }, i: number) => (
                    <a
                      key={i}
                      href={link.url}
                      className="text-sm text-spark-chartreuse hover:text-spark-chartreuse/80 underline transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
