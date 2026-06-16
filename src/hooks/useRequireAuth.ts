"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { requiresNinVerification } from "@/lib/verification";
import type { UserRole } from "@/types";

type ExpectedRole = "respondent" | "researcher";

export function useRequireAuth(
  expectedRole?: ExpectedRole,
  options?: { requireNin?: boolean }
) {
  const router = useRouter();
  const { data: user, isLoading, refetch } = useAuth();
  const requireNin = options?.requireNin ?? false;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (requireNin && requiresNinVerification(user) && !user.ninVerified) {
      router.push("/onboarding/verify-nin");
      return;
    }
    if (!expectedRole) return;

    const researcherRoles: UserRole[] = ["researcher", "admin"];
    const isResearcher = researcherRoles.includes(user.role);
    if (expectedRole === "researcher" && !isResearcher) {
      router.push("/dashboard");
      return;
    }
    if (expectedRole === "respondent" && isResearcher) {
      router.push("/researcher/dashboard");
    }
  }, [user, isLoading, router, expectedRole, requireNin]);

  return { user, isLoading, refetch };
}
