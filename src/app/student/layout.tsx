import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/TopNav";

const NAV = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/jobs", label: "Jobs & Internships" },
  { href: "/student/projects", label: "Projects" },
  { href: "/student/simulations", label: "Simulations" },
  { href: "/student/resume", label: "Resume AI" },
  { href: "/student/courses", label: "Courses & Skills" },
  { href: "/student/applications", label: "My Applications" },
  { href: "/student/profile", label: "Profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-pill px-3 py-2 text-sm font-medium text-body hover:bg-surface-strong hover:text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-body md:block">{user.name}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-pill bg-surface-strong px-4 text-sm font-semibold text-ink hover:bg-hairline"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-hairline-soft px-4 py-2 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-pill px-3 py-1.5 text-[13px] font-medium text-body hover:bg-surface-strong hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">{children}</main>
    </div>
  );
}
