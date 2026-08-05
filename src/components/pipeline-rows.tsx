import Link from "next/link";
import { RunBar } from "@/components/run-bar";
import { StatusDot } from "@/components/status-dot";
import { humanPeriod, timeAgo } from "@/lib/format";
import type { pipelines as pipelinesTable, runs } from "@/db/schema";

type Pipeline = typeof pipelinesTable.$inferSelect;
type RunStatus = (typeof runs.$inferSelect)["status"];

export function PipelineRows({
  pipelines,
  recentRuns,
  hrefBase,
}: {
  pipelines: Pipeline[];
  recentRuns: Map<string, { status: RunStatus }[]>;
  hrefBase: string;
}) {
  return (
    <ul className="mt-8 divide-y divide-edge rounded-lg border border-edge bg-surface">
      {pipelines.map((p) => {
        const recent = (recentRuns.get(p.id) ?? []).slice().reverse();
        return (
          <li key={p.id}>
            <Link
              href={`${hrefBase}/${p.slug}`}
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
  );
}
