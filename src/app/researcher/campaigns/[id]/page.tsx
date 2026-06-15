"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Lock, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CampaignStatusBadge } from "@/components/Badges";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import type { Survey } from "@/types";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useRequireAuth("researcher");

  const { data: survey, isLoading: loadingSurvey } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => (await api.get<{ survey: Survey }>(`/surveys/${id}`)).data.survey,
    enabled: !!id && !!user,
  });

  const progress =
    survey?.responsesNeeded && survey?.responsesReceived
      ? Math.min(100, Math.round((survey.responsesReceived / survey.responsesNeeded) * 100))
      : 0;

  return (
    <DashboardShell
      user={user}
      title={survey?.title || "Campaign"}
      subtitle={survey?.description}
      loading={isLoading || loadingSurvey}
      backHref="/researcher/campaigns"
      breadcrumbs={[
        { label: "Campaigns", href: "/researcher/campaigns" },
        { label: survey?.title || "Detail" },
      ]}
      maxWidth="narrow"
    >
      {survey && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {survey.billingLocked && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-gray-900">Campaign billing locked</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {survey.billingLockReason ||
                      "This campaign is paused until billing is resolved."}
                  </p>
                  <Link href="/researcher/billing" className="mt-3 inline-flex btn-primary text-sm">
                    Resolve in Billing
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="flex flex-wrap items-center gap-2">
              <CampaignStatusBadge status={survey.status} />
              {survey.billingModel === "PAYG" && (
                <span className="rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
                  Pay as you go
                </span>
              )}
              <span className="text-sm text-gray-500">
                {survey.responsesReceived}/{survey.responsesNeeded} responses
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {survey.billingModel === "PAYG" ? "Spent / Cap" : "Budget"}
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {survey.billingModel === "PAYG"
                    ? `${formatCurrency(survey.amountSpent || 0)} / ${formatCurrency(survey.spendingCap || survey.totalCost)}`
                    : formatCurrency(survey.totalCost || 0)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Per Response
                </p>
                <p className="mt-1 text-xl font-bold text-primary-600">
                  {formatCurrency(survey.payoutPerResponse)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Audience</p>
                <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                  {survey.targetAudience.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/researcher/campaigns/${id}/responses`} className="btn-primary">
              <Users className="h-4 w-4" /> View Responses
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/surveys/${id}/export`}
              className="btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                window.open(`${process.env.NEXT_PUBLIC_API_URL}/surveys/${id}/export`, "_blank");
              }}
            >
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </div>
        </motion.div>
      )}
    </DashboardShell>
  );
}
