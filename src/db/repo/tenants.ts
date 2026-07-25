import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";

export async function getTenant(tenantId: string) {
  const [row] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!row) throw new Error("tenant not found");
  return row;
}
