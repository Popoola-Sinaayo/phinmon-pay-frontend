"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { CURRENT_TERMS_VERSION } from "@/lib/legal";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "respondent";
  const [email, setEmail] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedLegal) {
      setError("You must accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/request-otp", {
        email,
        role,
        acceptedTermsVersion: CURRENT_TERMS_VERSION,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&role=${role}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-form px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="mt-2 text-sm text-gray-500">
        Signing up as a <span className="font-medium capitalize">{role}</span>
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            {(["respondent", "researcher"] as const).map((r) => (
              <Link
                key={r}
                href={`/register?role=${r}`}
                className={`rounded-btn border px-4 py-3 text-center text-sm font-medium capitalize ${
                  role === r
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {r === "respondent" ? "Get paid for opinions" : "Run Research"}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <label className="flex items-start gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            checked={acceptedLegal}
            onChange={(e) => setAcceptedLegal(e.target.checked)}
            required
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-primary-600 hover:underline" target="_blank">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary-600 hover:underline" target="_blank">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {error && <p className="text-sm text-error-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading || !acceptedLegal}>
          {loading ? "Sending..." : "Continue"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
