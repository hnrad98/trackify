"use server";

import { z } from "zod";
import { requireSession } from "@/lib/require-session";
import {
  countPipelines,
  findPipelineBySlug,
  insertPipeline,
} from "@/db/repo/pipelines";
import { getTenant } from "@/db/repo/tenants";
import { countActiveKeys, insertApiKey } from "@/db/repo/api-keys";
import { PLAN_LIMITS } from "@/lib/plans";
import { generateApiKey } from "@/lib/api-keys";
import { slugify } from "@/lib/slugify";

const schema = z.object({
  name: z.string().min(1).max(60),
  periodSeconds: z.coerce
    .number()
    .int()
    .min(60)
    .max(60 * 60 * 24 * 31),
  graceSeconds: z.coerce
    .number()
    .int()
    .min(0)
    .max(60 * 60 * 24),
});

export type CreatePipelineState =
  | { status: "idle" }
  | { status: "invalid"; message: string }
  | { status: "limit"; max: number }
  | { status: "created"; slug: string; rawKey: string | null };

export async function createPipeline(
  _prev: CreatePipelineState,
  formData: FormData,
): Promise<CreatePipelineState> {
  const { tenantId } = await requireSession();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "invalid",
      message: "Check the form values and try again.",
    };
  }

  const tenant = await getTenant(tenantId);
  const { maxPipelines } = PLAN_LIMITS[tenant.plan];
  if ((await countPipelines(tenantId)) >= maxPipelines) {
    return { status: "limit", max: maxPipelines };
  }

  const base = slugify(parsed.data.name);
  let slug = base;
  for (let i = 2; await findPipelineBySlug(tenantId, slug); i++) {
    slug = `${base}-${i}`;
  }

  const pipeline = await insertPipeline(tenantId, { ...parsed.data, slug });

  let rawKey: string | null = null;
  if ((await countActiveKeys(tenantId)) === 0) {
    const { key, prefix, hash } = generateApiKey();
    await insertApiKey(tenantId, {
      name: "Default",
      keyHash: hash,
      keyPrefix: prefix,
    });
    rawKey = key;
  }

  return { status: "created", slug: pipeline.slug, rawKey };
}
