"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Flag, FolderKanban, Mail, Users, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { MetricCard } from "@/components/Cards";
import { DataTable } from "@/components/DataTable";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminInsightsCharts } from "@/components/admin/AdminInsightsCharts";
import { MetricGridSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import type { User } from "@/types";

type AdminStats = {
  users: number;
  surveys: number;
  transactions: number;
  withdrawals: number;
  fraudFlags: number;
  activeSurveys?: number;
  newUsers7d?: number;
  newUsers30d?: number;
  totalEarnings?: number;
  totalWithdrawn?: number;
  verification?: {
    ninVerified: number;
    ninUnverified: number;
    livenessVerified: number;
    pendingVerification: number;
  };
  usersByStatus?: Array<{ label: string; count: number }>;
  usersByRole?: Array<{ label: string; count: number }>;
  surveysByStatus?: Array<{ label: string; count: number }>;
  signupsByDay?: Array<{ date: string; count: number; amount: number }>;
  transactionsByDay?: Array<{ date: string; count: number; amount: number }>;
};

const EMPTY_SERIES: Array<{ date: string; count: number; amount: number }> = [];
const EMPTY_BREAKDOWN: Array<{ label: string; count: number }> = [];
const EMPTY_VERIFICATION = {
  ninVerified: 0,
  ninUnverified: 0,
  livenessVerified: 0,
  pendingVerification: 0,
};

export default function AdminPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats", "v2"],
    queryFn: async () => (await api.get("/admin/stats")).data.stats as AdminStats,
    enabled: user?.role === "admin",
  });

  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", "recent"],
    queryFn: async () => {
      const res = await api.get("/admin/users", { params: { page: 1, limit: 10 } });
      return res.data.users as User[];
    },
    enabled: user?.role === "admin",
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, isLoading, router]);

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Platform insights, growth, and recent activity"
      actions={
        <Link href="/admin/emails" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4" /> Send emails
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsLoading || !stats ? (
          <div className="sm:col-span-2 lg:col-span-5">
            <MetricGridSkeleton count={5} />
          </div>
        ) : (
          <>
            <MetricCard
              title="Users"
              value={stats.users ?? 0}
              subtitle={`${stats.newUsers7d ?? 0} new this week`}
              icon={Users}
              iconColor="primary"
              index={0}
            />
            <MetricCard
              title="Active projects"
              value={stats.activeSurveys ?? 0}
              subtitle={`${stats.surveys ?? 0} total`}
              icon={FolderKanban}
              iconColor="secondary"
              index={1}
            />
            <MetricCard
              title="Total earnings paid"
              value={formatCurrency(stats.totalEarnings ?? 0)}
              subtitle={`${stats.transactions ?? 0} transactions`}
              icon={Wallet}
              iconColor="amber"
              index={2}
            />
            <MetricCard
              title="Withdrawn"
              value={formatCurrency(stats.totalWithdrawn ?? 0)}
              subtitle={`${stats.withdrawals ?? 0} requests`}
              icon={Wallet}
              iconColor="default"
              index={3}
            />
            <MetricCard
              title="Unverified"
              value={stats.verification?.ninUnverified ?? 0}
              subtitle={`${stats.fraudFlags ?? 0} open fraud flags`}
              icon={Flag}
              iconColor="amber"
              index={4}
            />
          </>
        )}
      </div>

      {!statsLoading && stats?.signupsByDay && (
        <AdminInsightsCharts
          signupsByDay={stats.signupsByDay ?? EMPTY_SERIES}
          transactionsByDay={stats.transactionsByDay ?? EMPTY_SERIES}
          usersByStatus={stats.usersByStatus ?? EMPTY_BREAKDOWN}
          usersByRole={stats.usersByRole ?? EMPTY_BREAKDOWN}
          surveysByStatus={stats.surveysByStatus ?? EMPTY_BREAKDOWN}
          verification={stats.verification ?? EMPTY_VERIFICATION}
        />
      )}

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Recent users</h2>
            <p className="mt-1 text-sm text-ink-500">Latest accounts on the platform</p>
          </div>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4">
          {usersLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : (
            <DataTable
              headers={["Name", "Email", "Role", "Status"]}
              statusColumn={3}
              rows={(recentUsers || []).map((u) => [
                u.name || "—",
                u.email,
                u.role,
                u.status,
              ])}
            />
          )}
        </div>
      </section>
    </AdminShell>
  );
}
