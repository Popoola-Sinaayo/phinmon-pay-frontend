"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { Survey } from "@/types";
import { PremiumBadge } from "./Badges";
import { Clock, HelpCircle, TrendingUp } from "lucide-react";

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function SurveyCard({
  survey,
  href,
  locked,
  index = 0,
}: {
  survey: Survey;
  href: string;
  locked?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      {...cardMotion}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="card-hover flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{survey.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{survey.description}</p>
        </div>
        {survey.targetAudience === "PREMIUM_ONLY" && <PremiumBadge />}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-sm font-semibold text-primary-700">
          {formatCurrency(survey.payoutPerResponse)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
          <Clock className="h-3 w-3" /> ~{survey.estimatedMinutes || 10} min
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
          <HelpCircle className="h-3 w-3" /> {survey.questions?.length || 0} Qs
        </span>
      </div>
      {locked ? (
        <Link href="/verification" className="btn-secondary text-center">
          Unlock Premium Access
        </Link>
      ) : (
        <Link href={href} className="btn-primary text-center">
          Start Survey
        </Link>
      )}
    </motion.div>
  );
}

const metricIconColors: Record<string, string> = {
  default: "bg-gray-100 text-gray-500",
  primary: "bg-primary-100 text-primary-600",
  secondary: "bg-secondary-100 text-secondary-600",
  amber: "bg-amber-100 text-amber-600",
};

export function MetricCard({
  title,
  value,
  subtitle,
  className,
  icon: Icon,
  trend,
  index = 0,
  iconColor = "default",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: string;
  index?: number;
  iconColor?: keyof typeof metricIconColors;
}) {
  return (
    <motion.div
      {...cardMotion}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className={cn("card-hover", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
          {trend && (
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary-600">
              <TrendingUp className="h-3 w-3" /> {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              metricIconColors[iconColor]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function CampaignRow({
  survey,
  index = 0,
}: {
  survey: Survey & {
    responsesReceived?: number;
    responsesNeeded?: number;
    totalCost?: number;
    billingModel?: "PREPAID" | "PAYG";
    amountSpent?: number;
    billingLocked?: boolean;
  };
  index?: number;
}) {
  const progress =
    survey.responsesNeeded && survey.responsesReceived
      ? Math.min(100, Math.round((survey.responsesReceived / survey.responsesNeeded) * 100))
      : 0;

  return (
    <motion.div
      {...cardMotion}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-subtle transition hover:border-primary-100 hover:shadow-card"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-gray-900">{survey.title}</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
            {survey.status.replace(/_/g, " ")}
          </span>
          {survey.billingModel === "PAYG" && (
            <span className="rounded-full bg-secondary-50 px-2 py-0.5 text-[10px] font-semibold text-secondary-700">
              PAYG
            </span>
          )}
          {survey.billingLocked && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Locked
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-gray-500">{survey.description}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 max-w-[140px] overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500">
            {survey.responsesReceived ?? 0}/{survey.responsesNeeded ?? 0} responses
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-gray-400">
            {survey.billingModel === "PAYG" ? "Spent" : "Budget"}
          </p>
          <p className="font-bold text-primary-600">
            {survey.billingModel === "PAYG"
              ? formatCurrency(survey.amountSpent || 0)
              : formatCurrency(survey.totalCost || 0)}
          </p>
        </div>
        <Link
          href={`/researcher/campaigns/${survey._id}`}
          className="btn-secondary text-sm opacity-90 transition group-hover:opacity-100"
        >
          Manage
        </Link>
      </div>
    </motion.div>
  );
}

export function WalletCard({
  available,
  pending,
  lifetime,
}: {
  available: number;
  pending: number;
  lifetime: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary-600 via-primary-600 to-primary-800 p-6 text-white shadow-glow sm:col-span-2 lg:col-span-1"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative">
        <p className="text-sm font-medium text-primary-100">Available Balance</p>
        <motion.p
          className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {formatCurrency(available)}
        </motion.p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-primary-100">
          <div>
            <p className="text-xs text-primary-200">Pending</p>
            <p className="font-semibold text-white">{formatCurrency(pending)}</p>
          </div>
          <div>
            <p className="text-xs text-primary-200">Lifetime</p>
            <p className="font-semibold text-white">{formatCurrency(lifetime)}</p>
          </div>
        </div>
        <Link
          href="/wallet/withdraw"
          className="mt-5 inline-flex items-center rounded-btn bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
        >
          Withdraw funds →
        </Link>
      </div>
    </motion.div>
  );
}
