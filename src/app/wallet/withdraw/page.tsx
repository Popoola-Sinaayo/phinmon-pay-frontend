"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import type { BankAccount } from "@/types";

export default function WithdrawPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();
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
    queryFn: async () => (await api.get("/wallet/banks")).data.banks as { name: string; code: string }[],
  });

  const [newBank, setNewBank] = useState({ bankName: "", bankCode: "", accountNumber: "" });
  const [addingBank, setAddingBank] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (banks?.length && !bankId) setBankId(banks[0]._id);
  }, [user, isLoading, router, banks, bankId]);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingBank(true);
    try {
      await api.post("/wallet/bank-accounts", newBank);
      await refetchBanks();
      setNewBank({ bankName: "", bankCode: "", accountNumber: "" });
    } catch {
      alert("Failed to add bank account");
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

  if (isLoading) return <div className="p-16 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/dashboard" />
      <div className="mx-auto max-w-form px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
        <p className="mt-2 text-sm text-gray-500">
          Available: {formatCurrency(wallet?.availableBalance || 0)} · Minimum: ₦1,000
        </p>

        {!banks?.length ? (
          <form onSubmit={handleAddBank} className="card mt-6 space-y-4">
            <h2 className="font-semibold">Add Bank Account</h2>
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
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Account Number</label>
              <input
                className="input"
                value={newBank.accountNumber}
                onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                maxLength={10}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={addingBank}>
              {addingBank ? "Adding..." : "Add Bank Account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleWithdraw} className="card mt-6 space-y-4">
            <div>
              <label className="label">Amount (₦)</label>
              <input
                type="number"
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1000}
                required
              />
            </div>
            <div>
              <label className="label">Bank Account</label>
              <select className="input" value={bankId} onChange={(e) => setBankId(e.target.value)} required>
                {banks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.bankName} — {b.accountName} ({b.accountNumber})
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-error-600">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
