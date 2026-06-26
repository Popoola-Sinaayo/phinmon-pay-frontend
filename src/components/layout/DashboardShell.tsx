"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { AppSidebar, MobileBottomNav } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { PageTransition } from "@/components/motion";
import { getNavForRole } from "@/config/navigation";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

export type Breadcrumb = { label: string; href?: string };

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-gray-200/80" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-card bg-gray-200/80" />
        ))}
      </div>
      <div className="h-64 rounded-card bg-gray-200/80" />
    </div>
  );
}

export function DashboardShell({
  children,
  user,
  title,
  subtitle,
  actions,
  breadcrumbs,
  backHref,
  loading,
  showCreateAction,
  maxWidth = "default",
  hideHeader,
}: {
  children: React.ReactNode;
  user?: User;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  backHref?: string;
  loading?: boolean;
  showCreateAction?: boolean;
  maxWidth?: "default" | "narrow" | "wide";
  hideHeader?: boolean;
}) {
  const role =
    user?.role === "researcher" || user?.role === "admin" ? "researcher" : "respondent";
  const nav = getNavForRole(role);
  const isResearcher = role === "researcher";

  return (
    <div className="min-h-screen bg-paper">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(31,157,99,0.07),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(221,214,200,0.4),transparent_55%)]" />
      <div className="relative flex min-h-screen">
        <AppSidebar
          items={nav}
          user={user}
          showCreateAction={showCreateAction ?? isResearcher}
        />

        <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-ink-900/[0.07] bg-paper/80 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {backHref && (
                <Link
                  href={backHref}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                  aria-label="Go back"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              )}

              <BrandLogo href={nav[0]?.href || "/dashboard"} size="sm" />

              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="hidden items-center gap-1.5 text-sm md:flex">
                  {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.label} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-gray-300">/</span>}
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="text-gray-500 transition hover:text-gray-900"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
            </div>

            {user ? <UserMenu user={user} /> : <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-100" />}
          </header>

          <main
            className={cn(
              "flex-1 p-4 pb-24 sm:p-6 lg:pb-8",
              maxWidth === "narrow" && "mx-auto w-full max-w-form",
              maxWidth === "wide" && "mx-auto w-full max-w-dashboard"
            )}
          >
            <PageTransition>
              {!hideHeader && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <h1 className="font-display text-[1.65rem] font-medium tracking-tight text-ink-900 sm:text-[1.9rem]">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
                </motion.div>
              )}

              {loading ? <DashboardSkeleton /> : children}
            </PageTransition>
          </main>
        </div>
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
    primary: "border-primary-100 bg-primary-50/80 text-primary-800 hover:bg-primary-100",
    secondary: "border-secondary-100 bg-secondary-50/80 text-secondary-800 hover:bg-secondary-100",
    amber: "border-amber-100 bg-amber-50/80 text-amber-800 hover:bg-amber-100",
  };

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-sm font-semibold transition-colors",
          colors[color]
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    </motion.div>
  );
}
