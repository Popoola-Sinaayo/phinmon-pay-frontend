"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingCard, OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { NinInput } from "@/components/onboarding/NinInput";
import { RetryCountdown } from "@/components/onboarding/RetryCountdown";
import { MotionButton } from "@/components/motion";
import { requiresNinVerification } from "@/lib/verification";

type VerificationStatus = {
  ninLocked?: boolean;
  ninLockedUntil?: string | null;
  retryRemainingMs?: number;
  registeredName?: string;
  dateOfBirth?: string | null;
  profileComplete?: boolean;
};

export default function VerifyNinPage() {
  const router = useRouter();
  const { data: user, isLoading, refetch } = useAuth();
  const [nin, setNin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: status, refetch: refetchStatus } = useQuery<VerificationStatus>({
    queryKey: ["verification-status"],
    queryFn: async () => (await api.get("/verification/status")).data,
    enabled: !!user,
    refetchInterval: (query) =>
      query.state.data?.ninLocked && (query.state.data.retryRemainingMs || 0) > 0 ? 1000 : false,
  });

  const isLocked = status?.ninLocked && (status.retryRemainingMs || 0) > 0;

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (user && !requiresNinVerification(user)) {
      router.push("/researcher/dashboard");
      return;
    }
    if (user?.ninVerified) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (status && status.profileComplete === false) {
      router.push("/onboarding");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/verification/nin", { nin });
      setSuccess(true);
      await refetch();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; details?: Record<string, unknown> } } })
        ?.response?.data;
      setError(res?.message || "Verification failed");
      await refetchStatus();
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-primary-200 border-t-primary-600"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f6f5] px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="w-full max-w-md rounded-2xl border border-primary-100 bg-white p-8 text-center shadow-card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100"
          >
            <CheckCircle2 className="h-10 w-10 text-primary-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-2xl font-bold text-gray-900"
          >
            You&apos;re verified!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-2 text-gray-500"
          >
            Your NIN matches your profile. Start earning from surveys.
          </motion.p>
          <MotionButton
            className="btn-primary mt-8 w-full"
            onClick={() => router.push("/dashboard")}
          >
            <Sparkles className="h-4 w-4" /> Go to dashboard
          </MotionButton>
        </motion.div>
      </div>
    );
  }

  return (
    <OnboardingShell
      step={2}
      totalSteps={2}
      title="Verify your NIN"
      subtitle="We cross-check your National ID against the name and date of birth you provided. Your NIN is encrypted and never shared."
    >
      <div className="space-y-5">
        {status?.registeredName && (
          <OnboardingCard className="bg-gray-50/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Profile to match
            </p>
            <p className="mt-1 font-semibold text-gray-900">{status.registeredName}</p>
            {status.dateOfBirth && (
              <p className="text-sm text-gray-500">
                DOB:{" "}
                {new Date(status.dateOfBirth).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </OnboardingCard>
        )}

        <AnimatePresence mode="wait">
          {isLocked ? (
            <RetryCountdown
              key="locked"
              lockedUntil={status?.ninLockedUntil}
              retryRemainingMs={status?.retryRemainingMs}
              onComplete={() => refetchStatus()}
            />
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <OnboardingCard>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-100">
                    <ShieldCheck className="h-5 w-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Enter your NIN</p>
                    <p className="text-xs text-gray-500">11-digit National Identification Number</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <NinInput value={nin} onChange={setNin} disabled={loading} />

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-500/5 p-3 text-sm text-error-700"
                    >
                      <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <MotionButton
                    type="submit"
                    className="btn-primary w-full"
                    disabled={loading || nin.length !== 11}
                  >
                    {loading ? "Verifying..." : "Verify identity"}
                  </MotionButton>
                </form>
              </OnboardingCard>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs leading-relaxed text-gray-400">
          Mismatched details trigger a 24-hour cooldown before you can retry. Ensure your name and
          date of birth match your NIN exactly.
        </p>
      </div>
    </OnboardingShell>
  );
}
