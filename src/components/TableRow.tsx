interface TableRowProps {
  columns: string[];
  data: Record<string, any>[];
  renderCell?: (key: string, value: any, row: Record<string, any>) => React.ReactNode;
  onRowClick?: (row: Record<string, any>) => void;
}

export function TableRow({ columns, data, renderCell, onRowClick }: TableRowProps) {
  const keys = columns.map((col) => col.toLowerCase().replace(/\s+/g, ''));

  const defaultRenderCell = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return (
        <div className="flex gap-1 flex-wrap">
          {value.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="px-2 py-0.5 bg-spark-teal/30 rounded text-xs font-mono"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }

    if (key === 'status' && typeof value === 'string') {
      const statusColors: Record<string, string> = {
        open: 'bg-green-500/30 text-green-300',
        claimed: 'bg-yellow-500/30 text-yellow-300',
        completed: 'bg-purple-500/30 text-purple-300',
        closed: 'bg-gray-500/30 text-gray-400',
      };
      return (
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${statusColors[value.toLowerCase()] || ''}`}>
          {value}
        </span>
      );
    }

    if (key === 'difficulty' && typeof value === 'string') {
      const colors: Record<string, string> = {
        Beginner: 'bg-green-500/30 text-green-300',
        Intermediate: 'bg-yellow-500/30 text-yellow-300',
        Advanced: 'bg-red-500/30 text-red-300',
      };
      return (
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${colors[value] || ''}`}>
          {value}
        </span>
      );
    }

    if (typeof value === 'number' && key === 'prize') {
      return (
        <span className="px-2 py-0.5 bg-spark-orange text-spark-black rounded font-semibold">
          ${value}
        </span>
      );
    }

    if (typeof value === 'number' && key === 'points') {
      return <span className="font-mono font-semibold text-spark-chartreuse">{value}</span>;
    }

    return <span>{value}</span>;
  };

  const cellRenderer = renderCell || defaultRenderCell;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-spark-teal">
            {columns.map((col) => (
              <th
                key={col}
                className="text-left px-3 py-2 font-display text-sm uppercase text-spark-chartreuse"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-spark-eggshell/40 font-mono">
                No bounties match your search.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.title || row.name || row.id || idx}
                className={`border-b border-spark-teal/30 hover:bg-spark-teal/10 transition-colors${onRowClick ? ' cursor-pointer' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {keys.map((key) => (
                  <td key={key} className="px-3 py-3 font-sans text-sm">
                    {cellRenderer(key, row[key], row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
