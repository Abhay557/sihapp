import { db } from "@/lib/db";
import { requireStudent } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Primitives";
import { parseJsonArray } from "@/lib/utils";
import { SimulationCard } from "./SimulationCard";

export const dynamic = "force-dynamic";

export default async function SimulationsPage() {
  const user = await requireStudent();

  const [simulations, runs] = await Promise.all([
    db.simulation.findMany({ orderBy: { createdAt: "asc" } }),
    db.simulationRun.findMany({ where: { studentId: user?.studentId } }),
  ]);
  const runBySim = new Map(runs.map((r) => [r.simulationId, r]));

  const completed = runs.filter((r) => r.completed).length;
  const avgScore = completed ? Math.round(runs.filter((r) => r.completed).reduce((s, r) => s + r.score, 0) / completed) : 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-widest text-muted">Virtual job simulations</div>
        <h1 className="text-display mt-2 text-3xl md:text-4xl">Try the job before the job</h1>
        <p className="mt-2 max-w-2xl text-body">
          Employer-built simulations replicate a day in the role. Finish the tasks, get scored and earn a shareable
          certificate.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge tone={completed > 0 ? "up" : "default"}>{completed} completed</Badge>
        {avgScore > 0 && <Badge tone="primary">Avg score {avgScore}%</Badge>}
        <Badge>{simulations.length - completed} available</Badge>
      </div>

      {simulations.length === 0 ? (
        <EmptyState title="No simulations yet" hint="Faculty will publish simulations soon." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {simulations.map((sim) => (
            <SimulationCard
              key={sim.id}
              id={sim.id}
              title={sim.title}
              company={sim.company}
              domain={sim.domain}
              difficulty={sim.difficulty}
              durationMins={sim.durationMins}
              description={sim.description}
              tasks={parseJsonArray(sim.tasks)}
              run={runBySim.get(sim.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
