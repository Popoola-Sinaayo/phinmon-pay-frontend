"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { DataTable } from "@/components/DataTable";
import Link from "next/link";

export default function AdminUsersPage() {
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/admin/users")).data.users,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/admin" items={[{ href: "/admin", label: "Overview" }, { href: "/admin/users", label: "Users" }]} />
      <main className="mx-auto max-w-dashboard p-6">
        <Link href="/admin" className="text-sm text-primary-600">← Admin</Link>
        <h1 className="mt-4 text-2xl font-bold">Users</h1>
        <div className="mt-6">
          <DataTable
            headers={["Name", "Email", "Role", "NIN", "Premium", "Status"]}
            rows={(users || []).map((u: { name?: string; email: string; role: string; ninVerified: boolean; livenessVerified: boolean; status: string }) => [
              u.name || "",
              u.email,
              u.role,
              u.ninVerified ? "Yes" : "No",
              u.livenessVerified ? "Yes" : "No",
              u.status,
            ])}
          />
        </div>
      </main>
    </div>
  );
}
