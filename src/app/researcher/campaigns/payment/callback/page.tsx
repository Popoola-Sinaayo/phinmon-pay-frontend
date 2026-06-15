"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (!reference) return;
    api
      .post("/payments/paystack/verify", { reference })
      .then(() => router.push("/researcher/campaigns?paid=true"))
      .catch(() => router.push("/researcher/campaigns?paid=false"));
  }, [reference, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Verifying payment...</p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Loading...</div>}>
      <PaymentCallback />
    </Suspense>
  );
}
