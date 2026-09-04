import { Badge } from "@/components/ui/Badge";

const MAP: Record<string, { label: string; tone: "up" | "down" | "primary" | "default" }> = {
  APPLIED: { label: "Applied", tone: "default" },
  SHORTLISTED: { label: "Shortlisted", tone: "primary" },
  INTERVIEW: { label: "Interview", tone: "primary" },
  OFFER: { label: "Offer", tone: "up" },
  ACCEPTED: { label: "Accepted", tone: "up" },
  REJECTED: { label: "Rejected", tone: "down" },
  WITHDRAWN: { label: "Withdrawn", tone: "down" },
};

export function ApplicationStatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? { label: status, tone: "default" as const };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
