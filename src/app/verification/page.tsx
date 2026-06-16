"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { VerificationBadge } from "@/components/Badges";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RetryCountdown } from "@/components/onboarding/RetryCountdown";
import { NinInput } from "@/components/onboarding/NinInput";
import { MotionCard, MotionButton } from "@/components/motion";
import { Crown, Shield, CheckCircle2, Lock } from "lucide-react";

type VerificationStatus = {
  ninVerified?: boolean;
  livenessEnabled?: boolean;
  ninLocked?: boolean;
  ninLockedUntil?: string | null;
  retryRemainingMs?: number;
  registeredName?: string;
  dateOfBirth?: string | null;
  profileComplete?: boolean;
};

export default function VerificationPage() {
  const router = useRouter();
  const { user, isLoading, refetch } = useRequireAuth("respondent");
  const [nin, setNin] = useState("");
  const [ninError, setNinError] = useState("");
  const [ninLoading, setNinLoading] = useState(false);
  const [showNinForm, setShowNinForm] = useState(false);
  const [livenessLoading, setLivenessLoading] = useState(false);

  const { data: status, refetch: refetchStatus } = useQuery<VerificationStatus>({
    queryKey: ["verification-status"],
    queryFn: async () => (await api.get("/verification/status")).data,
    enabled: !!user,
    refetchInterval: (query) =>
      query.state.data?.ninLocked && (query.state.data.retryRemainingMs || 0) > 0 ? 1000 : false,
  });

  const ninStatus = user?.ninVerified
    ? "verified"
    : status?.ninLocked
      ? "failed"
      : "not_started";
  const livenessStatus = !status?.livenessEnabled
    ? "locked"
    : user?.livenessVerified
      ? "verified"
      : user?.ninVerified
        ? "not_started"
        : "locked";

  const isLocked = status?.ninLocked && (status.retryRemainingMs || 0) > 0;

  const handleNinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setNinLoading(true);
    setNinError("");
    try {
      await api.post("/verification/nin", { nin });
      setShowNinForm(false);
      await refetch();
      await refetchStatus();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setNinError(msg || "Verification failed");
      await refetchStatus();
    } finally {
      setNinLoading(false);
    }
  };

  const steps = [
    { label: "Account created", done: true },
    { label: "NIN verified", done: !!user?.ninVerified },
    { label: "Premium liveness", done: !!user?.livenessVerified },
  ];

  return (
    <DashboardShell
      user={user}
      title="Verification"
      subtitle="Build trust and unlock higher-paying survey opportunities"
      loading={isLoading}
    >
      {user && (
        <>
          <div className="mb-6 flex flex-wrap gap-3 overflow-x-auto rounded-xl border border-gray-100 bg-white p-4 shadow-subtle">
            {steps.map((step, i) => (
              <div key={step.label} className="flex shrink-0 items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    step.done ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-400"}`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <MotionCard className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100">
                  <Shield className="h-6 w-6 text-secondary-600" />
                </div>
                <VerificationBadge status={ninStatus} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">NIN Verification</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Your NIN is matched against your legal name and date of birth. Data is encrypted and
                never shared with researchers.
              </p>

              {status?.registeredName && !user.ninVerified && (
                <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-900">{status.registeredName}</p>
                  {status.dateOfBirth && (
                    <p className="text-gray-500">
                      DOB: {new Date(status.dateOfBirth).toLocaleDateString("en-NG")}
                    </p>
                  )}
                </div>
              )}

              {!user.ninVerified && (
                <div className="mt-6 space-y-4">
                  {!status?.profileComplete && (
                    <button
                      type="button"
                      className="btn-secondary w-full"
                      onClick={() => router.push("/onboarding")}
                    >
                      Complete profile first
                    </button>
                  )}

                  <AnimatePresence mode="wait">
                    {isLocked ? (
                      <RetryCountdown
                        lockedUntil={status?.ninLockedUntil}
                        retryRemainingMs={status?.retryRemainingMs}
                        onComplete={() => refetchStatus()}
                      />
                    ) : showNinForm ? (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleNinSubmit}
                        className="space-y-4"
                      >
                        <NinInput value={nin} onChange={setNin} disabled={ninLoading} />
                        {ninError && (
                          <p className="flex items-start gap-2 text-sm text-error-600">
                            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                            {ninError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-secondary flex-1"
                            onClick={() => setShowNinForm(false)}
                          >
                            Cancel
                          </button>
                          <MotionButton
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={ninLoading || nin.length !== 11}
                          >
                            {ninLoading ? "..." : "Verify"}
                          </MotionButton>
                        </div>
                      </motion.form>
                    ) : (
                      status?.profileComplete && (
                        <MotionButton
                          className="btn-primary w-full"
                          onClick={() => setShowNinForm(true)}
                        >
                          Verify NIN
                        </MotionButton>
                      )
                    )}
                  </AnimatePresence>
                </div>
              )}
            </MotionCard>

            <MotionCard className="card-hover border-amber-100/80 bg-gradient-to-br from-amber-50/50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                <VerificationBadge status={livenessStatus} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">Premium Liveness</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Unlock premium surveys paying ₦1,000–₦5,000. Premium respondents earn 3× more on
                average.
              </p>
              {status?.livenessEnabled && user.ninVerified && !user.livenessVerified && (
                <MotionButton
                  className="btn-primary mt-6 w-full sm:w-auto"
                  onClick={async () => {
                    setLivenessLoading(true);
                    try {
                      const { data } = await api.post("/verification/liveness/start");
                      await api.post("/verification/liveness/complete", {
                        sessionId: data.sessionId,
                      });
                      await refetch();
                    } catch {
                      alert("Liveness verification failed");
                    } finally {
                      setLivenessLoading(false);
                    }
                  }}
                  disabled={livenessLoading}
                >
                  {livenessLoading ? "Verifying..." : "Complete Liveness Verification"}
                </MotionButton>
              )}
            </MotionCard>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
