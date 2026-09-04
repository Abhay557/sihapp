import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, EmptyState, ProgressBar, Stat } from "@/components/ui/Primitives";
import { parseJsonArray, fmtDate } from "@/lib/utils";
import { ResumeForm } from "./ResumeForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const user = await requireStudent();

  const analyses = await db.resumeAnalysis.findMany({
    where: { studentId: user?.studentId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const latest = analyses[0];

  // recommended courses: courses whose primary skill is in "missing" set of latest analysis
  let recommended: Array<{ id: string; title: string; provider: string; level: string; durationHrs: number }> = [];
  if (latest) {
    const missing = parseJsonArray(latest.missingSkills);
    if (missing.length) {
      recommended = await db.course.findMany({
        where: { skill: { name: { in: missing } } },
        include: { skill: true },
        take: 4,
      });
    }
    if (recommended.length === 0) {
      // fallback: courses for skills the student hasn't started
      const enrolled = await db.enrollment.findMany({ where: { studentId: user?.studentId }, select: { courseId: true } });
      const enrolledIds = new Set(enrolled.map((e) => e.courseId));
      const all = await db.course.findMany({ take: 12 });
      recommended = all.filter((c) => !enrolledIds.has(c.id)).slice(0, 4);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Resume screening</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">AI resume analysis</h1>
        <p className="mt-2 max-w-2xl text-body">
          Paste your resume text. The screener scores it like an ATS, matches your skills against the portal&#39;s live
          industry demand, and recommends exact courses to close the gaps.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ResumeForm />

        {latest ? (
          <Card className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Latest analysis</h2>
                <Badge tone={latest.atsScore >= 70 ? "up" : latest.atsScore >= 50 ? "primary" : "down"}>
                  ATS {latest.atsScore}/100
                </Badge>
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {latest.fileName} · {fmtDate(latest.createdAt)}
              </p>
              <div className="mt-3">
                <ProgressBar value={latest.atsScore} tone={latest.atsScore >= 70 ? "up" : "primary"} />
              </div>
            </div>

            <p className="rounded-md bg-surface-soft p-4 text-sm leading-relaxed text-body">{latest.summary}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-semantic-up">Strengths</div>
                <ul className="mt-2 space-y-1.5">
                  {parseJsonArray(latest.strengths).map((s) => (
                    <li key={s} className="text-[13px] leading-snug text-body">✓ {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-semantic-down">To improve</div>
                <ul className="mt-2 space-y-1.5">
                  {parseJsonArray(latest.weaknesses).map((s) => (
                    <li key={s} className="text-[13px] leading-snug text-body">→ {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">Skills detected</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {parseJsonArray(latest.matchedSkills).map((s) => (
                    <Badge key={s} tone="up">{s}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">Gaps vs job demand</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {parseJsonArray(latest.missingSkills).length === 0 && <span className="text-[13px] text-body">No critical gaps 🎉</span>}
                  {parseJsonArray(latest.missingSkills).map((s) => (
                    <Badge key={s} tone="down">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <EmptyState title="No analysis yet" hint="Paste your resume on the left to get your first ATS report." />
          </Card>
        )}
      </div>

      {/* recommendations */}
      {latest && recommended.length > 0 && (
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Recommended for you</div>
              <h2 className="text-display mt-1 text-2xl">Close your skill gaps</h2>
            </div>
            <Link href="/student/courses" className="text-sm font-semibold text-primary hover:underline">
              All courses
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((c) => (
              <Link
                key={c.id}
                href="/student/courses"
                className="rounded-lg border border-hairline bg-canvas p-5 transition-shadow hover:shadow-soft"
              >
                <Badge tone="primary">{c.level}</Badge>
                <div className="mt-3 text-sm font-semibold leading-snug text-ink">{c.title}</div>
                <div className="mt-1 text-[13px] text-body">{c.provider} · {c.durationHrs}h</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* history */}
      {analyses.length > 1 && (
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">History</div>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {analyses.map((a) => (
              <Stat key={a.id} label={fmtDate(a.createdAt)} value={`${a.atsScore}`} hint={a.fileName} tone={a.atsScore >= 70 ? "up" : "default"} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
