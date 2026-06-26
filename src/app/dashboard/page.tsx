"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ClipboardList,
  Crown,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { MetricCard, SurveyCard, WalletCard } from "@/components/Cards";
import { EmptyState } from "@/components/EmptyState";
import { DashboardShell, QuickAction } from "@/components/layout/DashboardShell";
import { StaggerList, StaggerItem } from "@/components/motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getSurveyLockReason } from "@/lib/verification";
import type { Survey } from "@/types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function RespondentDashboard() {
  const { user, isLoading } = useRequireAuth("respondent");

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ["respondent-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/wallet/dashboard");
      return data.dashboard;
    },
    enabled: !!user,
  });

  const { data: surveys } = useQuery({
    queryKey: ["available-surveys"],
    queryFn: async () => {
      const { data } = await api.get<{ surveys: Survey[] }>("/surveys/available");
      return data.surveys.slice(0, 3);
    },
    enabled: !!user,
  });

  const firstName = user?.name?.split(" ")[0] || "there";
  const recentEarnings = dashboard?.recentEarnings || [];

  return (
    <DashboardShell
      user={user}
      title={user ? `${getGreeting()}, ${firstName}` : "Dashboard"}
      subtitle={
        dashboard?.isPremium
          ? "Premium member — higher-paying surveys unlocked"
          : "Complete verification to unlock premium surveys and faster payouts"
      }
      loading={isLoading || loadingDash}
    >
      {!loadingDash && user && (
        <>
          {!dashboard?.isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-6 overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 via-white to-amber-50/40 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-primary-700">
                    <Sparkles className="h-4 w-4" /> Boost your earnings
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {user.livenessVerified
                      ? "You're all set — premium surveys unlocked"
                      : user.ninVerified
                        ? "Complete premium verification for 3× higher payouts"
                        : "Verify your NIN to start earning from surveys"}
                  </p>
                </div>
                <Link href="/verification" className="btn-primary shrink-0 self-start">
                  {user.livenessVerified ? "View status" : "Continue verification"}
                </Link>
              </div>
              <div className="mt-4 flex gap-1">
                {[user.ninVerified, user.livenessVerified].map((done, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${done ? "bg-primary-500" : "bg-gray-200"}`}
                  />
                ))}
                <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
              </div>
            </motion.div>
          )}

          <StaggerList className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StaggerItem>
              <QuickAction href="/surveys" icon={ClipboardList} label="Browse Surveys" />
            </StaggerItem>
            <StaggerItem>
              <QuickAction href="/wallet" icon={Wallet} label="My Wallet" color="secondary" />
            </StaggerItem>
            <StaggerItem>
              <QuickAction href="/verification" icon={Shield} label="Verification" />
            </StaggerItem>
            <StaggerItem>
              <QuickAction href="/verification" icon={Crown} label="Go Premium" color="amber" />
            </StaggerItem>
          </StaggerList>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <WalletCard
              available={dashboard?.wallet?.availableBalance || 0}
              pending={dashboard?.wallet?.pendingBalance || 0}
              lifetime={dashboard?.wallet?.lifetimeEarnings || 0}
            />
            <MetricCard
              title="Available Surveys"
              value={dashboard?.availableSurveys || 0}
              subtitle="Ready to complete"
              icon={ClipboardList}
              iconColor="primary"
              trend="+12 this week"
              index={1}
            />
            <MetricCard
              title="Completed"
              value={dashboard?.completedSurveys || 0}
              subtitle="Total submissions"
              icon={TrendingUp}
              iconColor="secondary"
              index={2}
            />
            <MetricCard
              title="Premium Status"
              value={dashboard?.isPremium ? "Active" : "Standard"}
              subtitle={dashboard?.isPremium ? "All tiers unlocked" : "Verify to upgrade"}
              icon={Crown}
              iconColor="amber"
              className={dashboard?.isPremium ? "border-amber-200/80 bg-amber-50/20" : ""}
              index={3}
            />
          </div>

          {recentEarnings.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card mt-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Earnings</h2>
                <Link
                  href="/wallet"
                  className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
                >
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                {recentEarnings.map(
                  (t: { _id: string; description: string; amount: number; createdAt: string }) => (
                    <motion.div
                      key={t._id}
                      className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/80 px-4 py-3"
                      whileHover={{ x: 2 }}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(t.createdAt)}</p>
                      </div>
                      <span className="font-semibold text-primary-600">
                        +{formatCurrency(t.amount)}
                      </span>
                    </motion.div>
                  )
                )}
              </div>
            </motion.section>
          )}

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Top Surveys For You</h2>
              <Link href="/surveys" className="text-sm font-medium text-primary-600 hover:underline">
                View all →
              </Link>
            </div>
            {surveys?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {surveys.map((s, i) => (
                  <SurveyCard
                    key={s._id}
                    survey={s}
                    href={`/surveys/${s._id}`}
                    lockReason={getSurveyLockReason(s, user)}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No surveys available yet"
                description="New campaigns launch daily. Check back soon or enable notifications."
                actionLabel="Browse Surveys"
                actionHref="/surveys"
              />
            )}
          </section>
        </>
      )}
    </DashboardShell>
  );
}
