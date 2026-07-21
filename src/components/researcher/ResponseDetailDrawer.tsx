"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Crown, Flag, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { ResponseStatusBadge } from "@/components/Badges";
import { api } from "@/lib/api";
import { formatAnswerValue, getRespondentLabel, getResponseUser, type SurveyResponseRecord } from "@/lib/responseAnalytics";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Question, Survey } from "@/types";

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
  const [flagReason, setFlagReason] = useState("");
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);

  const statusMutation = useMutation({
    mutationFn: async (status: "APPROVED" | "REJECTED") => {
      await api.patch(`/responses/${response!._id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-responses", surveyId] });
      onClose();
    },
  });

  const flagMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/responses/${response!._id}/flag`, {
        reason: flagReason || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-responses", surveyId] });
      setShowFlagConfirm(false);
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
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Response detail
                </p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  {getRespondentLabel(response.userId)}
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

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="flex flex-wrap gap-2">
                <ResponseStatusBadge
                  status={response.status}
                  spamSuspected={response.spamSuspected}
                />
                <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                  {formatCurrency(response.rewardAmount)}
                </span>
                {getResponseUser(response.userId)?.ninVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    <ShieldCheck className="h-3 w-3" /> NIN
                  </span>
                )}
                {getResponseUser(response.userId)?.livenessVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <Crown className="h-3 w-3" /> Premium
                  </span>
                )}
              </div>

              {response.spamSuspected && (
                <div className="mt-4 flex gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Possible spam  review this response before approving. Reward is held in pending
                    until you approve or reject.
                  </p>
                </div>
              )}

              {response.flagReason && (
                <p className="mt-4 text-sm text-gray-600">
                  <strong>Flag reason:</strong> {response.flagReason}
                </p>
              )}

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
              <div className="flex flex-col gap-3 border-t border-gray-100 p-4 sm:flex-row sm:p-5">
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    disabled={statusMutation.isPending || flagMutation.isPending}
                    onClick={() => statusMutation.mutate("REJECTED")}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn-primary flex-1"
                    disabled={statusMutation.isPending || flagMutation.isPending}
                    onClick={() => statusMutation.mutate("APPROVED")}
                  >
                    Approve
                  </button>
                </div>
                {!showFlagConfirm ? (
                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center justify-center gap-2 text-error-600"
                    onClick={() => setShowFlagConfirm(true)}
                  >
                    <Flag className="h-4 w-4" />
                    Flag as invalid
                  </button>
                ) : (
                  <div className="rounded-lg border border-error-200 bg-error-500/5 p-3">
                    <p className="text-sm font-medium text-gray-900">
                      Flag this response as invalid? The reward will be clawed back.
                    </p>
                    <textarea
                      className="input mt-2 min-h-[60px] text-sm"
                      placeholder="Optional reason..."
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="btn-secondary flex-1 text-sm"
                        onClick={() => setShowFlagConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary flex-1 bg-error-600 text-sm hover:bg-error-700"
                        disabled={flagMutation.isPending}
                        onClick={() => flagMutation.mutate()}
                      >
                        Confirm flag
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {response.status === "APPROVED" && (
              <div className="border-t border-gray-100 p-4 sm:p-5">
                {!showFlagConfirm ? (
                  <button
                    type="button"
                    className="btn-secondary inline-flex w-full items-center justify-center gap-2 text-error-600"
                    onClick={() => setShowFlagConfirm(true)}
                  >
                    <Flag className="h-4 w-4" />
                    Flag as invalid
                  </button>
                ) : (
                  <div className="rounded-lg border border-error-200 bg-error-500/5 p-3">
                    <p className="text-sm font-medium text-gray-900">
                      Flag this response as invalid? The reward will be clawed back from the
                      respondent&apos;s wallet.
                    </p>
                    <textarea
                      className="input mt-2 min-h-[60px] text-sm"
                      placeholder="Optional reason..."
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="btn-secondary flex-1 text-sm"
                        onClick={() => setShowFlagConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary flex-1 bg-error-600 text-sm hover:bg-error-700"
                        disabled={flagMutation.isPending}
                        onClick={() => flagMutation.mutate()}
                      >
                        Confirm flag
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
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
