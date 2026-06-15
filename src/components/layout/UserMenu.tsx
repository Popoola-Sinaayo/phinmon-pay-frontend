"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LogOut, Settings, ShieldCheck, Crown } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

function getInitials(user: User) {
  if (user.name) {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return user.email[0].toUpperCase();
}

export function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    setAuthToken(null);
    router.push("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-gray-300 hover:shadow-subtle"
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white",
            user.livenessVerified
              ? "bg-gradient-to-br from-amber-500 to-amber-600"
              : user.ninVerified
                ? "bg-gradient-to-br from-primary-500 to-primary-700"
                : "bg-gray-400"
          )}
        >
          {getInitials(user)}
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 sm:block">
          {user.name?.split(" ")[0] || user.email.split("@")[0]}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate font-semibold text-gray-900">{user.name || "User"}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.ninVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                    <ShieldCheck className="h-3 w-3" /> NIN
                  </span>
                )}
                {user.livenessVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    <Crown className="h-3 w-3" /> Premium
                  </span>
                )}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-gray-600">
                  {user.role}
                </span>
              </div>
            </div>
            <div className="p-1.5">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 text-gray-400" /> Settings
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error-600 hover:bg-error-500/5"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
