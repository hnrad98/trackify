import type { Metadata } from "next";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { SnippetTabs } from "@/components/snippet-tabs";

export const metadata: Metadata = {
  title: "Docs — Trackify",
  description: "Integrate any scheduled job with one HTTP call.",
};

const curl = `# report success (simplest possible integration)
curl -X POST https://trackify.example/api/runs \\
  -H "Authorization: Bearer $TRACKIFY_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"pipeline":"nightly-etl","status":"success"}'

# or wrap a run with start/finish and a shared run_id
RUN_ID=$(date +%s)
curl -X POST https://trackify.example/api/runs \\
  -H "Authorization: Bearer $TRACKIFY_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{\\"pipeline\\":\\"nightly-etl\\",\\"status\\":\\"start\\",\\"run_id\\":\\"$RUN_ID\\"}"`;

const cron = `# crontab: ping success only if the job exits 0, fail otherwise
0 2 * * * /opt/jobs/etl.sh \\
  && curl -fsS -X POST https://trackify.example/api/runs -H "Authorization: Bearer $TRACKIFY_KEY" -H "Content-Type: application/json" -d '{"pipeline":"nightly-etl","status":"success"}' \\
  || curl -fsS -X POST https://trackify.example/api/runs -H "Authorization: Bearer $TRACKIFY_KEY" -H "Content-Type: application/json" -d '{"pipeline":"nightly-etl","status":"fail"}'`;

const actions = `# .github/workflows/etl.yml — report the outcome of any job
- name: Report to Trackify
  if: always()
  run: |
    curl -fsS -X POST https://trackify.example/api/runs \\
      -H "Authorization: Bearer \${{ secrets.TRACKIFY_KEY }}" \\
      -H "Content-Type: application/json" \\
      -d '{"pipeline":"nightly-etl","status":"\${{ job.status == 'success' && 'success' || 'fail' }}","run_id":"\${{ github.run_id }}"}'`;

const python = `import os, time, requests

BASE = "https://trackify.example/api/runs"
HEADERS = {"Authorization": f"Bearer {os.environ['TRACKIFY_KEY']}"}
run_id = str(int(time.time()))

def ping(status, **extra):
    requests.post(BASE, headers=HEADERS, json={
        "pipeline": "nightly-etl", "status": status, "run_id": run_id, **extra,
    }, timeout=10)

ping("start")
try:
    do_the_work()
    ping("success")
except Exception as e:
    ping("fail", message=str(e)[:500], exit_code=1)
    raise`;

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-medium tracking-tight">Integration</h1>
        <p className="mt-3 text-ink-muted">
          Anything that can make an HTTP request can report to Trackify. One
          endpoint, three ping types.
        </p>

        <h2 className="mt-12 text-lg font-medium">Send a ping</h2>
        <div className="mt-4">
          <SnippetTabs
            tabs={[
              { label: "curl", code: curl },
              { label: "cron", code: cron },
              { label: "GitHub Actions", code: actions },
              { label: "Python", code: python },
            ]}
          />
        </div>

        <h2 className="mt-12 text-lg font-medium">The contract</h2>
        <p className="mt-2 text-sm text-ink-muted">
          <span className="font-mono text-ink">POST /api/runs</span> with your
          API key as a Bearer token. Fields:
        </p>
        <FieldsTable />

        <h2 className="mt-12 text-lg font-medium">Responses</h2>
        <CodesTable />

        <h2 className="mt-12 text-lg font-medium">Run lifecycle</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
          <li>
            <span className="font-mono text-ink">start</span> opens a run;{" "}
            <span className="font-mono text-ink">success</span> /{" "}
            <span className="font-mono text-ink">fail</span> closes it. Send a
            shared <span className="font-mono text-ink">run_id</span> to
            correlate the two and get measured durations.
          </li>
          <li>
            Pings are safe to retry and can arrive out of order — a{" "}
            <span className="font-mono text-ink">success</span> with no prior{" "}
            <span className="font-mono text-ink">start</span> simply records a
            completed run.
          </li>
          <li>
            A pipeline that stays silent past its expected period plus grace is
            marked late, then down — no ping required. That&apos;s the point.
          </li>
        </ul>
      </main>
      <PublicFooter />
    </div>
  );
}

function FieldsTable() {
  const rows: [string, string, string, string][] = [
    ["pipeline", "string", "yes", "Slug of the pipeline to report against"],
    ["status", '"start" | "success" | "fail"', "yes", "What happened"],
    [
      "run_id",
      "string",
      "no",
      "Correlation id — lets start and finish match up",
    ],
    [
      "duration_ms",
      "integer",
      "no",
      "If omitted, measured from start to finish",
    ],
    ["exit_code", "integer", "no", "Process exit code, if any"],
    ["message", "string, max 500", "no", "Short failure reason or note"],
  ];
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-edge bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-edge text-left text-xs text-ink-muted">
            <th className="px-4 py-2 font-medium">Field</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Required</th>
            <th className="px-4 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {rows.map(([field, type, required, notes]) => (
            <tr key={field}>
              <td className="px-4 py-2 font-mono text-xs">{field}</td>
              <td className="px-4 py-2 font-mono text-xs text-ink-muted">
                {type}
              </td>
              <td className="px-4 py-2 text-xs">{required}</td>
              <td className="px-4 py-2 text-xs text-ink-muted">{notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodesTable() {
  const rows: [string, string][] = [
    ["202", "Ping accepted. Response body contains the run's current state."],
    ["401", "Missing, malformed, or revoked API key."],
    ["404", "No pipeline with that slug in your tenant."],
    ["422", "Invalid body — details in the issues array."],
  ];
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-edge bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-edge text-left text-xs text-ink-muted">
            <th className="px-4 py-2 font-medium">Code</th>
            <th className="px-4 py-2 font-medium">Meaning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {rows.map(([code, meaning]) => (
            <tr key={code}>
              <td className="px-4 py-2 font-mono text-xs">{code}</td>
              <td className="px-4 py-2 text-xs text-ink-muted">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-edge px-4 py-2 text-xs text-ink-muted">
        The existence of pipelines outside your tenant is never confirmed — a
        valid key with someone else&apos;s slug gets the same 404 as a typo.
      </p>
    </div>
  );
}
