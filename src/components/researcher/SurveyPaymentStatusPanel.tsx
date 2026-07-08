"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 60;

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

interface SurveyPaymentInfo {
  reference: string;
  status: PaymentStatus;
  amount: number;
  authorizationUrl?: string;
  createdAt?: string;
}

interface SurveyPaymentStatusPanelProps {
  surveyId: string;
  onSuccess?: () => void;
  onRetryPaystack?: () => void;
  retryLoading?: boolean;
}

export function SurveyPaymentStatusPanel({
  surveyId,
  onSuccess,
  onRetryPaystack,
  retryLoading = false,
}: SurveyPaymentStatusPanelProps) {
  const [payment, setPayment] = useState<SurveyPaymentInfo | null>(null);
  const [surveyStatus, setSurveyStatus] = useState<string>("PENDING_PAYMENT");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const fetchStatus = useCallback(async () => {
    const { data } = await api.get<{
      surveyStatus: string;
      payment: SurveyPaymentInfo | null;
    }>(`/surveys/${surveyId}/payment`);
    setSurveyStatus(data.surveyStatus);
    setPayment(data.payment);
    return data;
  }, [surveyId]);

  const confirmPayment = useCallback(async () => {
    if (!payment?.reference) return false;
    setVerifying(true);
    setVerifyError(null);
    try {
      await api.post("/payments/paystack/verify", { reference: payment.reference });
      const latest = await fetchStatus();
      if (latest.surveyStatus === "ACTIVE" || latest.payment?.status === "SUCCESS") {
        onSuccess?.();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not confirm payment yet";
      setVerifyError(msg);
      await fetchStatus();
      return false;
    } finally {
      setVerifying(false);
    }
  }, [payment?.reference, fetchStatus, onSuccess]);

  useEffect(() => {
    let active = true;
    let polls = 0;

    const load = async () => {
      try {
        const data = await fetchStatus();
        if (!active) return;

        if (data.surveyStatus === "ACTIVE" || data.payment?.status === "SUCCESS") {
          onSuccess?.();
        }
      } catch {
        if (active) setVerifyError("Could not load payment status");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    const interval = setInterval(async () => {
      if (!active) return;
      polls += 1;
      try {
        const data = await fetchStatus();
        if (data.surveyStatus === "ACTIVE" || data.payment?.status === "SUCCESS") {
          clearInterval(interval);
          onSuccess?.();
          return;
        }
        if (data.payment?.status !== "PENDING" || polls >= MAX_POLLS) {
          clearInterval(interval);
          if (polls >= MAX_POLLS && data.payment?.status === "PENDING") {
            setTimedOut(true);
          }
        }
      } catch {
        // Keep polling on transient errors
      }
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [surveyId, fetchStatus, onSuccess]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading payment status…
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No payment record found for this campaign. Use &quot;Pay with Paystack&quot; to start
        checkout.
      </div>
    );
  }

  const isSuccess = payment.status === "SUCCESS" || surveyStatus === "ACTIVE";
  const isFailed = payment.status === "FAILED";
  const isPending = !isSuccess && !isFailed;

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 p-4">
      <div className="text-center">
        {isSuccess ? (
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary-600" />
        ) : isFailed ? (
          <XCircle className="mx-auto h-10 w-10 text-error-600" />
        ) : (
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-600" />
        )}
        <h3 className="mt-3 text-lg font-semibold text-gray-900">
          {isSuccess
            ? "Payment confirmed"
            : isFailed
              ? "Payment failed"
              : "Payment pending"}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {formatCurrency(payment.amount)} · Ref {payment.reference}
        </p>
      </div>

      {isPending && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          If you already paid on Paystack but were not redirected back, your payment may still be
          processing. We check automatically every few seconds, or you can confirm manually below.
        </div>
      )}

      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
        <p>
          <span className="text-gray-500">Payment status:</span>{" "}
          <span className="font-medium capitalize text-gray-900">{payment.status.toLowerCase()}</span>
        </p>
        <p className="mt-1">
          <span className="text-gray-500">Campaign status:</span>{" "}
          <span className="font-medium capitalize text-gray-900">
            {surveyStatus.replace(/_/g, " ").toLowerCase()}
          </span>
        </p>
      </div>

      {verifyError && (
        <p className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
          {verifyError}
        </p>
      )}

      {isPending && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => void confirmPayment()}
            disabled={verifying}
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Confirm payment status
              </>
            )}
          </button>
          {(payment.authorizationUrl || onRetryPaystack) && (
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() => {
                if (onRetryPaystack) {
                  onRetryPaystack();
                } else if (payment.authorizationUrl) {
                  window.location.href = payment.authorizationUrl;
                }
              }}
              disabled={retryLoading}
            >
              {retryLoading ? "Opening…" : "Return to Paystack"}
            </button>
          )}
        </div>
      )}

      {isPending && timedOut && (
        <p className="text-center text-xs text-gray-500">
          Automatic checks paused. Use &quot;Confirm payment status&quot; if you completed payment on
          Paystack.
        </p>
      )}

      {isFailed && onRetryPaystack && (
        <button
          type="button"
          className="btn-primary w-full"
          onClick={onRetryPaystack}
          disabled={retryLoading}
        >
          {retryLoading ? "Opening…" : "Try payment again"}
        </button>
      )}
    </div>
  );
}
