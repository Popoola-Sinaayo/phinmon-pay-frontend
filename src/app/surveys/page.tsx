"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { SurveyCard } from "@/components/Cards";
import { EmptyState } from "@/components/EmptyState";
import { DashboardShell, DashboardSkeleton } from "@/components/layout/DashboardShell";
import { StaggerList, StaggerItem } from "@/components/motion";
import type { Survey } from "@/types";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/surveys", label: "Surveys" },
  { href: "/wallet", label: "Wallet" },
  { href: "/verification", label: "Verification" },
  { href: "/settings", label: "Settings" },
];

const filters = [
  { key: "", label: "Available" },
  { key: "premium", label: "Premium" },
  { key: "highest_paying", label: "Highest Paying" },
  { key: "newest", label: "Newest" },
];

function SurveysContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const { data: user, isLoading } = useAuth();

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

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    else if (user && !user.ninVerified) router.push("/onboarding/verify-nin");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <DashboardShell nav={nav} logoHref="/dashboard" title="Surveys">
        <DashboardSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      nav={nav}
      logoHref="/dashboard"
      title="Surveys"
      subtitle="Find paid research opportunities matched to your profile"
      userEmail={user?.email}
    >
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/surveys?filter=${f.key}` : "/surveys"}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-primary-600 text-white shadow-glow"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-primary-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {loadingSurveys ? (
        <DashboardSkeleton />
      ) : surveys?.length ? (
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
    </DashboardShell>
  );
}

export default function SurveysPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SurveysContent />
    </Suspense>
  );
}
