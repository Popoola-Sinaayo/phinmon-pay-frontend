export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>
          Question {current} of {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
