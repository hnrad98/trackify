import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { alerts, pipelines, runs, tenants } from "@/db/schema";
import { PLAN_LIMITS } from "@/lib/plans";

export type CheckSummary = {
  markedLate: number;
  markedDown: number;
  sweptIncomplete: number;
  prunedRuns: number;
};

export async function runChecks(): Promise<CheckSummary> {
  // silence past period+grace: up/late -> down, exactly one alert per transition
  const wentDown = await db
    .update(pipelines)
    .set({ status: "down" })
    .where(
      and(
        inArray(pipelines.status, ["up", "late"]),
        isNotNull(pipelines.lastPingAt),
        sql`${pipelines.lastPingAt} + (${pipelines.periodSeconds} + ${pipelines.graceSeconds}) * interval '1 second' < now()`,
      ),
    )
    .returning({ id: pipelines.id, tenantId: pipelines.tenantId });

  if (wentDown.length > 0) {
    await db.insert(alerts).values(
      wentDown.map((p) => ({
        pipelineId: p.id,
        tenantId: p.tenantId,
        type: "down" as const,
      })),
    );
  }

  // silence past period but within grace: up -> late (no alert)
  const wentLate = await db
    .update(pipelines)
    .set({ status: "late" })
    .where(
      and(
        eq(pipelines.status, "up"),
        isNotNull(pipelines.lastPingAt),
        sql`${pipelines.lastPingAt} + ${pipelines.periodSeconds} * interval '1 second' < now()`,
      ),
    )
    .returning({ id: pipelines.id });

  // runs stuck 'running' past period+grace: started but never finished
  const stuck = await db
    .select({ id: runs.id })
    .from(runs)
    .innerJoin(pipelines, eq(runs.pipelineId, pipelines.id))
    .where(
      and(
        eq(runs.status, "running"),
        sql`${runs.startedAt} + (${pipelines.periodSeconds} + ${pipelines.graceSeconds}) * interval '1 second' < now()`,
      ),
    );
  if (stuck.length > 0) {
    await db
      .update(runs)
      .set({ status: "incomplete" })
      .where(
        inArray(
          runs.id,
          stuck.map((s) => s.id),
        ),
      );
  }

  // retention pruning per plan
  let prunedRuns = 0;
  for (const plan of ["free", "pro"] as const) {
    const pruned = await db
      .delete(runs)
      .where(
        and(
          sql`${runs.createdAt} < now() - make_interval(days => ${PLAN_LIMITS[plan].retentionDays})`,
          inArray(
            runs.tenantId,
            db
              .select({ id: tenants.id })
              .from(tenants)
              .where(eq(tenants.plan, plan)),
          ),
        ),
      )
      .returning({ id: runs.id });
    prunedRuns += pruned.length;
  }

  return {
    markedLate: wentLate.length,
    markedDown: wentDown.length,
    sweptIncomplete: stuck.length,
    prunedRuns,
  };
}
