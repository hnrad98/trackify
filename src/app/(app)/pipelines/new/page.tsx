"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createPipeline, type CreatePipelineState } from "./actions";

const initial: CreatePipelineState = { status: "idle" };

export default function NewPipelinePage() {
  const [state, formAction, isPending] = useActionState(
    createPipeline,
    initial,
  );

  if (state.status === "created") {
    return state.rawKey ? (
      <RevealKey rawKey={state.rawKey} slug={state.slug} />
    ) : (
      <Panel title="Pipeline created">
        <p className="text-sm text-ink-muted">
          <span className="font-mono">{state.slug}</span> is waiting for its
          first ping.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-accent hover:underline"
        >
          Back to dashboard
        </Link>
      </Panel>
    );
  }

  if (state.status === "limit") {
    return (
      <Panel title="Pipeline limit reached">
        <p className="text-sm text-ink-muted">
          The free plan includes {state.max} pipelines. Upgrade to Pro to
          monitor up to 50.
        </p>
        <button className="mt-4 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white">
          Upgrade — coming soon
        </button>
      </Panel>
    );
  }

  return (
    <Panel title="New pipeline">
      <form action={formAction} className="space-y-4">
        <label className="block text-sm">
          <span className="text-ink-muted">Name</span>
          <input
            name="name"
            required
            maxLength={60}
            placeholder="Nightly ETL"
            className="mt-1 w-full rounded-md border border-edge bg-bg px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-muted">Expected every</span>
          <select
            name="periodSeconds"
            defaultValue="86400"
            className="mt-1 w-full rounded-md border border-edge bg-bg px-3 py-2"
          >
            <option value="300">5 minutes</option>
            <option value="3600">Hour</option>
            <option value="86400">Day</option>
            <option value="604800">Week</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-ink-muted">Grace period</span>
          <select
            name="graceSeconds"
            defaultValue="600"
            className="mt-1 w-full rounded-md border border-edge bg-bg px-3 py-2"
          >
            <option value="60">1 minute</option>
            <option value="600">10 minutes</option>
            <option value="3600">1 hour</option>
          </select>
        </label>
        {state.status === "invalid" && (
          <p className="text-sm text-down">{state.message}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create pipeline"}
        </button>
      </form>
    </Panel>
  );
}

function RevealKey({ rawKey, slug }: { rawKey: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Panel title="Your API key">
      <p className="text-sm text-ink-muted">
        This key authenticates every ping you send. It is shown{" "}
        <span className="text-ink">only once</span> — store it like a password.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-md border border-edge bg-bg p-3">
        <code className="flex-1 break-all font-mono text-sm">{rawKey}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(rawKey).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="shrink-0 rounded-md border border-edge px-2 py-1 text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        <span className="font-mono">{slug}</span> is now waiting for its first
        ping.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 inline-block text-sm text-accent hover:underline"
      >
        I saved the key — continue
      </Link>
    </Panel>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-edge bg-surface p-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="mt-4">{children}</div>
      </div>
    </main>
  );
}
