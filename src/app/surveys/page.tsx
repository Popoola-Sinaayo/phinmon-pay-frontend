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
import { getSurveyLockReason } from "@/lib/verification";
import { usePlatformFeatures } from "@/lib/platformFeatures";
import type { Survey } from "@/types";

const filters = [
  { key: "", label: "Available" },
  { key: "premium", label: "Premium", requiresPremium: true },
  { key: "highest_paying", label: "Highest Paying" },
  { key: "newest", label: "Newest" },
];

function SurveysContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const { user, isLoading } = useRequireAuth("respondent");
  const platformFeatures = usePlatformFeatures();

  const { data: surveys, isLoading: loadingSurveys } = useQuery({
    queryKey: ["surveys", filter],
    queryFn: async () => {
      const { data } = await api.get<{ surveys: Survey[] }>("/surveys/available", {
        params: filter ? { filter } : {},
      });
      return data.surveys;
    },
    enabled: !!user,
  });

  return (
    <DashboardShell
      user={user}
      title="Tasks"
      subtitle="Find paid research tasks matched to your profile"
      loading={isLoading || loadingSurveys}
    >
      {!loadingSurveys && (
        <>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {filters.map((f) => {
              const isComingSoon = f.requiresPremium && platformFeatures.premiumLivenessComingSoon;
              return (
              <Link
                key={f.key}
                href={isComingSoon ? "/surveys" : f.key ? `/surveys?filter=${f.key}` : "/surveys"}
                aria-disabled={isComingSoon}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  isComingSoon
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 ring-1 ring-gray-200"
                    : filter === f.key
                    ? "bg-gray-900 text-white shadow-subtle"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
                )}
              >
                {f.label}
                {isComingSoon && " (soon)"}
              </Link>
            );
            })}
          </div>

          {surveys?.length ? (
            <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {surveys.map((s, i) => (
                <StaggerItem key={s._id}>
                  <SurveyCard
                    survey={s}
                    href={`/surveys/${s._id}`}
                    lockReason={user ? getSurveyLockReason(s, user) : null}
                    index={i}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <EmptyState
              title="No tasks found"
              description="Try a different filter or check back later for new projects."
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
        <DashboardShell title="Tasks" loading>
          <DashboardSkeleton />
        </DashboardShell>
      }
    >
      <SurveysContent />
    </Suspense>
  );
}
