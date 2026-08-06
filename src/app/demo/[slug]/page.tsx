import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { StatusDot } from "@/components/status-dot";
import {
  AlertsTimeline,
  DurationChart,
  RunsTable,
} from "@/components/run-views";
import { findPipelineBySlug } from "@/db/repo/pipelines";
import { listRunsForPipeline } from "@/db/repo/runs";
import { listAlertsForPipeline } from "@/db/repo/alerts";
import { humanPeriod, timeAgo } from "@/lib/format";
import { DEMO_TENANT_ID } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function DemoPipelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pipeline = await findPipelineBySlug(DEMO_TENANT_ID, slug);
  if (!pipeline) notFound();

  const [runList, alertList] = await Promise.all([
    listRunsForPipeline(DEMO_TENANT_ID, pipeline.id),
    listAlertsForPipeline(DEMO_TENANT_ID, pipeline.id),
  ]);

  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/demo" className="text-sm text-ink-muted hover:text-ink">
          ← Demo dashboard
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <StatusDot status={pipeline.status} />
          <h1 className="text-xl font-semibold">{pipeline.name}</h1>
          <span className="rounded-full border border-edge px-2 py-0.5 font-mono text-xs text-ink-muted">
            {humanPeriod(pipeline.periodSeconds)} · grace{" "}
            {Math.round(pipeline.graceSeconds / 60)}m
          </span>
        </div>
        <p className="mt-1 font-mono text-sm text-ink-muted">
          {pipeline.slug} · last ping{" "}
          <span title={pipeline.lastPingAt?.toISOString()}>
            {timeAgo(pipeline.lastPingAt)}
          </span>
        </p>

        <AlertsTimeline alerts={alertList} />
        <DurationChart runs={runList} />
        <RunsTable runs={runList} />
      </main>
      <PublicFooter />
    </div>
  );
}
