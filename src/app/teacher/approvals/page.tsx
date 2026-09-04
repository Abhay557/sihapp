import { db } from "@/lib/db";
import { requireTeacher } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, EmptyState, Stat } from "@/components/ui/Primitives";
import { fmtDate, initials } from "@/lib/utils";
import { ApprovalForm } from "./ApprovalForm";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  await requireTeacher();

  const [students, history] = await Promise.all([
    db.student.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true, email: true } },
        skills: { include: { skill: true } },
        _count: { select: { certificates: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.profileApproval.findMany({
      include: {
        student: { include: { user: { select: { name: true } } } },
        teacher: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Profile approval system</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Student profile approvals</h1>
        <p className="mt-2 max-w-2xl text-body">
          Verify student records before they become visible to recruiters. Approved students unlock full placement
          features.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Pending review" value={students.length} tone={students.length > 0 ? "down" : "up"} />
        <Stat label="Actions taken" value={history.length} hint="all time" />
        <Stat label="Last action" value={history[0] ? fmtDate(history[0].createdAt) : "—"} />
      </div>

      {students.length === 0 ? (
        <EmptyState title="No pending profiles 🎉" hint="All student records are verified." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {students.map((s) => {
            const avg = s.skills.length ? Math.round(s.skills.reduce((sum, x) => sum + x.level, 0) / s.skills.length) : 0;
            return (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 items-center justify-center rounded-full bg-surface-strong text-sm font-bold text-ink">
                      {initials(s.user.name)}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-ink">{s.user.name}</h3>
                      <div className="text-[13px] text-body">
                        {s.rollNumber} · {s.department} · Batch {s.batch}
                      </div>
                      <div className="text-[12px] text-muted">{s.user.email} · joined {fmtDate(s.createdAt)}</div>
                    </div>
                  </div>
                  <Badge tone="primary">PENDING</Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-surface-soft p-4 text-center">
                  <div>
                    <div className="tabular text-lg font-semibold text-ink">{avg}%</div>
                    <div className="text-[11px] text-muted">avg skill</div>
                  </div>
                  <div>
                    <div className="tabular text-lg font-semibold text-ink">{s.skills.length}</div>
                    <div className="text-[11px] text-muted">skills</div>
                  </div>
                  <div>
                    <div className="tabular text-lg font-semibold text-ink">{s._count.certificates}</div>
                    <div className="text-[11px] text-muted">certificates</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {s.skills.slice(0, 8).map((sk) => (
                    <span key={sk.skillId} className="rounded-pill bg-surface-strong px-3 py-1 text-[12px] font-medium text-body">
                      {sk.skill.name} {sk.level}%
                    </span>
                  ))}
                  {s.skills.length === 0 && <span className="text-[13px] text-muted">No skills recorded yet.</span>}
                </div>

                <div className="mt-5 border-t border-hairline-soft pt-4">
                  <ApprovalForm studentId={s.id} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* approval history */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-ink">Approval history</h2>
        <Card className="p-0">
          {history.length === 0 ? (
            <div className="p-8 text-sm text-body">No actions yet.</div>
          ) : (
            <ul className="divide-y divide-hairline-soft">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      {h.student.user.name} — <span className={h.action === "APPROVED" ? "text-semantic-up" : "text-semantic-down"}>{h.action}</span>
                    </div>
                    <div className="text-[12px] text-muted">
                      by {h.teacher.user.name} · {fmtDate(h.createdAt)} {h.note ? `· "${h.note}"` : ""}
                    </div>
                  </div>
                  <Badge tone={h.action === "APPROVED" ? "up" : "down"}>{h.action}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
