"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setErrorMessage("No payment reference found in the redirect URL.");
      return;
    }

    api
      .post<{ survey?: { _id: string } }>("/payments/paystack/verify", { reference })
      .then(() => {
        setStatus("success");
        router.push("/researcher/campaigns?paid=true");
      })
      .catch((err: unknown) => {
        setStatus("error");
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Payment could not be verified yet.";
        setErrorMessage(msg);
      });
  }, [reference, router]);

  if (status === "verifying") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-gray-600">Verifying payment…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-gray-900">Payment verification incomplete</p>
        <p className="max-w-md text-sm text-gray-600">{errorMessage}</p>
        <p className="max-w-md text-sm text-gray-500">
          If you already paid on Paystack, open your project and use &quot;Confirm payment
          status&quot; to complete activation without paying again.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/researcher/campaigns" className="btn-primary">
            Go to projects
          </Link>
          {reference && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStatus("verifying");
                setErrorMessage(null);
                api
                  .post("/payments/paystack/verify", { reference })
                  .then(() => router.push("/researcher/campaigns?paid=true"))
                  .catch((err: unknown) => {
                    setStatus("error");
                    const msg =
                      (err as { response?: { data?: { message?: string } } })?.response?.data
                        ?.message || "Payment could not be verified yet.";
                    setErrorMessage(msg);
                  });
              }}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      <p className="text-ink-600">Payment confirmed. Redirecting&hellip;</p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-ink-600">Loading&hellip;</p>
        </div>
      }
    >
      <PaymentCallback />
    </Suspense>
  );
}
