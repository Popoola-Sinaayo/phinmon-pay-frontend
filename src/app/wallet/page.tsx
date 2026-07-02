"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { WalletCard } from "@/components/Cards";
import { DataTable } from "@/components/DataTable";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

export default function WalletPage() {
  const { user, isLoading } = useRequireAuth("respondent");

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
    refetchInterval: (query) => {
      const txs = query.state.data;
      const hasPendingWithdrawal = txs?.some(
        (t) => t.type === "WITHDRAWAL" && t.status === "PENDING"
      );
      return hasPendingWithdrawal ? 5000 : false;
    },
  });

  return (
    <DashboardShell
      user={user}
      title="Wallet"
      subtitle="Track earnings and withdraw to your bank"
      loading={isLoading || loadingWallet}
      actions={
        <Link href="/wallet/withdraw" className="btn-primary">
          Withdraw
        </Link>
      }
    >
      {!loadingWallet && (
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
            <div className="mt-4">
              <DataTable
                headers={["Date", "Description", "Amount", "Status"]}
                rows={(transactions || []).map((t) => [
                  formatDate(t.createdAt),
                  t.description,
                  formatCurrency(Math.abs(t.amount)),
                  t.status,
                ])}
                statusColumn={3}
              />
            </div>
          </motion.section>
        </>
      )}
    </DashboardShell>
  );
}
