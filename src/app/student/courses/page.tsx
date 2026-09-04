import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Card, EmptyState, ProgressBar } from "@/components/ui/Primitives";
import { parseJsonArray } from "@/lib/utils";
import { EnrollButton, ProgressControl } from "./CourseControls";
import { AssessmentForm } from "./AssessmentForm";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await requireStudent();

  const [courses, enrollments, attempts] = await Promise.all([
    db.course.findMany({
      include: {
        skill: true,
        skills: { include: { skill: true } },
        assessment: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    db.enrollment.findMany({ where: { studentId: user?.studentId } }),
    db.assessmentAttempt.findMany({
      where: { studentId: user?.studentId },
      include: { assessment: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const enrollByCourse = new Map(enrollments.map((e) => [e.courseId, e]));
  const passedCourseIds = new Set(
    attempts.filter((a) => a.passed).map((a) => a.assessment.courseId)
  );

  // student badges: skill + level where they passed assessments
  const skillBadges = await db.studentSkill.findMany({
    where: { studentId: user?.studentId },
    include: { skill: true },
  });
  const badgeLevelFor = (skillId: string) => {
    const lvl = skillBadges.find((s) => s.skillId === skillId)?.level ?? 0;
    return lvl >= 85 ? "Gold" : lvl >= 70 ? "Silver" : lvl >= 55 ? "Bronze" : null;
  };

  const enrolled = courses.filter((c) => enrollByCourse.has(c.id));
  const available = courses.filter((c) => !enrollByCourse.has(c.id));

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Courses & skills portal</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Upskill, assess, get badged</h1>
        <p className="mt-2 max-w-2xl text-body">
          Enroll in a course, track progress, then take its skills assessment. Passing earns a Bronze / Silver / Gold
          skill badge on your verified profile.
        </p>
      </div>

      {/* my skill badges */}
      <Card>
        <h2 className="text-lg font-semibold">My skill badges</h2>
        <p className="mt-1 text-[13px] text-body">Badge tier rises with your verified skill level (55% Bronze · 70% Silver · 85% Gold).</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {skillBadges.length === 0 && <span className="text-sm text-body">No badges yet — pass a course assessment to earn your first.</span>}
          {skillBadges.map((s) => {
            const level = badgeLevelFor(s.skillId);
            return (
              <div
                key={s.skillId}
                className={`flex items-center gap-3 rounded-pill px-4 py-2 ${
                  level === "Gold"
                    ? "bg-accent-yellow/20 text-ink"
                    : level === "Silver"
                      ? "bg-surface-strong text-ink"
                      : level === "Bronze"
                        ? "bg-[#cd7f32]/15 text-ink"
                        : "border border-dashed border-hairline text-muted"
                }`}
              >
                <span className="text-sm font-semibold">{s.skill.name}</span>
                {level ? (
                  <Badge tone={level === "Gold" ? "primary" : "default"}>{level}</Badge>
                ) : (
                  <span className="text-[12px]">no badge yet — {s.level}%</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* enrolled courses */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-ink">Continue learning</h2>
        {enrolled.length === 0 ? (
          <EmptyState title="Not enrolled anywhere" hint="Browse courses below and enroll." />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {enrolled.map((course) => {
              const e = enrollByCourse.get(course.id)!;
              const passed = passedCourseIds.has(course.id);
              const best = attempts
                .filter((a) => a.assessment.courseId === course.id)
                .reduce((m, a) => Math.max(m, a.score), 0);
              return (
                <Card key={course.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{course.title}</h3>
                      <div className="mt-1 text-sm text-body">
                        {course.provider} · {course.durationHrs}h · {course.level}
                      </div>
                    </div>
                    {passed ? <Badge tone="up">Passed · best {best}%</Badge> : <Badge>{e.status.replace("_", " ")}</Badge>}
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span className="text-body">Progress</span>
                      <span className="tabular font-semibold text-ink">{e.progress}%</span>
                    </div>
                    <ProgressBar value={e.progress} tone={e.progress >= 100 ? "up" : "primary"} />
                  </div>

                  {!passed && (
                    <>
                      <div className="mt-4">
                        <ProgressControl courseId={course.id} progress={e.progress} />
                      </div>
                      {e.progress >= 100 && course.assessment && (
                        <div className="mt-4 border-t border-hairline-soft pt-4">
                          <AssessmentForm
                            assessmentId={course.assessment.id}
                            courseId={course.id}
                            title={course.assessment.title}
                            passScore={course.assessment.passScore}
                            questions={parseJsonArray<{ q: string; options: string[]; answer: number }>(course.assessment.questions)}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {passed && (
                    <div className="mt-4 rounded-md bg-semantic-up/10 px-4 py-3 text-sm font-medium text-semantic-up">
                      Badge earned for {course.skill?.name ?? "this skill"} — visible on your profile.
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* available courses */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-ink">Browse courses</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {available.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <Badge tone="primary">{course.level}</Badge>
              <h3 className="mt-3 text-base font-semibold leading-snug text-ink">{course.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-body">{course.description}</p>
              <div className="mt-3 text-[13px] text-muted">
                {course.provider} · {course.durationHrs}h · badge: {course.skill?.name}
              </div>
              <div className="mt-4">
                <EnrollButton courseId={course.id} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
