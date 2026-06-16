import type { Survey } from "@/types";

export type SurveyResponseRecord = {
  _id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rewardAmount: number;
  createdAt: string;
  answers: Array<{ questionId: string; type: string; value: unknown }>;
  userId?: { name?: string; email?: string; ninVerified?: boolean; livenessVerified?: boolean };
};

export type QuestionInsight =
  | {
      questionId: string;
      questionText: string;
      type: "single_choice" | "multiple_choice" | "boolean";
      distribution: { label: string; count: number; percent: number }[];
    }
  | {
      questionId: string;
      questionText: string;
      type: "rating" | "number";
      average: number;
      count: number;
    };

export function computeResponseSummary(
  survey: Survey,
  responses: SurveyResponseRecord[]
) {
  const statusCounts = { APPROVED: 0, PENDING: 0, REJECTED: 0 };
  let approvedRewards = 0;
  let pendingRewards = 0;

  for (const r of responses) {
    statusCounts[r.status] += 1;
    if (r.status === "APPROVED") approvedRewards += r.rewardAmount;
    if (r.status === "PENDING") pendingRewards += r.rewardAmount;
  }

  const premiumCount = responses.filter((r) => r.userId?.livenessVerified).length;
  const verifiedCount = responses.filter((r) => r.userId?.ninVerified).length;

  return {
    total: responses.length,
    needed: survey.responsesNeeded,
    received: survey.responsesReceived,
    completionPercent:
      survey.responsesNeeded > 0
        ? Math.round((survey.responsesReceived / survey.responsesNeeded) * 100)
        : 0,
    statusCounts,
    approvedRewards,
    pendingRewards,
    premiumCount,
    verifiedCount,
    payoutPerResponse: survey.payoutPerResponse,
  };
}

export function computeQuestionInsights(
  survey: Survey,
  responses: SurveyResponseRecord[]
): QuestionInsight[] {
  const insights: QuestionInsight[] = [];

  for (const q of survey.questions) {
    const answers = responses
      .flatMap((r) => r.answers.filter((a) => a.questionId === q.questionId))
      .map((a) => a.value);

    if (!answers.length) continue;

    if (q.type === "single_choice" || q.type === "multiple_choice") {
      const counts: Record<string, number> = {};
      for (const val of answers) {
        const items = Array.isArray(val) ? val : [val];
        for (const item of items) {
          const key = String(item);
          counts[key] = (counts[key] || 0) + 1;
        }
      }
      const total = Object.values(counts).reduce((s, n) => s + n, 0);
      insights.push({
        questionId: q.questionId,
        questionText: q.questionText,
        type: q.type,
        distribution: Object.entries(counts)
          .map(([label, count]) => ({
            label,
            count,
            percent: total > 0 ? Math.round((count / total) * 100) : 0,
          }))
          .sort((a, b) => b.count - a.count),
      });
    } else if (q.type === "boolean") {
      let yes = 0;
      let no = 0;
      for (const val of answers) {
        if (val === true || val === "true" || val === "Yes") yes += 1;
        else no += 1;
      }
      const total = yes + no;
      insights.push({
        questionId: q.questionId,
        questionText: q.questionText,
        type: "boolean",
        distribution: [
          { label: "Yes", count: yes, percent: total ? Math.round((yes / total) * 100) : 0 },
          { label: "No", count: no, percent: total ? Math.round((no / total) * 100) : 0 },
        ],
      });
    } else if (q.type === "rating" || q.type === "number") {
      const nums = answers.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
      if (nums.length) {
        insights.push({
          questionId: q.questionId,
          questionText: q.questionText,
          type: q.type,
          average: Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10,
          count: nums.length,
        });
      }
    }
  }

  return insights;
}

export function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}
