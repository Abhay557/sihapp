import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";

export const SESSION_COOKIE = "ps44_session";
const SESSION_DAYS = 7;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken() {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token: hashToken(token), userId, expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER";
  studentId?: string;
  teacherId?: string;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token: hashToken(token) },
    include: {
      user: { include: { student: true, teacher: true } },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;

  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    studentId: u.student?.id,
    teacherId: u.teacher?.id,
  };
});

export async function requireStudent() {
  const user = await getSessionUser();
  if (!user || user.role !== "STUDENT" || !user.studentId) return null;
  return user;
}

export async function requireTeacher() {
  const user = await getSessionUser();
  if (!user || user.role !== "TEACHER" || !user.teacherId) return null;
  return user;
}
