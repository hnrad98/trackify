import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/require-session";
import { findPipelineBySlug } from "@/db/repo/pipelines";
import { listRunsForPipeline } from "@/db/repo/runs";
import { StatusDot } from "@/components/status-dot";
import { humanPeriod, timeAgo } from "@/lib/format";
import type { runs as runsTable } from "@/db/schema";
import { AutoRefresh } from "@/components/auto-refresh";
import { CopyButton } from "@/components/copy-button";

type Run = typeof runsTable.$inferSelect;

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tenantId } = await requireSession();

  const pipeline = await findPipelineBySlug(tenantId, slug);
  if (!pipeline) notFound();

  const runList = await listRunsForPipeline(tenantId, pipeline.id);

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

function DurationChart({ runs }: { runs: Run[] }) {
  const closed = runs
    .filter((r) => r.durationMs !== null)
    .slice(0, 30)
    .reverse();
  if (closed.length < 2) return null;
  const max = Math.max(...closed.map((r) => r.durationMs ?? 0));

  return (
    <div className="mt-10">
      <h2 className="text-sm font-medium text-ink-muted">
        Durations (last {closed.length})
      </h2>
      <div className="mt-3 flex h-24 items-end gap-1 rounded-lg border border-edge bg-surface p-3">
        {closed.map((r) => (
          <div
            key={r.id}
            title={`${r.durationMs}ms`}
            className={`flex-1 rounded-t-sm ${r.status === "fail" ? "bg-down" : "bg-up"}`}
            style={{
              height: `${Math.max(6, ((r.durationMs ?? 0) / max) * 100)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const runStatusStyle: Record<Run["status"], string> = {
  success: "text-up",
  fail: "text-down",
  incomplete: "text-late",
  running: "text-idle",
};

function RunsTable({ runs }: { runs: Run[] }) {
  return (
    <div className="mt-10 overflow-x-auto rounded-lg border border-edge bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-edge text-left text-xs text-ink-muted">
            <th className="px-4 py-2 font-medium">Started</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Duration</th>
            <th className="px-4 py-2 font-medium">Exit</th>
            <th className="px-4 py-2 font-medium">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {runs.map((r) => (
            <tr key={r.id}>
              <td
                title={r.startedAt.toISOString()}
                className="px-4 py-2 font-mono text-xs text-ink-muted"
              >
                {timeAgo(r.startedAt)}
              </td>
              <td
                className={`px-4 py-2 text-xs font-medium ${runStatusStyle[r.status]}`}
              >
                {r.status}
              </td>
              <td className="px-4 py-2 font-mono text-xs">
                {r.durationMs !== null ? `${r.durationMs}ms` : "—"}
              </td>
              <td className="px-4 py-2 font-mono text-xs">
                {r.exitCode !== null ? r.exitCode : "—"}
              </td>
              <td className="max-w-xs truncate px-4 py-2 text-xs text-ink-muted">
                {r.message ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
