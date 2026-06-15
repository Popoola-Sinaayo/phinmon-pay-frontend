"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { VerificationBadge } from "@/components/Badges";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MotionCard } from "@/components/motion";
import { Crown, Shield } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/surveys", label: "Surveys" },
  { href: "/wallet", label: "Wallet" },
  { href: "/verification", label: "Verification" },
  { href: "/settings", label: "Settings" },
];

export default function VerificationPage() {
  const router = useRouter();
  const { data: user, isLoading, refetch } = useAuth();
  const [livenessLoading, setLivenessLoading] = useState(false);

  const { data: status } = useQuery({
    queryKey: ["verification-status"],
    queryFn: async () => (await api.get("/verification/status")).data,
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const ninStatus = user?.ninVerified ? "verified" : "not_started";
  const livenessStatus = !status?.livenessEnabled
    ? "locked"
    : user?.livenessVerified
      ? "verified"
      : user?.ninVerified
        ? "not_started"
        : "locked";

  if (isLoading) return null;

  return (
    <DashboardShell
      nav={nav}
      logoHref="/dashboard"
      title="Verification"
      subtitle="Build trust and unlock higher-paying survey opportunities"
      userEmail={user?.email}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <MotionCard className="card-hover">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50">
              <Shield className="h-6 w-6 text-secondary-600" />
            </div>
            <VerificationBadge status={ninStatus} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">NIN Verification</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Required to participate in surveys and withdraw funds. Your NIN is encrypted and never shared with researchers.
          </p>
          {!user?.ninVerified && (
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

        <MotionCard className="card-hover border-amber-100 bg-gradient-to-br from-amber-50/40 to-white">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Crown className="h-6 w-6 text-amber-600" />
            </div>
            <VerificationBadge status={livenessStatus} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Premium Liveness</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Unlock premium surveys paying ₦1,000–₦5,000. Premium respondents earn 3× more on average.
          </p>
          {status?.livenessEnabled && user?.ninVerified && !user?.livenessVerified && (
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
    </DashboardShell>
  );
}
