"use client";

import { useActionState } from "react";
import { completeProject, joinProject, toggleMilestone, type ActionResult } from "@/app/actions/student";

function Feedback({ state }: { state: ActionResult | undefined }) {
  if (!state) return null;
  if (state.error) return <div className="text-[13px] text-semantic-down">{state.error}</div>;
  if (state.ok) return <div className="text-[13px] font-medium text-semantic-up">{state.ok}</div>;
  return null;
}

export function JoinProjectForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(joinProject, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
      >
        {pending ? "Joining…" : "Join project"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function MilestoneToggle({
  milestoneId,
  done,
  title,
  disabled,
}: {
  milestoneId: string;
  done: boolean;
  title: string;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(toggleMilestone, undefined);
  return (
    <form action={action} className="flex items-center justify-between gap-3 rounded-md border border-hairline-soft px-3 py-2">
      <input type="hidden" name="milestoneId" value={milestoneId} />
      <span className={`text-sm ${done ? "text-muted line-through" : "font-medium text-ink"}`}>{title}</span>
      <div className="flex items-center gap-2">
        {state?.ok && <span className="text-[12px] text-semantic-up">saved</span>}
        <button
          type="submit"
          disabled={pending || disabled}
          className={`h-8 rounded-pill px-3 text-[12px] font-semibold disabled:opacity-40 ${
            done ? "bg-surface-strong text-body" : "bg-primary text-on-primary"
          }`}
        >
          {done ? "Undo" : "Mark done"}
        </button>
      </div>
    </form>
  );
}

export function CompleteProjectForm({ projectId, allDone }: { projectId: string; allDone: boolean }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(completeProject, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        disabled={pending || !allDone}
        className="inline-flex h-10 items-center rounded-pill bg-surface-dark px-5 text-sm font-semibold text-on-dark disabled:opacity-40"
      >
        {pending ? "Issuing…" : allDone ? "Complete & get certificate" : "Complete all milestones first"}
      </button>
      <Feedback state={state} />
    </form>
  );
}
