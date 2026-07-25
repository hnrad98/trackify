import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";

export async function countActiveKeys(tenantId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(apiKeys)
    .where(and(eq(apiKeys.tenantId, tenantId), isNull(apiKeys.revokedAt)));
  return row?.n ?? 0;
}

export async function listApiKeys(tenantId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.tenantId, tenantId))
    .orderBy(apiKeys.createdAt);
}

export async function insertApiKey(
  tenantId: string,
  data: { name: string; keyHash: string; keyPrefix: string },
) {
  const [row] = await db
    .insert(apiKeys)
    .values({ tenantId, ...data })
    .returning();
  if (!row) throw new Error("api key insert failed");
  return row;
}
