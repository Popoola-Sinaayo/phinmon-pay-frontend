"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SurveyBuilder } from "@/components/SurveyBuilder";
import { SurveyPricingBreakdown } from "@/components/researcher/SurveyPricingBreakdown";
import { SurveyPaymentStatusPanel } from "@/components/researcher/SurveyPaymentStatusPanel";
import { usePricingConfig } from "@/lib/pricingConfig";
import { validateCampaignQuestions } from "@/lib/surveyValidation";
import type { Question, Survey } from "@/types";

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
  payoutPerResponse?: number;
  budget?: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  aiSpamFilterCost?: number;
  aiAnalyticsCost?: number;
  aiAddOnsCost?: number;
  totalCost: number;
  highComplexity: boolean;
  questionBreakdown?: Array<{
    index: number;
    type: string;
    seconds: number;
    optionCount?: number;
  }>;
}

const validateDetails = (title: string, description: string): string | null => {
  if (!title.trim()) return "Title is required";
  if (!description.trim()) return "Description is required";
  return null;
};

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading campaign...</div>}>
      <NewCampaignForm />
    </Suspense>
  );
}

function NewCampaignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume");
  const { user, isLoading } = useRequireAuth("researcher");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(!!resumeId);
  const [surveyId, setSurveyId] = useState<string | null>(resumeId);
  const [surveyStatus, setSurveyStatus] = useState<string>("DRAFT");
  const [pricing, setPricing] = useState<PricingPreview | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const pricingConfig = usePricingConfig();
  const premiumMultiplier =
    pricingConfig.standardRatePerMinute > 0
      ? pricingConfig.premiumRatePerMinute / pricingConfig.standardRatePerMinute
      : 2;
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

  const questionsLocked = surveyStatus === "PENDING_PAYMENT";

  useEffect(() => {
    if (!resumeId || !user) return;

    const loadDraft = async () => {
      setLoadingResume(true);
      try {
        const { data } = await api.get<{ survey: Survey }>(`/surveys/${resumeId}`);
        const survey = data.survey;
        if (!["DRAFT", "PENDING_PAYMENT"].includes(survey.status)) {
          router.replace(`/researcher/campaigns/${resumeId}`);
          return;
        }
        setSurveyId(survey._id);
        setSurveyStatus(survey.status);
        setForm({
          title: survey.title || "",
          description: survey.description || "",
          category: survey.category || "Market Research",
          targetAudience: survey.targetAudience === "PREMIUM_ONLY" ? "PREMIUM_ONLY" : "ALL_VERIFIED",
          responsesNeeded: survey.responsesNeeded || 100,
          aiSpamFilterEnabled: survey.aiSpamFilterEnabled ?? false,
          aiAnalyticsEnabled: survey.aiAnalyticsEnabled ?? false,
          questions: survey.questions || [],
        });
        const savedStep = Math.min(Math.max(survey.draftStep ?? 0, 0), STEPS.length - 2);
        setStep(survey.status === "PENDING_PAYMENT" ? Math.max(savedStep, 5) : savedStep);
      } catch {
        alert("Could not load saved campaign");
        router.push("/researcher/campaigns");
      } finally {
        setLoadingResume(false);
      }
    };

    void loadDraft();
  }, [resumeId, user, router]);

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

  const saveDraft = async (nextStep: number) => {
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      targetAudience: form.targetAudience,
      responsesNeeded: form.responsesNeeded,
      aiSpamFilterEnabled: form.aiSpamFilterEnabled,
      aiAnalyticsEnabled: form.aiAnalyticsEnabled,
      draftStep: nextStep,
    };

    if (!questionsLocked) {
      payload.questions = form.questions.map((q) => ({
        ...q,
        questionText: q.questionText.trim(),
      }));
    }

    if (surveyId) {
      const { data } = await api.patch(`/surveys/${surveyId}`, payload);
      setSurveyStatus(data.survey.status);
      return data.survey._id as string;
    }
    const { data } = await api.post("/surveys", {
      ...payload,
      questions: form.questions.map((q) => ({
        ...q,
        questionText: q.questionText.trim(),
      })),
    });
    setSurveyId(data.survey._id);
    setSurveyStatus(data.survey.status);
    return data.survey._id as string;
  };

  const validateCurrentStep = (): string | null => {
    if (step === 0) return validateDetails(form.title, form.description);
    if (step === 1 && !questionsLocked) return validateCampaignQuestions(form.questions);
    return null;
  };

  const handleNext = async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (step < 4) {
      setLoading(true);
      try {
        await saveDraft(step + 1);
        setStep((s) => s + 1);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        alert(msg || "Failed to save campaign");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (step === 4) {
      setLoading(true);
      try {
        await saveDraft(5);
        setStep(5);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        alert(msg || "Failed to save campaign");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (step === 5) {
      setLoading(true);
      try {
        const id = surveyId || (await saveDraft(5));
        const { data } = await api.post<{ authorizationUrl?: string }>(`/surveys/${id}/launch`, {});
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
      return;
    }
  };

  const handlePaymentSuccess = () => {
    setSurveyStatus("ACTIVE");
    setStep(6);
  };

  const handleRetryPaystack = async () => {
    if (!surveyId) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ authorizationUrl?: string }>(`/surveys/${surveyId}/launch`, {});
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || "Could not open Paystack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
      user={user}
      title={resumeId ? "Continue Campaign" : "Create Campaign"}
      subtitle={`Step ${step + 1} of ${STEPS.length}  ${STEPS[step]}`}
      loading={isLoading || loadingResume}
      backHref="/researcher/campaigns"
      breadcrumbs={[
        { label: "Campaigns", href: "/researcher/campaigns" },
        { label: resumeId ? "Continue" : "New Campaign" },
      ]}
      maxWidth="narrow"
    >
      {questionsLocked && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Payment was started but not completed. You can review questions and edit campaign settings,
          but questions are locked until payment is complete.
        </div>
      )}

      <div className="mb-6 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs",
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
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[100px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
          <>
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <strong>Pricing note:</strong> Your campaign cost is not fixed upfront. It is
              calculated from the estimated time to complete your questions — different question
              types take different amounts of time. You will see the full breakdown on the Budget
              step.
            </div>
            <SurveyBuilder
              questions={form.questions}
              onChange={(q) => setForm({ ...form, questions: q })}
              readOnly={questionsLocked}
            />
          </>
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
                    ? `NIN verified respondents — ${formatCurrency(pricingConfig.standardRatePerMinute)}/min standard rate`
                    : `NIN + liveness verified — ${formatCurrency(pricingConfig.premiumRatePerMinute)}/min premium rate (${premiumMultiplier}×)`}
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
                    {formatCurrency(pricingConfig.aiSpamFilterCostPerResponse)} per response —
                    flags nonsensical text answers for review
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
                    {formatCurrency(pricingConfig.aiAnalyticsCost)} flat — unlimited Q&amp;A about
                    your survey results
                  </span>
                </span>
              </label>
            </div>

            {pricing ? (
              <SurveyPricingBreakdown
                pricing={pricing}
                pricingConfig={pricingConfig}
                responsesNeeded={form.responsesNeeded}
                targetAudience={form.targetAudience}
                aiSpamFilterEnabled={form.aiSpamFilterEnabled}
                aiAnalyticsEnabled={form.aiAnalyticsEnabled}
              />
            ) : pricingLoading ? (
              <p className="text-sm text-gray-500">Calculating pricing...</p>
            ) : (
              <p className="text-sm text-gray-500">Add questions to see pricing estimate.</p>
            )}
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
              <SurveyPricingBreakdown
                pricing={pricing}
                pricingConfig={pricingConfig}
                responsesNeeded={form.responsesNeeded}
                targetAudience={form.targetAudience}
                aiSpamFilterEnabled={form.aiSpamFilterEnabled}
                aiAnalyticsEnabled={form.aiAnalyticsEnabled}
                compact
              />
            )}
          </div>
        )}
        {step === 5 && (
          <div className="space-y-4">
            {questionsLocked && surveyId ? (
              <SurveyPaymentStatusPanel
                surveyId={surveyId}
                onSuccess={handlePaymentSuccess}
                onRetryPaystack={() => void handleRetryPaystack()}
                retryLoading={loading}
              />
            ) : (
              <p className="text-gray-600">
                You will be redirected to Paystack to complete payment. If the payment window does
                not open or you are not redirected back after paying, return here and use
                &quot;Confirm payment status&quot; on the next visit.
              </p>
            )}
          </div>
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
        <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <button
            type="button"
            className="btn-secondary w-full sm:w-auto"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            onClick={handleNext}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : step === 5
                ? questionsLocked
                  ? "Return to Paystack"
                  : "Pay with Paystack"
                : step === 4
                  ? "Proceed to Payment"
                  : "Next"}
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
