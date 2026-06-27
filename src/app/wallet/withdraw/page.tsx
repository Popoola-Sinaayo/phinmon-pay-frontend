"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { formatCurrency } from "@/lib/utils";
import type { BankAccount } from "@/types";

export default function WithdrawPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth("respondent");
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => (await api.get("/wallet")).data.wallet,
    enabled: !!user,
  });

  const { data: banks, refetch: refetchBanks } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data } = await api.get<{ accounts: BankAccount[] }>("/wallet/bank-accounts");
      return data.accounts;
    },
    enabled: !!user,
  });

  const { data: bankList } = useQuery({
    queryKey: ["banks"],
    queryFn: async () =>
      (await api.get("/wallet/banks")).data.banks as { name: string; code: string }[],
  });

  const [newBank, setNewBank] = useState({ bankName: "", bankCode: "", accountNumber: "" });
  const [addingBank, setAddingBank] = useState(false);
  const [resolvedName, setResolvedName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  useEffect(() => {
    if (banks?.length && !bankId) setBankId(banks[0]._id);
  }, [banks, bankId]);

  useEffect(() => {
    setResolvedName("");
    setResolveError("");

    if (newBank.accountNumber.length !== 10 || !newBank.bankCode) return;

    let active = true;
    setResolving(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.post<{ accountName: string }>("/wallet/resolve-account", {
          bankCode: newBank.bankCode,
          accountNumber: newBank.accountNumber,
        });
        if (active) setResolvedName(data.accountName);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
        if (active) setResolveError(msg || "Could not verify account");
      } finally {
        if (active) setResolving(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [newBank.accountNumber, newBank.bankCode]);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedName) return;
    setAddingBank(true);
    try {
      await api.post("/wallet/bank-accounts", newBank);
      await refetchBanks();
      setNewBank({ bankName: "", bankCode: "", accountNumber: "" });
      setResolvedName("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || "Failed to add bank account");
    } finally {
      setAddingBank(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/wallet/withdrawals", { amount: Number(amount), bankId });
      router.push("/wallet");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
      user={user}
      title="Withdraw Funds"
      subtitle={`Available: ${formatCurrency(wallet?.availableBalance || 0)} · Minimum: ₦100`}
      loading={isLoading}
      backHref="/wallet"
      breadcrumbs={[
        { label: "Wallet", href: "/wallet" },
        { label: "Withdraw" },
      ]}
      maxWidth="narrow"
    >
      {!banks?.length ? (
        <motion.form
          onSubmit={handleAddBank}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-4"
        >
          <h2 className="font-semibold text-gray-900">Add Bank Account</h2>
          <p className="text-sm text-gray-500">Link your bank account before withdrawing earnings.</p>
          <div>
            <label className="label">Bank</label>
            <select
              className="input"
              value={newBank.bankCode}
              onChange={(e) => {
                const bank = bankList?.find((b) => b.code === e.target.value);
                setNewBank({ ...newBank, bankCode: e.target.value, bankName: bank?.name || "" });
              }}
              required
            >
              <option value="">Select bank</option>
              {bankList?.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Account Number</label>
            <input
              className="input"
              value={newBank.accountNumber}
              onChange={(e) =>
                setNewBank({
                  ...newBank,
                  accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              inputMode="numeric"
              maxLength={10}
              required
            />
          </div>

          {resolving && (
            <p className="text-sm text-gray-500">Verifying account name…</p>
          )}
          {resolvedName && !resolving && (
            <div className="rounded-lg border border-primary-100 bg-primary-50/60 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Account name
              </p>
              <p className="text-sm font-semibold text-gray-900">{resolvedName}</p>
            </div>
          )}
          {resolveError && !resolving && (
            <p className="rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-600">
              {resolveError}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={addingBank || resolving || !resolvedName}
          >
            {addingBank ? "Adding..." : "Confirm & Add Bank Account"}
          </button>
        </motion.form>
      ) : (
        <motion.form
          onSubmit={handleWithdraw}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-4"
        >
          <div>
            <label className="label">Amount (₦)</label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={100}
              required
            />
          </div>
          <div>
            <label className="label">Bank Account</label>
            <select
              className="input"
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              required
            >
              {banks.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bankName}  {b.accountName} ({b.accountNumber})
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-600">{error}</p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </motion.form>
      )}
    </DashboardShell>
  );
}
