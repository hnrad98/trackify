import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/require-session";
import { findPipelineBySlug } from "@/db/repo/pipelines";
import { listRunsForPipeline } from "@/db/repo/runs";
import { StatusDot } from "@/components/status-dot";
import { humanPeriod, timeAgo } from "@/lib/format";
import { AutoRefresh } from "@/components/auto-refresh";
import { CopyButton } from "@/components/copy-button";
import { listAlertsForPipeline } from "@/db/repo/alerts";
import {
  AlertsTimeline,
  DurationChart,
  RunsTable,
} from "@/components/run-views";

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tenantId } = await requireSession();

  const pipeline = await findPipelineBySlug(tenantId, slug);
  if (!pipeline) notFound();

  const [runList, alertList] = await Promise.all([
    listRunsForPipeline(tenantId, pipeline.id),
    listAlertsForPipeline(tenantId, pipeline.id),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <AutoRefresh />
      <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">
        ← Dashboard
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

      {runList.length === 0 ? (
        <WaitingForPing slug={pipeline.slug} />
      ) : (
        <>
          <AlertsTimeline alerts={alertList} />
          <DurationChart runs={runList} />
          <RunsTable runs={runList} />
        </>
      )}
    </main>
  );
}

function WaitingForPing({ slug }: { slug: string }) {
  const snippet = `curl -X POST https://your-app.example/api/runs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"pipeline":"${slug}","status":"success"}'`;
  return (
    <div className="mt-10 rounded-lg border border-edge bg-surface p-8">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-idle pulse-soft" />
        <h2 className="text-lg font-medium">Waiting for the first ping</h2>
      </div>
      <p className="mt-2 max-w-lg text-sm text-ink-muted">
        Send a ping from your job to bring this pipeline to life. Add this to
        the end of your script, or run it right now to test:
      </p>
      <div className="relative mt-4">
        <pre className="overflow-x-auto rounded-md border border-edge bg-bg p-4 font-mono text-xs leading-relaxed">
          {snippet}
        </pre>
        <CopyButton text={snippet} />
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        YOUR_API_KEY is the key you saved when you created your first pipeline.
        Lost it? Revoke and reissue from Settings.
      </p>
    </div>
  );
}
