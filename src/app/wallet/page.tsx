"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { WalletCard } from "@/components/Cards";
import { DataTable } from "@/components/DataTable";
import { DashboardShell, DashboardSkeleton } from "@/components/layout/DashboardShell";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/surveys", label: "Surveys" },
  { href: "/wallet", label: "Wallet" },
  { href: "/verification", label: "Verification" },
  { href: "/settings", label: "Settings" },
];

export default function WalletPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data } = await api.get("/wallet");
      return data.wallet;
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data } = await api.get<{ transactions: Transaction[] }>("/wallet/transactions");
      return data.transactions;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <DashboardShell nav={nav} logoHref="/dashboard" title="Wallet">
        <DashboardSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      nav={nav}
      logoHref="/dashboard"
      title="Wallet"
      subtitle="Track earnings and withdraw to your bank"
      userEmail={user?.email}
      actions={
        <Link href="/wallet/withdraw" className="btn-primary">
          Withdraw
        </Link>
      }
    >
      {loadingWallet ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="max-w-xl">
            <WalletCard
              available={wallet?.availableBalance || 0}
              pending={wallet?.pendingBalance || 0}
              lifetime={wallet?.lifetimeEarnings || 0}
            />
          </div>
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <div className="mt-4 overflow-hidden rounded-card border border-gray-100">
              <DataTable
                headers={["Date", "Description", "Amount", "Status"]}
                rows={(transactions || []).map((t) => [
                  formatDate(t.createdAt),
                  t.description,
                  formatCurrency(Math.abs(t.amount)),
                  t.status,
                ])}
              />
            </div>
          </motion.section>
        </>
      )}
    </DashboardShell>
  );
}
