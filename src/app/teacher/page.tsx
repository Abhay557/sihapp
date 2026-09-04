import Link from "next/link";
import { db } from "@/lib/db";
import { requireTeacher } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, Stat, ProgressBar, SectionTitle } from "@/components/ui/Primitives";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  const teacher = await requireTeacher();

  const [students, jobs, applications, projects, certificates] = await Promise.all([
    db.student.findMany({ include: { user: { select: { name: true } }, skills: { include: { skill: true } } } }),
    db.job.count({ where: { active: true } }),
    db.application.findMany({ include: { job: true, student: { include: { user: { select: { name: true } } } } }, orderBy: { createdAt: "desc" } }),
    db.project.findMany({ include: { members: true } }),
    db.certificate.count(),
  ]);

  const pendingApprovals = students.filter((s) => s.status === "PENDING").length;
  const approved = students.filter((s) => s.status === "APPROVED").length;
  const deptSkillAvg = new Map<string, { total: number; count: number }>();
  for (const s of students) {
    const entry = deptSkillAvg.get(s.department) ?? { total: 0, count: 0 };
    const avg = s.skills.length ? s.skills.reduce((sum, x) => sum + x.level, 0) / s.skills.length : 0;
    deptSkillAvg.set(s.department, { total: entry.total + avg, count: entry.count + 1 });
  }

  const statusMap: Record<string, number> = {};
  for (const a of applications) statusMap[a.status] = (statusMap[a.status] ?? 0) + 1;

  const topDemand = await db.jobSkill.groupBy({
    by: ["skillId"],
    _count: { _all: true },
    orderBy: { _count: { skillId: "desc" } },
    take: 6,
  });
  const skills = await db.skill.findMany();
  const demand = topDemand.map((d) => ({
    name: skills.find((s) => s.id === d.skillId)?.name ?? "—",
    count: d._count._all,
  }));
  const maxDemand = Math.max(1, ...demand.map((d) => d.count));

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Teacher dashboard</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Coordination overview</h1>
        <p className="mt-2 text-body">
          {teacher?.name} — monitor readiness, approvals, the placement funnel and skill demand in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Students" value={students.length} hint={`${approved} approved · ${pendingApprovals} pending`} />
        <Stat label="Open opportunities" value={jobs} hint="posted + synced" />
        <Stat label="Applications" value={applications.length} hint={`${statusMap["OFFER"] ?? 0} offers`} />
        <Stat label="Certificates issued" value={certificates} hint="projects, sims, courses" />
      </div>

      {pendingApprovals > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-ink">{pendingApprovals} student profile(s) awaiting approval</h2>
                <Badge tone="primary">action needed</Badge>
              </div>
              <p className="mt-1 text-sm text-body">Students can&apos;t be shown to recruiters until approved.</p>
            </div>
            <Link
              href="/teacher/approvals"
              className="inline-flex h-10 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active"
            >
              Review approvals
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Placement funnel</h2>
          <div className="mt-5 space-y-4">
            {(["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFER", "ACCEPTED"] as const).map((s) => (
              <div key={s}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-medium text-ink">{s[0] + s.slice(1).toLowerCase()}</span>
                  <span className="tabular text-muted">{statusMap[s] ?? 0}</span>
                </div>
                <ProgressBar value={((statusMap[s] ?? 0) / Math.max(1, applications.length)) * 100} />
              </div>
            ))}
          </div>
          <Link href="/teacher/students" className="mt-5 inline-block text-sm font-semibold text-primary hover:underline">
            Manage applications →
          </Link>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Top industry-demand skills</h2>
          <p className="mt-1 text-[13px] text-body">From live job & internship postings on the portal.</p>
          <div className="mt-5 space-y-4">
            {demand.map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-medium text-ink">{d.name}</span>
                  <span className="tabular text-muted">{d.count} postings</span>
                </div>
                <ProgressBar value={(d.count / maxDemand) * 100} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <SectionTitle title="Department skill readiness" subtitle="Average verified skill level per department." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...deptSkillAvg.entries()].map(([dept, v]) => {
            const avg = v.count ? Math.round(v.total / v.count) : 0;
            return <Stat key={dept} label={dept} value={`${avg}%`} tone={avg >= 70 ? "up" : avg >= 50 ? "default" : "down"} hint={`${v.count} students`} />;
          })}
        </div>
      </div>

      <div>
        <SectionTitle title="Active projects" subtitle="Faculty-mentored hands-on projects." />
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((p) => (
            <div key={p.id} className="rounded-lg border border-hairline bg-canvas p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-ink">{p.title}</div>
                <Badge tone={p.status === "COMPLETED" ? "up" : p.status === "IN_PROGRESS" ? "primary" : "default"}>
                  {p.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="mt-2 text-[13px] text-body">{p.domain} · {p.members.length} member(s)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
