"use client";

export function CustomEmailPreview({
  headline,
  subject,
  message,
  ctaLabel,
}: {
  headline: string;
  subject: string;
  message: string;
  ctaLabel: string;
}) {
  const displayHeadline = headline.trim() || subject.trim() || "Your headline";
  const paragraphs = (message.trim() || "Your message runs full width with a single padding layer — no nested box.")
    .split(/\n\n+/)
    .filter(Boolean);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-subtle">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Live preview</p>
        <p className="mt-1 truncate text-sm text-ink-700">
          Subject: <span className="font-medium">{subject.trim() || "—"}</span>
        </p>
      </div>
      {/* Mirrors edge-to-edge email: no outer margin, no nested card */}
      <div className="w-full overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-7 py-9">
          <p className="text-xs font-bold uppercase tracking-wider text-white/85">Phinmon</p>
          <h3 className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight text-white">
            {displayHeadline}
          </h3>
        </div>
        <div className="px-7 py-8">
          <p className="text-[17px] text-ink-500">Hi there,</p>
          <div className="mt-6 space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[17px] leading-7 text-ink-900">
                {p.split("\n").map((line, j) => (
                  <span key={j}>
                    {j > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            ))}
          </div>
          <div className="mt-8">
            <span className="block w-full rounded-xl bg-primary-600 py-4 text-center text-lg font-bold text-white">
              {ctaLabel.trim() || "Open Phinmon"}
            </span>
          </div>
          <div className="mt-9 border-t border-gray-100 pt-6">
            <p className="text-[15px] font-bold text-ink-900">The Phinmon team</p>
            <p className="mt-1 text-sm text-ink-500">Nigeria&apos;s verified insights marketplace</p>
          </div>
        </div>
        <div className="bg-[#f4f6f2] px-7 py-6 text-center text-xs text-ink-500">
          Footer note appears here in the actual email.
        </div>
      </div>
    </div>
  );
}
