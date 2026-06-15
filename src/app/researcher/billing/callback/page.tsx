"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function BillingCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (!reference) return;
    api
      .post("/payments/paystack/verify", { reference })
      .then((res) => {
        const purpose = res.data.purpose;
        if (purpose === "DEBT_SETTLEMENT") {
          router.push("/researcher/billing?debt=settled");
        } else if (purpose === "CARD_SETUP") {
          if (res.data.requiresDebtPayment) {
            router.push("/researcher/billing?card=added&debt=pending");
          } else {
            router.push("/researcher/campaigns?payg=launched");
          }
        } else {
          router.push("/researcher/billing?card=added");
        }
      })
      .catch(() => router.push("/researcher/billing?error=verify"));
  }, [reference, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f5]">
      <div className="rounded-xl border border-gray-100 bg-white px-8 py-6 text-center shadow-subtle">
        <p className="font-medium text-gray-900">Verifying payment...</p>
        <p className="mt-1 text-sm text-gray-500">Please wait a moment.</p>
      </div>
    </div>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Loading...</div>}>
      <BillingCallback />
    </Suspense>
  );
}
