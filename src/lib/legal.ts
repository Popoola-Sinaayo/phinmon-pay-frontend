/** Must match backend/src/constants/legal.ts — bump when Terms or Privacy change. */
export const CURRENT_TERMS_VERSION = "2026-07-21";

export function needsTermsAcceptance(termsVersion?: string | null): boolean {
  return !termsVersion || termsVersion !== CURRENT_TERMS_VERSION;
}
