"use client";

import { useActionState } from "react";
import { approveStudent, type ActionResult } from "@/app/actions/teacher";

export function ApprovalForm({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(approveStudent, undefined);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="studentId" value={studentId} />
      <input
        name="note"
        placeholder="Verification note (optional)"
        className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-primary"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          name="decision"
          value="APPROVED"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="REJECTED"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-pill bg-surface-strong px-5 text-sm font-semibold text-body hover:bg-hairline disabled:opacity-50"
        >
          Reject
        </button>
        {state?.error && <span className="text-[13px] text-semantic-down">{state.error}</span>}
        {state?.ok && <span className="text-[13px] font-medium text-semantic-up">✓ {state.ok}</span>}
      </div>
    </form>
  );
}
