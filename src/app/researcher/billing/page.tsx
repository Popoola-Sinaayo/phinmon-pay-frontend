"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CreditCard,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DataTable } from "@/components/DataTable";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Survey } from "@/types";
import Link from "next/link";

function BillingContent() {
  const searchParams = useSearchParams();
  const { user, isLoading } = useRequireAuth("researcher");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: accountData, refetch: refetchAccount } = useQuery({
    queryKey: ["billing-account"],
    queryFn: async () => (await api.get("/billing/account")).data,
    enabled: !!user,
  });

  const { data: chargesData, refetch: refetchCharges } = useQuery({
    queryKey: ["billing-charges"],
    queryFn: async () => (await api.get("/billing/charges")).data.charges,
    enabled: !!user,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["billing-payments"],
    queryFn: async () => (await api.get("/billing/payments")).data.payments,
    enabled: !!user,
  });

  const account = accountData?.account;
  const paymentMethod = accountData?.paymentMethod;
  const lockedSurveys = (accountData?.lockedSurveys || []) as Survey[];
  const charges = chargesData || [];
  const payments = paymentsData || [];

  const addCard = async () => {
    setActionLoading("card");
    try {
      const { data } = await api.post("/billing/payment-methods/setup", {});
      if (data.authorizationUrl) window.location.href = data.authorizationUrl;
    } finally {
      setActionLoading(null);
    }
  };

  const settleDebt = async () => {
    setActionLoading("debt");
    try {
      const { data } = await api.post("/billing/settle-debt");
      if (data.authorizationUrl) window.location.href = data.authorizationUrl;
    } finally {
      setActionLoading(null);
    }
  };

  const alert =
    searchParams.get("debt") === "settled"
      ? "Outstanding balance settled. Locked campaigns have been restored."
      : searchParams.get("card") === "added" && searchParams.get("debt") === "pending"
        ? "Card saved. Settle your outstanding balance to unlock campaigns."
        : searchParams.get("card") === "added"
          ? "Payment method saved successfully."
          : searchParams.get("error") === "verify"
            ? "Payment verification failed. Please try again."
            : null;

  return (
    <DashboardShell
      user={user}
      title="Billing"
      subtitle="Manage payment methods, pay-as-you-go charges, and outstanding balances"
      loading={isLoading}
    >
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800"
        >
          {alert}
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Payment method
              </p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Saved card</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <CreditCard className="h-5 w-5 text-gray-600" />
            </div>
          </div>

          {paymentMethod ? (
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="font-semibold capitalize text-gray-900">
                {paymentMethod.brand} •••• {paymentMethod.last4}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                {paymentMethod.bank ? ` · ${paymentMethod.bank}` : ""}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No card on file. Add a card to use pay-as-you-go billing.
            </p>
          )}

          <button
            type="button"
            onClick={addCard}
            disabled={actionLoading === "card"}
            className="btn-primary mt-4 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {paymentMethod ? "Update card" : "Add card"}
          </button>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Account status
              </p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Pay-as-you-go</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100">
              <Wallet className="h-5 w-5 text-secondary-600" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Total spent</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(account?.totalSpent || 0)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Outstanding</p>
              <p
                className={`text-lg font-bold ${
                  (account?.outstandingDebt || 0) > 0 ? "text-error-600" : "text-gray-900"
                }`}
              >
                {formatCurrency(account?.outstandingDebt || 0)}
              </p>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <ShieldCheck className="h-4 w-4 text-primary-500" />
            Status:{" "}
            <span className="font-semibold capitalize">{account?.status?.toLowerCase() || "active"}</span>
          </p>

          {(account?.outstandingDebt || 0) > 0 && (
            <button
              type="button"
              onClick={settleDebt}
              disabled={actionLoading === "debt"}
              className="btn-primary mt-4 w-full"
            >
              {actionLoading === "debt" ? "Redirecting..." : "Pay outstanding balance"}
            </button>
          )}
        </div>
      </div>

      {lockedSurveys.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-5"
        >
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Locked campaigns</h3>
              <p className="mt-1 text-sm text-gray-600">
                These campaigns are paused due to a failed charge or spending cap. Add a new card
                and settle any outstanding balance to restore them.
              </p>
              <ul className="mt-3 space-y-2">
                {lockedSurveys.map((s) => (
                  <li
                    key={s._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-gray-900">{s.title}</span>
                    <span className="text-gray-500">{s.billingLockReason || "Billing locked"}</span>
                    <Link href={`/researcher/campaigns/${s._id}`} className="text-primary-600 hover:underline">
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Per-response charges</h2>
          <button
            type="button"
            onClick={() => {
              refetchAccount();
              refetchCharges();
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
        <DataTable
          headers={["Date", "Reference", "Amount", "Status"]}
          rows={charges.map(
            (c: { createdAt: string; reference: string; amount: number; status: string }) => [
              formatDate(c.createdAt),
              c.reference.split("-")[0],
              formatCurrency(c.amount),
              c.status,
            ]
          )}
          statusColumn={3}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment history</h2>
        <DataTable
          headers={["Date", "Purpose", "Amount", "Status"]}
          rows={payments.map(
            (p: {
              createdAt: string;
              purpose: string;
              amount: number;
              status: string;
            }) => [
              formatDate(p.createdAt),
              p.purpose.replace(/_/g, " ").toLowerCase(),
              formatCurrency(p.amount),
              p.status,
            ]
          )}
          statusColumn={3}
        />
      </section>

      <div className="mt-8 rounded-xl border border-gray-100 bg-white p-5 text-sm text-gray-600">
        <p className="flex items-center gap-2 font-semibold text-gray-900">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> How pay-as-you-go works
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1">
          <li>Add your card once — Paystack saves it securely for future charges.</li>
          <li>You are charged per approved response (reward + 15% platform fee).</li>
          <li>Set a spending cap when launching — campaigns pause when the cap is reached.</li>
          <li>If a charge fails, the campaign locks until you update your card and pay any debt.</li>
        </ul>
      </div>
    </DashboardShell>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<DashboardShell title="Billing" loading><div /></DashboardShell>}>
      <BillingContent />
    </Suspense>
  );
}
