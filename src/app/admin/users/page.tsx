"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { AdminShell } from "@/components/layout/AdminShell";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminUsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/admin/users")).data.users,
  });

  return (
    <AdminShell title="Users" subtitle="Every registered account on the platform" backHref="/admin">
      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <DataTable
          headers={["Name", "Email", "Role", "NIN", "Premium", "Status"]}
          statusColumn={5}
          rows={(users || []).map(
            (u: {
              name?: string;
              email: string;
              role: string;
              ninVerified: boolean;
              livenessVerified: boolean;
              status: string;
            }) => [
              u.name || "",
              u.email,
              u.role,
              u.ninVerified ? "Yes" : "No",
              u.livenessVerified ? "Yes" : "No",
              u.status,
            ]
          )}
        />
      )}
    </AdminShell>
  );
}
