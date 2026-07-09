"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Settings,
  Shield,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Surveys: ClipboardList,
  Tasks: ClipboardList,
  Wallet: Wallet,
  Verification: Shield,
  Settings: Settings,
  Campaigns: ClipboardList,
  Projects: ClipboardList,
  Billing: CreditCard,
  Home: Home,
};

export function Sidebar({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-100 bg-white lg:block">
      <div className="sticky top-16 p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = ICONS[item.label] || LayoutDashboard;
            return (
              <Link key={item.href} href={item.href} className="relative block">
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary-50"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "text-primary-700" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-primary-600" : "text-gray-400")} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function MobileBottomNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const mobileItems = items.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/90 backdrop-blur-xl pb-safe lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = ICONS[item.label] || LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-1"
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-dot"
                  className="absolute -top-1 h-1 w-8 rounded-full bg-primary-500"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.9 }}>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary-600" : "text-gray-400"
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-primary-700" : "text-gray-500"
                )}
              >
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
