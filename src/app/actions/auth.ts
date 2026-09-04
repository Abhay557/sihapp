"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, getSessionUser } from "@/lib/auth";

export type AuthState = { error?: string } | undefined;
export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const user = await db.user.findUnique({ where: { email }, include: { student: true, teacher: true } });
  if (!user) return { error: "No account found with that email." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Incorrect password." };

  await createSession(user.id);
  redirect(user.role === "STUDENT" ? "/student" : "/teacher");
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "STUDENT") as "STUDENT" | "TEACHER";
  const department = String(formData.get("department") ?? "CSE").trim();
  const batch = String(formData.get("batch") ?? "2027").trim();
  const rollNumber = String(formData.get("rollNumber") ?? "").trim().toUpperCase();

  if (!name || !email || password.length < 6) {
    return { error: "Name, email and a password of at least 6 characters are required." };
  }
  if (role === "STUDENT" && !rollNumber) {
    return { error: "Roll number is required for student accounts." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  if (role === "STUDENT") {
    const dupeRoll = await db.student.findUnique({ where: { rollNumber } });
    if (dupeRoll) return { error: "This roll number is already registered." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      ...(role === "STUDENT"
        ? { student: { create: { rollNumber, department, batch } } }
        : { teacher: { create: { department } } }),
    },
  });

  await createSession(user.id);
  redirect(role === "STUDENT" ? "/student" : "/teacher");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
