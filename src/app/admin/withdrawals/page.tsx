"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { AdminShell } from "@/components/layout/AdminShell";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminWithdrawalsPage() {
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => (await api.get("/admin/withdrawals")).data.withdrawals,
  });

  return (
    <AdminShell title="Withdrawals" subtitle="Payout requests and their status" backHref="/admin">
      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : (
        <DataTable
          headers={["Date", "User", "Amount", "Status", "Reference"]}
          statusColumn={3}
          rows={(withdrawals || []).map(
            (w: {
              createdAt: string;
              userId: { email?: string };
              amount: number;
              status: string;
              reference: string;
            }) => [
              formatDate(w.createdAt),
              w.userId?.email || "",
              formatCurrency(w.amount),
              w.status,
              w.reference,
            ]
          )}
        />
      )}
    </AdminShell>
  );
}
