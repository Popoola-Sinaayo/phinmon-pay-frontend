"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

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
    age: "",
    gender: "",
    state: "",
    occupation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/users/onboarding", {
        ...form,
        age: Number(form.age),
      });
      router.push("/onboarding/verify-nin");
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="p-16 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-form px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Tell us about yourself</h1>
      <p className="mt-2 text-sm text-gray-500">Step 1 of 2 — Basic information</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Age</label>
          <input type="number" className="input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required min={16} max={100} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="label">State</label>
          <select className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required>
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Occupation</label>
          <input className="input" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} required />
        </div>
        {error && <p className="text-sm text-error-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          Continue
        </button>
      </form>
    </div>
  );
}
