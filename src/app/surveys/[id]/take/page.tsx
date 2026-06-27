"use client";

import { Clock, ShieldAlert } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { ProgressBar } from "@/components/ProgressBar";
import { formatCurrency, getEstimatedMinutes } from "@/lib/utils";
import { canTakeSurvey } from "@/lib/verification";
import type { Survey, Answer } from "@/types";

export default function TakeSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: user, isLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reward, setReward] = useState(0);

  const { data: survey } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const { data } = await api.get<{ survey: Survey }>(`/surveys/${id}`);
      return data.survey;
    },
    enabled: !!id && !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (user && survey) {
      const access = canTakeSurvey(survey, user);
      if (!access.allowed) {
        router.replace(
          access.reason === "liveness" ? "/verification?step=liveness" : "/verification?step=nin"
        );
      }
    }
  }, [user, isLoading, survey, router]);

  if (isLoading || !survey || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const question = survey.questions[currentIndex];
  const isLast = currentIndex === survey.questions.length - 1;

  const handleNext = async () => {
    if (!question) return;
    const value = answers[question.questionId];
    if (question.required && (value === undefined || value === "" || value === null)) {
      alert("This question is required");
      return;
    }
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    try {
      const payload: Answer[] = survey.questions.map((q) => ({
        questionId: q.questionId,
        type: q.type,
        value: answers[q.questionId] ?? "",
      }));
      const { data } = await api.post(`/responses/surveys/${id}/responses`, { answers: payload });
      setReward(data.rewardAmount);
      setCompleted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg?.toLowerCase().includes("nin")) {
        router.push("/verification?step=nin");
        return;
      }
      if (msg?.toLowerCase().includes("premium") || msg?.toLowerCase().includes("eligible")) {
        router.push("/verification?step=liveness");
        return;
      }
      alert(msg || "Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-primary-50 px-4 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Response Submitted!</h1>
        <p className="mt-2 text-gray-600">You earned {formatCurrency(reward)}</p>
        <button className="btn-primary mt-8" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-gray-100 px-4 py-4">
        <div className="mx-auto max-w-survey space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">{survey.title}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">
                {formatCurrency(survey.payoutPerResponse)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                <Clock className="h-3 w-3" /> ~{getEstimatedMinutes(survey)} min
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Give thoughtful answers. Low-quality or spam responses may be flagged and put your
              account at risk of suspension.
            </span>
          </div>
          <ProgressBar current={currentIndex + 1} total={survey.questions.length} />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-survey">
          {question && (
            <QuestionRenderer
              question={question}
              value={answers[question.questionId]}
              onChange={(v) => setAnswers({ ...answers, [question.questionId]: v })}
            />
          )}
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-4">
        <div className="mx-auto flex max-w-survey justify-between">
          <button
            type="button"
            className="btn-secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Back
          </button>
          <button type="button" className="btn-primary" onClick={handleNext} disabled={submitting}>
            {submitting ? "Submitting..." : isLast ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
