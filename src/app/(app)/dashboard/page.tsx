import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-ink-muted">
        Signed in as <span className="font-mono">{session.user.email}</span>
      </p>
    </main>
  );
}
