import { and, desc, eq, isNull, sql } from "drizzle-orm";
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
