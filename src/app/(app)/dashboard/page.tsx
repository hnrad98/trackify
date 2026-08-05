import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { listPipelines } from "@/db/repo/pipelines";
import { listRecentRunsByPipeline } from "@/db/repo/runs";
import { getTenant } from "@/db/repo/tenants";
import { PLAN_LIMITS } from "@/lib/plans";
import { RunBar } from "@/components/run-bar";
import { AutoRefresh } from "@/components/auto-refresh";
import { PipelineRows } from "@/components/pipeline-rows";

export default async function DashboardPage() {
  const { tenantId } = await requireSession();
  const [tenant, pipelines, recentRuns] = await Promise.all([
    getTenant(tenantId),
    listPipelines(tenantId),
    listRecentRunsByPipeline(tenantId),
  ]);
  const { maxPipelines } = PLAN_LIMITS[tenant.plan];
  const downPipelines = pipelines.filter((p) => p.status === "down");

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <AutoRefresh />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{tenant.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            <span className="font-mono">
              {pipelines.length}/{maxPipelines}
            </span>{" "}
            pipelines · <span className="uppercase">{tenant.plan}</span> plan
          </p>
        </div>
        <Link
          href="/pipelines/new"
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          New pipeline
        </Link>
      </div>
      {downPipelines.length > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-md border border-down/40 bg-down/10 px-4 py-2.5 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-down pulse-soft" />
          <span>
            {downPipelines.length === 1
              ? `1 pipeline is down: ${downPipelines[0]?.name}`
              : `${downPipelines.length} pipelines are down: ${downPipelines
                  .map((p) => p.name)
                  .join(", ")}`}
          </span>
        </div>
      )}
      {pipelines.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-lg border border-edge bg-surface px-6 py-16 text-center">
          <RunBar statuses={[]} />
          <h2 className="mt-6 text-lg font-medium">No pipelines yet</h2>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Create your first pipeline and Trackify will tell you the moment it
            fails — or fails to show up.
          </p>
          <Link
            href="/pipelines/new"
            className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg"
          >
            Create your first pipeline
          </Link>
        </div>
      ) : (
        <PipelineRows
          pipelines={pipelines}
          recentRuns={recentRuns}
          hrefBase="/pipelines"
        />
      )}
    </main>
  );
}
