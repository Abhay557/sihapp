"use client";

import { useActionState, useState } from "react";
import { completeSimulation, startSimulation, type ActionResult } from "@/app/actions/student";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Primitives";

type Run = { score: number; completed: boolean } | null;

export function SimulationCard({
  id,
  title,
  company,
  domain,
  difficulty,
  durationMins,
  description,
  tasks,
  run,
}: {
  id: string;
  title: string;
  company: string;
  domain: string;
  difficulty: string;
  durationMins: number;
  description: string;
  tasks: string[];
  run: Run;
}) {
  const [startState, startAction, starting] = useActionState<ActionResult, FormData>(startSimulation, undefined);
  const [completeState, completeAction, completing] = useActionState<ActionResult, FormData>(completeSimulation, undefined);
  const [score, setScore] = useState(75);

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-tight text-ink">{title}</h3>
          <div className="mt-1 text-sm text-body">
            {company} · {domain} · {difficulty}
          </div>
        </div>
        <Badge tone={run?.completed ? "up" : "default"}>
          {run?.completed ? `Scored ${run.score}%` : `${durationMins} min`}
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-body">{description}</p>

      <ol className="mt-4 space-y-2">
        {tasks.map((t, i) => (
          <li key={i} className="flex items-start gap-3 rounded-md border border-hairline-soft px-3 py-2 text-sm text-ink">
            <span className="tabular text-[12px] font-semibold text-primary">{String(i + 1).padStart(2, "0")}</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 border-t border-hairline-soft pt-4">
        {run?.completed ? (
          <div className="text-sm font-semibold text-semantic-up">Certificate issued ✓ — scored {run.score}%</div>
        ) : !run ? (
          <form action={startAction} className="space-y-2">
            <input type="hidden" name="simulationId" value={id} />
            <button
              type="submit"
              disabled={starting}
              className="inline-flex h-10 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
            >
              {starting ? "Starting…" : "Start simulation"}
            </button>
            {startState?.error && <div className="text-[13px] text-semantic-down">{startState.error}</div>}
          </form>
        ) : (
          <form action={completeAction} className="space-y-3">
            <input type="hidden" name="simulationId" value={id} />
            <input type="hidden" name="score" value={score} />
            <label className="block text-[13px] font-medium text-body">
              Work through the tasks above, then self-evaluate: how confident are you? ({score}%)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-[#0052ff]"
            />
            <button
              type="submit"
              disabled={completing}
              className="inline-flex h-10 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
            >
              {completing ? "Scoring…" : "Submit & get certificate"}
            </button>
            {completeState?.error && <div className="text-[13px] text-semantic-down">{completeState.error}</div>}
            {completeState?.ok && <div className="text-[13px] font-medium text-semantic-up">{completeState.ok}</div>}
          </form>
        )}
      </div>
    </Card>
  );
}
