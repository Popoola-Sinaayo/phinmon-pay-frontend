"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { SurveyBuilder } from "@/components/SurveyBuilder";
import { calculateSurveyCost } from "@/lib/utils";
import type { Question } from "@/types";

const STEPS = ["Details", "Questions", "Audience", "Budget", "Review", "Payment", "Launch"];

export default function NewCampaignPage() {
  const router = useRouter();
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
    questions: [] as Question[],
  });

  const costs = calculateSurveyCost(form.responsesNeeded, form.payoutPerResponse);

  const saveDraft = async () => {
    const payload = { ...form };
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
        const { data } = await api.post(`/surveys/${id}/launch`);
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        } else {
          setStep(6);
        }
      } catch {
        alert("Payment initialization failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar logoHref="/researcher/dashboard" />
      <div className="mx-auto max-w-form px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                i === step ? "bg-primary-600 text-white" : i < step ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="card mt-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>
          )}
          {step === 1 && (
            <SurveyBuilder questions={form.questions} onChange={(q) => setForm({ ...form, questions: q })} />
          )}
          {step === 2 && (
            <div className="space-y-3">
              {(["ALL_VERIFIED", "PREMIUM_ONLY"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, targetAudience: a })}
                  className={`block w-full rounded-btn border p-4 text-left ${
                    form.targetAudience === a ? "border-primary-500 bg-primary-50" : "border-gray-200"
                  }`}
                >
                  <p className="font-medium">{a === "ALL_VERIFIED" ? "Verified Users" : "Premium Users"}</p>
                  <p className="text-sm text-gray-500">
                    {a === "ALL_VERIFIED" ? "NIN verified respondents" : "NIN + liveness verified"}
                  </p>
                </button>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="label">Responses Needed</label>
                <input type="number" className="input" value={form.responsesNeeded} onChange={(e) => setForm({ ...form, responsesNeeded: Number(e.target.value) })} min={1} />
              </div>
              <div>
                <label className="label">Reward Per Response (₦)</label>
                <input type="number" className="input" value={form.payoutPerResponse} onChange={(e) => setForm({ ...form, payoutPerResponse: Number(e.target.value) })} min={100} />
              </div>
              <div className="rounded-btn bg-gray-50 p-4 text-sm">
                <p>Response cost: ₦{costs.budget.toLocaleString()}</p>
                <p>Platform fee (15%): ₦{costs.platformFee.toLocaleString()}</p>
                <p className="font-bold text-primary-600">Total: ₦{costs.totalCost.toLocaleString()}</p>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-2 text-sm">
              <p><strong>Title:</strong> {form.title}</p>
              <p><strong>Audience:</strong> {form.targetAudience}</p>
              <p><strong>Questions:</strong> {form.questions.length}</p>
              <p><strong>Responses:</strong> {form.responsesNeeded}</p>
              <p><strong>Total Cost:</strong> ₦{costs.totalCost.toLocaleString()}</p>
            </div>
          )}
          {step === 5 && <p className="text-gray-600">Redirecting to Paystack for payment...</p>}
          {step === 6 && (
            <div className="text-center">
              <div className="text-5xl">🚀</div>
              <h2 className="mt-4 text-xl font-bold">Campaign Activated!</h2>
              <button className="btn-primary mt-6" onClick={() => router.push("/researcher/campaigns")}>
                View Campaigns
              </button>
            </div>
          )}
        </div>

        {step < 6 && (
          <div className="mt-6 flex justify-between">
            <button type="button" className="btn-secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={handleNext} disabled={loading}>
              {loading ? "Saving..." : step === 5 ? "Pay with Paystack" : step === 4 ? "Proceed to Payment" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
