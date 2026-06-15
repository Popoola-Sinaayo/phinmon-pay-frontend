"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import type { Survey } from "@/types";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: survey, isLoading } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => (await api.get<{ survey: Survey }>(`/surveys/${id}`)).data.survey,
    enabled: !!id,
  });

  if (isLoading) return <div className="p-16 text-center">Loading...</div>;
  if (!survey) return <div className="p-16 text-center">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/researcher/dashboard" />
      <div className="mx-auto max-w-form px-4 py-8">
        <Link href="/researcher/campaigns" className="text-sm text-primary-600">← Campaigns</Link>
        <div className="card mt-4">
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          <p className="mt-2 text-gray-600">{survey.description}</p>
          <div className="mt-4 grid gap-2 text-sm">
            <p>Status: <strong>{survey.status}</strong></p>
            <p>Responses: {survey.responsesReceived}/{survey.responsesNeeded}</p>
            <p>Total cost: {formatCurrency(survey.totalCost)}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href={`/researcher/campaigns/${id}/responses`} className="btn-primary">
              View Responses
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/surveys/${id}/export`}
              className="btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                window.open(`${process.env.NEXT_PUBLIC_API_URL}/surveys/${id}/export`, "_blank");
              }}
            >
              Export CSV
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
