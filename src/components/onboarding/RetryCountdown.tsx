"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function RetryCountdown({
  lockedUntil,
  retryRemainingMs,
  onComplete,
}: {
  lockedUntil?: string | null;
  retryRemainingMs?: number;
  onComplete?: () => void;
}) {
  const [remaining, setRemaining] = useState(retryRemainingMs || 0);

  useEffect(() => {
    const compute = () => {
      if (lockedUntil) {
        return Math.max(0, new Date(lockedUntil).getTime() - Date.now());
      }
      return retryRemainingMs || 0;
    };
    setRemaining(compute());
    const id = setInterval(() => {
      const next = compute();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(id);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, retryRemainingMs, onComplete]);

  if (remaining <= 0) return null;

  const { hours, minutes, seconds } = formatCountdown(remaining);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-6 w-6 text-amber-600" />
      </div>
      <p className="mt-3 font-semibold text-gray-900">Verification temporarily locked</p>
      <p className="mt-1 text-sm text-gray-600">
        Your NIN didn&apos;t match your profile. You can try again when the timer ends.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {[
          { label: "hrs", value: hours },
          { label: "min", value: minutes },
          { label: "sec", value: seconds },
        ].map((unit) => (
          <div
            key={unit.label}
            className="flex min-w-[4rem] flex-col rounded-xl bg-white px-3 py-2 shadow-subtle"
          >
            <span className="text-2xl font-bold tabular-nums text-gray-900">{unit.value}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
