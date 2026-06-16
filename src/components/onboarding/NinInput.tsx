"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function NinInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(11, " ").split("").slice(0, 11);

  const focusInput = () => {
    if (!disabled) inputRef.current?.focus();
  };

  const handleChange = (raw: string) => {
    onChange(raw.replace(/\D/g, "").slice(0, 11));
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        aria-label="National Identification Number"
      />
      <div
        className={cn("grid grid-cols-11 gap-1.5 sm:gap-2", disabled && "opacity-60")}
        onClick={focusInput}
      >
        {digits.map((digit, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "flex aspect-[3/4] items-center justify-center rounded-lg border-2 bg-white text-lg font-bold tabular-nums transition sm:rounded-xl sm:text-xl",
              digit.trim()
                ? "border-primary-400 text-gray-900 shadow-sm"
                : value.length === i
                  ? "border-primary-500 ring-2 ring-primary-100"
                  : "border-gray-200 text-gray-300"
            )}
          >
            {digit.trim() || ""}
          </motion.div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">
        Tap to enter your 11-digit NIN
      </p>
    </div>
  );
}
