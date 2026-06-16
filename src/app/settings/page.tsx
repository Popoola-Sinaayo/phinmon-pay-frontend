"use client";

import { useRouter } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MotionCard } from "@/components/motion";
import { motion } from "framer-motion";
import { LogOut, Mail, Shield, Crown, User as UserIcon } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth();

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setAuthToken(null);
    router.push("/login");
  };

  return (
    <DashboardShell
      user={user}
      title="Settings"
      subtitle="Manage your account and preferences"
      loading={isLoading}
      maxWidth="narrow"
    >
      {user && (
        <MotionCard className="card space-y-1">
          {[
            { label: "Email", value: user.email, icon: Mail },
            { label: "Role", value: user.role, icon: UserIcon, capitalize: true },
            ...(user.role === "respondent"
              ? [
                  {
                    label: "NIN Verified",
                    value: user.ninVerified ? "Verified" : "Not verified",
                    icon: Shield,
                  },
                  {
                    label: "Premium",
                    value: user.livenessVerified ? "Active" : "Not active",
                    icon: Crown,
                  },
                ]
              : []),
          ].map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between border-b border-gray-50 py-4 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <row.icon className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">{row.label}</p>
              </div>
              <p className={`font-semibold text-gray-900 ${row.capitalize ? "capitalize" : ""}`}>
                {row.value}
              </p>
            </motion.div>
          ))}

          <div className="pt-4">
            <motion.button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-error-500/20 bg-error-500/5 py-3 text-sm font-semibold text-error-600 transition hover:bg-error-500/10"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <LogOut className="h-4 w-4" /> Log out
            </motion.button>
          </div>
        </MotionCard>
      )}
    </DashboardShell>
  );
}
