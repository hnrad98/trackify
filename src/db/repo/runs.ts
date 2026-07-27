import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { runs } from "@/db/schema";

export async function openRun(
  tenantId: string,
  data: { pipelineId: string; externalRunId?: string; startedAt: Date },
) {
  const [row] = await db
    .insert(runs)
    .values({ tenantId, status: "running", ...data })
    .onConflictDoNothing()
    .returning();
  return row ?? null;
}

export async function closeRun(
  tenantId: string,
  data: {
    pipelineId: string;
    externalRunId?: string;
    status: "success" | "fail";
    endedAt: Date;
    durationMs?: number;
    exitCode?: number;
    message?: string;
  },
) {
  const { pipelineId, externalRunId, ...rest } = data;

  const open = externalRunId
    ? await findRun(tenantId, pipelineId, externalRunId)
    : await findLatestOpenRun(tenantId, pipelineId);

  if (open && open.status === "running") {
    const [row] = await db
      .update(runs)
      .set({
        ...rest,
        durationMs:
          rest.durationMs ?? rest.endedAt.getTime() - open.startedAt.getTime(),
      })
      .where(and(eq(runs.id, open.id), eq(runs.tenantId, tenantId)))
      .returning();
    return row ?? null;
  }

  if (open) return open; // already closed — replay, not an error

  // success/fail with no prior start: create the run already closed
  const [row] = await db
    .insert(runs)
    .values({
      tenantId,
      pipelineId,
      externalRunId,
      startedAt: rest.endedAt,
      ...rest,
    })
    .onConflictDoNothing()
    .returning();
  return row ?? null;
}

async function findRun(
  tenantId: string,
  pipelineId: string,
  externalRunId: string,
) {
  const [row] = await db
    .select()
    .from(runs)
    .where(
      and(
        eq(runs.tenantId, tenantId),
        eq(runs.pipelineId, pipelineId),
        eq(runs.externalRunId, externalRunId),
      ),
    );
  return row ?? null;
}

async function findLatestOpenRun(tenantId: string, pipelineId: string) {
  const [row] = await db
    .select()
    .from(runs)
    .where(
      and(
        eq(runs.tenantId, tenantId),
        eq(runs.pipelineId, pipelineId),
        eq(runs.status, "running"),
        isNull(runs.endedAt),
      ),
    )
    .orderBy(desc(runs.startedAt))
    .limit(1);
  return row ?? null;
}

export async function listRecentRunsByPipeline(
  tenantId: string,
  perPipeline = 20,
) {
  const rows = await db
    .select({
      id: runs.id,
      pipelineId: runs.pipelineId,
      status: runs.status,
      startedAt: runs.startedAt,
    })
    .from(runs)
    .where(eq(runs.tenantId, tenantId))
    .orderBy(desc(runs.startedAt))
    .limit(500);

  const byPipeline = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = byPipeline.get(r.pipelineId) ?? [];
    if (list.length < perPipeline) {
      list.push(r);
      byPipeline.set(r.pipelineId, list);
    }
  }
  return byPipeline;
}

export async function listRunsForPipeline(
  tenantId: string,
  pipelineId: string,
  limit = 50,
) {
  return db
    .select()
    .from(runs)
    .where(and(eq(runs.tenantId, tenantId), eq(runs.pipelineId, pipelineId)))
    .orderBy(desc(runs.startedAt))
    .limit(limit);
}
