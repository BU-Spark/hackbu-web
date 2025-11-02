interface TableRowProps {
  columns: string[];
  data: Record<string, any>[];
  renderCell?: (key: string, value: any, row: Record<string, any>) => React.ReactNode;
}

export function TableRow({ columns, data, renderCell }: TableRowProps) {
  const keys = columns.map((col) => col.toLowerCase().replace(/\s+/g, ''));

  const defaultRenderCell = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return (
        <div className="flex gap-1 flex-wrap">
          {value.map((item, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-spark-teal/30 rounded text-xs font-mono"
            >
              {item}
            </span>
          ))}
        </div>
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
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-spark-teal/30 hover:bg-spark-teal/10 transition-colors"
            >
              {keys.map((key) => (
                <td key={key} className="px-3 py-3 font-sans text-sm">
                  {cellRenderer(key, row[key], row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
