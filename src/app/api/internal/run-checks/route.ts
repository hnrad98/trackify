import { runChecks } from "@/lib/checker";

export async function POST(req: Request) {
  const header = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    header !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return Response.json(await runChecks());
}
