import type { runs } from "@/db/schema";

type RunStatus = (typeof runs.$inferSelect)["status"];

const tickColor: Record<RunStatus, string> = {
  success: "bg-up",
  fail: "bg-down",
  running: "bg-idle",
  incomplete: "bg-late",
};

export function RunBar({
  statuses,
  slots = 20,
}: {
  statuses: RunStatus[];
  slots?: number;
}) {
  const pad = Math.max(0, slots - statuses.length);
  return (
    <div className="flex items-end gap-0.75" aria-label="recent runs">
      {Array.from({ length: pad }).map((_, i) => (
        <span key={`pad-${i}`} className="h-4 w-0.75 rounded-sm bg-edge" />
      ))}
      {statuses.map((s, i) => (
        <span key={i} className={`h-4 w-0.75 rounded-sm ${tickColor[s]}`} />
      ))}
    </div>
  );
}
