import { z } from "zod";
import { hashApiKey } from "@/lib/api-keys";
import { findTenantIdByKeyHash } from "@/db/repo/api-keys";
import { findPipelineBySlug, recordPing } from "@/db/repo/pipelines";
import { closeRun, openRun } from "@/db/repo/runs";
import { insertAlert } from "@/db/repo/alerts";

const bodySchema = z.object({
  pipeline: z.string().min(1),
  status: z.enum(["start", "success", "fail"]),
  run_id: z.string().min(1).max(120).optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  exit_code: z.number().int().optional(),
  message: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return Response.json(
      { error: "missing or malformed Authorization header" },
      { status: 401 },
    );
  }

  const tenantId = await findTenantIdByKeyHash(hashApiKey(header.slice(7)));
  if (!tenantId) {
    return Response.json({ error: "invalid API key" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "body must be valid JSON" }, { status: 422 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid body", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const body = parsed.data;

  const pipeline = await findPipelineBySlug(tenantId, body.pipeline);
  if (!pipeline) {
    return Response.json({ error: "unknown pipeline" }, { status: 404 });
  }

  const now = new Date();
  const run =
    body.status === "start"
      ? await openRun(tenantId, {
          pipelineId: pipeline.id,
          externalRunId: body.run_id,
          startedAt: now,
        })
      : await closeRun(tenantId, {
          pipelineId: pipeline.id,
          externalRunId: body.run_id,
          status: body.status,
          endedAt: now,
          durationMs: body.duration_ms,
          exitCode: body.exit_code,
          message: body.message,
        });

  if (body.status === "success" && pipeline.status === "down") {
    await insertAlert(tenantId, { pipelineId: pipeline.id, type: "recovery" });
  }

  if (body.status === "fail" && pipeline.status !== "down") {
    await insertAlert(tenantId, { pipelineId: pipeline.id, type: "down" });
  }

  await recordPing(
    tenantId,
    pipeline.id,
    body.status === "start"
      ? undefined
      : body.status === "success"
        ? "up"
        : "down",
  );

  return Response.json({ run }, { status: 202 });
}
