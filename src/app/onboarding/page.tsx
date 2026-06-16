"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, User, Briefcase } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingCard, OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { MotionButton } from "@/components/motion";
import { getPostOnboardingPath, requiresNinVerification } from "@/lib/verification";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    occupation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const needsNin = user ? requiresNinVerification(user) : true;

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/users/onboarding", form);
      router.push(getPostOnboardingPath(user));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-primary-200 border-t-primary-600"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <OnboardingShell
      step={1}
      totalSteps={needsNin ? 2 : 1}
      title="Tell us about yourself"
      subtitle={
        needsNin
          ? "Use your legal name and date of birth exactly as they appear on your NIN — we'll verify them in the next step."
          : "A few details so we can personalize your researcher account."
      }
    >
      <OnboardingCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" /> Legal full name
            </label>
            <input
              className="input"
              placeholder={needsNin ? "As on your NIN" : "Full name"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" /> Date of birth
            </label>
            <input
              type="date"
              className="input"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              required
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 16))
                .toISOString()
                .split("T")[0]}
            />
          </div>

          <div>
            <label className="label">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, gender: opt.value })}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    form.gender === opt.value
                      ? "border-primary-500 bg-primary-50 text-primary-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" /> State
            </label>
            <select
              className="input"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400" /> Occupation
            </label>
            <input
              className="input"
              placeholder="e.g. Student, Trader, Engineer"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-600"
            >
              {error}
            </motion.p>
          )}

          <MotionButton type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Saving..." : needsNin ? "Continue to NIN verification" : "Continue to dashboard"}
          </MotionButton>
        </form>
      </OnboardingCard>
    </OnboardingShell>
  );
}
