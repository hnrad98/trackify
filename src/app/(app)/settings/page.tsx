import { requireSession } from "@/lib/require-session";
import { getTenant } from "@/db/repo/tenants";
import { listApiKeys } from "@/db/repo/api-keys";
import { countPipelines } from "@/db/repo/pipelines";
import { PLAN_LIMITS } from "@/lib/plans";
import { timeAgo } from "@/lib/format";
import { NewKeyPanel } from "./new-key-panel";
import { revokeKey } from "./actions";

export default async function SettingsPage() {
  const { tenantId, user } = await requireSession();
  const [tenant, keys, pipelineCount] = await Promise.all([
    getTenant(tenantId),
    listApiKeys(tenantId),
    countPipelines(tenantId),
  ]);
  const limits = PLAN_LIMITS[tenant.plan];
  const usagePct = Math.min(100, (pipelineCount / limits.maxPipelines) * 100);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {tenant.name} · signed in as{" "}
        <span className="font-mono">{user.email}</span>
      </p>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink-muted">Plan</h2>
        <div className="mt-3 rounded-lg border border-edge bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="font-medium uppercase">{tenant.plan}</span>
            <span className="font-mono text-sm text-ink-muted">
              {pipelineCount}/{limits.maxPipelines} pipelines
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-edge">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            {limits.retentionDays}-day run retention ·{" "}
            {limits.webhookAlerts ? "webhook + in-app alerts" : "in-app alerts"}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-muted">API keys</h2>
        </div>
        <div className="mt-3 space-y-4">
          <NewKeyPanel />
          <div className="overflow-x-auto rounded-lg border border-edge bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge text-left text-xs text-ink-muted">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Key</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                  <th className="px-4 py-2 font-medium">Last used</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {keys.map((k) => (
                  <tr key={k.id} className={k.revokedAt ? "opacity-50" : ""}>
                    <td className="px-4 py-2 text-xs">{k.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-ink-muted">
                      {k.keyPrefix}…
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-ink-muted">
                      {timeAgo(k.createdAt)}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-ink-muted">
                      {timeAgo(k.lastUsedAt)}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {k.revokedAt ? (
                        <span className="text-ink-muted">revoked</span>
                      ) : (
                        <span className="text-up">active</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {!k.revokedAt && (
                        <form action={revokeKey}>
                          <input type="hidden" name="keyId" value={k.id} />
                          <button className="text-xs text-down transition-opacity hover:opacity-75">
                            Revoke
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
