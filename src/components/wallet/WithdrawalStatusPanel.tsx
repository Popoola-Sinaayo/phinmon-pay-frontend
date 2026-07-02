"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40;

type WithdrawalStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

interface WithdrawalStatusPanelProps {
  withdrawalId: string;
  amount: number;
  onDone?: () => void;
}

export function WithdrawalStatusPanel({
  withdrawalId,
  amount,
  onDone,
}: WithdrawalStatusPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<WithdrawalStatus>("PROCESSING");
  const [transactionStatus, setTransactionStatus] = useState("PENDING");
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let polls = 0;
    let active = true;

    const poll = async () => {
      try {
        const { data } = await api.get<{
          withdrawal: { status: WithdrawalStatus };
          transactionStatus: string;
        }>(`/wallet/withdrawals/${withdrawalId}`);

        if (!active) return;

        setStatus(data.withdrawal.status);
        setTransactionStatus(data.transactionStatus);

        if (data.withdrawal.status === "COMPLETED" || data.withdrawal.status === "FAILED") {
          return true;
        }
        if (data.transactionStatus === "COMPLETED" || data.transactionStatus === "FAILED") {
          return true;
        }
      } catch {
        // Keep polling on transient errors
      }
      return false;
    };

    const interval = setInterval(async () => {
      polls += 1;
      const done = await poll();
      if (done || polls >= MAX_POLLS) {
        clearInterval(interval);
        if (!done && polls >= MAX_POLLS) setTimedOut(true);
      }
    }, POLL_INTERVAL_MS);

    void poll();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [withdrawalId]);

  const isSuccess = status === "COMPLETED";
  const isFailed = status === "FAILED";

  return (
    <div className="card space-y-4 text-center">
      {isSuccess ? (
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary-600" />
      ) : isFailed ? (
        <XCircle className="mx-auto h-12 w-12 text-error-600" />
      ) : (
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {isSuccess
            ? "Withdrawal successful"
            : isFailed
              ? "Withdrawal failed"
              : "Processing withdrawal"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {formatCurrency(amount)} to your bank account
        </p>
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
        <p>
          <span className="text-gray-500">Transfer status:</span>{" "}
          <span className="font-medium capitalize text-gray-900">{status.toLowerCase()}</span>
        </p>
        <p className="mt-1">
          <span className="text-gray-500">Transaction:</span>{" "}
          <span className="font-medium capitalize text-gray-900">
            {transactionStatus.toLowerCase()}
          </span>
        </p>
      </div>

      {!isSuccess && !isFailed && (
        <p className="text-xs text-gray-500">
          {timedOut
            ? "This is taking longer than usual. You can check your wallet for updates."
            : "Waiting for Paystack to confirm the transfer…"}
        </p>
      )}

      {isFailed && (
        <p className="text-sm text-error-600">
          The amount has been restored to your wallet if the transfer did not go through.
        </p>
      )}

      {(isSuccess || isFailed || timedOut) && (
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {
            onDone?.();
            router.push("/wallet");
          }}
        >
          Back to wallet
        </button>
      )}
    </div>
  );
}
