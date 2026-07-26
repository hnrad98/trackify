import type { pipelines } from "@/db/schema";

type Status = (typeof pipelines.$inferSelect)["status"];

const styles: Record<Status, string> = {
  new: "bg-idle",
  up: "bg-up",
  late: "bg-late pulse-soft",
  down: "bg-down pulse-soft",
  paused: "bg-idle",
};

export function StatusDot({ status }: { status: Status }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${styles[status]}`} />
  );
}
