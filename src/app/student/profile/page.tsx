import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, Stat, ProgressBar, EmptyState } from "@/components/ui/Primitives";
import { fmtDate, initials } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireStudent();
  if (!user?.studentId) redirect("/login");

  const [student, skills, certificates, projects, applications, sims, analyses] = await Promise.all([
    db.student.findUnique({ where: { id: user.studentId } }),
    db.studentSkill.findMany({ where: { studentId: user.studentId }, include: { skill: true }, orderBy: { level: "desc" } }),
    db.certificate.findMany({ where: { studentId: user.studentId }, orderBy: { issuedAt: "desc" } }),
    db.projectMember.findMany({ where: { studentId: user.studentId }, include: { project: true } }),
    db.application.findMany({ where: { studentId: user.studentId } }),
    db.simulationRun.findMany({ where: { studentId: user.studentId }, include: { simulation: true } }),
    db.resumeAnalysis.findMany({ where: { studentId: user.studentId }, orderBy: { createdAt: "desc" }, take: 1 }),
  ]);

  const avgSkill = skills.length ? Math.round(skills.reduce((s, x) => s + x.level, 0) / skills.length) : 0;
  const latestAts = analyses[0]?.atsScore;
  const badgeCount = skills.filter((s) => s.level >= 55).length;

  return (
    <div className="space-y-8">
      {/* header card */}
      <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-on-primary">
            {initials(user.name)}
          </div>
          <div>
            <h1 className="text-display text-2xl md:text-3xl">{user.name}</h1>
            <p className="mt-1 text-sm text-body">
              {student?.rollNumber} · {student?.department} · {student?.program} · Batch {student?.batch}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={student?.status === "APPROVED" ? "up" : "down"}>
                Profile {student?.status.toLowerCase()}
              </Badge>
              <Badge>CGPA {student?.cgpa.toFixed(1)}</Badge>
              {avgSkill >= 70 && certificates.length >= 2 && <Badge tone="primary">Placement ready</Badge>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-surface-soft px-5 py-4">
            <div className="tabular text-2xl font-semibold text-ink">{avgSkill}%</div>
            <div className="mt-1 text-[12px] text-muted">avg skill</div>
          </div>
          <div className="rounded-lg bg-surface-soft px-5 py-4">
            <div className="tabular text-2xl font-semibold text-ink">{badgeCount}</div>
            <div className="mt-1 text-[12px] text-muted">badged skills</div>
          </div>
          <div className="rounded-lg bg-surface-soft px-5 py-4">
            <div className="tabular text-2xl font-semibold text-ink">{certificates.length}</div>
            <div className="mt-1 text-[12px] text-muted">certificates</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* verified skill profile */}
        <Card>
          <h2 className="text-lg font-semibold">Verified skill profile</h2>
          <p className="mt-1 text-[13px] text-body">Levels update automatically from assessments, resume screening and simulations.</p>
          <div className="mt-5 space-y-4">
            {skills.length === 0 && <EmptyState title="No skills tracked yet" hint="Take an assessment or run resume screening." />}
            {skills.map((s) => (
              <div key={s.skillId}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-medium text-ink">
                    {s.skill.name}
                    {s.level >= 85 && <span className="ml-2 text-[11px] font-semibold text-accent-yellow">GOLD</span>}
                    {s.level >= 70 && s.level < 85 && <span className="ml-2 text-[11px] font-semibold text-muted">SILVER</span>}
                    {s.level >= 55 && s.level < 70 && <span className="ml-2 text-[11px] font-semibold text-[#cd7f32]">BRONZE</span>}
                  </span>
                  <span className="tabular text-muted">{s.level}%</span>
                </div>
                <ProgressBar value={s.level} tone={s.level >= 70 ? "up" : "primary"} />
              </div>
            ))}
          </div>
        </Card>

        {/* certificates */}
        <Card>
          <h2 className="text-lg font-semibold">Certificates</h2>
          <p className="mt-1 text-[13px] text-body">Verifiable certificates from projects, simulations and courses.</p>
          <div className="mt-5">
            {certificates.length === 0 && <EmptyState title="No certificates yet" />}
            <ul className="divide-y divide-hairline-soft">
              {certificates.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{c.title}</div>
                    <div className="text-[13px] text-body">
                      {c.issuer} · {fmtDate(c.issuedAt)} · code <span className="tabular">{c.code}</span>
                    </div>
                  </div>
                  <Badge tone="primary">{c.kind}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* activity summary */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Activity</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Applications" value={applications.length} hint="jobs & internships" />
          <Stat label="Projects" value={projects.length} hint={`${projects.filter((p) => p.project.status === "COMPLETED").length} completed`} />
          <Stat label="Simulations" value={sims.length} hint={`${sims.filter((s) => s.completed).length} completed`} />
          <Stat label="Latest ATS score" value={latestAts !== undefined ? `${latestAts}/100` : "—"} tone={latestAts !== undefined && latestAts >= 70 ? "up" : "default"} hint="resume screening" />
        </div>
      </div>
    </div>
  );
}
