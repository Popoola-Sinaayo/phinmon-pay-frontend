"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Survey } from "@/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STARTER_PROMPTS = [
  "What are the main themes in open-text answers?",
  "Which multiple-choice option is most popular?",
  "Summarize overall sentiment from text responses.",
];

export function AiAnalyticsPanel({ survey }: { survey: Survey }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const { data } = await api.post<{ answer: string }>(`/analytics/surveys/${survey._id}/ask`, {
        question,
      });
      return data.answer;
    },
    onSuccess: (answer, question) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: answer },
      ]);
      setInput("");
    },
  });

  if (!survey.aiAnalyticsEnabled) {
    return (
      <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
            <Lock className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI analytics chat</h2>
            <p className="mt-1 text-sm text-gray-600">
              This add-on was not enabled when this campaign was created. Create a new campaign with
              AI analytics to ask questions about your response data.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const submit = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || askMutation.isPending) return;
    askMutation.mutate(trimmed);
  };

  return (
    <section className="rounded-xl border border-primary-100 bg-white p-6 shadow-subtle">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">AI analytics chat</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Ask questions about your survey responses. Answers are generated from your collected data.
      </p>

      {messages.length > 0 && (
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                msg.role === "user"
                  ? "ml-8 bg-primary-50 text-primary-900"
                  : "mr-8 bg-white text-gray-800 ring-1 ring-gray-100"
              )}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          ))}
          {askMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing responses...
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 hover:border-primary-200 hover:bg-primary-50"
            onClick={() => submit(prompt)}
            disabled={askMutation.isPending}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          className="input flex-1"
          placeholder="Ask about your survey data..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={askMutation.isPending}
        />
        <button
          type="submit"
          className="btn-primary inline-flex items-center gap-2"
          disabled={askMutation.isPending || !input.trim()}
        >
          <Send className="h-4 w-4" />
          Ask
        </button>
      </form>

      {askMutation.isError && (
        <p className="mt-2 text-sm text-error-600">
          {(askMutation.error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Failed to get an answer. Please try again."}
        </p>
      )}
    </section>
  );
}
