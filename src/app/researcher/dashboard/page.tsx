"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, ClipboardList, Plus, Target, TrendingUp, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { MetricCard } from "@/components/Cards";
import { DashboardShell, DashboardSkeleton } from "@/components/layout/DashboardShell";
import { formatCurrency } from "@/lib/utils";

const nav = [
  { href: "/researcher/dashboard", label: "Dashboard" },
  { href: "/researcher/campaigns", label: "Campaigns" },
  { href: "/researcher/campaigns/new", label: "Create Survey" },
  { href: "/researcher/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

export default function ResearcherDashboard() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ["researcher-dashboard"],
    queryFn: async () => (await api.get("/surveys/dashboard")).data.dashboard,
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    else if (user && user.role === "respondent") router.push("/dashboard");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <DashboardShell nav={nav} logoHref="/researcher/dashboard" title="Research Hub">
        <DashboardSkeleton />
      </DashboardShell>
    );
  }

  const maxCount = Math.max(
    ...(dashboard?.dailyResponses || []).map((d: { count: number }) => d.count),
    1
  );

  return (
    <DashboardShell
      nav={nav}
      logoHref="/researcher/dashboard"
      title="Research Hub"
      subtitle="Track campaigns, response quality, and spend in real time"
      userEmail={user.email}
      actions={
        <Link href="/researcher/campaigns/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New Campaign
        </Link>
      }
    >
      {loadingDash ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Campaigns"
              value={dashboard?.totalCampaigns || 0}
              icon={ClipboardList}
              index={0}
            />
            <MetricCard
              title="Active Now"
              value={dashboard?.activeCampaigns || 0}
              subtitle="Collecting responses"
              icon={Target}
              trend="Live"
              index={1}
            />
            <MetricCard
              title="Responses"
              value={dashboard?.responsesReceived || 0}
              icon={TrendingUp}
              index={2}
            />
            <MetricCard
              title="Total Spend"
              value={formatCurrency(dashboard?.fundsSpent || 0)}
              icon={Wallet}
              index={3}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card lg:col-span-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Response Activity</h2>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-50">
                  <BarChart3 className="h-5 w-5 text-secondary-600" />
                </div>
              </div>
              <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
                {(dashboard?.dailyResponses || []).map(
                  (d: { date: string; count: number }, i: number) => (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                      <motion.div
                        className="w-full rounded-t-lg bg-gradient-to-t from-secondary-600 to-secondary-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max((d.count / maxCount) * 100, 4)}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                      <span className="text-[10px] font-medium text-gray-500 sm:text-xs">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </motion.div>

            {/* Completion rate */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card flex flex-col items-center justify-center text-center"
            >
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(dashboard?.completionRate || 0) * 2.64} 264`}
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{
                      strokeDasharray: `${(dashboard?.completionRate || 0) * 2.64} 264`,
                    }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-gray-900">
                  {dashboard?.completionRate || 0}%
                </span>
              </div>
              <p className="mt-4 font-semibold text-gray-900">Completion Rate</p>
              <p className="text-sm text-gray-500">Across all campaigns</p>
              <Link
                href="/researcher/campaigns"
                className="mt-4 text-sm font-medium text-primary-600 hover:underline"
              >
                View campaigns →
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
