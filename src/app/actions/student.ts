"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { certCode, clamp, parseJsonArray } from "@/lib/utils";

export type ActionResult = { ok?: string; error?: string } | undefined;

/* ---------- Jobs ---------- */

export async function applyToJob(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const jobId = String(formData.get("jobId") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) return { error: "Job not found." };

  const existing = await db.application.findUnique({
    where: { studentId_jobId: { studentId: user.studentId, jobId } },
  });
  if (existing) return { error: "You have already applied to this opportunity." };

  await db.application.create({
    data: { studentId: user.studentId, jobId, note: note || null },
  });
  revalidatePath("/student/jobs");
  revalidatePath("/student/applications");
  return { ok: `Applied to ${job.title} at ${job.company}.` };
}

/* ---------- Projects ---------- */

export async function joinProject(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const projectId = String(formData.get("projectId") ?? "");

  const project = await db.project.findUnique({ where: { id: projectId }, include: { members: true } });
  if (!project) return { error: "Project not found." };
  if (project.status !== "OPEN") return { error: "This project is no longer open." };

  const existing = project.members.find((m) => m.studentId === user.studentId);
  if (existing) return { error: "You are already on this project." };

  await db.projectMember.create({ data: { projectId, studentId: user.studentId } });
  revalidatePath("/student/projects");
  return { ok: `Joined "${project.title}". Work toward your milestones!` };
}

export async function toggleMilestone(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const milestoneId = String(formData.get("milestoneId") ?? "");

  const ms = await db.projectMilestone.findUnique({ where: { id: milestoneId }, include: { project: { include: { members: true } } } });
  if (!ms) return { error: "Milestone not found." };
  if (!ms.project.members.some((m) => m.studentId === user.studentId)) {
    return { error: "You are not a member of this project." };
  }

  await db.projectMilestone.update({ where: { id: milestoneId }, data: { done: !ms.done } });
  revalidatePath("/student/projects");
  return { ok: ms.done ? "Milestone reopened." : "Milestone completed. Nice!" };
}

export async function completeProject(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const projectId = String(formData.get("projectId") ?? "");

  const project = await db.project.findUnique({ where: { id: projectId }, include: { members: true, milestones: true } });
  if (!project) return { error: "Project not found." };
  if (!project.members.some((m) => m.studentId === user.studentId)) {
    return { error: "You are not a member of this project." };
  }
  const open = project.milestones.filter((m) => !m.done).length;
  if (open > 0) return { error: `Complete all milestones first (${open} remaining).` };

  await db.project.update({ where: { id: projectId }, data: { status: "COMPLETED" } });
  const code = certCode("PRJ");
  await db.certificate.create({
    data: {
      studentId: user.studentId,
      kind: "PROJECT",
      title: project.title,
      issuer: "PS44 Portal",
      code,
    },
  });
  revalidatePath("/student/projects");
  revalidatePath("/student/profile");
  return { ok: `Project completed! Certificate issued: ${code}` };
}

/* ---------- Simulations ---------- */

export async function startSimulation(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const simulationId = String(formData.get("simulationId") ?? "");

  const sim = await db.simulation.findUnique({ where: { id: simulationId } });
  if (!sim) return { error: "Simulation not found." };

  const existing = await db.simulationRun.findFirst({
    where: { studentId: user.studentId, simulationId },
  });
  if (existing?.completed) return { error: "You already completed this simulation." };

  if (!existing) {
    await db.simulationRun.create({ data: { studentId: user.studentId, simulationId } });
  }
  revalidatePath("/student/simulations");
  return { ok: existing ? `Resuming "${sim.title}".` : `Started "${sim.title}".` };
}

export async function completeSimulation(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const simulationId = String(formData.get("simulationId") ?? "");
  const score = clamp(parseInt(String(formData.get("score") ?? "0"), 10) || 0, 0, 100);

  const sim = await db.simulation.findUnique({ where: { id: simulationId } });
  if (!sim) return { error: "Simulation not found." };

  const run = await db.simulationRun.findFirst({ where: { studentId: user.studentId, simulationId } });
  if (!run) return { error: "Start the simulation first." };
  if (run.completed) return { error: "Already completed." };

  await db.simulationRun.update({
    where: { id: run.id },
    data: { score, completed: true, completedAt: new Date() },
  });

  const code = certCode("SIM");
  await db.certificate.create({
    data: {
      studentId: user.studentId,
      kind: "SIMULATION",
      title: sim.title,
      issuer: sim.company,
      code,
    },
  });
  revalidatePath("/student/simulations");
  revalidatePath("/student/profile");
  return { ok: `Scored ${score}% — certificate ${code} issued!` };
}

