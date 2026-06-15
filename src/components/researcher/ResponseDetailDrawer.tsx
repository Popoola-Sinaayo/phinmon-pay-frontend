"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, ShieldCheck, X } from "lucide-react";
import { api } from "@/lib/api";
import { formatAnswerValue, type SurveyResponseRecord } from "@/lib/responseAnalytics";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Question, Survey } from "@/types";
import { cn } from "@/lib/utils";

export function ResponseDetailDrawer({
  response,
  survey,
  surveyId,
  onClose,
}: {
  response: SurveyResponseRecord | null;
  survey: Survey;
  surveyId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: async (status: "APPROVED" | "REJECTED") => {
      await api.patch(`/responses/${response!._id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-responses", surveyId] });
      onClose();
    },
  });

  return (
    <AnimatePresence>
      {response && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Response detail
                </p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  {response.userId?.name || response.userId?.email || "Respondent"}
                </h2>
                <p className="text-sm text-gray-500">{formatDate(response.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <StatusPill status={response.status} />
                <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                  {formatCurrency(response.rewardAmount)}
                </span>
                {response.userId?.ninVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    <ShieldCheck className="h-3 w-3" /> NIN
                  </span>
                )}
                {response.userId?.livenessVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <Crown className="h-3 w-3" /> Premium
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {survey.questions.map((q, i) => {
                  const answer = response.answers.find((a) => a.questionId === q.questionId);
                  return (
                    <AnswerBlock key={q.questionId} question={q} index={i} value={answer?.value} />
                  );
                })}
              </div>
            </div>

            {response.status === "PENDING" && (
              <div className="flex gap-3 border-t border-gray-100 p-5">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate("REJECTED")}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="btn-primary flex-1"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate("APPROVED")}
                >
                  Approve
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-primary-50 text-primary-700",
    PENDING: "bg-amber-50 text-amber-700",
    REJECTED: "bg-error-500/10 text-error-600",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[status] || "bg-gray-100 text-gray-600"
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

function AnswerBlock({
  question,
  index,
  value,
}: {
  question: Question;
  index: number;
  value?: unknown;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Q{index + 1} · {question.type.replace(/_/g, " ")}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-900">{question.questionText}</p>
      <p className="mt-3 rounded-lg bg-white px-3 py-2.5 text-sm text-gray-800 ring-1 ring-gray-100">
        {formatAnswerValue(value)}
      </p>
    </div>
  );
}
