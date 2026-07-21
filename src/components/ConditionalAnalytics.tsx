"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useCookieConsent } from "@/components/CookieConsent";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function ConditionalAnalytics() {
  const { analyticsAllowed, ready } = useCookieConsent();
  if (!ready || !analyticsAllowed || !gaMeasurementId) return null;
  return <GoogleAnalytics gaId={gaMeasurementId} />;
}
