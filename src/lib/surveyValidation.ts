import type { Question } from "@/types";

export const isAnswerEmpty = (question: Question, value: unknown): boolean => {
  if (value === undefined || value === null) return true;

  if (question.type === "boolean") {
    return typeof value !== "boolean";
  }

  if (question.type === "number") {
    if (value === "") return true;
    if (typeof value === "number" && Number.isNaN(value)) return true;
    return false;
  }

  if (question.type === "multiple_choice") {
    return !Array.isArray(value) || value.length === 0;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  return false;
};

export const validateCampaignQuestions = (questions: Question[]): string | null => {
  if (!questions.length) return "Add at least one question";

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.questionText?.trim()) {
      return `Question ${i + 1} text is required`;
    }
    if (["single_choice", "multiple_choice"].includes(q.type)) {
      const options = (q.options || []).map((o) => o.trim()).filter(Boolean);
      if (options.length < 2) {
        return `Question ${i + 1} needs at least 2 answer options`;
      }
    }
  }

  return null;
};
