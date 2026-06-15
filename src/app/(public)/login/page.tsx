"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { FadeIn } from "@/components/motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/request-otp", { email });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <FadeIn className="w-full max-w-form">
        <motion.div
          className="card shadow-card"
          whileHover={{ boxShadow: "0 20px 40px -12px rgb(0 0 0 / 0.1)" }}
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email — we&apos;ll send a 6-digit code. No password needed.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-error-600"
              >
                {error}
              </motion.p>
            )}
            <motion.button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
            >
              {loading ? "Sending code..." : "Continue"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </motion.button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary-600 hover:underline">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </FadeIn>
    </div>
  );
}
