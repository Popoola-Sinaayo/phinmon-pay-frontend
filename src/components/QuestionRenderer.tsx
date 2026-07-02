"use client";

import type { Question } from "@/types";

export function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const isLongText = question.type === "text_long" || question.type === "text";

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">{question.questionText}</h2>
      {question.required && <p className="text-sm text-gray-500">Required</p>}

      {(question.type === "text_short" || question.type === "text") && (
        <input
          type="text"
          className="input"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
        />
      )}

      {isLongText && (
        <textarea
          className="input min-h-[120px]"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
        />
      )}

      {question.type === "number" && (
        <input
          type="number"
          className="input"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}

      {question.type === "boolean" && (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt === "Yes")}
              className={`rounded-btn border px-6 py-3 text-sm font-medium transition ${
                value === (opt === "Yes")
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === "rating" && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`h-12 w-12 rounded-btn border text-sm font-medium transition ${
                value === n
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {question.type === "single_choice" && (
        <div className="space-y-2">
          {(question.options || []).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`block w-full rounded-btn border px-4 py-3 text-left text-sm transition ${
                value === opt
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {(question.options || []).map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const current = Array.isArray(value) ? value : [];
                  onChange(
                    selected ? current.filter((v) => v !== opt) : [...current, opt]
                  );
                }}
                className={`block w-full rounded-btn border px-4 py-3 text-left text-sm transition ${
                  selected
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
