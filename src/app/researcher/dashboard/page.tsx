"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CampaignRow, MetricCard } from "@/components/Cards";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StaggerItem, StaggerList } from "@/components/motion";
import { formatCurrency } from "@/lib/utils";
import type { Survey } from "@/types";

export default function ResearcherDashboard() {
  const { user, isLoading } = useRequireAuth("researcher");

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ["researcher-dashboard"],
    queryFn: async () => (await api.get("/surveys/dashboard")).data.dashboard,
    enabled: !!user,
  });

  const { data: recentCampaigns } = useQuery({
    queryKey: ["my-surveys-recent"],
    queryFn: async () => {
      const { data } = await api.get<{ surveys: Survey[] }>("/surveys/mine");
      return data.surveys.slice(0, 3);
    },
    enabled: !!user,
  });

  const maxCount = Math.max(
    ...(dashboard?.dailyResponses || []).map((d: { count: number }) => d.count),
    1
  );

  const firstName = user?.name?.split(" ")[0] || "Researcher";

  return (
    <DashboardShell
      user={user}
      title={`Welcome back, ${firstName}`}
      subtitle="Track campaigns, response quality, and spend in real time"
      loading={isLoading || loadingDash}
      actions={
        <Link href="/researcher/campaigns/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New Campaign
        </Link>
      }
    >
      {!loadingDash && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 p-6 text-white shadow-card"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-500/20 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-primary-200">
                  <Sparkles className="h-4 w-4" /> Research Hub
                </p>
                <p className="mt-2 text-xl font-bold sm:text-2xl">
                  {dashboard?.activeCampaigns || 0} active campaign
                  {(dashboard?.activeCampaigns || 0) !== 1 ? "s" : ""} collecting data
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  {dashboard?.responsesReceived || 0} total responses ·{" "}
                  {dashboard?.completionRate || 0}% avg completion
                </p>
              </div>
              <Link
                href="/researcher/campaigns"
                className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
              >
                View all campaigns <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Campaigns"
              value={dashboard?.totalCampaigns || 0}
              icon={ClipboardList}
              iconColor="primary"
              index={0}
            />
            <MetricCard
              title="Active Now"
              value={dashboard?.activeCampaigns || 0}
              subtitle="Collecting responses"
              icon={Target}
              iconColor="secondary"
              trend="Live"
              index={1}
            />
            <MetricCard
              title="Responses"
              value={dashboard?.responsesReceived || 0}
              icon={TrendingUp}
              iconColor="primary"
              index={2}
            />
            <MetricCard
              title="Total Spend"
              value={formatCurrency(dashboard?.fundsSpent || 0)}
              icon={Wallet}
              iconColor="secondary"
              index={3}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100">
                  <BarChart3 className="h-5 w-5 text-secondary-600" />
                </div>
              </div>
              <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
                {(dashboard?.dailyResponses || []).map(
                  (d: { date: string; count: number }, i: number) => (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                      <motion.div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary-700 to-primary-400"
                        initial={{ height: 0 }}
                        animate={{
                          height: `${Math.max((d.count / maxCount) * 100, 4)}%`,
                        }}
                        transition={{
                          delay: 0.3 + i * 0.05,
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                      <span className="text-[10px] font-medium text-gray-500 sm:text-xs">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </motion.div>

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
                    stroke="#7b61ff"
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
            </motion.div>
          </div>

          {recentCampaigns && recentCampaigns.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                <Link
                  href="/researcher/campaigns"
                  className="text-sm font-medium text-primary-600 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <StaggerList className="space-y-3">
                {recentCampaigns.map((s, i) => (
                  <StaggerItem key={s._id}>
                    <CampaignRow survey={s} index={i} />
                  </StaggerItem>
                ))}
              </StaggerList>
            </section>
          )}
        </>
      )}
    </DashboardShell>
  );
}
