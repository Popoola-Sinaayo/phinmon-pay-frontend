"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, History, Mail, Send, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/layout/AdminShell";
import { CustomEmailPreview } from "@/components/admin/CustomEmailPreview";
import { UserPicker } from "@/components/admin/UserPicker";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { formatDate } from "@/lib/utils";

type AudienceMode = "preset" | "signed_up_since" | "specific_users";

type PresetAudience =
  | "all"
  | "unverified"
  | "verified"
  | "pending_verification"
  | "respondents"
  | "researchers"
  | "premium";

type Template = "use_platform" | "complete_verification" | "custom";

type EmailCampaign = {
  _id: string;
  audience: string;
  audienceLabel: string;
  template: string;
  subject: string;
  messagePreview?: string;
  totalRecipients: number;
  sent: number;
  failed: number;
  status: "completed" | "partial" | "failed";
  createdAt: string;
  sentBy?: { name?: string; email?: string };
};

const PRESET_AUDIENCES: Array<{ value: PresetAudience; label: string; hint: string }> = [
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
    hint: "Premium broadcast with headline, body, and CTA",
  },
];

export default function AdminEmailsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authUser, isLoading: authLoading } = useAuth();

  const [mode, setMode] = useState<AudienceMode>("preset");
  const [presetAudience, setPresetAudience] = useState<PresetAudience>("unverified");
  const [signedUpSince, setSignedUpSince] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [template, setTemplate] = useState<Template>("custom");
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Open Phinmon");
  const [historyPage, setHistoryPage] = useState(1);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    total: number;
    label: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audience =
    mode === "specific_users"
      ? "specific_users"
      : mode === "signed_up_since"
        ? "signed_up_since"
        : presetAudience;

  useEffect(() => {
    if (!authLoading && (!authUser || authUser.role !== "admin")) router.push("/login");
  }, [authUser, authLoading, router]);

  const previewParams = {
    audience,
    ...(mode === "specific_users" ? { userIds: selectedUserIds.join(",") } : {}),
    ...(mode === "signed_up_since" && signedUpSince ? { signedUpSince } : {}),
  };

  const { data: preview, isFetching: previewLoading } = useQuery({
    queryKey: ["admin-email-preview", previewParams],
    queryFn: async () => {
      const res = await api.get("/admin/emails/preview", { params: previewParams });
      return res.data as { count: number; label: string; audience: string };
    },
    enabled:
      authUser?.role === "admin" &&
      (mode !== "specific_users" || selectedUserIds.length > 0) &&
      (mode !== "signed_up_since" || Boolean(signedUpSince)),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["admin-email-history", historyPage],
    queryFn: async () => {
      const res = await api.get("/admin/emails/history", { params: { page: historyPage } });
      return res.data as {
        campaigns: EmailCampaign[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    },
    enabled: authUser?.role === "admin",
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/admin/emails/send", {
        audience,
        template,
        ...(mode === "specific_users" ? { userIds: selectedUserIds } : {}),
        ...(mode === "signed_up_since" ? { signedUpSince } : {}),
        ...(template === "custom" ? { subject, headline, message, ctaLabel } : {}),
      });
      return res.data as {
        sent: number;
        failed: number;
        total: number;
        label: string;
        status: string;
      };
    },
    onSuccess: (data) => {
      setError(null);
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["admin-email-history"] });
    },
    onError: (err: unknown) => {
      setResult(null);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to send emails";
      setError(msg);
    },
  });

  const recipientCount = preview?.count ?? (mode === "specific_users" ? selectedUserIds.length : 0);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (recipientCount === 0) {
      setError("No recipients selected.");
      return;
    }
    if (template === "custom" && (!subject.trim() || !message.trim())) {
      setError("Custom emails need a subject and message.");
      return;
    }
    const confirmed = window.confirm(
      `Send this email to ${recipientCount.toLocaleString()} ${preview?.label || "users"}?`
    );
    if (!confirmed) return;
    sendMutation.mutate();
  };

  return (
    <AdminShell
      title="Email users"
      subtitle="Target audiences, pick specific users, filter by signup date, and track send history"
      backHref="/admin"
    >
      <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_minmax(380px,480px)]">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-subtle sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold text-ink-900">Recipients</h2>
                <p className="mt-1 text-sm text-ink-500">
                  Choose a preset group, users who signed up from a date, or hand-pick accounts.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  { id: "preset", label: "Preset groups" },
                  { id: "signed_up_since", label: "Signed up since" },
                  { id: "specific_users", label: "Pick users" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    mode === tab.id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-ink-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {mode === "preset" && (
              <div className="mt-5 space-y-2">
                {PRESET_AUDIENCES.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition ${
                      presetAudience === opt.value
                        ? "border-primary-300 bg-primary-50/60"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="presetAudience"
                      className="mt-1"
                      checked={presetAudience === opt.value}
                      onChange={() => setPresetAudience(opt.value)}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">{opt.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-500">{opt.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {mode === "signed_up_since" && (
              <div className="mt-5">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <Calendar className="h-3.5 w-3.5" /> Signup date (from → today)
                  </span>
                  <input
                    type="date"
                    className="input max-w-xs"
                    value={signedUpSince}
                    onChange={(e) => setSignedUpSince(e.target.value)}
                    required
                  />
                </label>
                <p className="mt-2 text-sm text-ink-500">
                  Includes everyone who registered on or after this date, up to now.
                </p>
              </div>
            )}

            {mode === "specific_users" && (
              <div className="mt-5">
                <UserPicker selectedIds={selectedUserIds} onChange={setSelectedUserIds} />
              </div>
            )}

            <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-ink-600">
              {previewLoading ? (
                "Counting recipients…"
              ) : (
                <>
                  Will send to{" "}
                  <strong className="text-ink-900">{recipientCount.toLocaleString()}</strong>{" "}
                  {preview?.label || "users"}
                </>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-subtle sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold text-ink-900">Message</h2>
                <p className="mt-1 text-sm text-ink-500">Pick a template or craft a premium broadcast.</p>
              </div>
            </div>

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
                    Email subject
                  </span>
                  <input
                    className="input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={200}
                    required
                    placeholder="Something important from Phinmon"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Headline (shown in hero)
                  </span>
                  <input
                    className="input"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={200}
                    placeholder="Leave blank to use the subject"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Message
                  </span>
                  <textarea
                    className="input min-h-[160px] resize-y"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={5000}
                    required
                    placeholder="Write your message. Use blank lines between paragraphs for better formatting."
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Button label
                  </span>
                  <input
                    className="input"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    maxLength={80}
                    placeholder="Open Phinmon"
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
              Status: <strong>{result.status}</strong>.
            </div>
          )}

          <button
            type="submit"
            disabled={sendMutation.isPending || recipientCount === 0}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            <Send className="h-4 w-4" />
            {sendMutation.isPending ? "Sending…" : `Send to ${recipientCount.toLocaleString()} users`}
          </button>
        </div>

        {template === "custom" && (
          <div className="xl:sticky xl:top-6 xl:self-start">
            <CustomEmailPreview
              subject={subject}
              headline={headline}
              message={message}
              ctaLabel={ctaLabel}
            />
          </div>
        )}
      </form>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-ink-500" />
          <h2 className="text-lg font-semibold text-ink-900">Send history</h2>
        </div>
        {historyLoading && !history ? (
          <p className="text-sm text-ink-500">Loading history…</p>
        ) : (
          <>
            <DataTable
              headers={["Date", "Subject", "Audience", "Template", "Sent", "Failed", "Status"]}
              statusColumn={6}
              rows={(history?.campaigns || []).map((c) => [
                formatDate(c.createdAt),
                c.subject,
                c.audienceLabel,
                c.template.replace(/_/g, " "),
                c.sent,
                c.failed,
                c.status,
              ])}
            />
            {history && history.total > 0 && (
              <Pagination
                page={history.page}
                totalPages={history.totalPages}
                total={history.total}
                limit={history.limit}
                onPageChange={setHistoryPage}
              />
            )}
          </>
        )}
      </section>
    </AdminShell>
  );
}
