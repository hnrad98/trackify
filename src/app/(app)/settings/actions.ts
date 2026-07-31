"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/require-session";
import { generateApiKey } from "@/lib/api-keys";
import { insertApiKey, revokeApiKey } from "@/db/repo/api-keys";

export async function revokeKey(formData: FormData) {
  const { tenantId } = await requireSession();
  const keyId = formData.get("keyId");
  if (typeof keyId !== "string") return;
  await revokeApiKey(tenantId, keyId);
  revalidatePath("/settings");
}

export type CreateKeyState = { rawKey: string | null };

export async function createKey(
  _prev: CreateKeyState,
  formData: FormData,
): Promise<CreateKeyState> {
  const { tenantId } = await requireSession();
  const name = String(formData.get("name") || "").trim() || "Key";
  const { key, prefix, hash } = generateApiKey();
  await insertApiKey(tenantId, { name, keyHash: hash, keyPrefix: prefix });
  revalidatePath("/settings");
  return { rawKey: key };
}
