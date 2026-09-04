import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Primitives";
import { TopNav } from "@/components/TopNav";

const MODULES = [
  { icon: "🎯", title: "Job & Internship Portal", desc: "PM internships, live jobs and campus drives — aggregated from external sources and posted by faculty." },
  { icon: "🛠", title: "Real Projects Portal", desc: "Hands-on industry projects with faculty mentors, milestones and verifiable completion certificates." },
  { icon: "🖥", title: "Virtual Job Simulations", desc: "Day-in-the-life simulations from top companies. Finish tasks, get scored, earn a certificate." },
  { icon: "📄", title: "AI Resume Screening", desc: "Upload your resume — get an ATS score, skill match, gaps and course recommendations instantly." },
  { icon: "📚", title: "Courses & Skill Badges", desc: "Targeted upskilling courses with assessments. Pass to earn Bronze / Silver / Gold skill badges." },
  { icon: "🧭", title: "Curriculum Intelligence", desc: "Syllabus mapped to industry skills — see coverage, gaps and emerging-skill interventions." },
];

const LOOP = [
  "Industry jobs, internships & projects",
  "Skill requirements extracted",
  "Demand trends & skill graph",
  "Curriculum mapping",
  "Skill gaps detected",
  "Targeted training & courses",
  "Assessment & verification",
  "Internship / live project",
  "Placement",
  "Employer feedback",
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <TopNav />

      {/* Hero — dark editorial band (DESIGN.md signature pattern) */}
      <section className="bg-surface-dark text-on-dark">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 py-24 md:grid-cols-2 md:px-6 md:py-32">
          <div>
            <div className="mb-6 inline-flex items-center rounded-pill bg-surface-dark-elevated px-4 py-1.5 text-[12px] font-semibold uppercase tracking-widest text-on-dark-soft">
              SIH · PS44
            </div>
            <h1 className="text-display text-4xl md:text-6xl">
              The college layer between <span className="text-primary">industry demand</span> and student readiness.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-on-dark-soft">
              One portal connecting students, teachers and industry: jobs &amp; internships, real projects, virtual
              simulations, AI resume screening, skill courses with badges — and the analytics that turn skill gaps
              into curriculum decisions.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/signup" size="lg">Get started</ButtonLink>
              <ButtonLink href="/login" variant="outline-dark" size="lg">Sign in</ButtonLink>
            </div>
            <p className="mt-6 text-[13px] text-on-dark-soft">
              Demo logins (password <code className="rounded-xs bg-surface-dark-elevated px-1.5 py-0.5">password123</code>):
              student <code className="rounded-xs bg-surface-dark-elevated px-1.5 py-0.5">aarav@college.edu</code> · teacher{" "}
              <code className="rounded-xs bg-surface-dark-elevated px-1.5 py-0.5">anita@college.edu</code>
            </p>
          </div>

          {/* Layered product-UI mockup cards */}
          <div className="relative hidden md:block">
            <div className="absolute -top-6 left-8 w-72 rotate-[-6deg] rounded-xl border border-white/10 bg-surface-dark-elevated p-6 opacity-80">
              <div className="text-[12px] font-semibold uppercase tracking-widest text-on-dark-soft">Placement funnel</div>
              <div className="tabular mt-3 text-2xl">128 applied</div>
              <div className="mt-4 space-y-3">
                {[
                  ["Shortlisted", 62],
                  ["Interviews", 34],
                  ["Offers", 18],
                ].map(([label, v]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-[12px] text-on-dark-soft">
                      <span>{label}</span>
                      <span className="tabular">{v}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${((v as number) / 128) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative ml-auto mt-10 w-80 rotate-[4deg] rounded-xl border border-white/10 bg-surface-dark-elevated p-6">
              <div className="text-[12px] font-semibold uppercase tracking-widest text-on-dark-soft">Skill demand vs coverage</div>
              <div className="mt-4 space-y-3">
                {[
                  ["React", 92, 74],
                  ["System Design", 81, 42],
                  ["Machine Learning", 77, 55],
                  ["Product Mgmt", 70, 38],
                ].map(([s, demand, cover]) => (
                  <div key={s as string}>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-on-dark">{s}</span>
                      <span className="tabular text-on-dark-soft">{cover}/{demand}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${((cover as number) / (demand as number)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-md bg-primary/10 p-3 text-[12px] leading-relaxed text-on-dark">
                Gap detected: <span className="font-semibold">System Design</span> → recommend elective + training cohort.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
        <div className="mb-12 max-w-2xl">
          <div className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-muted">Modules</div>
          <h2 className="text-display text-3xl md:text-4xl">Everything a college runs, one intelligence loop.</h2>
          <p className="mt-3 text-body">
            Student skill profiling, projects, simulations, courses, jobs and placements — closed by employer feedback
            into curriculum improvement.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <Card key={m.title}>
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-surface-strong text-xl">{m.icon}</div>
              <h3 className="text-lg font-semibold text-ink">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Closed-loop workflow */}
      <section id="workflow" className="bg-surface-soft py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-muted">The PS44 closed loop</div>
            <h2 className="text-display text-3xl md:text-4xl">Industry demand → curriculum → placement → feedback.</h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-5">
            {LOOP.map((step, i) => (
              <li key={step} className="rounded-lg border border-hairline bg-canvas p-5">
                <div className="tabular text-[12px] font-semibold text-primary">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-2 text-sm font-medium leading-snug text-ink">{step}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-surface-dark py-24 text-center text-on-dark">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-display text-3xl md:text-4xl">Ready to close the skill gap?</h2>
          <p className="mx-auto mt-4 max-w-xl text-on-dark-soft">
            Join as a student to build your verified skill profile, or as a teacher to run the coordination layer.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink href="/signup" size="lg">Create account</ButtonLink>
            <ButtonLink href="#modules" variant="outline-dark" size="lg">Explore modules</ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-hairline bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-[13px] text-body md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">P</span>
            PS44 Portal — Academia–Industry Collaboration
          </div>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-ink">Sign in</Link>
            <Link href="/signup" className="hover:text-ink">Sign up</Link>
            <span>SIH PS44</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
