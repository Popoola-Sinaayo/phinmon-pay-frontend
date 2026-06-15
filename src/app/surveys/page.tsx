"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { SurveyCard } from "@/components/Cards";
import { EmptyState } from "@/components/EmptyState";
import { DashboardShell, DashboardSkeleton } from "@/components/layout/DashboardShell";
import { StaggerList, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { Survey } from "@/types";

const filters = [
  { key: "", label: "Available" },
  { key: "premium", label: "Premium" },
  { key: "highest_paying", label: "Highest Paying" },
  { key: "newest", label: "Newest" },
];

function SurveysContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const { user, isLoading } = useRequireAuth("respondent", { requireNin: true });

  const { data: surveys, isLoading: loadingSurveys } = useQuery({
    queryKey: ["surveys", filter],
    queryFn: async () => {
      const { data } = await api.get<{ surveys: Survey[] }>("/surveys/available", {
        params: filter ? { filter } : {},
      });
      return data.surveys;
    },
    enabled: !!user?.ninVerified,
  });

  return (
    <DashboardShell
      user={user}
      title="Surveys"
      subtitle="Find paid research opportunities matched to your profile"
      loading={isLoading || loadingSurveys}
    >
      {!loadingSurveys && (
        <>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <Link
                key={f.key}
                href={f.key ? `/surveys?filter=${f.key}` : "/surveys"}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  filter === f.key
                    ? "bg-gray-900 text-white shadow-subtle"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>

          {surveys?.length ? (
            <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {surveys.map((s, i) => (
                <StaggerItem key={s._id}>
                  <SurveyCard
                    survey={s}
                    href={`/surveys/${s._id}`}
                    locked={s.targetAudience === "PREMIUM_ONLY" && !user?.livenessVerified}
                    index={i}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <EmptyState
              title="No surveys found"
              description="Try a different filter or check back later for new campaigns."
            />
          )}
        </>
      )}
    </DashboardShell>
  );
}

export default function SurveysPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell title="Surveys" loading>
          <DashboardSkeleton />
        </DashboardShell>
      }
    >
      <SurveysContent />
    </Suspense>
  );
}
