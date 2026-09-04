"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, undefined);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8">
        <h1 className="text-display text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm text-body">Sign in to the PS44 portal.</p>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@college.edu"
            className="h-12 w-full rounded-md border border-hairline bg-canvas px-4 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-12 w-full rounded-md border border-hairline bg-canvas px-4 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {state?.error && (
          <div className="rounded-md bg-semantic-down/10 px-4 py-3 text-sm text-semantic-down">{state.error}</div>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        No account?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">Create one</Link>
      </p>

      <div className="mt-8 rounded-lg border border-hairline bg-surface-soft p-4 text-[13px] leading-relaxed text-body">
        <div className="font-semibold text-ink">Demo logins — password: password123</div>
        <div className="mt-1">Student: aarav@college.edu · rohan@college.edu (pending approval)</div>
        <div>Teacher: anita@college.edu</div>
      </div>
    </div>
  );
}
