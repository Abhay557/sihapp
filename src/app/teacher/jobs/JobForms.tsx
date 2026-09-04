"use client";

import { useActionState, useState } from "react";
import { createJob, toggleJobActive, type ActionResult } from "@/app/actions/teacher";
import { Card } from "@/components/ui/Primitives";

const inputCls =
  "h-11 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-primary";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-ink";

export function CreateJobForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(createJob, undefined);
  const [open, setOpen] = useState(false);

  return (
    <Card className="h-fit lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Post an opportunity</h2>
        <button onClick={() => setOpen((o) => !o)} className="text-sm font-semibold text-primary hover:underline lg:hidden">
          {open ? "Hide" : "Show"}
        </button>
      </div>

      <form action={action} className={`${open ? "mt-4" : "mt-4 hidden lg:block"} space-y-3`}>
        <div>
          <label htmlFor="title" className={labelCls}>Role title</label>
          <input id="title" name="title" required className={inputCls} placeholder="Product Management Intern" />
        </div>
        <div>
          <label htmlFor="company" className={labelCls}>Company</label>
          <input id="company" name="company" required className={inputCls} placeholder="Company name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="type" className={labelCls}>Type</label>
            <select id="type" name="type" className={inputCls} defaultValue="INTERNSHIP">
              <option value="INTERNSHIP">Internship</option>
              <option value="FULL_TIME">Full-time</option>
            </select>
          </div>
          <div>
            <label htmlFor="location" className={labelCls}>Location</label>
            <input id="location" name="location" className={inputCls} placeholder="Remote" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="stipend" className={labelCls}>Stipend / CTC</label>
            <input id="stipend" name="stipend" className={inputCls} placeholder="₹25,000/month" />
          </div>
          <div>
            <label htmlFor="deadline" className={labelCls}>Deadline</label>
            <input id="deadline" name="deadline" type="date" className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="skills" className={labelCls}>Required skills (comma separated)</label>
          <input id="skills" name="skills" className={inputCls} placeholder="React, Node.js, SQL" />
        </div>
        <div>
          <label htmlFor="description" className={labelCls}>Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            className="w-full rounded-md border border-hairline bg-canvas p-3 text-sm text-ink outline-none focus:border-primary"
            placeholder="Role overview, responsibilities, eligibility…"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post opportunity"}
        </button>
        {state?.error && <div className="rounded-md bg-semantic-down/10 px-4 py-3 text-sm text-semantic-down">{state.error}</div>}
        {state?.ok && <div className="rounded-md bg-semantic-up/10 px-4 py-3 text-sm font-medium text-semantic-up">{state.ok}</div>}
      </form>
    </Card>
  );
}

export function JobToggle({ jobId, active }: { jobId: string; active: boolean }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(toggleJobActive, undefined);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="jobId" value={jobId} />
      <button
        type="submit"
        disabled={pending}
        className={`h-9 rounded-pill px-4 text-[13px] font-semibold disabled:opacity-50 ${
          active ? "bg-surface-strong text-body hover:bg-hairline" : "bg-primary text-on-primary hover:bg-primary-active"
        }`}
      >
        {pending ? "…" : active ? "Close posting" : "Reopen"}
      </button>
      {state?.ok && <span className="text-[12px] text-semantic-up">✓</span>}
      {state?.error && <span className="text-[12px] text-semantic-down">{state.error}</span>}
    </form>
  );
}
