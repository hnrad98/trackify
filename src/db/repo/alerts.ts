import { db } from "@/db";
import { alerts } from "@/db/schema";

export async function insertAlert(
  tenantId: string,
  data: { pipelineId: string; type: "down" | "recovery" },
) {
  await db.insert(alerts).values({ tenantId, ...data });
}
