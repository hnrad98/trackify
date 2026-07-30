"use client";

import { useState } from "react";

export function CopyButton({
  text,
  className = "absolute right-2 top-2",
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className={`${className} rounded-md border border-edge bg-surface px-2 py-1 text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
