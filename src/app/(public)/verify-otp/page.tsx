"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { api, setAuthToken } from "@/lib/api";
import { OTPInput } from "@/components/OTPInput";
import { FadeIn } from "@/components/motion";
import type { User } from "@/types";
import { requiresNinVerification } from "@/lib/verification";
import { ShieldCheck } from "lucide-react";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectUser = (user: User) => {
    if (!user.name) {
      router.push("/onboarding");
      return;
    }
    if (requiresNinVerification(user) && !user.ninVerified) {
      router.push("/onboarding/verify-nin");
      return;
    }
    if (user.role === "researcher") router.push("/researcher/dashboard");
    else if (user.role === "admin") router.push("/admin");
    else router.push("/dashboard");
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/verify-otp", {
        email,
        code,
      });
      setAuthToken(data.token);
      redirectUser(data.user);
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await api.post("/auth/request-otp", { email });
  };

  return (
    <div className="mesh-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <FadeIn className="w-full max-w-form text-center">
        <motion.div className="card shadow-card">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-50">
            <ShieldCheck className="h-7 w-7 text-secondary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-500">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <div className="mt-8">
            <OTPInput onComplete={handleVerify} />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-error-600"
            >
              {error}
            </motion.p>
          )}
          {loading && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-4 text-sm text-gray-500"
            >
              Verifying...
            </motion.p>
          )}
          <button
            type="button"
            onClick={handleResend}
            className="mt-6 text-sm font-medium text-primary-600 hover:underline"
          >
            Resend code
          </button>
        </motion.div>
      </FadeIn>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <motion.div
            className="h-8 w-8 rounded-full border-2 border-primary-200 border-t-primary-600"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
