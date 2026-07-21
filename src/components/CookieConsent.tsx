"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export type CookieConsentValue = "accepted" | "rejected";

export const COOKIE_CONSENT_KEY = "phinmon_cookie_consent";

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function setCookieConsent(value: CookieConsentValue) {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new Event("phinmon-cookie-consent"));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(getCookieConsent());
    setReady(true);
    const onChange = () => setConsent(getCookieConsent());
    window.addEventListener("phinmon-cookie-consent", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("phinmon-cookie-consent", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const accept = useCallback(() => {
    setCookieConsent("accepted");
    setConsent("accepted");
  }, []);

  const reject = useCallback(() => {
    setCookieConsent("rejected");
    setConsent("rejected");
  }, []);

  return { consent, ready, accept, reject, analyticsAllowed: consent === "accepted" };
}

export function CookieConsent() {
  const { consent, ready, accept, reject } = useCookieConsent();

  if (!ready || consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-ink-900/10 bg-white/95 p-4 shadow-lg backdrop-blur sm:p-5">
      <div className="mx-auto flex max-w-landing flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-ink-700">
          We use essential cookies to keep you signed in. With your permission we also use Google
          Analytics and Crisp chat to improve Phinmon and support you. See our{" "}
          <Link href="/privacy" className="font-medium text-primary-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={reject}>
            Reject non-essential
          </button>
          <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={accept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
