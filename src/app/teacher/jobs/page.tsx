import { db } from "@/lib/db";
import { requireTeacher } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, Stat } from "@/components/ui/Primitives";
import { fmtDate } from "@/lib/utils";
import { CreateJobForm, JobToggle } from "./JobForms";

export const dynamic = "force-dynamic";

export default async function TeacherJobsPage() {
  await requireTeacher();

  const jobs = await db.job.findMany({
    include: {
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const internships = jobs.filter((j) => j.type === "INTERNSHIP").length;
  const totalApps = jobs.reduce((s, j) => s + j._count.applications, 0);

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Job portal</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Post & manage opportunities</h1>
        <p className="mt-2 max-w-2xl text-body">
          Post jobs and internships (including PM internships) for your students. External sources — Google Jobs
          (SerpApi), fantastic.jobs and Upwork — sync automatically.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total postings" value={jobs.length} />
        <Stat label="Internships" value={internships} hint="incl. PM track" />
        <Stat label="Full-time" value={jobs.length - internships} />
        <Stat label="Applications received" value={totalApps} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <CreateJobForm />

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-ink">{job.title}</h3>
                  <div className="mt-1 text-sm text-body">
                    {job.company} · {job.location}
                    {job.stipend && <span className="ml-2 font-semibold text-ink">{job.stipend}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Badge tone={job.type === "INTERNSHIP" ? "primary" : "default"}>
                      {job.type === "INTERNSHIP" ? "Internship" : "Full-time"}
                    </Badge>
                    {!job.active && <Badge tone="down">closed</Badge>}
                  </div>
                  {job.source !== "MANUAL" && <Badge>{job.source.replace(/_/g, " ").toLowerCase()}</Badge>}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((js) => (
                  <span key={js.skillId} className="rounded-pill bg-surface-strong px-3 py-1 text-[12px] font-medium text-body">
                    {js.skill.name}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft pt-4">
                <div className="text-[13px] text-muted">
                  {job._count.applications} application(s) · posted {fmtDate(job.createdAt)}
                  {job.deadline && ` · deadline ${fmtDate(job.deadline)}`}
                </div>
                <JobToggle jobId={job.id} active={job.active} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
