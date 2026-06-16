"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Crown,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const SCREENS = [
  {
    id: "surveys",
    header: "Available Surveys",
    body: (
      <div className="space-y-2.5">
        {[
          { title: "Mobile Banking UX Study", pay: "₦850", time: "12 min", premium: false },
          { title: "Premium: FMCG Brand Test", pay: "₦2,400", time: "18 min", premium: true },
          { title: "Lagos Transport Survey", pay: "₦600", time: "8 min", premium: false },
        ].map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className={`rounded-xl border p-3 ${s.premium ? "border-amber-200 bg-amber-50/80" : "border-gray-100 bg-gray-50"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold leading-tight text-gray-900">{s.title}</p>
              {s.premium && <Crown className="h-3 w-3 shrink-0 text-amber-500" />}
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-primary-600">{s.pay}</span>
              <span className="text-[10px] text-gray-400">{s.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "question",
    header: "Question 3 of 12",
    body: (
      <div className="space-y-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: "25%" }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs font-semibold text-gray-900">
          How often do you shop online in Nigeria?
        </p>
        {["Daily", "Weekly", "Monthly", "Rarely"].map((opt, i) => (
          <motion.div
            key={opt}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className={`rounded-lg border px-3 py-2 text-[11px] font-medium ${
              i === 1 ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-100 text-gray-600"
            }`}
          >
            {opt}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "wallet",
    header: "Your Wallet",
    body: (
      <div className="space-y-3">
        <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 p-4 text-white">
          <p className="text-[10px] text-primary-100">Available balance</p>
          <motion.p
            className="text-2xl font-bold"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            ₦12,450
          </motion.p>
        </div>
        {[
          { label: "Survey completed", amount: "+₦850", time: "2m ago" },
          { label: "Withdrawal to GTBank", amount: "-₦5,000", time: "Yesterday" },
        ].map((tx, i) => (
          <motion.div
            key={tx.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
          >
            <div>
              <p className="text-[10px] font-medium text-gray-800">{tx.label}</p>
              <p className="text-[9px] text-gray-400">{tx.time}</p>
            </div>
            <span className={`text-[11px] font-bold ${tx.amount.startsWith("+") ? "text-primary-600" : "text-gray-600"}`}>
              {tx.amount}
            </span>
          </motion.div>
        ))}
      </div>
    ),
  },
];

export function PhoneMockup() {
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScreenIndex((i) => (i + 1) % SCREENS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const screen = SCREENS[screenIndex];

  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      {/* Phone frame */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[2.5rem] border-[6px] border-gray-900 bg-gray-900 p-2 shadow-2xl shadow-gray-900/25"
      >
        <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-gray-900" />
        <div className="overflow-hidden rounded-[2rem] bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-white px-5 pb-1 pt-8">
            <span className="text-[10px] font-semibold text-gray-900">9:41</span>
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-gray-900" />
              <div className="h-2.5 w-2.5 rounded-sm bg-gray-900" />
            </div>
          </div>
          {/* App header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-bold text-primary-600">Phinmon</span>
            <ShieldCheck className="h-4 w-4 text-secondary-500" />
          </div>
          {/* Screen content */}
          <div className="h-[340px] px-4 py-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={screen.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <p className="mb-3 text-xs font-semibold text-gray-500">{screen.header}</p>
                {screen.body}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Bottom nav */}
          <div className="flex justify-around border-t border-gray-100 px-2 py-2.5">
            {[
              { icon: ClipboardList, active: screenIndex === 0 },
              { icon: CircleDollarSign, active: false },
              { icon: Wallet, active: screenIndex === 2 },
            ].map(({ icon: Icon, active }, i) => (
              <Icon
                key={i}
                className={`h-4 w-4 ${active ? "text-primary-600" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating notifications */}
      <motion.div
        className="absolute -left-8 top-24 hidden rounded-xl border border-gray-100 bg-white p-3 shadow-lg sm:block"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-900">Survey completed</p>
            <p className="text-[10px] text-primary-600">+₦850 earned</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-6 bottom-32 hidden rounded-xl border border-gray-100 bg-white p-3 shadow-lg sm:block"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100">
            <ShieldCheck className="h-4 w-4 text-secondary-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-900">NIN Verified</p>
            <p className="text-[10px] text-gray-500">Premium unlocked</p>
          </div>
        </div>
      </motion.div>

      {/* Screen dots */}
      <div className="mt-4 flex justify-center gap-1.5">
        {SCREENS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setScreenIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === screenIndex ? "w-6 bg-primary-500" : "w-1.5 bg-gray-300"
            }`}
            aria-label={`Screen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
