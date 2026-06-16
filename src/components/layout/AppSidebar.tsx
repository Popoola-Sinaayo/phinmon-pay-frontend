"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { isNavActive, RESEARCHER_CREATE, type NavItem } from "@/config/navigation";
import type { User } from "@/types";

export function AppSidebar({
  items,
  user,
  showCreateAction,
}: {
  items: NavItem[];
  user?: User;
  showCreateAction?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-gray-200/80 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
        <BrandLogo href={items[0]?.href || "/dashboard"} size="sm" />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {showCreateAction && (
          <Link
            href={RESEARCHER_CREATE.href}
            className={cn(
              "mb-3 flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800",
              pathname.startsWith("/researcher/campaigns/new") && "ring-2 ring-primary-500 ring-offset-2"
            )}
          >
            <RESEARCHER_CREATE.icon className="h-4 w-4" />
            New campaign
          </Link>
        )}

        {items.map((item) => {
          const active = isNavActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative block">
              {active && (
                <motion.span
                  layoutId="app-sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary-50"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "text-primary-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    active ? "bg-primary-600 text-white shadow-sm" : "bg-gray-100 text-gray-500"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {user && user.role === "respondent" && (
        <div className="border-t border-gray-100 p-4">
          <VerificationStrip user={user} />
        </div>
      )}
    </aside>
  );
}

function VerificationStrip({ user }: { user: User }) {
  const steps = [
    { done: true, label: "Account" },
    { done: user.ninVerified, label: "NIN" },
    { done: user.livenessVerified, label: "Premium" },
  ];
  const completed = steps.filter((s) => s.done).length;

  return (
    <Link
      href="/verification"
      className="block rounded-xl border border-gray-100 bg-gray-50/80 p-3 transition hover:border-primary-200 hover:bg-primary-50/30"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-700">Verification</p>
        <span className="text-xs font-bold text-primary-600">{completed}/3</span>
      </div>
      <div className="mt-2 flex gap-1">
        {steps.map((step) => (
          <div
            key={step.label}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step.done ? "bg-primary-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>
      <p className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
        {user.livenessVerified ? (
          <>
            <Crown className="h-3 w-3 text-amber-500" /> Premium active
          </>
        ) : user.ninVerified ? (
          <>
            <ShieldCheck className="h-3 w-3 text-primary-500" /> Upgrade to premium
          </>
        ) : (
          "Complete NIN to earn"
        )}
      </p>
    </Link>
  );
}

export function MobileBottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 bg-white/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-safe pt-1">
        {items.map((item) => {
          const active = isNavActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center py-2"
            >
              {active && (
                <motion.span
                  layoutId="mobile-tab-active"
                  className="absolute inset-x-2 inset-y-1 rounded-xl bg-primary-50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span className="relative" whileTap={{ scale: 0.88 }}>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary-600" : "text-gray-400"
                  )}
                />
              </motion.span>
              <span
                className={cn(
                  "relative mt-0.5 text-[10px] font-semibold",
                  active ? "text-primary-700" : "text-gray-500"
                )}
              >
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
