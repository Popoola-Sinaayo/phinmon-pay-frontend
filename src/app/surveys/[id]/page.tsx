"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { PremiumBadge } from "@/components/Badges";
import type { Survey } from "@/types";

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  const { data: survey, isLoading: loadingSurvey } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const { data } = await api.get<{ survey: Survey }>(`/surveys/${id}`);
      return data.survey;
    },
    enabled: !!id && !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const locked = survey?.targetAudience === "PREMIUM_ONLY" && !user?.livenessVerified;

  if (isLoading || loadingSurvey) return <div className="p-16 text-center">Loading...</div>;
  if (!survey) return <div className="p-16 text-center">Survey not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/dashboard" />
      <div className="mx-auto max-w-survey px-4 py-8">
        <Link href="/surveys" className="text-sm text-primary-600 hover:underline">
          ← Back to surveys
        </Link>
        <div className="card mt-4">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            {survey.targetAudience === "PREMIUM_ONLY" && <PremiumBadge />}
          </div>
          <p className="mt-4 text-gray-600">{survey.description}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Reward</p>
              <p className="text-xl font-bold text-primary-600">{formatCurrency(survey.payoutPerResponse)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Time</p>
              <p className="font-medium">~{survey.estimatedMinutes || 10} minutes</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Questions</p>
              <p className="font-medium">{survey.questions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Audience</p>
              <p className="font-medium capitalize">{survey.targetAudience.replace("_", " ").toLowerCase()}</p>
            </div>
          </div>
          {locked ? (
            <Link href="/verification" className="btn-secondary mt-8 inline-flex">
              Unlock Premium Access
            </Link>
          ) : (
            <Link href={`/surveys/${id}/take`} className="btn-primary mt-8 inline-flex">
              Start Survey
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
