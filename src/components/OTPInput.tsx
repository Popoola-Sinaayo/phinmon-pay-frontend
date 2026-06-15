"use client";

import { useRef, useState, KeyboardEvent } from "react";

export function OTPInput({ length = 6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...values];
    next[index] = value.slice(-1);
    setValues(next);
    if (value && index < length - 1) inputs.current[index + 1]?.focus();
    if (next.every((v) => v) && next.join("").length === length) onComplete(next.join(""));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-12 w-10 rounded-input border border-gray-200 text-center text-lg font-semibold outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
