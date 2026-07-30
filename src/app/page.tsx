import Link from "next/link";
import { TickField } from "@/components/tick-field";
import { PLAN_LIMITS } from "@/lib/plans";

export default function LandingPage() {
  return (
    <div className="dot-grid min-h-screen">
      <nav className="sticky top-0 z-20 border-b border-edge bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-block h-3.5 w-3.5 border-2 border-accent" />
            Trackify
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/docs"
              className="text-ink-muted transition-colors hover:text-ink"
            >
              Docs
            </Link>
            <Link
              href="/login"
              className="text-ink-muted transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-accent px-3 py-1.5 font-medium text-bg transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden">
        <TickField className="absolute inset-0 h-full w-full opacity-60" />
        <div className="pointer-events-none relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-24">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Monitoring for scheduled jobs
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl">
            Know the moment a job doesn&apos;t run.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-muted">
            Cron jobs, data pipelines, scheduled workflows — one HTTP ping from
            any of them, and Trackify tells you when they fail. Or never start.
          </p>
          <div className="pointer-events-auto mt-10 flex gap-4">
            <Link
              href="/register"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              Start monitoring
            </Link>
            <Link
              href="/docs"
              className="rounded-md border border-edge px-5 py-2.5 text-sm text-ink transition-colors hover:border-ink"
            >
              Read the docs
            </Link>
          </div>
        </div>

        <div className="relative z-10 border-y border-edge bg-bg/70 backdrop-blur">
          <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-4">
            {[
              ["1", "HTTP call to integrate"],
              ["3", "ping types — start · success · fail"],
              ["60s", "to your first ping"],
              ["$0", `for ${PLAN_LIMITS.free.maxPipelines} pipelines`],
            ].map(([big, small]) => (
              <div
                key={small}
                className="border-r border-edge px-6 py-5 last:border-r-0"
              >
                <div className="font-mono text-3xl">{big}</div>
                <div className="mt-1 text-xs text-ink-muted">{small}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* how it works */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="text-2xl font-medium tracking-tight">
          Three pings. Total visibility.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            [
              "01",
              "Create a pipeline",
              "Name it, tell Trackify how often it should run, and how much lateness to forgive.",
            ],
            [
              "02",
              "Add one line to your job",
              "A curl at the end of your script, a step in your workflow — anything that can speak HTTP.",
            ],
            [
              "03",
              "Get the full picture",
              "Live status, run history, durations — and alerts when a job fails or goes quiet.",
            ],
          ].map(([n, title, body]) => (
            <div
              key={n}
              className="rounded-lg border border-edge bg-surface p-6"
            >
              <div className="font-mono text-xs text-accent">{n}</div>
              <h3 className="mt-3 font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {body}
              </p>
            </div>
          ))}
        </div>
        <pre className="mt-10 overflow-x-auto rounded-lg border border-edge bg-surface p-5 font-mono text-xs leading-relaxed">
          {`# the whole integration:
curl -X POST https://trackify.example/api/runs \\
  -H "Authorization: Bearer $TRACKIFY_KEY" \\
  -d '{"pipeline":"nightly-etl","status":"success"}'`}
        </pre>
      </section>

      <footer className="border-t border-edge">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 text-sm text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 border-2 border-edge" />
            Trackify
          </div>
          <div className="flex gap-6">
            <Link href="/docs" className="transition-colors hover:text-ink">
              Docs
            </Link>
            <Link href="/login" className="transition-colors hover:text-ink">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
