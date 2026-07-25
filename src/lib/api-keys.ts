import { createHash, randomBytes } from "crypto";

export function generateApiKey(): {
  key: string;
  prefix: string;
  hash: string;
} {
  const key = `trk_${randomBytes(32).toString("base64url")}`;
  return { key, prefix: key.slice(0, 12), hash: hashApiKey(key) };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
