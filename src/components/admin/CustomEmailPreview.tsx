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
  const paragraphs = (message.trim() || "Your message will appear here in a spacious, easy-to-read card.")
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
      <div className="p-4 sm:p-5">
        <div className="mx-auto w-full max-w-[640px] overflow-hidden rounded-[20px] border border-[#e8ebe6] bg-white shadow-[0_4px_24px_rgba(16,122,76,0.08)]">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-8 py-10 sm:px-12 sm:py-12">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-white/85">Phinmon</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-white/75">
              Message for you
            </p>
            <h3 className="mt-3 text-[32px] font-extrabold leading-[1.2] tracking-tight text-white sm:text-4xl">
              {displayHeadline}
            </h3>
          </div>
          <div className="px-8 py-10 sm:px-12 sm:py-11">
            <p className="text-lg text-ink-500">Hi there,</p>
            <div className="mt-7 rounded-2xl border border-[#dceee3] border-l-[5px] border-l-primary-500 bg-[#f8fbf9] px-8 py-8 sm:px-9 sm:py-9">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={cn(
                    "text-lg leading-8 text-ink-900",
                    i > 0 && "mt-5"
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
            <div className="mt-10 text-center">
              <span className="inline-block min-w-[200px] rounded-[14px] bg-primary-600 px-12 py-4 text-lg font-bold text-white">
                {ctaLabel.trim() || "Open Phinmon"}
              </span>
            </div>
            <div className="mt-11 border-t border-gray-100 pt-7">
              <p className="text-base font-bold text-ink-900">The Phinmon team</p>
              <p className="mt-1 text-[15px] leading-6 text-ink-500">
                Nigeria&apos;s verified insights marketplace
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
