"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { DataTable } from "@/components/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CampaignResponsesPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["campaign-responses", id],
    queryFn: async () => (await api.get(`/responses/surveys/${id}/responses`)).data,
    enabled: !!id,
  });

  if (isLoading) return <div className="p-16 text-center">Loading...</div>;

  const responses = data?.responses || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/researcher/dashboard" />
      <div className="mx-auto max-w-dashboard px-4 py-8">
        <Link href={`/researcher/campaigns/${id}`} className="text-sm text-primary-600">← Campaign</Link>
        <h1 className="mt-4 text-2xl font-bold">Responses</h1>
        <p className="text-sm text-gray-500">
          {data?.completionPercent || 0}% complete · {responses.length} responses
        </p>
        <div className="mt-6">
          <DataTable
            headers={["Date", "User", "Status", "Reward"]}
            rows={responses.map((r: { createdAt: string; userId: { name?: string; email?: string }; status: string; rewardAmount: number }) => [
              formatDate(r.createdAt),
              r.userId?.name || r.userId?.email || "—",
              r.status,
              formatCurrency(r.rewardAmount),
            ])}
          />
        </div>
      </div>
    </div>
  );
}
