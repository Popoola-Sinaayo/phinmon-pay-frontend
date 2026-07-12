"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useQoreIdLiveness } from "@/hooks/useQoreIdLiveness";
import { usePlatformFeatures, isPremiumLivenessAvailable } from "@/lib/platformFeatures";
import { VerificationBadge } from "@/components/Badges";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RetryCountdown } from "@/components/onboarding/RetryCountdown";
import { NinInput } from "@/components/onboarding/NinInput";
import { ProfileDetailsForm } from "@/components/onboarding/ProfileDetailsForm";
import { MotionCard, MotionButton } from "@/components/motion";
import { Crown, Shield, CheckCircle2, Lock, Pencil } from "lucide-react";

type VerificationStatus = {
  ninVerified?: boolean;
  livenessEnabled?: boolean;
  premiumLivenessEnabled?: boolean;
  premiumLivenessComingSoon?: boolean;
  ninLocked?: boolean;
  ninLockedUntil?: string | null;
  retryRemainingMs?: number;
  registeredName?: string;
  dateOfBirth?: string | null;
  profileComplete?: boolean;
};

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusStep = searchParams.get("step");
  const { user, isLoading, refetch } = useRequireAuth("respondent");
  const platformFeatures = usePlatformFeatures();
  const premiumLivenessAvailable = isPremiumLivenessAvailable(platformFeatures);
  const { runLivenessCheck, loading: livenessLoading, error: livenessError } = useQoreIdLiveness();
  const [nin, setNin] = useState("");
  const [ninError, setNinError] = useState("");
  const [ninLoading, setNinLoading] = useState(false);
  const [showNinForm, setShowNinForm] = useState(focusStep === "nin");
  const [editingDetails, setEditingDetails] = useState(false);

  const { data: status, refetch: refetchStatus } = useQuery<VerificationStatus>({
    queryKey: ["verification-status"],
    queryFn: async () => (await api.get("/verification/status")).data,
    enabled: !!user,
    refetchInterval: (query) =>
      query.state.data?.ninLocked && (query.state.data.retryRemainingMs || 0) > 0 ? 1000 : false,
  });

  useEffect(() => {
    if (focusStep === "nin") setShowNinForm(true);
  }, [focusStep]);

  const ninStatus = user?.ninVerified
    ? "verified"
    : status?.ninLocked
      ? "failed"
      : "not_started";
  const livenessStatus = user?.livenessVerified
    ? "verified"
    : !premiumLivenessAvailable ||
        status?.premiumLivenessComingSoon ||
        !status?.premiumLivenessEnabled
      ? "coming_soon"
      : "not_started";

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
      const res = (err as { response?: { status?: number; data?: { message?: string; details?: { duplicateNin?: boolean } } } })
        ?.response;
      const msg = res?.data?.message;
      if (res?.status === 409 || res?.data?.details?.duplicateNin) {
        setNinError(
          msg || "This NIN is already linked to another account. Each NIN can only be used once."
        );
      } else {
        setNinError(msg || "Verification failed");
      }
      await refetchStatus();
    } finally {
      setNinLoading(false);
    }
  };

  const handleLiveness = async () => {
    if (!user || !premiumLivenessAvailable) return;
    try {
      await runLivenessCheck(user, { dateOfBirth: status?.dateOfBirth || undefined });
      await refetch();
      await refetchStatus();
    } catch {
      // error surfaced via livenessError
    }
  };

  const steps = [
    { label: "Account created", done: true },
    { label: "Profile details", done: !!status?.profileComplete },
    { label: "NIN verified", done: !!user?.ninVerified },
    { label: "NIN liveness", done: !!user?.livenessVerified, optional: true },
  ];

  return (
    <DashboardShell
      user={user}
      title="Verification"
      subtitle="Verify your NIN to start earning. Premium liveness verification is coming soon."
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
                  {"optional" in step && step.optional && !step.done && (
                    <span className="ml-1 text-xs text-blue-600">(coming soon)</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <MotionCard className={`card-hover ${focusStep === "nin" ? "ring-2 ring-secondary-200" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100">
                  <Shield className="h-6 w-6 text-secondary-600" />
                </div>
                <VerificationBadge status={ninStatus} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">NIN Verification</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Required before taking any task. Your NIN is securely verified and matched against
                your profile details.
              </p>

              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-secondary-600" />
                  <p className="text-sm font-semibold text-gray-900">Why am I verifying?</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  We verify your NIN only to confirm you&apos;re a real person and to stop bots and
                  duplicate accounts — this keeps task results validated and trustworthy. Your NIN
                  is hashed, not stored on our systems, and is never shared. We only use it to check
                  you&apos;re genuine.
                </p>
              </div>

              {!user.ninVerified && (
                <div className="mt-4">
                  <AnimatePresence mode="wait">
                    {editingDetails ? (
                      <motion.div
                        key="edit-details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                      >
                        <p className="mb-3 text-sm font-medium text-gray-900">Edit your details</p>
                        <ProfileDetailsForm
                          onSaved={async () => {
                            setEditingDetails(false);
                            setNinError("");
                            await refetch();
                            await refetchStatus();
                          }}
                          onCancel={() => setEditingDetails(false)}
                        />
                      </motion.div>
                    ) : (
                      <div className="rounded-xl bg-gray-50 p-3 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {status?.registeredName || "Your name"}
                            </p>
                            {status?.dateOfBirth && (
                              <p className="text-gray-500">
                                DOB: {new Date(status.dateOfBirth).toLocaleDateString("en-NG")}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingDetails(true)}
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                          Make sure these match your NIN exactly before verifying.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
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
                            {ninLoading ? "Verifying..." : "Verify NIN"}
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

            <MotionCard
              className={`card-hover border-amber-100/80 bg-gradient-to-br from-amber-50/50 to-white ${
                focusStep === "liveness" ? "ring-2 ring-amber-200" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                <VerificationBadge status={livenessStatus} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">Premium Liveness Check</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {!premiumLivenessAvailable ||
                status?.premiumLivenessComingSoon ||
                !status?.premiumLivenessEnabled ? (
                  <>
                    Coming soon. We&apos;re enabling premium liveness verification shortly. For now,
                    complete NIN verification to take tasks and earn.
                  </>
                ) : (
                  <>
                    Required for premium tasks. Complete a quick liveness check to confirm
                    you&apos;re a real person.
                  </>
                )}
              </p>
              {premiumLivenessAvailable &&
                status?.premiumLivenessEnabled &&
                user.ninVerified &&
                !user.livenessVerified && (
                <div className="mt-6 space-y-3">
                  {livenessError && (
                    <p className="text-sm text-error-600">{livenessError}</p>
                  )}
                  <MotionButton
                    className="btn-primary w-full sm:w-auto"
                    onClick={handleLiveness}
                    disabled={livenessLoading}
                  >
                    {livenessLoading ? "Starting..." : "Start liveness check"}
                  </MotionButton>
                </div>
              )}
              {premiumLivenessAvailable &&
                status?.premiumLivenessEnabled &&
                !user.ninVerified &&
                !user.livenessVerified && (
                <p className="mt-6 text-sm text-gray-500">Complete NIN verification first.</p>
              )}
              {(!premiumLivenessAvailable ||
                status?.premiumLivenessComingSoon ||
                !status?.premiumLivenessEnabled) &&
                !user.livenessVerified && (
                  <p className="mt-6 rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-sm text-blue-900">
                    Premium verification will be enabled soon. You&apos;ll be notified when it&apos;s
                    ready.
                  </p>
                )}
            </MotionCard>
          </div>
        </>
      )}
    </DashboardShell>
  );
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell title="Verification" loading>
          <div />
        </DashboardShell>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
