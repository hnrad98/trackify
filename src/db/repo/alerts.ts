import { db } from "@/db";
import { alerts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function insertAlert(
  tenantId: string,
  data: { pipelineId: string; type: "down" | "recovery" },
) {
  await db.insert(alerts).values({ tenantId, ...data });
}

export async function listAlertsForPipeline(
  tenantId: string,
  pipelineId: string,
  limit = 20,
) {
  return db
    .select()
    .from(alerts)
    .where(
      and(eq(alerts.tenantId, tenantId), eq(alerts.pipelineId, pipelineId)),
    )
    .orderBy(desc(alerts.createdAt))
    .limit(limit);
}
