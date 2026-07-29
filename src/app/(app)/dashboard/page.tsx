import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { listPipelines } from "@/db/repo/pipelines";
import { listRecentRunsByPipeline } from "@/db/repo/runs";
import { getTenant } from "@/db/repo/tenants";
import { PLAN_LIMITS } from "@/lib/plans";
import { RunBar } from "@/components/run-bar";
import { StatusDot } from "@/components/status-dot";
import { humanPeriod, timeAgo } from "@/lib/format";

export default async function DashboardPage() {
  const { tenantId } = await requireSession();
  const [tenant, pipelines, recentRuns] = await Promise.all([
    getTenant(tenantId),
    listPipelines(tenantId),
    listRecentRunsByPipeline(tenantId),
  ]);
  const { maxPipelines } = PLAN_LIMITS[tenant.plan];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
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
        <ul className="mt-8 divide-y divide-edge rounded-lg border border-edge bg-surface">
          {pipelines.map((p) => {
            const recent = (recentRuns.get(p.id) ?? []).slice().reverse();
            return (
              <li key={p.id}>
                <Link
                  href={`/pipelines/${p.slug}`}
                  className="flex items-center gap-6 px-5 py-4 transition-colors hover:bg-bg/50"
                >
                  <StatusDot status={p.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate font-mono text-xs text-ink-muted">
                      {p.slug}
                    </p>
                  </div>
                  <RunBar statuses={recent.map((r) => r.status)} />
                  <div
                    title={p.lastPingAt?.toISOString()}
                    className="w-24 text-right font-mono text-xs text-ink-muted"
                  >
                    {timeAgo(p.lastPingAt)}
                  </div>
                  <div className="w-20 text-right text-xs text-ink-muted">
                    {humanPeriod(p.periodSeconds)}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
