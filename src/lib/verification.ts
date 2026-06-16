import type { User } from "@/types";

export function requiresNinVerification(user: Pick<User, "role">): boolean {
  return user.role === "respondent";
}

export function getPostOnboardingPath(user: Pick<User, "role">): string {
  if (user.role === "researcher" || user.role === "admin") {
    return "/researcher/dashboard";
  }
  return "/onboarding/verify-nin";
}
