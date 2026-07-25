import type { tenants } from "@/db/schema";

type Plan = (typeof tenants.$inferSelect)["plan"];

export const PLAN_LIMITS: Record<
  Plan,
  { maxPipelines: number; retentionDays: number; webhookAlerts: boolean }
> = {
  free: { maxPipelines: 3, retentionDays: 7, webhookAlerts: false },
  pro: { maxPipelines: 50, retentionDays: 90, webhookAlerts: true },
};
