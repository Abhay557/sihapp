"use client";

import { useActionState } from "react";
import { enrollCourse, setCourseProgress, type ActionResult } from "@/app/actions/student";

function Feedback({ state }: { state: ActionResult | undefined }) {
  if (!state) return null;
  if (state.error) return <div className="mt-2 text-[13px] text-semantic-down">{state.error}</div>;
  if (state.ok) return <div className="mt-2 text-[13px] font-medium text-semantic-up">{state.ok}</div>;
  return null;
}

export function EnrollButton({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(enrollCourse, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
      >
        {pending ? "Enrolling…" : "Enroll"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function ProgressControl({ courseId, progress }: { courseId: string; progress: number }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(setCourseProgress, undefined);
  const next = Math.min(100, progress + 25);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="progress" value={next} />
      <button
        type="submit"
        disabled={pending || next === progress}
        className="inline-flex h-9 items-center rounded-pill bg-surface-strong px-4 text-[13px] font-semibold text-ink hover:bg-hairline disabled:opacity-50"
      >
        {pending ? "Saving…" : `Mark progress → ${next}%`}
      </button>
      <Feedback state={state} />
    </form>
  );
}
