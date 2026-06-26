"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

export function Navbar({
  items,
  logoHref = "/",
  actions,
}: {
  items?: NavItem[];
  logoHref?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 border-b border-ink-900/[0.07] bg-paper/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-landing items-center justify-between px-4 sm:px-6">
          <BrandLogo href={logoHref} size="md" />

          {items && (
            <nav className="hidden items-center gap-1 md:flex">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary-700"
                      : "text-ink-600 hover:text-ink-900"
                  )}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary-500"
                    />
                  )}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex sm:items-center sm:gap-3">{actions}</div>
            {items && (
              <motion.button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-pill border border-ink-900/10 text-ink-700 md:hidden"
                onClick={() => setMobileOpen(true)}
                whileTap={{ scale: 0.95 }}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-2xl md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
                <span className="font-bold text-primary-600">Menu</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1 p-4">
                {items?.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium",
                        pathname === item.href
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="space-y-3 border-t border-gray-100 p-4">{actions}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
