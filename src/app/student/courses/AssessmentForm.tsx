"use client";

import { useActionState, useState } from "react";
import { submitAssessment, type ActionResult } from "@/app/actions/student";

type Question = { q: string; options: string[]; answer: number };

export function AssessmentForm({
  assessmentId,
  courseId,
  title,
  passScore,
  questions,
}: {
  assessmentId: string;
  courseId: string;
  title: string;
  passScore: number;
  questions: Question[];
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(submitAssessment, undefined);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <input type="hidden" name="courseId" value={courseId} />

      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-ink">📝 {title}</div>
        <div className="text-[12px] font-semibold text-muted">
          {answered}/{questions.length} answered · pass ≥ {passScore}%
        </div>
      </div>

      <ol className="space-y-4">
        {questions.map((question, qi) => (
          <li key={qi} className="rounded-md border border-hairline-soft p-4">
            <div className="text-sm font-medium text-ink">
              {qi + 1}. {question.q}
            </div>
            <div className="mt-3 grid gap-2">
              {question.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    name={`q_${qi}`}
                    value={oi}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`rounded-pill border px-4 py-2 text-left text-[13px] transition-colors ${
                      selected ? "border-primary bg-primary/10 font-semibold text-primary" : "border-hairline text-body hover:border-muted"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name={`q_${qi}`} value={answers[qi] ?? -1} />
          </li>
        ))}
      </ol>

      <button
        type="submit"
        disabled={pending || answered < questions.length}
        className="inline-flex h-10 items-center rounded-pill bg-primary px-6 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
      >
        {pending ? "Grading…" : answered < questions.length ? `Answer ${questions.length - answered} more` : "Submit assessment"}
      </button>

      {state?.error && <div className="rounded-md bg-semantic-down/10 px-4 py-3 text-sm text-semantic-down">{state.error}</div>}
      {state?.ok && <div className="rounded-md bg-semantic-up/10 px-4 py-3 text-sm font-medium text-semantic-up">{state.ok}</div>}
    </form>
  );
}
