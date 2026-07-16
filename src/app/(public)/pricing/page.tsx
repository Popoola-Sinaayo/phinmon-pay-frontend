"use client";

import Link from "next/link";
import { CircleDollarSign, ClipboardList, CreditCard, HelpCircle, Sparkles, Users } from "lucide-react";
import { computeFromPerResponse, usePricingConfig } from "@/lib/pricingConfig";
import { formatCurrency } from "@/lib/utils";

export default function PricingPage() {
  const pricingConfig = usePricingConfig();
  const fromPerResponse = computeFromPerResponse(pricingConfig);

  return (
    <div className="mx-auto max-w-landing px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-medium tracking-tight text-ink-900">Pricing</h1>
      <p className="mt-2 text-gray-600">
        Project pricing is calculated automatically from your study setup. You see the full total
        before you pay — no manual reward overrides.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">From {formatCurrency(fromPerResponse)}</span>{" "}
          per response
        </p>
        <p className="text-gray-700">
          Platform fee:{" "}
          <span className="font-semibold text-gray-900">{pricingConfig.platformFeeRate}%</span>
        </p>
      </div>

      <div className="card mt-12 border-2 border-primary-500 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
          Start for free
        </span>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-4xl font-extrabold">₦0</p>
            <p className="mt-1 text-sm text-gray-400">No signup fee · No subscription</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-primary-400" />
                Respondents join and get paid for their opinions
              </li>
              <li className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary-400" />
                Researchers build draft projects at no cost
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary-400" />
                Pay in full when you launch a live study
              </li>
            </ul>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <Link href="/register?role=respondent" className="btn-primary bg-white text-gray-900 hover:bg-gray-100">
              Start earning free
            </Link>
            <Link
              href="/register?role=researcher"
              className="inline-flex items-center justify-center rounded-btn border border-gray-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-gray-900">What drives your project cost</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary-600" />
            <p className="text-lg font-bold text-gray-900">Number of questions</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            More questions mean more respondent effort. Each question type contributes to the
            estimated completion time and reward.
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            <p className="text-lg font-bold text-gray-900">Number of respondents</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Set how many verified responses you need. Total payout scales with the number of people
            who share their opinions in your study.
          </p>
        </div>
        <div className="card border-primary-100 bg-primary-50/30">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary-600" />
            <p className="text-lg font-bold text-gray-900">Type of questions</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Yes/no, multiple choice, ratings, and text fields each carry different time weights.
            Longer or more complex questions increase the per-response reward.
          </p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-gray-900">Optional AI add-ons</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <p className="text-lg font-bold text-gray-900">AI spam filtering</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Automatically flag nonsensical or low-quality text answers for review before payout.
            Priced per response when enabled at project creation.
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <p className="text-lg font-bold text-gray-900">AI analytics chat</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Ask questions about your project results and get instant insights from your response data.
            One flat fee per project when enabled.
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        Your exact total  including any AI add-ons  is shown in the project builder before you
        pay.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/register?role=researcher" className="btn-primary">
          Launch Your First Project
        </Link>
        <Link href="/register?role=respondent" className="btn-secondary">
          Start for free as a respondent
        </Link>
      </div>
    </div>
  );
}
