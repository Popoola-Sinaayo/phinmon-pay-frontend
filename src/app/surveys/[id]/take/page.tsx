"use client";

import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  Timer,
  Users,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { ProgressBar } from "@/components/ProgressBar";
import { cn, formatCurrency, getEstimatedMinutes } from "@/lib/utils";
import { canTakeSurvey } from "@/lib/verification";
import { usePlatformFeatures, isPremiumLivenessAvailable } from "@/lib/platformFeatures";
import { isAnswerEmpty } from "@/lib/surveyValidation";
import { useToast } from "@/components/ui/Toast";
import { AnimatedCounter } from "@/components/motion";
import type { Survey, Answer } from "@/types";

type BlockType = "full" | "already" | "inactive" | "expired" | "error";

const EASE = [0.22, 1, 0.36, 1] as const;

function parseApiError(err: unknown) {
  const res = (
    err as {
      response?: {
        status?: number;
        data?: { message?: string; details?: { code?: string } };
      };
    }
  )?.response;
  return {
    status: res?.status,
    code: res?.data?.details?.code,
    message: res?.data?.message,
  };
}

function haptic(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // no-op
  }
}

function TakeSkeleton({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-ink-900/[0.07] px-4 py-4">
        <div className="mx-auto max-w-survey space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-paper-200" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-paper-200" />
          </div>
          <div className="h-2 w-full animate-pulse rounded-full bg-paper-200" />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="w-full max-w-survey space-y-4">
          <div className="h-6 w-3/4 animate-pulse rounded-full bg-paper-200" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-input bg-paper-100" />
            ))}
          </div>
        </div>
        {label && (
          <p className="flex items-center gap-2 text-sm text-ink-500">
            <motion.span
              className="h-4 w-4 rounded-full border-2 border-primary-200 border-t-primary-600"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

function BlockedScreen({
  type,
  message,
  onRetry,
  retrying,
}: {
  type: BlockType;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const router = useRouter();

  const config: Record<
    BlockType,
    { emoji: string; title: string; body: string; accent: string }
  > = {
    full: {
      emoji: "🎯",
      title: "This task just filled up",
      body:
        message ||
        "All response slots have been taken. New tasks are added regularly \u2014 check back soon.",
      accent: "from-warning-500/10",
    },
    already: {
      emoji: "✅",
      title: "You've already completed this",
      body: message || "You can only respond to each task once. Your reward is on the way.",
      accent: "from-primary-500/10",
    },
    inactive: {
      emoji: "⏸️",
      title: "This task isn't available",
      body: message || "It may have been paused or closed by the researcher.",
      accent: "from-ink-900/[0.04]",
    },
    expired: {
      emoji: "⌛",
      title: "Your slot expired",
      body:
        message ||
        "You were away for a while, so we freed your slot for others. Grab a new one to continue.",
      accent: "from-secondary-500/10",
    },
    error: {
      emoji: "⚠️",
      title: "Something went wrong",
      body: message || "We couldn't start this task. Please try again.",
      accent: "from-error-500/10",
    },
  };

  const c = config[type];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={cn(
          "w-full max-w-sm rounded-modal border border-ink-900/[0.07] bg-gradient-to-b to-white p-8 shadow-card",
          c.accent
        )}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-subtle">
          {c.emoji}
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">{c.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{c.body}</p>
        <div className="mt-7 flex flex-col gap-2">
          {type === "expired" && onRetry && (
            <button className="btn-accent w-full" onClick={onRetry} disabled={retrying}>
              {retrying ? "Getting a slot..." : "Get another slot"}
            </button>
          )}
          {type === "error" && onRetry && (
            <button className="btn-accent w-full" onClick={onRetry} disabled={retrying}>
              {retrying ? "Retrying..." : "Try again"}
            </button>
          )}
          <button className="btn-secondary w-full" onClick={() => router.push("/surveys")}>
            Browse other tasks
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SuccessScreen({ reward, onDone }: { reward: number; onDone: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary-50 to-white px-4 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary-600 text-white shadow-glow"
      >
        <motion.span
          className="absolute inset-0 rounded-full bg-primary-400"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut", repeat: 1 }}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 15 }}
        >
          <CheckCircle2 className="h-12 w-12" strokeWidth={2.4} />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
        className="mt-6 font-display text-3xl font-semibold text-ink-900"
      >
        Response submitted!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4, ease: EASE }}
        className="mt-1 text-sm text-ink-500"
      >
        Nice work. Your earnings have been added to your wallet.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.4, ease: EASE }}
        className="mt-6 rounded-modal border border-primary-100 bg-white px-8 py-5 shadow-card"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">You earned</p>
        <AnimatedCounter
          value={reward}
          prefix="₦"
          className="mt-1 block font-display text-4xl font-bold text-primary-600"
        />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4, ease: EASE }}
        className="btn-accent mt-8 w-full max-w-xs"
        onClick={onDone}
      >
        Back to dashboard
      </motion.button>
      <button
        className="mt-3 text-sm font-medium text-ink-500 hover:text-ink-900"
        onClick={() => (window.location.href = "/surveys")}
      >
        Find another task
      </button>
    </div>
  );
}

function SlotTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [left, setLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const tick = () => {
      const s = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setLeft(s);
      if (s <= 0) onExpire();
    };
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt, onExpire]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  const low = left <= 120;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        low ? "bg-warning-500/10 text-warning-600" : "bg-primary-50 text-primary-700"
      )}
      title="Your response slot is held for this long"
    >
      <Timer className="h-3 w-3" /> Slot held · {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

export default function TakeSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: user, isLoading } = useAuth();
  const platformFeatures = usePlatformFeatures();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reward, setReward] = useState(0);

  const [starting, setStarting] = useState(true);
  const [reservation, setReservation] = useState<{ expiresAt: string } | null>(null);
  const [remainingSlots, setRemainingSlots] = useState<number | null>(null);
  const [blocked, setBlocked] = useState<{ type: BlockType; message?: string } | null>(null);

  const startedRef = useRef(false);
  const reservedRef = useRef(false);
  const consumedRef = useRef(false);

  const {
    data: survey,
    isError: surveyError,
  } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const { data } = await api.get<{ survey: Survey }>(`/surveys/${id}`);
      return data.survey;
    },
    enabled: !!id && !!user,
  });

  const startTask = useCallback(async () => {
    setStarting(true);
    setBlocked(null);
    try {
      const { data } = await api.post(`/responses/surveys/${id}/start`);
      setReservation({ expiresAt: data.expiresAt });
      setRemainingSlots(typeof data.remainingSlots === "number" ? data.remainingSlots : null);
      reservedRef.current = true;
    } catch (err) {
      reservedRef.current = false;
      const { status, code, message } = parseApiError(err);
      if (code === "FULL") {
        setBlocked({ type: "full", message });
      } else if (code === "ALREADY_SUBMITTED") {
        setBlocked({ type: "already", message });
      } else if (code === "NOT_ACTIVE" || code === "UNAVAILABLE") {
        setBlocked({ type: "inactive", message });
      } else if (code === "NOT_ELIGIBLE") {
        setBlocked({ type: "inactive", message });
      } else if (status === 403 && message?.toLowerCase().includes("nin")) {
        router.replace("/verification?step=nin");
        return;
      } else {
        setBlocked({ type: "error", message });
      }
    } finally {
      setStarting(false);
    }
  }, [id, router]);

  // Auth gate.
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  // Access gate + reserve a slot once we have the survey and user.
  useEffect(() => {
    if (!user || !survey || startedRef.current) return;
    const access = canTakeSurvey(survey, user);
    if (!access.allowed) {
      if (access.reason === "liveness" && !isPremiumLivenessAvailable(platformFeatures)) {
        router.replace("/surveys");
        return;
      }
      router.replace(
        access.reason === "liveness" ? "/verification?step=liveness" : "/verification?step=nin"
      );
      return;
    }
    startedRef.current = true;
    startTask();
  }, [user, survey, platformFeatures, router, startTask]);

  // Best-effort slot release if the user abandons before submitting.
  useEffect(() => {
    const release = () => {
      if (!reservedRef.current || consumedRef.current) return;
      reservedRef.current = false;
      api.post(`/responses/surveys/${id}/release`).catch(() => {});
    };
    window.addEventListener("pagehide", release);
    return () => {
      window.removeEventListener("pagehide", release);
      release();
    };
  }, [id]);

  const handleExpire = useCallback(() => {
    if (consumedRef.current) return;
    reservedRef.current = false;
    setReservation(null);
    setBlocked({ type: "expired" });
  }, []);

  const question = survey?.questions[currentIndex];
  const isLast = survey ? currentIndex === survey.questions.length - 1 : false;

  const goBack = () => {
    setDirection(-1);
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = async () => {
    if (!question || !survey) return;
    const value = answers[question.questionId];
    if (question.required && isAnswerEmpty(question, value)) {
      toast.warning("This question is required", {
        description: "Please answer before continuing.",
      });
      haptic(60);
      return;
    }
    if (!isLast) {
      setDirection(1);
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
      consumedRef.current = true;
      reservedRef.current = false;
      setReward(data.rewardAmount);
      setCompleted(true);
      haptic([40, 60, 120]);
    } catch (err: unknown) {
      const { code, status, message } = parseApiError(err);
      if (code === "FULL") {
        setBlocked({ type: "full", message });
        return;
      }
      if (status === 409 && message?.toLowerCase().includes("already")) {
        setBlocked({ type: "already", message });
        return;
      }
      if (message?.toLowerCase().includes("nin")) {
        router.push("/verification?step=nin");
        return;
      }
      if (message?.toLowerCase().includes("premium") || message?.toLowerCase().includes("eligible")) {
        if (isPremiumLivenessAvailable(platformFeatures)) {
          router.push("/verification?step=liveness");
        } else {
          router.push("/surveys");
        }
        return;
      }
      toast.error("Couldn't submit your response", {
        description: message || "Please check your connection and try again.",
      });
      haptic(80);
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return <SuccessScreen reward={reward} onDone={() => router.push("/dashboard")} />;
  }

  if (blocked) {
    return (
      <BlockedScreen
        type={blocked.type}
        message={blocked.message}
        onRetry={() => {
          startedRef.current = true;
          startTask();
        }}
        retrying={starting}
      />
    );
  }

  if (surveyError) {
    return <BlockedScreen type="error" message="We couldn't load this task." />;
  }

  if (isLoading || !survey || !user) {
    return <TakeSkeleton />;
  }

  if (starting || !reservation) {
    return <TakeSkeleton label="Reserving your spot..." />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="border-b border-ink-900/[0.07] px-4 py-4">
        <div className="mx-auto max-w-survey space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-ink-900">{survey.title}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">
                {formatCurrency(survey.payoutPerResponse)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-paper-100 px-2.5 py-1 text-xs text-ink-600">
                <Clock className="h-3 w-3" /> ~{getEstimatedMinutes(survey)} min
              </span>
              <SlotTimer expiresAt={reservation.expiresAt} onExpire={handleExpire} />
            </div>
          </div>
          {typeof remainingSlots === "number" && remainingSlots <= 5 && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-warning-600">
              <Users className="h-3.5 w-3.5" />
              {remainingSlots === 0
                ? "You claimed the last slot \u2014 finish to secure your reward."
                : `Only ${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} left after yours \u2014 your spot is held.`}
            </div>
          )}
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

      <div className="flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
        <div className="w-full max-w-survey">
          <AnimatePresence mode="wait" custom={direction}>
            {question && (
              <motion.div
                key={question.questionId || currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                <QuestionRenderer
                  question={question}
                  value={answers[question.questionId]}
                  onChange={(v) =>
                    setAnswers((prev) => ({ ...prev, [question.questionId]: v }))
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-ink-900/[0.07] px-4 py-4 pb-safe">
        <div className="mx-auto flex max-w-survey flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <motion.button
            type="button"
            className="btn-secondary inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
            disabled={currentIndex === 0}
            onClick={goBack}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </motion.button>
          <motion.button
            type="button"
            className="btn-primary inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
            onClick={handleNext}
            disabled={submitting}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
          >
            {submitting ? (
              <>
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
                Submitting...
              </>
            ) : isLast ? (
              <>Submit</>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
