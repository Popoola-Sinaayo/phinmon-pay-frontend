"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { PricingConfig } from "@/lib/pricingConfig";

export interface QuestionBreakdownItem {
  index: number;
  type: string;
  seconds: number;
  optionCount?: number;
}

export interface SurveyPricingPreview {
  estimatedTimeSeconds: number;
  estimatedTimeMinutes: number;
  rewardPerResponseStandard: number;
  rewardPerResponsePremium: number;
  payoutPerResponse?: number;
  budget?: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  aiSpamFilterCost?: number;
  aiAnalyticsCost?: number;
  aiAddOnsCost?: number;
  totalCost: number;
  highComplexity?: boolean;
  questionBreakdown?: QuestionBreakdownItem[];
}

interface SurveyPricingBreakdownProps {
  pricing: SurveyPricingPreview;
  pricingConfig: PricingConfig;
  responsesNeeded: number;
  targetAudience: "ALL_VERIFIED" | "PREMIUM_ONLY";
  aiSpamFilterEnabled: boolean;
  aiAnalyticsEnabled: boolean;
  compact?: boolean;
}

const DEFAULT_TIME_WEIGHTS: Record<string, number> = {
  boolean: 2,
  single_choice: 4,
  multiple_choice: 6,
  rating: 3,
  number: 6,
  text_short: 15,
  text_long: 45,
};

const DEFAULT_TYPE_LABELS: Record<string, string> = {
  boolean: "Yes / No",
  single_choice: "Single choice",
  multiple_choice: "Multiple choice",
  rating: "Rating scale",
  number: "Number input",
  text_short: "Short text",
  text_long: "Long text",
};

function formatQuestionType(
  type: string,
  labels: Record<string, string>,
  optionCount?: number
): string {
  const label = labels[type] || type.replace(/_/g, " ");
  if (type === "multiple_choice" && optionCount) {
    return `${label} (${optionCount} options)`;
  }
  return label;
}

