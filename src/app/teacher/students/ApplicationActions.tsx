"use client";

import { useActionState } from "react";
import { advanceApplication, rejectApplication, type ActionResult } from "@/app/actions/teacher";

export function ApplicationActions({ applicationId, status }: { applicationId: string; status: string }) {
  const [advState, advAction, advPending] = useActionState<ActionResult, FormData>(advanceApplication, undefined);
  const [rejState, rejAction, rejPending] = useActionState<ActionResult, FormData>(rejectApplication, undefined);

  const nextMap: Record<string, string> = {
    APPLIED: "Shortlist",
    SHORTLISTED: "Interview",
    INTERVIEW: "Offer",
    OFFER: "Accept",
  };
  const next = nextMap[status];
  const terminal = ["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(status);
  const state = advState ?? rejState;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next && (
        <form action={advAction}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <button
            type="submit"
            disabled={advPending}
            className="h-8 rounded-pill bg-primary px-3 text-[12px] font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
          >
            {advPending ? "…" : next}
          </button>
        </form>
      )}
      {!terminal && status !== "REJECTED" && (
        <form action={rejAction}>
          <input type="hidden" name="applicationId" value={applicationId} />
          <button
            type="submit"
            disabled={rejPending}
            className="h-8 rounded-pill bg-surface-strong px-3 text-[12px] font-semibold text-body hover:bg-hairline disabled:opacity-50"
          >
            Reject
          </button>
        </form>
      )}
      {terminal && <span className="text-[12px] text-muted">closed</span>}
      {state?.error && <span className="text-[12px] text-semantic-down">{state.error}</span>}
      {state?.ok && <span className="text-[12px] text-semantic-up">✓</span>}
    </div>
  );
}
