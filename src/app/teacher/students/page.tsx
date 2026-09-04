import { db } from "@/lib/db";
import { requireTeacher } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, EmptyState } from "@/components/ui/Primitives";
import { fmtDate, initials } from "@/lib/utils";
import { ApplicationActions } from "./ApplicationActions";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";

export const dynamic = "force-dynamic";

export default async function TeacherStudentsPage() {
  await requireTeacher();

  const [students, applications] = await Promise.all([
    db.student.findMany({
      include: {
        user: { select: { name: true, email: true } },
        skills: { include: { skill: true } },
        applications: { include: { job: true } },
        _count: { select: { certificates: true, projectMembers: true } },
      },
      orderBy: { rollNumber: "asc" },
    }),
    db.application.findMany({
      include: {
        job: true,
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const deptFilter = new Set(students.map((s) => s.department));

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Students</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Student status & applications</h1>
        <p className="mt-2 max-w-2xl text-body">
          Every registered student, their verified skill profile, and the applications pipeline across all drives.
        </p>
      </div>

      {/* students table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-[12px] uppercase tracking-wider text-muted">
              <th className="px-6 py-4 font-semibold">Student</th>
              <th className="px-6 py-4 font-semibold">Dept / Batch</th>
              <th className="px-6 py-4 font-semibold">Skills</th>
              <th className="px-6 py-4 font-semibold">Apps</th>
              <th className="px-6 py-4 font-semibold">Certs</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold">Profile status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const avg = s.skills.length ? Math.round(s.skills.reduce((sum, x) => sum + x.level, 0) / s.skills.length) : 0;
              return (
                <tr key={s.id} className="border-b border-hairline-soft last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-strong text-[12px] font-bold text-ink">
                        {initials(s.user.name)}
                      </span>
                      <div>
                        <div className="font-semibold text-ink">{s.user.name}</div>
                        <div className="text-[12px] text-body">{s.rollNumber} · {s.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-body">
                    {s.department} · {s.batch}
                  </td>
                  <td className="px-6 py-4">
                    <div className="tabular font-semibold text-ink">{avg}%</div>
                    <div className="text-[12px] text-muted">{s.skills.length} tracked</div>
                  </td>
                  <td className="tabular px-6 py-4 text-body">{s.applications.length}</td>
                  <td className="tabular px-6 py-4 text-body">{s._count.certificates}</td>
                  <td className="px-6 py-4 text-body">{fmtDate(s.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Badge tone={s.status === "APPROVED" ? "up" : s.status === "PENDING" ? "primary" : "down"}>
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* applications pipeline */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-ink">Application pipeline</h2>
        <p className="mb-4 text-sm text-body">Advance or reject applications — students see updates instantly.</p>
        {applications.length === 0 ? (
          <EmptyState title="No applications yet" />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-[12px] uppercase tracking-wider text-muted">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Opportunity</th>
                  <th className="px-6 py-4 font-semibold">Applied</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-b border-hairline-soft last:border-0">
                    <td className="px-6 py-4 font-semibold text-ink">{a.student.user.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-body">{a.job.title}</div>
                      <div className="text-[12px] text-muted">{a.job.company}</div>
                    </td>
                    <td className="tabular px-6 py-4 text-body">{fmtDate(a.createdAt)}</td>
                    <td className="px-6 py-4">
                      <ApplicationStatusBadge status={a.status} />
                    </td>
                    <td className="px-6 py-4">
                      <ApplicationActions applicationId={a.id} status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <p className="text-[13px] text-muted">
        {students.length} students · {[...deptFilter].join(", ")}
      </p>
    </div>
  );
}
