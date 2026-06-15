"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { Survey } from "@/types";

const nav = [
  { href: "/researcher/dashboard", label: "Dashboard" },
  { href: "/researcher/campaigns", label: "Campaigns" },
  { href: "/researcher/campaigns/new", label: "Create Survey" },
  { href: "/researcher/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

export default function CampaignsPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  const { data: surveys } = useQuery({
    queryKey: ["my-surveys"],
    queryFn: async () => {
      const { data } = await api.get<{ surveys: Survey[] }>("/surveys/mine");
      return data.surveys;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading) return <div className="p-16 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/researcher/dashboard" />
      <div className="mx-auto flex max-w-dashboard">
        <Sidebar items={nav} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <Link href="/researcher/campaigns/new" className="btn-primary">New Campaign</Link>
          </div>
          {surveys?.length ? (
            <div className="mt-6 space-y-4">
              {surveys.map((s) => (
                <div key={s._id} className="card flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-gray-500">
                      {s.responsesReceived}/{s.responsesNeeded} responses · {s.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-primary-600">{formatCurrency(s.totalCost)}</span>
                    <Link href={`/researcher/campaigns/${s._id}`} className="btn-secondary text-sm">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No campaigns yet"
                description="Create your first research campaign to start collecting insights."
                actionLabel="Create Campaign"
                actionHref="/researcher/campaigns/new"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
