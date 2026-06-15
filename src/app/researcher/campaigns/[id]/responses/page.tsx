"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ResponseDetailDrawer } from "@/components/researcher/ResponseDetailDrawer";
import { ResponseList } from "@/components/researcher/ResponseList";
import { ResponseSummary } from "@/components/researcher/ResponseSummary";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { SurveyResponseRecord } from "@/lib/responseAnalytics";
import type { Survey } from "@/types";

export default function CampaignResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useRequireAuth("researcher");
  const [selected, setSelected] = useState<SurveyResponseRecord | null>(null);

  const { data, isLoading: loadingResponses } = useQuery({
    queryKey: ["campaign-responses", id],
    queryFn: async () => (await api.get(`/responses/surveys/${id}/responses`)).data,
    enabled: !!id && !!user,
  });

  const survey = data?.survey as Survey | undefined;
  const responses = (data?.responses || []) as SurveyResponseRecord[];

  return (
    <DashboardShell
      user={user}
      title="Responses"
      subtitle={
        survey
          ? `${survey.title} · ${data?.completionPercent || 0}% complete`
          : "Loading campaign data..."
      }
      loading={isLoading || loadingResponses}
      backHref={`/researcher/campaigns/${id}`}
      breadcrumbs={[
        { label: "Campaigns", href: "/researcher/campaigns" },
        { label: survey?.title || "Campaign", href: `/researcher/campaigns/${id}` },
        { label: "Responses" },
      ]}
    >
      {survey && !loadingResponses && (
        <div className="space-y-8">
          <ResponseSummary survey={survey} responses={responses} />
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Individual responses</h2>
            <ResponseList responses={responses} onSelect={setSelected} />
          </section>
        </div>
      )}

      {survey && (
        <ResponseDetailDrawer
          response={selected}
          survey={survey}
          surveyId={id}
          onClose={() => setSelected(null)}
        />
      )}
    </DashboardShell>
  );
}
