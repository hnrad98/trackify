"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-md border border-edge px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
