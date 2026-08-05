import { timeAgo } from "@/lib/format";
import type { alerts as alertsTable, runs as runsTable } from "@/db/schema";

export type Run = typeof runsTable.$inferSelect;
export type Alert = typeof alertsTable.$inferSelect;

export function DurationChart({ runs }: { runs: Run[] }) {
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

export function RunsTable({ runs }: { runs: Run[] }) {
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

export function AlertsTimeline({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="text-sm font-medium text-ink-muted">Alerts</h2>
      <ul className="mt-3 space-y-2">
        {alerts.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-md border border-edge bg-surface px-4 py-2.5 text-sm"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                a.type === "down" ? "bg-down" : "bg-up"
              }`}
            />
            <span className="font-medium">
              {a.type === "down" ? "Pipeline went down" : "Pipeline recovered"}
            </span>
            <span
              title={a.createdAt.toISOString()}
              className="ml-auto font-mono text-xs text-ink-muted"
            >
              {timeAgo(a.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
