"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DataTable } from "@/components/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

const nav = [
  { href: "/researcher/dashboard", label: "Dashboard" },
  { href: "/researcher/campaigns", label: "Campaigns" },
  { href: "/researcher/billing", label: "Billing" },
];

export default function BillingPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["billing-transactions"],
    queryFn: async () => (await api.get("/wallet/transactions")).data.transactions,
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const payments = (transactions || []).filter((t: { type: string }) => t.type === "PAYMENT");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/researcher/dashboard" />
      <div className="mx-auto flex max-w-dashboard">
        <Sidebar items={nav} />
        <main className="flex-1 p-4 sm:p-6">
          <h1 className="text-2xl font-bold">Billing</h1>
          <div className="mt-6">
            <DataTable
              headers={["Date", "Description", "Amount", "Status"]}
              rows={payments.map((t: { createdAt: string; description: string; amount: number; status: string }) => [
                formatDate(t.createdAt),
                t.description,
                formatCurrency(Math.abs(t.amount)),
                t.status,
              ])}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
