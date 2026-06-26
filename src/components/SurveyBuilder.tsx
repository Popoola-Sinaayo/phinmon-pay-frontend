"use client";

import { motion } from "framer-motion";
import {
  AlignLeft,
  CheckSquare,
  CircleDot,
  Copy,
  GripVertical,
  Hash,
  Plus,
  Star,
  ToggleLeft,
  Trash2,
  X,
} from "lucide-react";
import type { Question, QuestionType } from "@/types";
import { cn } from "@/lib/utils";

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "text_short", label: "Short text", icon: AlignLeft },
  { value: "text_long", label: "Long text", icon: AlignLeft },
  { value: "single_choice", label: "Single choice", icon: CircleDot },
  { value: "multiple_choice", label: "Multiple choice", icon: CheckSquare },
  { value: "number", label: "Number", icon: Hash },
  { value: "rating", label: "Rating", icon: Star },
  { value: "boolean", label: "Yes / No", icon: ToggleLeft },
];

function defaultOptions(type: QuestionType): string[] {
  if (type === "single_choice" || type === "multiple_choice") {
    return ["Option 1", "Option 2", "Option 3"];
  }
  return [];
}

function QuestionOptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    onChange(next);
  };

  const addOption = () => onChange([...options, `Option ${options.length + 1}`]);

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Answer options
      </label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
            {String.fromCharCode(65 + i)}
          </span>
          <input
            className="input flex-1"
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeOption(i)}
            disabled={options.length <= 2}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-error-500/10 hover:text-error-600 disabled:opacity-30"
            aria-label="Remove option"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-700"
      >
        <Plus className="h-4 w-4" /> Add option
      </button>
    </div>
  );
}

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
        type: "text_short",
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
    const copy = {
      ...q,
      questionId: crypto.randomUUID(),
      questionText: q.questionText ? `${q.questionText} (copy)` : "",
      options: q.options ? [...q.options] : [],
    };
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
      {questions.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-10 text-center">
          <p className="text-sm text-gray-500">No questions yet. Add your first question below.</p>
        </div>
      )}

      {questions.map((q, i) => {
        const typeMeta =
          QUESTION_TYPES.find((t) => t.value === q.type) ??
          (q.type === "text" ? QUESTION_TYPES[0] : QUESTION_TYPES[0]);

        return (
          <motion.div
            key={q.questionId}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-subtle"
          >
            <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/60 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-300" />
                <span className="text-sm font-semibold text-gray-700">Question {i + 1}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-gray-200">
                  {typeMeta.label}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-white"
                  onClick={() => moveQuestion(i, -1)}
                  disabled={i === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-white"
                  onClick={() => moveQuestion(i, 1)}
                  disabled={i === questions.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-primary-600"
                  onClick={() => duplicateQuestion(i)}
                  title="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-error-600"
                  onClick={() => removeQuestion(i)}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <label className="label">Question</label>
                <input
                  className="input"
                  placeholder="What would you like to ask?"
                  value={q.questionText}
                  onChange={(e) => updateQuestion(i, { questionText: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Type</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {QUESTION_TYPES.map((t) => {
                    const Icon = t.icon;
                    const selected = q.type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() =>
                          updateQuestion(i, {
                            type: t.value,
                            options: defaultOptions(t.value),
                          })
                        }
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition",
                          selected
                            ? "border-primary-500 bg-primary-50 text-primary-800 ring-1 ring-primary-200"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {["single_choice", "multiple_choice"].includes(q.type) && (
                <QuestionOptionsEditor
                  options={q.options || []}
                  onChange={(options) => updateQuestion(i, { options })}
                />
              )}

              {q.type === "multiple_choice" && (q.options?.length ?? 0) > 10 && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                  High complexity: more than 10 options may increase survey time and cost.
                </p>
              )}

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(i, { required: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600"
                />
                <span className="text-sm font-medium text-gray-700">Required question</span>
              </label>
            </div>
          </motion.div>
        );
      })}

      <motion.button
        type="button"
        onClick={addQuestion}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-4 text-sm font-semibold text-gray-700 transition hover:border-primary-300 hover:bg-primary-50/30 hover:text-primary-700"
      >
        <Plus className="h-4 w-4" /> Add Question
      </motion.button>
    </div>
  );
}
