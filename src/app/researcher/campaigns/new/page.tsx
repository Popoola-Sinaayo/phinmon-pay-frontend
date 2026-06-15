"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, calculateSurveyCost, calculatePerResponseCost, formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SurveyBuilder } from "@/components/SurveyBuilder";
import type { Question } from "@/types";

const STEPS = ["Details", "Questions", "Audience", "Budget", "Review", "Payment", "Launch"];

export default function NewCampaignPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth("researcher");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Market Research",
    targetAudience: "ALL_VERIFIED" as "ALL_VERIFIED" | "PREMIUM_ONLY",
    payoutPerResponse: 500,
    responsesNeeded: 100,
    estimatedMinutes: 10,
    billingModel: "PREPAID" as "PREPAID" | "PAYG",
    spendingCap: 0,
    questions: [] as Question[],
  });

  const costs = calculateSurveyCost(form.responsesNeeded, form.payoutPerResponse);
  const perResponseCost = calculatePerResponseCost(form.payoutPerResponse);
  const effectiveCap = form.spendingCap || costs.totalCost;

  const saveDraft = async () => {
    const payload = {
      ...form,
      spendingCap: form.billingModel === "PAYG" ? form.spendingCap || costs.totalCost : undefined,
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
        const { data } = await api.post(`/surveys/${id}/launch`, {
          billingModel: form.billingModel,
          spendingCap: form.billingModel === "PAYG" ? effectiveCap : undefined,
        });
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        } else if (data.billingModel === "PAYG" && !data.requiresCardSetup) {
          setStep(6);
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
      subtitle={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}
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
              <input
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
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
                  {a === "ALL_VERIFIED" ? "NIN verified respondents" : "NIN + liveness verified"}
                </p>
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="label">Billing model</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      key: "PREPAID",
                      title: "Prepay in full",
                      desc: "Pay the full campaign cost upfront via Paystack checkout.",
                    },
                    {
                      key: "PAYG",
                      title: "Pay as you go",
                      desc: "Save your card and pay per response as they come in.",
                    },
                  ] as const
                ).map((plan) => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        billingModel: plan.key,
                        spendingCap: plan.key === "PAYG" ? costs.totalCost : 0,
                      })
                    }
                    className={cn(
                      "rounded-xl border p-4 text-left transition",
                      form.billingModel === plan.key
                        ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <p className="font-semibold text-gray-900">{plan.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{plan.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Responses Needed</label>
              <input
                type="number"
                className="input"
                value={form.responsesNeeded}
                onChange={(e) => {
                  const responsesNeeded = Number(e.target.value);
                  const nextCosts = calculateSurveyCost(responsesNeeded, form.payoutPerResponse);
                  setForm({
                    ...form,
                    responsesNeeded,
                    spendingCap:
                      form.billingModel === "PAYG" ? nextCosts.totalCost : form.spendingCap,
                  });
                }}
                min={1}
              />
            </div>
            <div>
              <label className="label">Reward Per Response (₦)</label>
              <input
                type="number"
                className="input"
                value={form.payoutPerResponse}
                onChange={(e) => {
                  const payoutPerResponse = Number(e.target.value);
                  const nextCosts = calculateSurveyCost(form.responsesNeeded, payoutPerResponse);
                  setForm({
                    ...form,
                    payoutPerResponse,
                    spendingCap:
                      form.billingModel === "PAYG" ? nextCosts.totalCost : form.spendingCap,
                  });
                }}
                min={100}
              />
            </div>

            {form.billingModel === "PAYG" && (
              <div>
                <label className="label">Spending cap (₦)</label>
                <input
                  type="number"
                  className="input"
                  value={form.spendingCap || costs.totalCost}
                  onChange={(e) => setForm({ ...form, spendingCap: Number(e.target.value) })}
                  min={perResponseCost}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Campaign pauses when spend reaches this cap. Per response:{" "}
                  {formatCurrency(perResponseCost)} incl. fee.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
              {form.billingModel === "PREPAID" ? (
                <>
                  <p>Response cost: ₦{costs.budget.toLocaleString()}</p>
                  <p>Platform fee (15%): ₦{costs.platformFee.toLocaleString()}</p>
                  <p className="mt-2 font-bold text-primary-600">
                    Total due at launch: ₦{costs.totalCost.toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <p>Estimated max if fully filled: ₦{costs.totalCost.toLocaleString()}</p>
                  <p>Charged per response: {formatCurrency(perResponseCost)}</p>
                  <p className="mt-2 font-bold text-primary-600">
                    Spending cap: ₦{(form.spendingCap || costs.totalCost).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <p>
              <strong>Title:</strong> {form.title}
            </p>
            <p>
              <strong>Billing:</strong> {form.billingModel === "PAYG" ? "Pay as you go" : "Prepay in full"}
            </p>
            <p>
              <strong>Audience:</strong> {form.targetAudience}
            </p>
            <p>
              <strong>Questions:</strong> {form.questions.length}
            </p>
            <p>
              <strong>Responses:</strong> {form.responsesNeeded}
            </p>
            {form.billingModel === "PREPAID" ? (
              <p>
                <strong>Total Cost:</strong> ₦{costs.totalCost.toLocaleString()}
              </p>
            ) : (
              <>
                <p>
                  <strong>Per response:</strong> {formatCurrency(perResponseCost)}
                </p>
                <p>
                  <strong>Spending cap:</strong> {formatCurrency(effectiveCap)}
                </p>
              </>
            )}
          </div>
        )}
        {step === 5 && (
          <p className="text-gray-600">
            {form.billingModel === "PAYG"
              ? "Redirecting to Paystack to save your card..."
              : "Redirecting to Paystack for payment..."}
          </p>
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
                ? form.billingModel === "PAYG"
                  ? "Save card & launch"
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
