"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Shield } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { CURRENT_TERMS_VERSION } from "@/lib/legal";
import type { User } from "@/types";

function redirectAfterAccept(user: User, router: ReturnType<typeof useRouter>) {
  if (!user.name) {
    router.replace("/onboarding");
    return;
  }
  if (user.role === "researcher") router.replace("/researcher/dashboard");
  else if (user.role === "admin") router.replace("/admin");
  else router.replace("/dashboard");
}

export default function AcceptTermsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.needsTermsAcceptance) {
      redirectAfterAccept(user, router);
    }
  }, [user, isLoading, router]);

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<{ user: User }>("/users/accept-terms", {
        version: CURRENT_TERMS_VERSION,
      });
      queryClient.setQueryData(["auth", "me"], data.user);
      redirectAfterAccept(data.user, router);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setError(msg || "Could not record acceptance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user || !user.needsTermsAcceptance) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card w-full max-w-lg shadow-card">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <FileText className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Accept Terms &amp; Privacy
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-gray-500">
          Before you continue, please review and accept our Terms of Service and Privacy Policy.
          This applies to every account on Phinmon.
        </p>

        <div className="mt-6 space-y-3 rounded-xl border border-ink-900/10 bg-ink-50/60 p-4 text-sm text-ink-700">
          <div className="flex gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            <p>
              We do not store your raw NIN. After verification we keep it encrypted (plus a hash) so
              the same NIN cannot be used on more than one account.
            </p>
          </div>
          <p>
            Read the full documents:{" "}
            <Link href="/terms" className="font-medium text-primary-600 hover:underline" target="_blank">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary-600 hover:underline" target="_blank">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {error && <p className="mt-4 text-sm text-error-600">{error}</p>}

        <button
          type="button"
          className="btn-primary mt-6 w-full"
          disabled={loading}
          onClick={handleAccept}
        >
          {loading ? "Saving..." : "I agree to the Terms and Privacy Policy"}
        </button>
      </div>
    </div>
  );
}
