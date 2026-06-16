"use client";

import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { FloatingOrb } from "@/components/motion";
import { cn } from "@/lib/utils";

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const progress = (step / totalSteps) * 100;

  return (
      <div className="relative min-h-screen overflow-hidden bg-[#f6f4ff]">
      <FloatingOrb className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary-400/20 blur-3xl" />
      <FloatingOrb className="pointer-events-none absolute -right-16 bottom-32 h-56 w-56 rounded-full bg-secondary-400/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
        <BrandLogo href="/" size="md" className="mb-8 self-start" />

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <motion.div
          key={title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-gray-500">{subtitle}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="flex-1"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function OnboardingCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100/80 bg-white p-5 shadow-subtle sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
