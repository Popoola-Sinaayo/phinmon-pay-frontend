"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { VerificationBadge } from "@/components/Badges";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MotionCard } from "@/components/motion";
import { Crown, Shield, CheckCircle2 } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const { user, isLoading, refetch } = useRequireAuth("respondent");
  const [livenessLoading, setLivenessLoading] = useState(false);

  const { data: status } = useQuery({
    queryKey: ["verification-status"],
    queryFn: async () => (await api.get("/verification/status")).data,
    enabled: !!user,
  });

  const ninStatus = user?.ninVerified ? "verified" : "not_started";
  const livenessStatus = !status?.livenessEnabled
    ? "locked"
    : user?.livenessVerified
      ? "verified"
      : user?.ninVerified
        ? "not_started"
        : "locked";

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
          <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-subtle">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    step.done ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </span>
                {i < steps.length - 1 && <span className="hidden h-px w-8 bg-gray-200 sm:block" />}
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <MotionCard className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100">
                  <Shield className="h-6 w-6 text-secondary-600" />
                </div>
                <VerificationBadge status={ninStatus} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">NIN Verification</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Required to participate in surveys and withdraw funds. Your NIN is encrypted and never
                shared with researchers.
              </p>
              {!user.ninVerified && (
                <motion.button
                  className="btn-primary mt-6 w-full sm:w-auto"
                  onClick={() => router.push("/onboarding/verify-nin")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Complete NIN Verification
                </motion.button>
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
                <motion.button
                  className="btn-primary mt-6 w-full sm:w-auto"
                  onClick={async () => {
                    setLivenessLoading(true);
                    try {
                      const { data } = await api.post("/verification/liveness/start");
                      await api.post("/verification/liveness/complete", { sessionId: data.sessionId });
                      await refetch();
                    } catch {
                      alert("Liveness verification failed");
                    } finally {
                      setLivenessLoading(false);
                    }
                  }}
                  disabled={livenessLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {livenessLoading ? "Verifying..." : "Complete Liveness Verification"}
                </motion.button>
              )}
            </MotionCard>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
