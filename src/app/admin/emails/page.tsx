"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Mail, Send } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/layout/AdminShell";

type Audience =
  | "all"
  | "unverified"
  | "verified"
  | "pending_verification"
  | "respondents"
  | "researchers"
  | "premium";

type Template = "use_platform" | "complete_verification" | "custom";

const AUDIENCES: Array<{ value: Audience; label: string; hint: string }> = [
  { value: "all", label: "All users", hint: "Everyone except admins and suspended accounts" },
  { value: "unverified", label: "Unverified (no NIN)", hint: "Users who have not completed NIN verification" },
  {
    value: "pending_verification",
    label: "Pending verification status",
    hint: "Accounts still marked PENDING_VERIFICATION",
  },
  { value: "verified", label: "NIN verified", hint: "Users who completed identity verification" },
  { value: "respondents", label: "Respondents", hint: "Survey respondents only" },
  { value: "researchers", label: "Researchers", hint: "Campaign creators only" },
  { value: "premium", label: "Premium", hint: "Users with liveness / premium verification" },
];

const TEMPLATES: Array<{ value: Template; label: string; hint: string }> = [
  {
    value: "use_platform",
    label: "Use the platform",
    hint: "Friendly reminder to come back and take surveys or run research",
  },
  {
    value: "complete_verification",
    label: "Complete verification",
    hint: "Nudge unverified users to finish NIN verification",
  },
  {
    value: "custom",
    label: "Custom message",
    hint: "Write your own subject and body",
  },
];

export default function AdminEmailsPage() {
  const router = useRouter();
  const { data: authUser, isLoading: authLoading } = useAuth();
  const [audience, setAudience] = useState<Audience>("unverified");
  const [template, setTemplate] = useState<Template>("complete_verification");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    total: number;
    label: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!authUser || authUser.role !== "admin")) router.push("/login");
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (audience === "unverified" || audience === "pending_verification") {
      setTemplate("complete_verification");
    } else if (template === "complete_verification") {
      setTemplate("use_platform");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react when audience changes
  }, [audience]);

  const { data: preview, isFetching: previewLoading } = useQuery({
    queryKey: ["admin-email-preview", audience],
    queryFn: async () => {
      const res = await api.get("/admin/emails/preview", { params: { audience } });
      return res.data as { count: number; label: string; audience: string };
    },
    enabled: authUser?.role === "admin",
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/admin/emails/send", {
        audience,
        template,
        ...(template === "custom" ? { subject, message } : {}),
      });
      return res.data as {
        sent: number;
        failed: number;
        total: number;
        label: string;
      };
    },
    onSuccess: (data) => {
      setError(null);
      setResult(data);
    },
    onError: (err: unknown) => {
      setResult(null);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to send emails";
      setError(msg);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const count = preview?.count ?? 0;
    if (count === 0) {
      setError("No recipients match this audience.");
      return;
    }
    const confirmed = window.confirm(
      `Send this email to ${count.toLocaleString()} ${preview?.label || "users"}? This cannot be undone.`
    );
    if (!confirmed) return;
    sendMutation.mutate();
  };

  return (
    <AdminShell
      title="Email users"
      subtitle="Send platform reminders to all users, unverified accounts, or a filtered audience"
      backHref="/admin"
    >
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-subtle sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-ink-900">Audience</h2>
              <p className="mt-1 text-sm text-ink-500">
                Choose who should receive this email. Admins and suspended users are always excluded.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {AUDIENCES.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition ${
                  audience === opt.value
                    ? "border-primary-300 bg-primary-50/60"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="audience"
                  className="mt-1"
                  checked={audience === opt.value}
                  onChange={() => setAudience(opt.value)}
                />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-500">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-ink-600">
            {previewLoading ? (
              "Counting recipients…"
            ) : (
              <>
                Will send to{" "}
                <strong className="text-ink-900">{(preview?.count ?? 0).toLocaleString()}</strong>{" "}
                {preview?.label || "users"}
              </>
            )}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-subtle sm:p-6">
          <h2 className="font-semibold text-ink-900">Message</h2>
          <p className="mt-1 text-sm text-ink-500">Pick a prepared reminder or write a custom note.</p>

          <div className="mt-5 space-y-2">
            {TEMPLATES.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition ${
                  template === opt.value
                    ? "border-primary-300 bg-primary-50/60"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="template"
                  className="mt-1"
                  checked={template === opt.value}
                  onChange={() => setTemplate(opt.value)}
                />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-500">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {template === "custom" && (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Subject
                </span>
                <input
                  className="input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  required
                  placeholder="Reminder from Phinmon"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Message
                </span>
                <textarea
                  className="input min-h-[140px] resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={5000}
                  required
                  placeholder="Write the email body…"
                />
              </label>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-primary-200 bg-primary-50/70 px-4 py-3 text-sm text-primary-800">
            Sent <strong>{result.sent}</strong> of <strong>{result.total}</strong> emails to{" "}
            {result.label}
            {result.failed > 0 ? ` (${result.failed} failed)` : ""}.
          </div>
        )}

        <button
          type="submit"
          disabled={sendMutation.isPending || (preview?.count ?? 0) === 0}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Send className="h-4 w-4" />
          {sendMutation.isPending ? "Sending…" : "Send emails"}
        </button>
      </form>
    </AdminShell>
  );
}
