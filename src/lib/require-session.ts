import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { tenantId } = session.user;
  if (!tenantId) throw new Error("session user has no tenantId");

  return { user: session.user, tenantId };
}
