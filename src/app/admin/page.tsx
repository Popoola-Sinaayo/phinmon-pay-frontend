"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { MetricCard } from "@/components/Cards";
import { DataTable } from "@/components/DataTable";
import { AdminShell } from "@/components/layout/AdminShell";
import { MetricGridSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data.stats,
    enabled: user?.role === "admin",
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/admin/users")).data.users,
    enabled: user?.role === "admin",
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, isLoading, router]);

  return (
    <AdminShell title="Admin Dashboard" subtitle="Platform overview and recent activity">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          <div className="sm:col-span-2 lg:col-span-5">
            <MetricGridSkeleton count={5} />
          </div>
        ) : (
          <>
            <MetricCard title="Users" value={stats?.users || 0} />
            <MetricCard title="Projects" value={stats?.surveys || 0} />
            <MetricCard title="Transactions" value={stats?.transactions || 0} />
            <MetricCard title="Withdrawals" value={stats?.withdrawals || 0} />
            <MetricCard title="Fraud Flags" value={stats?.fraudFlags || 0} />
          </>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink-900">Recent Users</h2>
        <div className="mt-4">
          {usersLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : (
            <DataTable
              headers={["Name", "Email", "Role", "Status"]}
              statusColumn={3}
              rows={(users || [])
                .slice(0, 10)
                .map((u: { name?: string; email: string; role: string; status: string }) => [
                  u.name || "",
                  u.email,
                  u.role,
                  u.status,
                ])}
            />
          )}
        </div>
        <Link
          href="/admin/users"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline"
        >
          View all users &rarr;
        </Link>
      </section>
    </AdminShell>
  );
}
