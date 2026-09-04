import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export async function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary text-sm font-bold">
        P
      </span>
      <span className={`text-lg font-semibold tracking-tight ${dark ? "text-on-dark" : "text-ink"}`}>PS44 Portal</span>
    </Link>
  );
}

export async function TopNav() {
  const user = await getSessionUser();
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-body md:flex">
          {user ? (
            <>
              <Link href={user.role === "STUDENT" ? "/student" : "/teacher"} className="hover:text-ink">
                Dashboard
              </Link>
              <Link href={user.role === "STUDENT" ? "/student/jobs" : "/teacher/jobs"} className="hover:text-ink">
                Jobs
              </Link>
              <Link href={user.role === "STUDENT" ? "/student/profile" : "/teacher/students"} className="hover:text-ink">
                {user.role === "STUDENT" ? "Profile" : "Students"}
              </Link>
            </>
          ) : (
            <>
              <Link href="/#modules" className="hover:text-ink">Modules</Link>
              <Link href="/#workflow" className="hover:text-ink">Workflow</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-body sm:block">{user.name}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-pill bg-surface-strong px-4 text-sm font-semibold text-ink hover:bg-hairline"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="secondary" size="sm">Sign in</ButtonLink>
              <ButtonLink href="/signup" size="sm">Get started</ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
