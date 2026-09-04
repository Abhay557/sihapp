"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTeacher } from "@/lib/auth";

export type ActionResult = { ok?: string; error?: string } | undefined;

/* ---------- Approvals ---------- */

export async function approveStudent(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const teacher = await requireTeacher();
  if (!teacher?.teacherId) return { error: "Teacher login required." };
  const studentId = String(formData.get("studentId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (decision !== "APPROVED" && decision !== "REJECTED") return { error: "Invalid decision." };

  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) return { error: "Student not found." };

  await db.student.update({ where: { id: studentId }, data: { status: decision } });
  await db.profileApproval.create({
    data: { studentId, teacherId: teacher.teacherId, action: decision, note: note || null },
  });

  revalidatePath("/teacher/students");
  revalidatePath("/teacher");
  return { ok: `${student.rollNumber ? student.rollNumber + " " : ""}${decision.toLowerCase()}.` };
}

/* ---------- Jobs ---------- */

export async function createJob(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const teacher = await requireTeacher();
  if (!teacher?.teacherId) return { error: "Teacher login required." };

  const title = String(formData.get("title") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const location = String(formData.get("location") ?? "Remote").trim();
  const type = String(formData.get("type") ?? "INTERNSHIP");
  const description = String(formData.get("description") ?? "").trim();
  const stipend = String(formData.get("stipend") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();
  const skillNames = String(formData.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!title || !company || description.length < 20) {
    return { error: "Title, company and a description of at least 20 characters are required." };
  }

  const job = await db.job.create({
    data: {
      title,
      company,
      location,
      type: type === "FULL_TIME" ? "FULL_TIME" : "INTERNSHIP",
      description,
      stipend: stipend || null,
      deadline: deadline ? new Date(deadline) : null,
      postedById: teacher.teacherId,
    },
  });

  for (const name of skillNames) {
    const skill = await db.skill.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    await db.jobSkill.create({ data: { jobId: job.id, skillId: skill.id } });
  }

  revalidatePath("/teacher/jobs");
  revalidatePath("/student/jobs");
  return { ok: `Posted "${title}" — live on the student job portal.` };
}

export async function toggleJobActive(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const teacher = await requireTeacher();
  if (!teacher?.teacherId) return { error: "Teacher login required." };
  const jobId = String(formData.get("jobId") ?? "");

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) return { error: "Job not found." };

  await db.job.update({ where: { id: jobId }, data: { active: !job.active } });
  revalidatePath("/teacher/jobs");
  return { ok: `${job.title} ${job.active ? "closed" : "reopened"}.` };
}

/* ---------- Application pipeline ---------- */

const NEXT_STATUS: Record<string, string> = {
  APPLIED: "SHORTLISTED",
  SHORTLISTED: "INTERVIEW",
  INTERVIEW: "OFFER",
  OFFER: "ACCEPTED",
};

export async function advanceApplication(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const teacher = await requireTeacher();
  if (!teacher?.teacherId) return { error: "Teacher login required." };
  const applicationId = String(formData.get("applicationId") ?? "");

  const app = await db.application.findUnique({ where: { id: applicationId } });
  if (!app) return { error: "Application not found." };

  const next = NEXT_STATUS[app.status];
  if (!next) return { error: `Application is already at ${app.status}.` };

  await db.application.update({ where: { id: applicationId }, data: { status: next as never } });
  revalidatePath("/teacher/students");
  revalidatePath("/student/applications");
  return { ok: `Moved to ${next}.` };
}

export async function rejectApplication(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const teacher = await requireTeacher();
  if (!teacher?.teacherId) return { error: "Teacher login required." };
  const applicationId = String(formData.get("applicationId") ?? "");

  const app = await db.application.findUnique({ where: { id: applicationId } });
  if (!app) return { error: "Application not found." };

  await db.application.update({ where: { id: applicationId }, data: { status: "REJECTED" } });
  revalidatePath("/teacher/students");
  revalidatePath("/student/applications");
  return { ok: "Marked rejected." };
}
