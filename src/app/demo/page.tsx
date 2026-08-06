import type { Metadata } from "next";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { PipelineRows } from "@/components/pipeline-rows";
import { listPipelines } from "@/db/repo/pipelines";
import { listRecentRunsByPipeline } from "@/db/repo/runs";
import { DEMO_TENANT_ID } from "@/lib/demo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live demo — Trackify",
  description: "A read-only look at a monitored fleet of pipelines.",
};

export default async function DemoPage() {
  const [pipelines, recentRuns] = await Promise.all([
    listPipelines(DEMO_TENANT_ID),
    listRecentRunsByPipeline(DEMO_TENANT_ID),
  ]);
  const downCount = pipelines.filter((p) => p.status === "down").length;

  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Meridian Data</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Read-only demo · seeded data · this is what your dashboard looks
              like
            </p>
          </div>
        </div>

        {downCount > 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-md border border-down/40 bg-down/10 px-4 py-2.5 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-down pulse-soft" />
            <span>
              {downCount === 1
                ? "1 pipeline is down"
                : `${downCount} pipelines are down`}
            </span>
          </div>
        )}

        <PipelineRows
          pipelines={pipelines}
          recentRuns={recentRuns}
          hrefBase="/demo"
        />
      </main>
      <PublicFooter />
    </div>
  );
}
