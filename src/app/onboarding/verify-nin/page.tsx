"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyNinPage() {
  const router = useRouter();
  const { data: user, isLoading, refetch } = useAuth();
  const [nin, setNin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (user?.ninVerified) {
      router.push(user.role === "researcher" ? "/researcher/dashboard" : "/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/verification/nin", { nin });
      setSuccess(true);
      await refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="p-16 text-center">Loading...</div>;

  if (success) {
    return (
      <div className="mx-auto max-w-form px-4 py-16 text-center">
        <div className="text-5xl">✓</div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Verification Successful</h1>
        <p className="mt-2 text-gray-500">Your identity has been verified.</p>
        <button
          className="btn-primary mt-8"
          onClick={() =>
            router.push(user?.role === "researcher" ? "/researcher/dashboard" : "/dashboard")
          }
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-form px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">NIN Verification</h1>
      <p className="mt-2 text-sm text-gray-500">Step 2 of 2 — Enter your 11-digit National Identification Number</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label">NIN</label>
          <input
            className="input"
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="12345678901"
            required
            maxLength={11}
          />
        </div>
        {error && <p className="text-sm text-error-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading || nin.length !== 11}>
          {loading ? "Verifying..." : "Verify NIN"}
        </button>
      </form>
    </div>
  );
}
