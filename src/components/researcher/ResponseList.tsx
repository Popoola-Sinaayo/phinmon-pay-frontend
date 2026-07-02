"use client";

import { ChevronRight } from "lucide-react";
import { ResponseStatusBadge } from "@/components/Badges";
import { type SurveyResponseRecord } from "@/lib/responseAnalytics";
import { formatCurrency, formatDate } from "@/lib/utils";

export function ResponseList({
  responses,
  onSelect,
}: {
  responses: SurveyResponseRecord[];
  onSelect: (response: SurveyResponseRecord) => void;
}) {
  if (!responses.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center">
        <p className="text-sm text-gray-500">No responses yet. Share your campaign to start collecting data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-subtle">
      <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          All responses · click to view details
        </p>
      </div>
      <ul className="divide-y divide-gray-50">
        {responses.map((r) => (
          <li key={r._id}>
            <button
              type="button"
              onClick={() => onSelect(r)}
              className="group flex w-full items-center gap-3 px-3 py-4 text-left transition hover:bg-primary-50/40 sm:gap-4 sm:px-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-700">
                {(r.userId?.name || r.userId?.email || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">
                  {r.userId?.name || r.userId?.email || "Anonymous"}
                </p>
                <p className="text-xs text-gray-500">{formatDate(r.createdAt)}</p>
              </div>
              <ResponseStatusBadge status={r.status} spamSuspected={r.spamSuspected} />
              <span className="hidden shrink-0 font-semibold text-primary-600 sm:inline">
                {formatCurrency(r.rewardAmount)}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-primary-500" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
