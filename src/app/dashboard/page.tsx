"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ClipboardList,
  Crown,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { MetricCard, SurveyCard, WalletCard } from "@/components/Cards";
import { EmptyState } from "@/components/EmptyState";
import { DashboardShell, DashboardSkeleton, QuickAction } from "@/components/layout/DashboardShell";
import { StaggerList, StaggerItem } from "@/components/motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Survey } from "@/types";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/surveys", label: "Surveys" },
  { href: "/wallet", label: "Wallet" },
  { href: "/verification", label: "Verification" },
  { href: "/settings", label: "Settings" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function RespondentDashboard() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

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
    enabled: !!user?.ninVerified,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    else if (user && !user.ninVerified) router.push("/onboarding/verify-nin");
    else if (user?.role === "researcher") router.push("/researcher/dashboard");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <DashboardShell nav={nav} logoHref="/dashboard" title="Dashboard">
        <DashboardSkeleton />
      </DashboardShell>
    );
  }

  const firstName = user.name?.split(" ")[0] || "there";
  const recentEarnings = dashboard?.recentEarnings || [];

  return (
    <DashboardShell
      nav={nav}
      logoHref="/dashboard"
      title={`${getGreeting()}, ${firstName} 👋`}
      subtitle={
        dashboard?.isPremium
          ? "Premium member — higher-paying surveys unlocked"
          : "Complete liveness verification to unlock premium surveys"
      }
      userEmail={user.email}
    >
      {loadingDash ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Quick actions — mobile first */}
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
              <QuickAction
                href="/verification"
                icon={Crown}
                label="Go Premium"
                color="amber"
              />
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
              trend="+12 this week"
              index={1}
            />
            <MetricCard
              title="Completed"
              value={dashboard?.completedSurveys || 0}
              subtitle="Total submissions"
              icon={TrendingUp}
              index={2}
            />
            <MetricCard
              title="Premium Status"
              value={dashboard?.isPremium ? "Active" : "Standard"}
              subtitle={
                dashboard?.isPremium ? "All tiers unlocked" : "Verify to upgrade"
              }
              icon={Crown}
              className={dashboard?.isPremium ? "border-amber-200 bg-amber-50/30" : ""}
              index={3}
            />
          </div>

          {/* Recent earnings */}
          {recentEarnings.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card mt-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Earnings</h2>
                <Link href="/wallet" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {recentEarnings.map(
                  (t: { _id: string; description: string; amount: number; createdAt: string }) => (
                    <motion.div
                      key={t._id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
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
                    locked={s.targetAudience === "PREMIUM_ONLY" && !user.livenessVerified}
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
