"use client";

import type { Question, QuestionType } from "@/types";

const QUESTION_TYPES: QuestionType[] = [
  "text",
  "single_choice",
  "multiple_choice",
  "number",
  "rating",
  "boolean",
];

export function SurveyBuilder({
  questions,
  onChange,
}: {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}) {
  const addQuestion = () => {
    onChange([
      ...questions,
      {
        questionId: crypto.randomUUID(),
        questionText: "",
        type: "text",
        required: true,
        options: [],
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const next = [...questions];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const duplicateQuestion = (index: number) => {
    const q = questions[index];
    const copy = { ...q, questionId: crypto.randomUUID(), questionText: `${q.questionText} (copy)` };
    const next = [...questions];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const next = [...questions];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.questionId} className="card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Question {i + 1}</span>
            <div className="flex gap-2">
              <button type="button" className="text-xs text-gray-500 hover:text-gray-700" onClick={() => moveQuestion(i, -1)}>↑</button>
              <button type="button" className="text-xs text-gray-500 hover:text-gray-700" onClick={() => moveQuestion(i, 1)}>↓</button>
              <button type="button" className="text-xs text-primary-600" onClick={() => duplicateQuestion(i)}>Duplicate</button>
              <button type="button" className="text-xs text-error-600" onClick={() => removeQuestion(i)}>Delete</button>
            </div>
          </div>
          <input
            className="input"
            placeholder="Question text"
            value={q.questionText}
            onChange={(e) => updateQuestion(i, { questionText: e.target.value })}
          />
          <select
            className="input"
            value={q.type}
            onChange={(e) =>
              updateQuestion(i, {
                type: e.target.value as QuestionType,
                options: ["single_choice", "multiple_choice"].includes(e.target.value)
                  ? ["Option 1", "Option 2"]
                  : [],
              })
            }
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
          {["single_choice", "multiple_choice"].includes(q.type) && (
            <textarea
              className="input min-h-[80px]"
              placeholder="Options (one per line)"
              value={(q.options || []).join("\n")}
              onChange={(e) =>
                updateQuestion(i, { options: e.target.value.split("\n").filter(Boolean) })
              }
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={q.required}
              onChange={(e) => updateQuestion(i, { required: e.target.checked })}
            />
            Required
          </label>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="btn-secondary w-full">
        + Add Question
      </button>
    </div>
  );
}
