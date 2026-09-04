import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, EmptyState } from "@/components/ui/Primitives";
import { ApplyForm } from "./ApplyForm";
import { fmtDate } from "@/lib/utils";
import { syncExternalJobs } from "@/lib/jobsources";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; type?: string }>;

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireStudent();
  const { q = "", type = "ALL" } = await searchParams;

  // opportunistically sync external sources (no-ops without API keys)
  await syncExternalJobs().catch(() => 0);

  const jobs = await db.job.findMany({
    where: {
      active: true,
      ...(type === "INTERNSHIP" || type === "FULL_TIME" ? { type } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { company: { contains: q } }, { description: { contains: q } }] } : {}),
    },
    include: {
      skills: { include: { skill: true } },
      applications: { where: user?.studentId ? { studentId: user.studentId } : undefined, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const myApplications = await db.application.findMany({
    where: { studentId: user?.studentId },
    select: { jobId: true },
  });
  const appliedJobIds = new Set(myApplications.map((a) => a.jobId));

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Job portal</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Jobs & internships</h1>
        <p className="mt-2 max-w-2xl text-body">
          Campus drives, PM internships and full-time roles — aggregated from external sources (Google Jobs via SerpApi,
          fantastic.jobs, Upwork) and posted by faculty.
        </p>
      </div>

      {/* filters */}
      <form className="flex flex-wrap items-center gap-3" action="/student/jobs">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title, company or keyword…"
          className="h-11 min-w-56 flex-1 rounded-pill border border-hairline bg-surface-strong px-5 text-sm text-ink outline-none focus:border-primary"
        />
        <select
          name="type"
          defaultValue={type}
          className="h-11 rounded-pill border border-hairline bg-surface-strong px-5 text-sm font-medium text-ink outline-none"
        >
          <option value="ALL">All types</option>
          <option value="INTERNSHIP">Internships</option>
          <option value="FULL_TIME">Full-time</option>
        </select>
        <button type="submit" className="h-11 rounded-pill bg-primary px-6 text-sm font-semibold text-on-primary hover:bg-primary-active">
          Filter
        </button>
      </form>

      {/* results */}
      {jobs.length === 0 ? (
        <EmptyState title="No opportunities match" hint="Try clearing filters or a different keyword." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => {
            const applied = appliedJobIds.has(job.id);
            return (
              <Card key={job.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold leading-tight text-ink">{job.title}</h2>
                    <div className="mt-1 text-sm text-body">
                      {job.company} · {job.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone={job.type === "INTERNSHIP" ? "primary" : "default"}>
                      {job.type === "INTERNSHIP" ? "Internship" : "Full-time"}
                    </Badge>
                    {job.source !== "MANUAL" && <Badge>{job.source.replace(/_/g, " ").toLowerCase()}</Badge>}
                  </div>
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-body">{job.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.slice(0, 5).map((js) => (
                    <span key={js.skillId} className="rounded-pill bg-surface-strong px-3 py-1 text-[12px] font-medium text-body">
                      {js.skill.name}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-4 text-[13px] text-muted">
                  {job.stipend && <span className="tabular font-semibold text-ink">{job.stipend}</span>}
                  {job.deadline && <span>Apply by {fmtDate(job.deadline)}</span>}
                </div>

                <div className="mt-5 border-t border-hairline-soft pt-4">
                  {applied ? (
                    <Badge tone="up">Applied ✓</Badge>
                  ) : job.applyUrl ? (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active"
                    >
                      Apply on {job.source === "UPWORK" ? "Upwork" : "external site"} ↗
                    </a>
                  ) : (
                    <ApplyForm jobId={job.id} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
