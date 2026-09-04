import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Card, EmptyState, Stat } from "@/components/ui/Primitives";
import { Badge } from "@/components/ui/Badge";
import { fmtDate } from "@/lib/utils";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await requireStudent();
  const applications = await db.application.findMany({
    where: { studentId: user?.studentId },
    include: { job: { include: { skills: { include: { skill: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const byStatus = (s: string) => applications.filter((a) => a.status === s).length;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Applications</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Students who applied & status</h1>
        <p className="mt-2 text-body">Track every application through the funnel: applied → shortlist → interview → offer → accepted.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Total" value={applications.length} />
        <Stat label="Applied" value={byStatus("APPLIED")} />
        <Stat label="Interviews" value={byStatus("INTERVIEW") + byStatus("SHORTLISTED")} />
        <Stat label="Offers" value={byStatus("OFFER") + byStatus("ACCEPTED")} tone={byStatus("OFFER") + byStatus("ACCEPTED") > 0 ? "up" : "default"} />
        <Stat label="Rejected" value={byStatus("REJECTED")} tone={byStatus("REJECTED") > 0 ? "down" : "default"} />
      </div>

      {applications.length === 0 ? (
        <EmptyState title="No applications yet" hint="Head to the Jobs & internships portal to apply." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-[12px] uppercase tracking-wider text-muted">
                <th className="px-6 py-4 font-semibold">Opportunity</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Applied on</th>
                <th className="px-6 py-4 font-semibold">Note</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-hairline-soft last:border-0">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-ink">{a.job.title}</div>
                    <div className="text-[13px] text-body">{a.job.company}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={a.job.type === "INTERNSHIP" ? "primary" : "default"}>
                      {a.job.type === "INTERNSHIP" ? "Internship" : "Full-time"}
                    </Badge>
                  </td>
                  <td className="tabular px-6 py-4 text-body">{fmtDate(a.createdAt)}</td>
                  <td className="max-w-48 truncate px-6 py-4 text-[13px] text-body">{a.note ?? "—"}</td>
                  <td className="px-6 py-4">
                    <ApplicationStatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