export function SurveyPricingBreakdown({
  pricing,
  pricingConfig,
  responsesNeeded,
  targetAudience,
  aiSpamFilterEnabled,
  aiAnalyticsEnabled,
  compact = false,
}: SurveyPricingBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  const timeWeights = pricingConfig.timeWeights ?? DEFAULT_TIME_WEIGHTS;
  const typeLabels = pricingConfig.questionTypeLabels ?? DEFAULT_TYPE_LABELS;
  const ratePerMinute =
    targetAudience === "PREMIUM_ONLY"
      ? pricingConfig.premiumRatePerMinute
      : pricingConfig.standardRatePerMinute;
  const minReward =
    targetAudience === "PREMIUM_ONLY"
      ? pricingConfig.minPremiumReward
      : pricingConfig.minStandardReward;
  const rewardPerResponse =
    targetAudience === "PREMIUM_ONLY"
      ? pricing.rewardPerResponsePremium
      : pricing.rewardPerResponseStandard;
  const responseCost = rewardPerResponse * responsesNeeded;
  const rawRewardFromTime = Math.round(
    (pricing.estimatedTimeSeconds / 60) * ratePerMinute
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <div className="flex gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Survey pricing is not fixed</p>
            <p className="mt-1 text-blue-800">
              Your total depends on the estimated completion time, which is calculated from the
              types of questions you add. Changing questions, audience, or response count will
              update the price before you pay.
            </p>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
          <p>
            <strong>Estimated time:</strong> ~{pricing.estimatedTimeMinutes} min (
            {pricing.estimatedTimeSeconds}s)
          </p>
          <p className="mt-2">
            <strong>Reward per response:</strong> {formatCurrency(rewardPerResponse)}
            {targetAudience === "ALL_VERIFIED" && (
              <span className="text-gray-500">
                {" "}
                (premium tier: {formatCurrency(pricing.rewardPerResponsePremium)})
              </span>
            )}
          </p>
          <p className="mt-2">Response cost: {formatCurrency(responseCost)}</p>
          <p>
            Platform fee ({pricing.platformFeeRate}%): {formatCurrency(pricing.platformFeeAmount)}
          </p>
          {(pricing.aiAddOnsCost || 0) > 0 && (
            <>
              {aiSpamFilterEnabled && (
                <p className="mt-2">
                  AI spam filtering: {formatCurrency(pricing.aiSpamFilterCost || 0)}
                </p>
              )}
              {aiAnalyticsEnabled && (
                <p>AI analytics chat: {formatCurrency(pricing.aiAnalyticsCost || 0)}</p>
              )}
            </>
          )}
          <p className="mt-2 font-bold text-primary-600">
            Total due at launch: {formatCurrency(pricing.totalCost)}
          </p>
          {pricing.highComplexity && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              This survey is flagged as high complexity due to multiple-choice questions with more
              than 10 options.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        <span>How is this calculated?</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="space-y-4 rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-900">Step 1 — Estimate completion time</p>
            <p className="mt-1">
              Each question type has a time weight. Multiple-choice questions add 2 seconds per
              option ({pricingConfig.multipleChoiceTimeFormula || "6s base + 2s per option"}).
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 pr-3 font-medium">Question type</th>
                    <th className="py-2 font-medium">Time weight</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(timeWeights)
                    .filter(([type]) => type !== "text")
                    .map(([type, seconds]) => (
                      <tr key={type} className="border-b border-gray-100">
                        <td className="py-2 pr-3">{typeLabels[type] || type}</td>
                        <td className="py-2">
                          {type === "multiple_choice"
                            ? pricingConfig.multipleChoiceTimeFormula || "6s + 2s/option"
                            : `${seconds}s`}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {pricing.questionBreakdown && pricing.questionBreakdown.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500">Your survey</p>
                <ul className="mt-1 space-y-1 text-xs">
                  {pricing.questionBreakdown.map((q) => (
                    <li key={q.index}>
                      Q{q.index}: {formatQuestionType(q.type, typeLabels, q.optionCount)} —{" "}
                      {q.seconds}s
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-medium text-gray-900">
                  Total: {pricing.estimatedTimeSeconds}s (~{pricing.estimatedTimeMinutes} min)
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-900">Step 2 — Reward per response</p>
            <p className="mt-1">
              {formatCurrency(ratePerMinute)}/min × {pricing.estimatedTimeMinutes} min ={" "}
              {formatCurrency(rawRewardFromTime)}
              {rawRewardFromTime < minReward && (
                <>
                  {" "}
                  → minimum {formatCurrency(minReward)} applied ={" "}
                  {formatCurrency(rewardPerResponse)}
                </>
              )}
              {rawRewardFromTime >= minReward && <> = {formatCurrency(rewardPerResponse)}</>}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Step 3 — Response budget</p>
            <p className="mt-1">
              {formatCurrency(rewardPerResponse)} × {responsesNeeded} responses ={" "}
              {formatCurrency(responseCost)}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Step 4 — Platform fee</p>
            <p className="mt-1">
              {pricing.platformFeeRate}% of {formatCurrency(responseCost)} ={" "}
              {formatCurrency(pricing.platformFeeAmount)}
            </p>
          </div>

          {(pricing.aiAddOnsCost || 0) > 0 && (
            <div>
              <p className="font-semibold text-gray-900">Step 5 — AI add-ons</p>
              {aiSpamFilterEnabled && (
                <p className="mt-1">
                  Spam filter: {formatCurrency(pricingConfig.aiSpamFilterCostPerResponse)} ×{" "}
                  {responsesNeeded} = {formatCurrency(pricing.aiSpamFilterCost || 0)}
                </p>
              )}
              {aiAnalyticsEnabled && (
                <p className="mt-1">
                  Analytics chat: {formatCurrency(pricing.aiAnalyticsCost || 0)} flat
                </p>
              )}
            </div>
          )}

          <div className="rounded-lg bg-gray-50 px-3 py-2 font-semibold text-gray-900">
            Total = {formatCurrency(responseCost)} + {formatCurrency(pricing.platformFeeAmount)}
            {(pricing.aiAddOnsCost || 0) > 0 && ` + ${formatCurrency(pricing.aiAddOnsCost || 0)}`}{" "}
            = {formatCurrency(pricing.totalCost)}
          </div>
        </div>
      )}
    </div>
  );
}
