import { cn } from "@/lib/utils";

function StatusCell({ value }: { value: string | number }) {
  const str = String(value).toUpperCase();
  const styles: Record<string, string> = {
    COMPLETED: "bg-primary-50 text-primary-700",
    APPROVED: "bg-primary-50 text-primary-700",
    PENDING: "bg-amber-50 text-amber-700",
    PROCESSING: "bg-amber-50 text-amber-700",
    FAILED: "bg-error-500/10 text-error-600",
    REJECTED: "bg-error-500/10 text-error-600",
  };
  const matched = Object.keys(styles).find((k) => str.includes(k));
  if (!matched) return <>{value}</>;
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", styles[matched])}>
      {value}
    </span>
  );
}

export function DataTable({
  headers,
  rows,
  statusColumn,
}: {
  headers: string[];
  rows: (string | number)[][];
  /** Index of column that should render as status badge */
  statusColumn?: number;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-card border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
        <p className="text-sm text-gray-500">No records yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-subtle">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, i) => (
              <tr key={i} className="transition hover:bg-gray-50/60">
                {row.map((cell, j) => (
                  <td key={j} className="whitespace-nowrap px-4 py-3.5 text-gray-700">
                    {statusColumn === j ? <StatusCell value={cell} /> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