/* ---------- Courses ---------- */

export async function enrollCourse(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const courseId = String(formData.get("courseId") ?? "");

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "Course not found." };

  const existing = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: user.studentId, courseId } },
  });
  if (existing) return { error: "Already enrolled." };

  await db.enrollment.create({ data: { studentId: user.studentId, courseId } });
  revalidatePath("/student/courses");
  return { ok: `Enrolled in "${course.title}".` };
}

export async function setCourseProgress(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const courseId = String(formData.get("courseId") ?? "");
  const progress = clamp(parseInt(String(formData.get("progress") ?? "0"), 10) || 0);

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: user.studentId, courseId } },
  });
  if (!enrollment) return { error: "Not enrolled." };

  const status = progress >= 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "ENROLLED";
  await db.enrollment.update({
    where: { id: enrollment.id },
    data: { progress, status, completedAt: status === "COMPLETED" ? new Date() : null },
  });
  revalidatePath("/student/courses");
  return { ok: status === "COMPLETED" ? "Course completed — take the assessment to earn your badge!" : `Progress saved: ${progress}%.` };
}

/* ---------- Assessments & badges ---------- */

export async function submitAssessment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };
  const assessmentId = String(formData.get("assessmentId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");

  const assessment = await db.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) return { error: "Assessment not found." };
  const questions = parseJsonArray<{ q: string; options: string[]; answer: number }>(assessment.questions);
  if (!questions.length) return { error: "Assessment has no questions." };

  // grade
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    const ans = parseInt(String(formData.get(`q_${i}`) ?? "-1"), 10);
    if (ans === questions[i].answer) correct++;
  }
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= assessment.passScore;

  await db.assessmentAttempt.create({
    data: { studentId: user.studentId, assessmentId, score, passed },
  });

  if (passed) {
    // award / raise skill badge + bump student skill level + certificate
    const course = await db.course.findUnique({ where: { id: courseId }, include: { skill: true, skills: { include: { skill: true } } } });
    if (course) {
      const skillNames = course.skills.map((cs) => cs.skill.name);
      if (course.skill) skillNames.push(course.skill.name);

      for (const name of [...new Set(skillNames)]) {
        const skill = await db.skill.findUnique({ where: { name } });
        if (!skill) continue;

        // badge level by score
        const level = score >= 90 ? "Gold" : score >= 75 ? "Silver" : "Bronze";
        await db.badge.upsert({
          where: { skillId_level: { skillId: skill.id, level } },
          create: { skillId: skill.id, level, label: `${name} ${level}` },
          update: { label: `${name} ${level}` },
        });

        // bump student skill
        const existing = await db.studentSkill.findUnique({
          where: { studentId_skillId: { studentId: user.studentId, skillId: skill.id } },
        });
        const newLevel = clamp(Math.max(existing?.level ?? 0, Math.round(score * 0.9)));
        if (existing) {
          await db.studentSkill.update({ where: { studentId_skillId: { studentId: user.studentId, skillId: skill.id } }, data: { level: newLevel } });
        } else {
          await db.studentSkill.create({ data: { studentId: user.studentId, skillId: skill.id, level: newLevel } });
        }
      }

      // course completion + certificate (first pass only)
      const enrollment = await db.enrollment.findUnique({
        where: { studentId_courseId: { studentId: user.studentId, courseId } },
      });
      if (enrollment) {
        await db.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "COMPLETED", progress: 100, completedAt: new Date() },
        });
      }
      const priorCert = await db.certificate.findFirst({
        where: { studentId: user.studentId, kind: "COURSE", title: course.title },
      });
      if (!priorCert) {
        const code = certCode("CRS");
        await db.certificate.create({
          data: { studentId: user.studentId, kind: "COURSE", title: course.title, issuer: course.provider, code },
        });
      }
    }
  }

  revalidatePath("/student/courses");
  revalidatePath("/student/profile");
  revalidatePath("/student");
  return passed
    ? { ok: `Scored ${score}% — passed! Badge awarded for this skill.` }
    : { error: `Scored ${score}% — below the ${assessment.passScore}% pass mark. Review and try again.` };
}

/* ---------- Resume screening ---------- */

