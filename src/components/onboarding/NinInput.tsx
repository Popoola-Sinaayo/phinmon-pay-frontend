"use client";

import { useRef } from "react";
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

  const handleChange = (raw: string) => {
    onChange(raw.replace(/\D/g, "").slice(0, 11));
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        placeholder="Enter your 11-digit NIN"
        className={cn(
          "input w-full text-center text-lg font-semibold tabular-nums sm:text-xl",
          value && "tracking-[0.2em] sm:tracking-[0.3em]",
          disabled && "opacity-60"
        )}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        maxLength={11}
        aria-label="National Identification Number"
      />
      <div className="mt-2 flex items-center justify-between px-1 text-xs">
        {value && !disabled ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="font-medium text-gray-400 transition hover:text-gray-600"
          >
            Clear
          </button>
        ) : (
          <span className="text-gray-400">You can edit any digit</span>
        )}
        <span
          className={cn(
            "tabular-nums text-gray-400",
            value.length === 11 && "font-semibold text-primary-600"
          )}
        >
          {value.length}/11
        </span>
      </div>
    </div>
  );
}
