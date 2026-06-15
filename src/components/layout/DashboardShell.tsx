"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar, MobileBottomNav } from "@/components/Sidebar";
import { PageTransition } from "@/components/motion";
import { cn } from "@/lib/utils";

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-card bg-gray-200" />
        ))}
      </div>
      <div className="h-64 rounded-card bg-gray-200" />
    </div>
  );
}

export function DashboardShell({
  children,
  nav,
  logoHref,
  title,
  subtitle,
  actions,
  userEmail,
}: {
  children: React.ReactNode;
  nav: { href: string; label: string }[];
  logoHref: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  userEmail?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <Navbar
        logoHref={logoHref}
        actions={
          userEmail ? (
            <span className="hidden max-w-[140px] truncate text-sm text-gray-500 sm:inline">
              {userEmail}
            </span>
          ) : undefined
        }
      />
      <div className="mx-auto flex max-w-dashboard">
        <Sidebar items={nav} />
        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 pb-24 sm:p-6 lg:pb-6">
          <PageTransition>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {title}
                </h1>
                {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
              </div>
              {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
            </motion.div>
            {children}
          </PageTransition>
        </main>
      </div>
      <MobileBottomNav items={nav} />
    </div>
  );
}

export function QuickAction({
  href,
  icon: Icon,
  label,
  color = "primary",
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color?: "primary" | "secondary" | "amber";
}) {
  const colors = {
    primary: "bg-primary-50 text-primary-700 hover:bg-primary-100",
    secondary: "bg-secondary-50 text-secondary-700 hover:bg-secondary-100",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  };

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center gap-2 rounded-card p-4 text-center text-sm font-medium transition-colors",
          colors[color]
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    </motion.div>
  );
}
