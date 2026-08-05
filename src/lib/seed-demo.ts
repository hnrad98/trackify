import { eq } from "drizzle-orm";
import { db } from "@/db";
import { alerts, pipelines, runs, tenants } from "@/db/schema";
import { DEMO_TENANT_ID } from "@/lib/demo";

const HOUR = 3600;
const DAY = 86400;

function jitterMs(base: number, pct = 0.3): number {
  return Math.round(base * (1 + (Math.random() - 0.5) * 2 * pct));
}

function at(now: Date, secondsAgo: number): Date {
  return new Date(now.getTime() - secondsAgo * 1000);
}

export async function seedDemo(now = new Date()): Promise<void> {
  // idempotent: cascade-delete the demo tenant and rebuild from scratch
  await db.delete(tenants).where(eq(tenants.id, DEMO_TENANT_ID));
  await db
    .insert(tenants)
    .values({ id: DEMO_TENANT_ID, name: "Meridian Data", plan: "pro" });

  type Def = {
    name: string;
    slug: string;
    period: number;
    grace: number;
    count: number; // how many runs of history
    baseMs: number; // typical duration
    failAt?: number[]; // indices (0 = oldest) that failed
    stopAfter?: number; // stop pinging after this index (goes down)
  };

  const defs: Def[] = [
    {
      name: "Nightly ETL",
      slug: "nightly-etl",
      period: DAY,
      grace: 1800,
      count: 30,
      baseMs: 420_000,
    },
    {
      name: "dbt marts build",
      slug: "dbt-marts",
      period: DAY,
      grace: 1800,
      count: 30,
      baseMs: 780_000,
      failAt: [26, 27],
    },
    {
      name: "Stripe reconciliation",
      slug: "stripe-reconciliation",
      period: HOUR,
      grace: 600,
      count: 72,
      baseMs: 45_000,
      failAt: [40],
    },
    {
      name: "Model retrain",
      slug: "model-retrain",
      period: 7 * DAY,
      grace: 4 * HOUR,
      count: 4,
      baseMs: 5_400_000,
    },
    {
      name: "Postgres backup",
      slug: "postgres-backup",
      period: DAY,
      grace: 1800,
      count: 30,
      baseMs: 900_000,
      stopAfter: 27,
    },
  ];

  for (const d of defs) {
    const effectiveCount =
      d.stopAfter !== undefined ? d.stopAfter + 1 : d.count;
    // newest run sits a fraction of one period in the past, older ones step back by period
    const newestAgo =
      d.stopAfter !== undefined
        ? (d.count - 1 - d.stopAfter) * d.period + Math.round(d.period * 0.3)
        : Math.round(d.period * 0.3);

    const lastPingAt = at(now, newestAgo);
    const status = d.stopAfter !== undefined ? "down" : "up";

    const [p] = await db
      .insert(pipelines)
      .values({
        tenantId: DEMO_TENANT_ID,
        name: d.name,
        slug: d.slug,
        periodSeconds: d.period,
        graceSeconds: d.grace,
        status,
        lastPingAt,
      })
      .returning();
    if (!p) throw new Error(`seed: pipeline insert failed for ${d.slug}`);

    const runRows = [];
    for (let i = 0; i < effectiveCount; i++) {
      const ago = newestAgo + (effectiveCount - 1 - i) * d.period;
      const startedAt = at(now, ago + Math.round(Math.random() * 300));
      const failed = d.failAt?.includes(i) ?? false;
      const durationMs = failed ? jitterMs(d.baseMs * 0.4) : jitterMs(d.baseMs);
      runRows.push({
        tenantId: DEMO_TENANT_ID,
        pipelineId: p.id,
        status: failed ? ("fail" as const) : ("success" as const),
        startedAt,
        endedAt: new Date(startedAt.getTime() + durationMs),
        durationMs,
        exitCode: failed ? 1 : null,
        message: failed ? "exit status 1" : null,
        createdAt: startedAt,
      });
    }
    await db.insert(runs).values(runRows);

    // alert story: first fail in a failAt streak = down, next success = recovery
    if (d.failAt && d.failAt.length > 0) {
      const firstFail = Math.min(...d.failAt);
      const recoveryIdx = Math.max(...d.failAt) + 1;
      const failAgo = newestAgo + (effectiveCount - 1 - firstFail) * d.period;
      await db.insert(alerts).values({
        tenantId: DEMO_TENANT_ID,
        pipelineId: p.id,
        type: "down",
        createdAt: at(now, failAgo),
      });
      if (recoveryIdx < effectiveCount) {
        const recAgo =
          newestAgo + (effectiveCount - 1 - recoveryIdx) * d.period;
        await db.insert(alerts).values({
          tenantId: DEMO_TENANT_ID,
          pipelineId: p.id,
          type: "recovery",
          createdAt: at(now, recAgo),
        });
      }
    }
    if (d.stopAfter !== undefined) {
      // went silent: down alert fires period+grace after the last ping
      await db.insert(alerts).values({
        tenantId: DEMO_TENANT_ID,
        pipelineId: p.id,
        type: "down",
        createdAt: at(now, newestAgo - d.period - d.grace),
      });
    }
  }
}
