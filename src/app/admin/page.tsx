"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { MetricCard } from "@/components/Cards";
import { DataTable } from "@/components/DataTable";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data.stats,
    enabled: user?.role === "admin",
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/admin/users")).data.users,
    enabled: user?.role === "admin",
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading) return <div className="p-16 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        logoHref="/admin"
        items={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/surveys", label: "Surveys" },
          { href: "/admin/withdrawals", label: "Withdrawals" },
        ]}
      />
      <main className="mx-auto max-w-dashboard p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard title="Users" value={stats?.users || 0} />
          <MetricCard title="Surveys" value={stats?.surveys || 0} />
          <MetricCard title="Transactions" value={stats?.transactions || 0} />
          <MetricCard title="Withdrawals" value={stats?.withdrawals || 0} />
          <MetricCard title="Fraud Flags" value={stats?.fraudFlags || 0} />
        </div>
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Recent Users</h2>
          <div className="mt-4">
            <DataTable
              headers={["Name", "Email", "Role", "Status"]}
              rows={(users || []).slice(0, 10).map((u: { name?: string; email: string; role: string; status: string }) => [
                u.name || "",
                u.email,
                u.role,
                u.status,
              ])}
            />
          </div>
          <Link href="/admin/users" className="mt-4 inline-block text-sm text-primary-600">
            View all users →
          </Link>
        </section>
      </main>
    </div>
  );
}
