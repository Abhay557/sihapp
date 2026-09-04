import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, EmptyState, ProgressBar, SectionTitle } from "@/components/ui/Primitives";
import { JoinProjectForm, MilestoneToggle, CompleteProjectForm } from "./ProjectForms";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireStudent();

  const [projects, memberships] = await Promise.all([
    db.project.findMany({
      include: {
        mentor: { include: { user: { select: { name: true } } } },
        members: true,
        milestones: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.projectMember.findMany({ where: { studentId: user?.studentId } }),
  ]);
  const myProjectIds = new Set(memberships.map((m) => m.projectId));

  const open = projects.filter((p) => p.status === "OPEN" && !myProjectIds.has(p.id));
  const mine = projects.filter((p) => myProjectIds.has(p.id));

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Projects portal</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Hands-on experience with real projects</h1>
        <p className="mt-2 max-w-2xl text-body">
          Faculty-mentored industry projects. Complete milestones with your team; completion issues a verifiable
          certificate on your profile.
        </p>
      </div>

      {/* my projects */}
      <div>
        <SectionTitle title="My projects" subtitle="Track milestones and finish to earn your certificate." />
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {mine.length === 0 && <EmptyState title="You're not on a project yet" hint="Join an open project below." />}
          {mine.map((p) => {
            const done = p.milestones.filter((m) => m.done).length;
            const pct = p.milestones.length ? Math.round((done / p.milestones.length) * 100) : 0;
            return (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
                    <div className="mt-1 text-sm text-body">
                      {p.domain} · {p.difficulty} · mentor {p.mentor?.user.name ?? "TBA"}
                    </div>
                  </div>
                  <Badge tone={p.status === "COMPLETED" ? "up" : "primary"}>{p.status.replace("_", " ")}</Badge>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="text-body">Milestones</span>
                    <span className="tabular font-semibold text-ink">{done}/{p.milestones.length}</span>
                  </div>
                  <ProgressBar value={pct} tone={pct === 100 ? "up" : "primary"} />
                </div>

                <ul className="mt-4 space-y-2">
                  {p.milestones.map((m) => (
                    <li key={m.id}>
                      <MilestoneToggle milestoneId={m.id} done={m.done} title={m.title} disabled={p.status === "COMPLETED"} />
                    </li>
                  ))}
                </ul>

                {p.status !== "COMPLETED" && (
                  <div className="mt-5 border-t border-hairline-soft pt-4">
                    <CompleteProjectForm projectId={p.id} allDone={done === p.milestones.length && p.milestones.length > 0} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* open projects */}
      <div>
        <SectionTitle title="Open projects" subtitle="Join a project aligned with your skills and career goals." />
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {open.length === 0 && <EmptyState title="No open projects right now" hint="Check back soon — faculty post new projects regularly." />}
          {open.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
                  <div className="mt-1 text-sm text-body">
                    {p.domain} · {p.difficulty} · mentor {p.mentor?.user.name ?? "TBA"}
                  </div>
                </div>
                <Badge>{p.members.length} members</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-body">{p.description}</p>
              <div className="mt-5 border-t border-hairline-soft pt-4">
                <JoinProjectForm projectId={p.id} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
