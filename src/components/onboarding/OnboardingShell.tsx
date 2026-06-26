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
      <div className="relative min-h-screen overflow-hidden bg-paper mesh-bg">
      <FloatingOrb className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary-400/15 blur-3xl" />
      <FloatingOrb className="pointer-events-none absolute -right-16 bottom-32 h-56 w-56 rounded-full bg-secondary-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
        <BrandLogo href="/" size="md" className="mb-8 self-start" />

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-500">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper-300">
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
          <h1 className="font-display text-[1.75rem] font-medium tracking-tight text-ink-900 sm:text-[2rem]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-500">{subtitle}</p>}
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
        "rounded-card border border-ink-900/[0.07] bg-white p-5 shadow-subtle sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
