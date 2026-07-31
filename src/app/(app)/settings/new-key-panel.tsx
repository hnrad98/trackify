"use client";

import { useActionState } from "react";
import { CopyButton } from "@/components/copy-button";
import { createKey, type CreateKeyState } from "./actions";

const initial: CreateKeyState = { rawKey: null };

export function NewKeyPanel() {
  const [state, formAction, isPending] = useActionState(createKey, initial);

  if (state.rawKey) {
    return (
      <div className="rounded-lg border border-edge bg-surface p-4">
        <p className="text-sm">
          New key created — shown <span className="font-medium">only once</span>
          :
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-md border border-edge bg-bg p-3">
          <code className="flex-1 break-all font-mono text-sm">
            {state.rawKey}
          </code>
          <CopyButton text={state.rawKey} className="shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex gap-2">
      <input
        name="name"
        placeholder="Key name (e.g. production)"
        className="flex-1 rounded-md border border-edge bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
      >
        {isPending ? "Creating…" : "New key"}
      </button>
    </form>
  );
}
