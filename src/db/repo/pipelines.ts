import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { pipelines } from "@/db/schema";

export async function listPipelines(tenantId: string) {
  return db
    .select()
    .from(pipelines)
    .where(eq(pipelines.tenantId, tenantId))
    .orderBy(pipelines.createdAt);
}

export async function countPipelines(tenantId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(pipelines)
    .where(eq(pipelines.tenantId, tenantId));
  return row?.n ?? 0;
}

export async function findPipelineBySlug(tenantId: string, slug: string) {
  const [row] = await db
    .select()
    .from(pipelines)
    .where(and(eq(pipelines.tenantId, tenantId), eq(pipelines.slug, slug)));
  return row ?? null;
}

export async function insertPipeline(
  tenantId: string,
  data: {
    name: string;
    slug: string;
    periodSeconds: number;
    graceSeconds: number;
  },
) {
  const [row] = await db
    .insert(pipelines)
    .values({ tenantId, ...data })
    .returning();
  if (!row) throw new Error("pipeline insert failed");
  return row;
}
