import type { User } from "@/types";

export function requiresNinVerification(user: Pick<User, "role">): boolean {
  return user.role === "respondent";
}

export function getPostOnboardingPath(user: Pick<User, "role">): string {
  if (user.role === "researcher" || user.role === "admin") {
    return "/researcher/dashboard";
  }
  return "/dashboard";
}

export function canTakeSurvey(
  survey: { targetAudience: string },
  user: Pick<User, "ninVerified" | "livenessVerified">
): { allowed: boolean; reason?: "nin" | "liveness" } {
  if (!user.ninVerified) {
    return { allowed: false, reason: "nin" };
  }
  if (survey.targetAudience === "PREMIUM_ONLY" && !user.livenessVerified) {
    return { allowed: false, reason: "liveness" };
  }
  return { allowed: true };
}

export function getSurveyLockReason(
  survey: { targetAudience: string },
  user: Pick<User, "ninVerified" | "livenessVerified">
): "nin" | "liveness" | null {
  if (!user.ninVerified) return "nin";
  if (survey.targetAudience === "PREMIUM_ONLY" && !user.livenessVerified) return "liveness";
  return null;
}
