"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { DataTable } from "@/components/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function AdminWithdrawalsPage() {
  const { data: withdrawals } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => (await api.get("/admin/withdrawals")).data.withdrawals,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/admin" />
      <main className="mx-auto max-w-dashboard p-6">
        <Link href="/admin" className="text-sm text-primary-600">← Admin</Link>
        <h1 className="mt-4 text-2xl font-bold">Withdrawals</h1>
        <div className="mt-6">
          <DataTable
            headers={["Date", "User", "Amount", "Status", "Reference"]}
            rows={(withdrawals || []).map((w: { createdAt: string; userId: { email?: string }; amount: number; status: string; reference: string }) => [
              formatDate(w.createdAt),
              w.userId?.email || "",
              formatCurrency(w.amount),
              w.status,
              w.reference,
            ])}
          />
        </div>
      </main>
    </div>
  );
}
