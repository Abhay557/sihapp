"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signupAction, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

const inputCls =
  "h-12 w-full rounded-md border border-hairline bg-canvas px-4 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signupAction, undefined);
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8">
        <h1 className="text-display text-3xl">Create your account</h1>
        <p className="mt-2 text-sm text-body">Join the PS44 academia–industry portal.</p>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        {/* role toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-pill bg-surface-strong p-1">
          {(["STUDENT", "TEACHER"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`h-10 rounded-pill text-sm font-semibold transition-colors ${
                role === r ? "bg-canvas text-ink shadow-soft" : "text-body hover:text-ink"
              }`}
            >
              {r === "STUDENT" ? "Student" : "Teacher"}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">Full name</label>
          <input id="name" name="name" required className={inputCls} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">College email</label>
          <input id="email" name="email" type="email" required className={inputCls} placeholder="you@college.edu" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
          <input id="password" name="password" type="password" required minLength={6} className={inputCls} placeholder="At least 6 characters" />
        </div>

        {role === "STUDENT" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rollNumber" className="mb-1.5 block text-sm font-semibold text-ink">Roll number</label>
                <input id="rollNumber" name="rollNumber" required className={inputCls} placeholder="CS23B045" />
              </div>
              <div>
                <label htmlFor="batch" className="mb-1.5 block text-sm font-semibold text-ink">Batch</label>
                <select id="batch" name="batch" className={inputCls} defaultValue="2027">
                  {["2026", "2027", "2028", "2029"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="department" className="mb-1.5 block text-sm font-semibold text-ink">Department</label>
              <select id="department" name="department" className={inputCls} defaultValue="CSE">
                {["CSE", "ECE", "ME", "CE", "EE", "IT"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="department" className="mb-1.5 block text-sm font-semibold text-ink">Department</label>
            <select id="department" name="department" className={inputCls} defaultValue="CSE">
              {["CSE", "ECE", "ME", "CE", "EE", "IT"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {state?.error && (
          <div className="rounded-md bg-semantic-down/10 px-4 py-3 text-sm text-semantic-down">{state.error}</div>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
