"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, HelpCircle, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { PremiumBadge } from "@/components/Badges";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MotionButton } from "@/components/motion";
import { formatCurrency, getEstimatedMinutes } from "@/lib/utils";
import { canTakeSurvey } from "@/lib/verification";
import type { Survey } from "@/types";

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useRequireAuth("respondent");

  const { data: survey, isLoading: loadingSurvey } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const { data } = await api.get<{ survey: Survey }>(`/surveys/${id}`);
      return data.survey;
    },
    enabled: !!id && !!user,
  });

  const access = user && survey ? canTakeSurvey(survey, user) : { allowed: true };

  return (
    <DashboardShell
      user={user}
      title={survey?.title || "Survey"}
      subtitle={survey?.description}
      loading={isLoading || loadingSurvey}
      backHref="/surveys"
      breadcrumbs={[
        { label: "Surveys", href: "/surveys" },
        { label: survey?.title || "Detail" },
      ]}
      maxWidth="narrow"
    >
      {survey && user && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
                {formatCurrency(survey.payoutPerResponse)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                <Clock className="h-3 w-3" /> ~{getEstimatedMinutes(survey)} min
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                <HelpCircle className="h-3 w-3" /> {survey.questions.length} questions
              </span>
            </div>
            {survey.targetAudience === "PREMIUM_ONLY" && <PremiumBadge />}
          </div>

          <div className="mt-6 grid gap-4 rounded-xl bg-gray-50/80 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Audience</p>
              <p className="mt-1 font-medium capitalize text-gray-900">
                {survey.targetAudience.replace(/_/g, " ").toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Category</p>
              <p className="mt-1 font-medium text-gray-900">{survey.category || "General"}</p>
            </div>
          </div>

          {!access.allowed && access.reason === "nin" && (
            <div className="mt-8 rounded-xl border border-secondary-100 bg-secondary-50/60 p-4">
              <div className="flex gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-secondary-600" />
                <div>
                  <p className="font-semibold text-gray-900">NIN verification required</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Verify your identity with your NIN before taking this survey.
                  </p>
                  <MotionButton
                    className="btn-primary mt-4"
                    onClick={() => router.push("/verification?step=nin")}
                  >
                    Verify NIN to continue
                  </MotionButton>
                </div>
              </div>
            </div>
          )}

          {!access.allowed && access.reason === "liveness" && (
            <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-gray-900">Premium liveness check required</p>
                  <p className="mt-1 text-sm text-gray-600">
                    This is a premium survey. Complete a quick liveness verification to access it.
                  </p>
                  <MotionButton
                    className="btn-primary mt-4"
                    onClick={() => router.push("/verification?step=liveness")}
                  >
                    Complete liveness check
                  </MotionButton>
                </div>
              </div>
            </div>
          )}

          {access.allowed && (
            <Link
              href={`/surveys/${id}/take`}
              className="btn-primary mt-8 inline-flex w-full justify-center sm:w-auto"
            >
              Start Survey →
            </Link>
          )}
        </motion.div>
      )}
    </DashboardShell>
  );
}
