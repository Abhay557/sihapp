"use client";

import { useActionState } from "react";
import { analyzeResume, type ActionResult } from "@/app/actions/student";
import { Card } from "@/components/ui/Primitives";

const SAMPLE = `AARAV SHARMA — B.Tech CSE, Batch 2026, CGPA 8.6
SKILLS: JavaScript, React, Node.js, SQL, Python, Docker, Git
PROJECTS:
- Built a campus events dashboard with React and Node.js; improved event discovery time by 40%.
- Machine learning churn predictor using Python and scikit-learn; 85% precision on test set.
EXPERIENCE:
- Web development internship at a startup — built REST APIs in Node.js and deployed with Docker on AWS.
- Led a 4-member team for the college tech fest website (won 2nd place).
ACHIEVEMENTS: Smart India Hackathon finalist; GitHub portfolio with 12 repositories.`;

export function ResumeForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(analyzeResume, undefined);

  return (
    <Card>
      <h2 className="text-lg font-semibold">Screen your resume</h2>
      <p className="mt-1 text-[13px] text-body">
        Paste your full resume text (or a sample to try it out). Analysis runs against the live job-demand skill set.
      </p>

      <form action={action} className="mt-4 space-y-4">
        <div>
          <label htmlFor="fileName" className="mb-1.5 block text-sm font-semibold text-ink">Resume label</label>
          <input
            id="fileName"
            name="fileName"
            defaultValue="resume-v1.txt"
            className="h-11 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="resumeText" className="text-sm font-semibold text-ink">Resume text</label>
            <button
              type="button"
              onClick={(e) => {
                const ta = (e.currentTarget.closest("form")?.elements.namedItem("resumeText") as HTMLTextAreaElement);
                if (ta) ta.value = SAMPLE;
              }}
              className="text-[12px] font-semibold text-primary hover:underline"
            >
              Insert sample
            </button>
          </div>
          <textarea
            id="resumeText"
            name="resumeText"
            rows={12}
            required
            placeholder="Paste your resume here — education, skills, projects, experience, achievements…"
            className="w-full rounded-md border border-hairline bg-canvas p-3 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-pill bg-primary px-6 text-sm font-semibold text-on-primary hover:bg-primary-active disabled:opacity-50"
        >
          {pending ? "Analyzing with AI…" : "Run AI screening"}
        </button>

        {state?.error && <div className="rounded-md bg-semantic-down/10 px-4 py-3 text-sm text-semantic-down">{state.error}</div>}
        {state?.ok && <div className="rounded-md bg-semantic-up/10 px-4 py-3 text-sm font-medium text-semantic-up">{state.ok}</div>}
      </form>
    </Card>
  );
}
