"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/surveys", label: "Projects" },
  { href: "/admin/withdrawals", label: "Withdrawals" },
];

export function AdminShell({
  children,
  title,
  subtitle,
  backHref,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(31,157,99,0.06),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(221,214,200,0.35),transparent_55%)]" />
      <div className="relative">
        <Navbar logoHref="/admin" items={ADMIN_NAV} />
        <main className="mx-auto max-w-dashboard p-4 sm:p-6">
          {backHref && (
            <Link
              href={backHref}
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h1 className="font-display text-xl font-medium tracking-tight text-ink-900 sm:text-[1.9rem]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
