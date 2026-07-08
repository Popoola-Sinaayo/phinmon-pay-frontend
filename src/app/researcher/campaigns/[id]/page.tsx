"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Download, Pencil, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CampaignStatusBadge } from "@/components/Badges";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SurveyBuilder } from "@/components/SurveyBuilder";
import { SurveyPaymentStatusPanel } from "@/components/researcher/SurveyPaymentStatusPanel";
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

  const canEdit = survey?.status === "DRAFT" || survey?.status === "PENDING_PAYMENT";
  const questionsLocked = survey?.status === "PENDING_PAYMENT";

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
      actions={
        canEdit ? (
          <Link
            href={`/researcher/campaigns/new?resume=${id}`}
            className="btn-primary text-sm"
          >
            <Pencil className="h-4 w-4" />
            {survey?.status === "PENDING_PAYMENT" ? "Edit & pay" : "Continue setup"}
          </Link>
        ) : undefined
      }
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

            {survey.status === "PENDING_PAYMENT" && (
              <div className="mt-4 space-y-3">
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Payment incomplete. If you already paid on Paystack, confirm your transaction
                  below. Otherwise continue setup to complete payment.
                </p>
                <SurveyPaymentStatusPanel
                  surveyId={survey._id}
                  onSuccess={() => window.location.reload()}
                  onRetryPaystack={async () => {
                    const { data } = await api.post<{ authorizationUrl?: string }>(
                      `/surveys/${survey._id}/launch`,
                      {}
                    );
                    if (data.authorizationUrl) {
                      window.location.href = data.authorizationUrl;
                    }
                  }}
                />
              </div>
            )}

            {survey.status === "DRAFT" && (
              <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                This campaign is saved as a draft. Continue setup to finish and launch.
              </p>
            )}

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

          <div className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Questions ({survey.questions.length})
              </h2>
              {questionsLocked && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  Locked
                </span>
              )}
            </div>
            {survey.questions.length > 0 ? (
              <SurveyBuilder
                questions={survey.questions}
                onChange={() => {}}
                readOnly
              />
            ) : (
              <p className="text-sm text-gray-500">No questions added yet.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {survey.status === "ACTIVE" && (
              <Link href={`/researcher/campaigns/${id}/responses`} className="btn-primary">
                <Users className="h-4 w-4" /> View Responses
              </Link>
            )}
            {canEdit && (
              <Link href={`/researcher/campaigns/new?resume=${id}`} className="btn-secondary">
                <Pencil className="h-4 w-4" />
                {survey.status === "PENDING_PAYMENT" ? "Edit & complete payment" : "Continue setup"}
              </Link>
            )}
            {survey.status === "ACTIVE" && (
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
            )}
          </div>
        </motion.div>
      )}
    </DashboardShell>
  );
}
