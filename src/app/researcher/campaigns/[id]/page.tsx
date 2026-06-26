"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Download, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CampaignStatusBadge } from "@/components/Badges";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatCurrency, getEstimatedMinutes } from "@/lib/utils";
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
          <div className="card">
            <div className="flex flex-wrap items-center gap-2">
              <CampaignStatusBadge status={survey.status} />
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total cost</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {formatCurrency(survey.totalCost || 0)}
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
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Est. time
                </p>
                <p className="mt-1 flex items-center gap-1 text-xl font-bold text-gray-900">
                  <Clock className="h-4 w-4 text-gray-400" />
                  ~{getEstimatedMinutes(survey)} min
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
