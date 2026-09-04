"use client";

import { useActionState, useState } from "react";
import { applyToJob, type ActionResult } from "@/app/actions/student";

export function ApplyForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(applyToJob, undefined);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active"
      >
        Apply
      </button>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <textarea
        name="note"
        rows={2}
        placeholder="Why you? (optional note to the placement cell)"
        className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-primary"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
        >
          {pending ? "Applying…" : "Submit application"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-body hover:text-ink">
          Cancel
        </button>
      </div>
      {state?.error && <div className="text-[13px] text-semantic-down">{state.error}</div>}
      {state?.ok && <div className="text-[13px] font-medium text-semantic-up">{state.ok}</div>}
    </form>
  );
}
