import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { Card, Stat, ProgressBar, EmptyState, SectionTitle } from "@/components/ui/Primitives";
import { fmtDate } from "@/lib/utils";
export default async function StudentDashboard() {
  const user = await requireStudent();
  if (!user?.studentId) redirect("/login");

  const [student, applications, enrollments, certificates, skills, jobsCount, myProjects, mySims] = await Promise.all([
    db.student.findUnique({ where: { id: user.studentId } }),
    db.application.findMany({
      where: { studentId: user.studentId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),
    db.enrollment.findMany({ where: { studentId: user.studentId }, include: { course: true } }),
    db.certificate.findMany({ where: { studentId: user.studentId }, orderBy: { issuedAt: "desc" } }),
    db.studentSkill.findMany({ where: { studentId: user.studentId }, include: { skill: true }, orderBy: { level: "desc" } }),
    db.job.count({ where: { active: true } }),
    db.projectMember.findMany({ where: { studentId: user.studentId }, include: { project: true } }),
    db.simulationRun.findMany({ where: { studentId: user.studentId }, include: { simulation: true } }),
  ]);

  const activeApps = applications.filter((a) => !["REJECTED", "WITHDRAWN", "ACCEPTED"].includes(a.status));
  const avgSkill = skills.length ? Math.round(skills.reduce((s, x) => s + x.level, 0) / skills.length) : 0;
  const placementReady = avgSkill >= 70 && certificates.length >= 2;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Student dashboard</div>
          <h1 className="text-display mt-2 text-3xl md:text-4xl">Hi {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-2 text-body">
            {student?.department} · Batch {student?.batch} · Roll {student?.rollNumber}
            {student?.status !== "APPROVED" && (
              <Badge tone="down" className="ml-3">Profile pending approval</Badge>
            )}
          </p>
        </div>
        {placementReady ? (
          <Badge tone="up" className="h-7 text-[13px]">Placement ready</Badge>
        ) : (
          <Badge className="h-7 text-[13px]">Building readiness</Badge>
        )}
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Open opportunities" value={jobsCount} hint="jobs & internships live" />
        <Stat label="My applications" value={applications.length} hint={`${activeApps.length} active`} />
        <Stat label="Avg skill level" value={`${avgSkill}%`} tone={avgSkill >= 70 ? "up" : "default"} hint={`${skills.length} skills tracked`} />
        <Stat label="Certificates" value={certificates.length} hint="projects, sims, courses" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Applications */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent applications</h2>
            <Link href="/student/applications" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState title="No applications yet" hint="Browse the job portal and apply to your first opportunity." />
          ) : (
            <ul className="divide-y divide-hairline-soft">
              {applications.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{a.job.title}</div>
                    <div className="text-[13px] text-body">
                      {a.job.company} · {a.job.type === "INTERNSHIP" ? "Internship" : "Full-time"}
                    </div>
                  </div>
                  <ApplicationStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Skill profile */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top skills</h2>
            <Link href="/student/profile" className="text-sm font-semibold text-primary hover:underline">Profile</Link>
          </div>
          {skills.length === 0 ? (
            <EmptyState title="No skills yet" hint="Take a course assessment or analyze your resume." />
          ) : (
            <div className="space-y-4">
              {skills.slice(0, 5).map((s) => (
                <div key={s.skillId}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="font-medium text-ink">{s.skill.name}</span>
                    <span className="tabular text-muted">{s.level}%</span>
                  </div>
                  <ProgressBar value={s.level} tone={s.level >= 70 ? "up" : "primary"} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active projects */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My projects</h2>
            <Link href="/student/projects" className="text-sm font-semibold text-primary hover:underline">Projects portal</Link>
          </div>
          {myProjects.length === 0 ? (
            <EmptyState title="Not on a project yet" hint="Join a real industry project to earn a certificate." />
          ) : (
            <ul className="divide-y divide-hairline-soft">
              {myProjects.map((pm) => (
                <li key={pm.projectId} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{pm.project.title}</div>
                    <div className="text-[13px] text-body">{pm.project.domain} · you are {pm.role}</div>
                  </div>
                  <Badge tone={pm.project.status === "COMPLETED" ? "up" : "primary"}>{pm.project.status.replace("_", " ")}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Latest certificates */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Certificates & badges</h2>
            <Link href="/student/profile" className="text-sm font-semibold text-primary hover:underline">All</Link>
          </div>
          {certificates.length === 0 ? (
            <EmptyState title="No certificates yet" hint="Finish a simulation, project or course." />
          ) : (
            <ul className="divide-y divide-hairline-soft">
              {certificates.slice(0, 4).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{c.title}</div>
                    <div className="text-[13px] text-body">{c.issuer} · {fmtDate(c.issuedAt)}</div>
                  </div>
                  <Badge tone="primary">{c.kind}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* quick links */}
      <div>
        <SectionTitle title="Jump back in" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/student/jobs", title: "Jobs & internships", desc: `${jobsCount} open` },
            { href: "/student/simulations", title: "Virtual simulations", desc: `${mySims.length} runs` },
            { href: "/student/resume", title: "Resume AI screening", desc: "ATS score & gaps" },
            { href: "/student/courses", title: "Courses & badges", desc: `${enrollments.length} enrolled` },
          ].map((q) => (
            <Link key={q.href} href={q.href} className="rounded-lg border border-hairline bg-canvas p-5 transition-shadow hover:shadow-soft">
              <div className="text-sm font-semibold text-ink">{q.title}</div>
              <div className="mt-1 text-[13px] text-body">{q.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