const RESUME_SKILL_HINTS: Record<string, RegExp> = {
  JavaScript: /javascript|js\b|es6/i,
  TypeScript: /typescript|ts\b/i,
  React: /react|reactjs|react\.js/i,
  "Next.js": /next\.?js/i,
  "Node.js": /node\.?js|express/i,
  Python: /python|django|flask|pandas|numpy/i,
  SQL: /sql|mysql|postgres|mongodb|database/i,
  "Machine Learning": /machine learning|ml\b|scikit|tensorflow|pytorch|deep learning/i,
  "Cloud AWS": /aws|amazon web services|ec2|s3|lambda/i,
  Docker: /docker|kubernetes|k8s|container/i,
  "System Design": /system design|scalab|distributed|microservice|architecture/i,
  "Data Structures": /data structures|dsa|algorithms|leetcode/i,
  "Product Management": /product manager|product management|prd|roadmap|prioriti/i,
  "Project Management": /project manager|scrum|agile|jira|sprint/i,
  Communication: /communication|presentation|public speaking|writing/i,
  Figma: /figma|ui\/ux|wireframe|prototype/i,
  Java: /\bjava\b|spring/i,
};

export async function analyzeResume(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  if (!user?.studentId) return { error: "Student login required." };

  const text = String(formData.get("resumeText") ?? "").trim();
  const fileName = String(formData.get("fileName") ?? "resume.txt").trim();
  if (text.length < 120) return { error: "Paste at least a few lines of your resume (120+ characters)." };

  const lower = text.toLowerCase();

  // 1) matched / missing skills against ontology
  const allSkills = await db.skill.findMany();
  const matched: string[] = [];
  const missing: string[] = [];
  for (const skill of allSkills) {
    const hint = RESUME_SKILL_HINTS[skill.name];
    const hit = hint ? hint.test(lower) : lower.includes(skill.name.toLowerCase());
    if (hit) matched.push(skill.name);
  }
  const demandSkills = await db.jobSkill.groupBy({
    by: ["skillId"],
    _count: { _all: true },
    orderBy: { _count: { skillId: "desc" } },
    take: 10,
  });
  const demandedNames = new Set<string>();
  for (const d of demandSkills) {
    const s = allSkills.find((x) => x.id === d.skillId);
    if (s) demandedNames.add(s.name);
  }
  for (const name of demandedNames) {
    if (!matched.includes(name)) missing.push(name);
  }

  // 2) structural checks
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const wordCount = lower.split(/\s+/).length;
  if (matched.length >= 6) strengths.push(`Strong skill coverage — ${matched.length} industry skills detected.`);
  else weaknesses.push(`Thin skill coverage — only ${matched.length} skills detected; add concrete technologies under projects.`);
  if (/\b(\d+(\.\d+)?)\s*(%|percent|lpa|k\b|users|students)\b/.test(lower) || /increased|reduced|improved|built|deployed|led/i.test(lower))
    strengths.push("Action/impact language present (built, improved, led, quantified outcomes).");
  else
    weaknesses.push("Add quantified impact — numbers like 'improved load time 30%', 'led team of 4'.");
  if (/internship|project|hackathon|github|portfolio/i.test(lower)) strengths.push("Evidence of hands-on work (internships, projects, hackathons, GitHub).");
  else weaknesses.push("No hands-on evidence found — add projects, hackathons, internships or GitHub links.");
  if (/leadership|coordinator|captain|club|committee|volunteer/i.test(lower)) strengths.push("Leadership / extracurricular signal detected.");
  if (wordCount < 150) weaknesses.push("Resume seems very short — flesh out project descriptions.");
  if (wordCount > 800) weaknesses.push("Resume is long — keep it to one page for campus placements.");

  // 3) ATS score
  let atsScore = 30 + matched.length * 5;
  if (strengths.length >= 2) atsScore += 10;
  if (weaknesses.length === 0) atsScore += 8;
  atsScore = clamp(atsScore, 10, 98);

  const summary =
    `Your resume matches ${matched.length} industry skills with an ATS score of ${atsScore}/100. ` +
    (missing.length
      ? `The portal's current job demand highlights ${missing.slice(0, 3).join(", ")} — close these gaps to widen your shortlist chances. `
      : "") +
    `Personalised courses are recommended below.`;

  await db.resumeAnalysis.create({
    data: {
      studentId: user.studentId,
      fileName,
      atsScore,
      strengths: JSON.stringify(strengths),
      weaknesses: JSON.stringify(weaknesses),
      matchedSkills: JSON.stringify(matched),
      missingSkills: JSON.stringify(missing),
      summary,
    },
  });

  // sync matched skills into student profile
  for (const name of matched) {
    const skill = allSkills.find((s) => s.name === name);
    if (!skill) continue;
    const existing = await db.studentSkill.findUnique({
      where: { studentId_skillId: { studentId: user.studentId, skillId: skill.id } },
    });
    if (!existing) {
      await db.studentSkill.create({ data: { studentId: user.studentId, skillId: skill.id, level: 45 } });
    }
  }

  revalidatePath("/student/resume");
  return { ok: `Analysis complete — ATS score ${atsScore}/100.` };
}
