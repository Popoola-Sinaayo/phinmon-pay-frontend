"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SurveyBuilder } from "@/components/SurveyBuilder";
import type { Question } from "@/types";

const STEPS = ["Details", "Questions", "Audience", "Budget", "Review", "Payment", "Launch"];

const CATEGORIES = [
  "Market Research",
  "Customer Feedback",
  "Product Research",
  "Brand Awareness",
  "Academic Research",
  "Public Opinion",
  "Health & Wellness",
  "Finance & Banking",
  "Technology",
  "Education",
  "Employee & HR",
  "Political & Social",
  "Other",
];

interface PricingPreview {
  estimatedTimeSeconds: number;
  estimatedTimeMinutes: number;
  rewardPerResponseStandard: number;
  rewardPerResponsePremium: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  aiSpamFilterCost?: number;
  aiAnalyticsCost?: number;
  aiAddOnsCost?: number;
  totalCost: number;
  highComplexity: boolean;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth("researcher");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingPreview | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Market Research",
    targetAudience: "ALL_VERIFIED" as "ALL_VERIFIED" | "PREMIUM_ONLY",
    responsesNeeded: 100,
    aiSpamFilterEnabled: false,
    aiAnalyticsEnabled: false,
    questions: [] as Question[],
  });

  const fetchPricing = useCallback(async () => {
    if (!form.questions.length) {
      setPricing(null);
      return;
    }
    setPricingLoading(true);
    try {
      const { data } = await api.post<PricingPreview & { success: boolean }>("/surveys/preview-cost", {
        questions: form.questions,
        responsesNeeded: form.responsesNeeded,
        targetAudience: form.targetAudience,
        aiSpamFilterEnabled: form.aiSpamFilterEnabled,
        aiAnalyticsEnabled: form.aiAnalyticsEnabled,
      });
      setPricing(data);
    } catch {
      setPricing(null);
    } finally {
      setPricingLoading(false);
    }
  }, [form.questions, form.responsesNeeded, form.targetAudience, form.aiSpamFilterEnabled, form.aiAnalyticsEnabled]);

  useEffect(() => {
    if (step < 3) return;
    const timer = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timer);
  }, [step, fetchPricing]);

  const applicableReward =
    form.targetAudience === "PREMIUM_ONLY"
      ? pricing?.rewardPerResponsePremium
      : pricing?.rewardPerResponseStandard;

  const saveDraft = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      targetAudience: form.targetAudience,
      responsesNeeded: form.responsesNeeded,
      aiSpamFilterEnabled: form.aiSpamFilterEnabled,
      aiAnalyticsEnabled: form.aiAnalyticsEnabled,
      questions: form.questions,
    };
    if (surveyId) {
      const { data } = await api.patch(`/surveys/${surveyId}`, payload);
      return data.survey._id;
    }
    const { data } = await api.post("/surveys", payload);
    setSurveyId(data.survey._id);
    return data.survey._id;
  };

  const handleNext = async () => {
    if (step === 1 && !form.questions.length) {
      alert("Add at least one question");
      return;
    }
    if (step < 4) {
      setLoading(true);
      try {
        await saveDraft();
        setStep((s) => s + 1);
      } finally {
        setLoading(false);
      }
      return;
    }
    if (step === 4) {
      setStep(5);
      return;
    }
    if (step === 5) {
      setLoading(true);
      try {
        const id = surveyId || (await saveDraft());
        const { data } = await api.post(`/surveys/${id}/launch`, {});
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        } else {
          setStep(6);
        }
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        alert(msg || "Launch failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <DashboardShell
      user={user}
      title="Create Campaign"
      subtitle={`Step ${step + 1} of ${STEPS.length}  ${STEPS[step]}`}
      loading={isLoading}
      backHref="/researcher/campaigns"
      breadcrumbs={[
        { label: "Campaigns", href: "/researcher/campaigns" },
        { label: "New Campaign" },
      ]}
      maxWidth="narrow"
    >
      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              i === step
                ? "bg-gray-900 text-white"
                : i < step
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-500"
            )}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[100px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {step === 1 && (
          <SurveyBuilder
            questions={form.questions}
            onChange={(q) => setForm({ ...form, questions: q })}
          />
        )}
        {step === 2 && (
          <div className="space-y-3">
            {(["ALL_VERIFIED", "PREMIUM_ONLY"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setForm({ ...form, targetAudience: a })}
                className={cn(
                  "block w-full rounded-xl border p-4 text-left transition",
                  form.targetAudience === a
                    ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <p className="font-semibold text-gray-900">
                  {a === "ALL_VERIFIED" ? "Verified Users" : "Premium Users"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {a === "ALL_VERIFIED"
                    ? "NIN verified respondents  standard reward rate"
                    : "NIN + liveness verified  premium reward rate (2×)"}
                </p>
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="label">Responses Needed</label>
              <input
                type="number"
                className="input"
                value={form.responsesNeeded}
                onChange={(e) =>
                  setForm({ ...form, responsesNeeded: Number(e.target.value) })
                }
                min={1}
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900">AI add-ons</p>
              <p className="mt-1 text-xs text-gray-500">
                Optional features billed at launch. Prices are included in your total.
              </p>
              <label className="mt-4 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.aiSpamFilterEnabled}
                  onChange={(e) =>
                    setForm({ ...form, aiSpamFilterEnabled: e.target.checked })
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    AI spam filtering
                  </span>
                  <span className="text-xs text-gray-500">
                    ₦20 per response  flags nonsensical text answers for review
                  </span>
                </span>
              </label>
              <label className="mt-3 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.aiAnalyticsEnabled}
                  onChange={(e) =>
                    setForm({ ...form, aiAnalyticsEnabled: e.target.checked })
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    AI analytics chat
                  </span>
                  <span className="text-xs text-gray-500">
                    ₦5,000 flat  unlimited Q&amp;A about your survey results
                  </span>
                </span>
              </label>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
              {pricingLoading ? (
                <p className="text-gray-500">Calculating pricing...</p>
              ) : pricing ? (
                <>
                  <p>
                    <strong>Estimated time:</strong> ~{pricing.estimatedTimeMinutes} min (
                    {pricing.estimatedTimeSeconds}s)
                  </p>
                  <p className="mt-2">
                    <strong>Reward per response:</strong>{" "}
                    {formatCurrency(applicableReward || 0)}
                    {form.targetAudience === "ALL_VERIFIED" && (
                      <span className="text-gray-500">
                        {" "}
                        (premium tier: {formatCurrency(pricing.rewardPerResponsePremium)})
                      </span>
                    )}
                  </p>
                  <p className="mt-2">
                    Response cost: {formatCurrency((applicableReward || 0) * form.responsesNeeded)}
                  </p>
                  <p>
                    Platform fee ({pricing.platformFeeRate}%):{" "}
                    {formatCurrency(pricing.platformFeeAmount)}
                  </p>
                  {(pricing.aiAddOnsCost || 0) > 0 && (
                    <>
                      {form.aiSpamFilterEnabled && (
                        <p className="mt-2">
                          AI spam filtering: {formatCurrency(pricing.aiSpamFilterCost || 0)}
                        </p>
                      )}
                      {form.aiAnalyticsEnabled && (
                        <p>
                          AI analytics chat: {formatCurrency(pricing.aiAnalyticsCost || 0)}
                        </p>
                      )}
                    </>
                  )}
                  <p className="mt-2 font-bold text-primary-600">
                    Total due at launch: {formatCurrency(pricing.totalCost)}
                  </p>
                  {pricing.highComplexity && (
                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                      This survey is flagged as high complexity due to multiple-choice questions with
                      more than 10 options.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Add questions to see pricing estimate.</p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Reward is calculated automatically from estimated completion time. Researchers cannot
              override per-response payouts.
            </p>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <p>
              <strong>Title:</strong> {form.title}
            </p>
            <p>
              <strong>Audience:</strong> {form.targetAudience.replace(/_/g, " ").toLowerCase()}
            </p>
            <p>
              <strong>Questions:</strong> {form.questions.length}
            </p>
            <p>
              <strong>Responses:</strong> {form.responsesNeeded}
            </p>
            <p>
              <strong>AI spam filtering:</strong> {form.aiSpamFilterEnabled ? "Yes" : "No"}
            </p>
            <p>
              <strong>AI analytics chat:</strong> {form.aiAnalyticsEnabled ? "Yes" : "No"}
            </p>
            {pricing && (
              <>
                <p>
                  <strong>Estimated time:</strong> ~{pricing.estimatedTimeMinutes} min
                </p>
                <p>
                  <strong>Reward per response:</strong> {formatCurrency(applicableReward || 0)}
                </p>
                <p>
                  <strong>Total Cost:</strong> {formatCurrency(pricing.totalCost)}
                </p>
              </>
            )}
          </div>
        )}
        {step === 5 && (
          <p className="text-gray-600">Redirecting to Paystack for payment...</p>
        )}
        {step === 6 && (
          <div className="text-center">
            <div className="text-5xl">🚀</div>
            <h2 className="mt-4 text-xl font-bold">Campaign Activated!</h2>
            <button
              className="btn-primary mt-6"
              onClick={() => router.push("/researcher/campaigns")}
            >
              View Campaigns
            </button>
          </div>
        )}
      </div>

      {step < 6 && (
        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
          <button type="button" className="btn-primary" onClick={handleNext} disabled={loading}>
            {loading
              ? "Saving..."
              : step === 5
                ? "Pay with Paystack"
                : step === 4
                  ? "Proceed to Payment"
                  : "Next"}
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
