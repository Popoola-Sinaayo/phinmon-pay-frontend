"use client";

import { cn } from "@/lib/utils";

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
  const paragraphs = (message.trim() || "Your message will appear here in a highlighted card with beautiful typography.")
    .split(/\n\n+/)
    .filter(Boolean);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#f4f6f2] shadow-subtle">
      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Live preview</p>
        <p className="mt-1 truncate text-sm text-ink-700">
          Subject: <span className="font-medium">{subject.trim() || "—"}</span>
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-[#e8ebe6] bg-white shadow-[0_4px_24px_rgba(16,122,76,0.08)]">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">
              Message from Phinmon
            </p>
            <h3 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-white">
              {displayHeadline}
            </h3>
          </div>
          <div className="px-6 py-6">
            <p className="text-sm text-ink-500">Hi there,</p>
            <div className="mt-4 rounded-xl border border-[#dceee3] border-l-4 border-l-primary-500 bg-[#f8fbf9] px-5 py-4">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={cn(
                    "text-[15px] leading-7 text-ink-900",
                    i > 0 && "mt-4"
                  )}
                >
                  {p.split("\n").map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </div>
            <div className="mt-6 text-center">
              <span className="inline-block rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(16,122,76,0.28)]">
                {ctaLabel.trim() || "Open Phinmon"}
              </span>
            </div>
            <div className="mt-8 border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-ink-900">The Phinmon team</p>
              <p className="mt-0.5 text-xs text-ink-500">Nigeria&apos;s verified insights marketplace</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
