"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Crown, ShieldCheck, Users, Wallet } from "lucide-react";
import {
  computeQuestionInsights,
  computeResponseSummary,
  type SurveyResponseRecord,
} from "@/lib/responseAnalytics";
import { formatCurrency } from "@/lib/utils";
import type { Survey } from "@/types";
import { cn } from "@/lib/utils";

export function ResponseSummary({
  survey,
  responses,
}: {
  survey: Survey;
  responses: SurveyResponseRecord[];
}) {
  const summary = computeResponseSummary(survey, responses);
  const insights = computeQuestionInsights(survey, responses);

  const statCards = [
    {
      label: "Collected",
      value: `${summary.received}/${summary.needed}`,
      sub: `${summary.completionPercent}% complete`,
      icon: Users,
      color: "text-primary-600 bg-primary-50",
    },
    {
      label: "Approved",
      value: summary.statusCounts.APPROVED,
      sub: formatCurrency(summary.approvedRewards),
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Pending review",
      value: summary.statusCounts.PENDING,
      sub: formatCurrency(summary.pendingRewards),
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Per response",
      value: formatCurrency(summary.payoutPerResponse),
      sub: `${summary.verifiedCount} NIN verified`,
      icon: Wallet,
      color: "text-secondary-600 bg-secondary-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-subtle"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{card.sub}</p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.color)}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          <ShieldCheck className="h-3.5 w-3.5 text-primary-500" />
          {summary.verifiedCount} NIN verified
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <Crown className="h-3.5 w-3.5" />
          {summary.premiumCount} premium respondents
        </span>
        {summary.statusCounts.REJECTED > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-error-500/10 px-3 py-1 text-xs font-semibold text-error-600">
            {summary.statusCounts.REJECTED} rejected
          </span>
        )}
      </div>

      {insights.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-gray-100 bg-white p-5 shadow-subtle"
        >
          <h2 className="font-semibold text-gray-900">Response insights</h2>
          <p className="mt-1 text-sm text-gray-500">
            Aggregated patterns across {responses.length} submissions
          </p>
          <div className="mt-5 space-y-5">
            {insights.map((insight) => (
              <div key={insight.questionId} className="rounded-xl bg-gray-50/80 p-4">
                <p className="text-sm font-medium text-gray-900">{insight.questionText}</p>
                {"distribution" in insight ? (
                  <div className="mt-3 space-y-2">
                    {insight.distribution.map((d) => (
                      <div key={d.label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium text-gray-700">{d.label}</span>
                          <span className="text-gray-500">
                            {d.count} ({d.percent}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-primary-500 transition-all"
                            style={{ width: `${d.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">
                    Average: <strong>{insight.average}</strong> · {insight.count} responses
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
