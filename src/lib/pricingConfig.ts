"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface PricingConfig {
  platformFeeRate: number;
  standardRatePerMinute: number;
  premiumRatePerMinute: number;
  minStandardReward: number;
  minPremiumReward: number;
  lowestRewardStandard: number;
  lowestRewardPremium: number;
  aiAnalyticsCost: number;
  aiSpamFilterCostPerResponse: number;
  timeWeights?: Record<string, number>;
  questionTypeLabels?: Record<string, string>;
  multipleChoiceTimeFormula?: string;
}

/** Fallback used until the backend responds (or if the request fails). */
export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  platformFeeRate: 25,
  standardRatePerMinute: 60,
  premiumRatePerMinute: 120,
  minStandardReward: 100,
  minPremiumReward: 200,
  lowestRewardStandard: 100,
  lowestRewardPremium: 200,
  aiAnalyticsCost: 5000,
  aiSpamFilterCostPerResponse: 20,
};

export async function fetchPricingConfig(): Promise<PricingConfig> {
  try {
    const { data } = await api.get<Partial<PricingConfig> & { success: boolean }>("/config/pricing");
    return {
      platformFeeRate: data.platformFeeRate ?? DEFAULT_PRICING_CONFIG.platformFeeRate,
      standardRatePerMinute:
        data.standardRatePerMinute ?? DEFAULT_PRICING_CONFIG.standardRatePerMinute,
      premiumRatePerMinute:
        data.premiumRatePerMinute ?? DEFAULT_PRICING_CONFIG.premiumRatePerMinute,
      minStandardReward: data.minStandardReward ?? DEFAULT_PRICING_CONFIG.minStandardReward,
      minPremiumReward: data.minPremiumReward ?? DEFAULT_PRICING_CONFIG.minPremiumReward,
      lowestRewardStandard:
        data.lowestRewardStandard ?? DEFAULT_PRICING_CONFIG.lowestRewardStandard,
      lowestRewardPremium:
        data.lowestRewardPremium ?? DEFAULT_PRICING_CONFIG.lowestRewardPremium,
      aiAnalyticsCost: data.aiAnalyticsCost ?? DEFAULT_PRICING_CONFIG.aiAnalyticsCost,
      aiSpamFilterCostPerResponse:
        data.aiSpamFilterCostPerResponse ?? DEFAULT_PRICING_CONFIG.aiSpamFilterCostPerResponse,
      timeWeights: data.timeWeights,
      questionTypeLabels: data.questionTypeLabels,
      multipleChoiceTimeFormula: data.multipleChoiceTimeFormula,
    };
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
}

/** Fetches pricing config on mount, falling back to defaults. */
export function usePricingConfig(): PricingConfig {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);

  useEffect(() => {
    let active = true;
    fetchPricingConfig().then((c) => {
      if (active) setConfig(c);
    });
    return () => {
      active = false;
    };
  }, []);

  return config;
}

export interface PricingTier {
  responses: number;
  rewardPerResponse: number;
  budget: number;
  platformFee: number;
  totalCost: number;
}

/**
 * Builds "from" pricing tiers using the cheapest possible question type
 * (lowest per-response reward) and the platform fee rate from the backend.
 */
export function computeFromTiers(
  config: PricingConfig,
  responseCounts: number[] = [100, 200, 500]
): PricingTier[] {
  return responseCounts.map((responses) => {
    const rewardPerResponse = config.lowestRewardStandard;
    const budget = responses * rewardPerResponse;
    const platformFee = Math.round(budget * (config.platformFeeRate / 100));
    return {
      responses,
      rewardPerResponse,
      budget,
      platformFee,
      totalCost: budget + platformFee,
    };
  });
}

/** Lowest possible cost for a single response, including the platform fee. */
export function computeFromPerResponse(config: PricingConfig): number {
  const reward = config.lowestRewardStandard;
  return reward + Math.round(reward * (config.platformFeeRate / 100));
}
