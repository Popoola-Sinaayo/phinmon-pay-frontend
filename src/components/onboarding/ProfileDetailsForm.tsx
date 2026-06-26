"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, Calendar, MapPin, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";
import { MotionButton } from "@/components/motion";
import type { Profile, User } from "@/types";

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 16))
  .toISOString()
  .split("T")[0];

type ProfileResponse = { user: User; profile?: Profile };

export function ProfileDetailsForm({
  onSaved,
  onCancel,
}: {
  onSaved: () => void | Promise<void>;
  onCancel?: () => void;
}) {
  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/users/profile")).data,
  });

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    occupation: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.user?.name || "",
      dateOfBirth: data.profile?.dateOfBirth ? data.profile.dateOfBirth.split("T")[0] : "",
      gender: data.profile?.gender || "",
      state: data.profile?.state || "",
      occupation: data.profile?.occupation || "",
    });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patch("/users/profile", form);
      await onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-primary-200 border-t-primary-600"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-400" /> Legal full name
        </label>
        <input
          className="input"
          placeholder="As on your NIN"
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
          max={maxDob}
        />
      </div>

      <div>
        <label className="label">Gender</label>
        <div className="grid grid-cols-2 gap-2">
          {GENDER_OPTIONS.map((opt) => (
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
        <p className="rounded-lg bg-error-500/10 px-3 py-2 text-sm text-error-600">{error}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {onCancel && (
          <button type="button" className="btn-secondary sm:flex-1" onClick={onCancel}>
            Cancel
          </button>
        )}
        <MotionButton type="submit" className="btn-primary sm:flex-1" disabled={saving}>
          {saving ? "Saving..." : "Save details"}
        </MotionButton>
      </div>
    </form>
  );
}
