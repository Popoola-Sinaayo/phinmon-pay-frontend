"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api, setAuthToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MotionCard } from "@/components/motion";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/surveys", label: "Surveys" },
  { href: "/wallet", label: "Wallet" },
  { href: "/verification", label: "Verification" },
  { href: "/settings", label: "Settings" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setAuthToken(null);
    router.push("/login");
  };

  if (isLoading || !user) return null;

  const settingsNav =
    user.role === "researcher"
      ? [
          { href: "/researcher/dashboard", label: "Dashboard" },
          { href: "/researcher/campaigns", label: "Campaigns" },
          { href: "/researcher/billing", label: "Billing" },
          { href: "/settings", label: "Settings" },
        ]
      : nav;

  return (
    <DashboardShell
      nav={settingsNav}
      logoHref={user.role === "researcher" ? "/researcher/dashboard" : "/dashboard"}
      title="Settings"
      subtitle="Manage your account and preferences"
      userEmail={user.email}
    >
      <MotionCard className="card max-w-form space-y-6">
        {[
          { label: "Email", value: user.email },
          { label: "Role", value: user.role, capitalize: true },
          { label: "Status", value: user.status.replace("_", " "), capitalize: true },
          { label: "NIN Verified", value: user.ninVerified ? "Yes" : "No" },
          { label: "Premium", value: user.livenessVerified ? "Active" : "Not yet" },
        ].map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0"
          >
            <p className="text-sm text-gray-500">{row.label}</p>
            <p className={`font-medium text-gray-900 ${row.capitalize ? "capitalize" : ""}`}>
              {row.value}
            </p>
          </motion.div>
        ))}
        <motion.button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-btn border border-error-500/20 bg-error-500/5 py-2.5 text-sm font-semibold text-error-600 transition hover:bg-error-500/10"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <LogOut className="h-4 w-4" /> Log out
        </motion.button>
      </MotionCard>
    </DashboardShell>
  );
}
