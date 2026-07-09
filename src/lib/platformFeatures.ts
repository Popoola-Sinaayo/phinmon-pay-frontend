"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface PlatformFeatures {
  premiumLivenessEnabled: boolean;
  premiumAudienceEnabled: boolean;
  premiumLivenessComingSoon: boolean;
}

export const DEFAULT_PLATFORM_FEATURES: PlatformFeatures = {
  premiumLivenessEnabled: false,
  premiumAudienceEnabled: false,
  premiumLivenessComingSoon: true,
};

export async function fetchPlatformFeatures(): Promise<PlatformFeatures> {
  try {
    const { data } = await api.get<Partial<PlatformFeatures> & { success: boolean }>(
      "/config/features"
    );
    return {
      premiumLivenessEnabled: data.premiumLivenessEnabled ?? false,
      premiumAudienceEnabled: data.premiumAudienceEnabled ?? false,
      premiumLivenessComingSoon:
        data.premiumLivenessComingSoon ?? !data.premiumLivenessEnabled,
    };
  } catch {
    return DEFAULT_PLATFORM_FEATURES;
  }
}

export function isPremiumLivenessAvailable(features: PlatformFeatures): boolean {
  return features.premiumLivenessEnabled && !features.premiumLivenessComingSoon;
}

export function usePlatformFeatures(): PlatformFeatures {
  const [features, setFeatures] = useState<PlatformFeatures>(DEFAULT_PLATFORM_FEATURES);

  useEffect(() => {
    let active = true;
    fetchPlatformFeatures().then((f) => {
      if (active) setFeatures(f);
    });
    return () => {
      active = false;
    };
  }, []);

  return features;
}
