"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";

export function SnippetTabs({
  tabs,
}: {
  tabs: { label: string; code: string }[];
}) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  if (!tab) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-edge">
      <div className="flex border-b border-edge bg-surface">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2 font-mono text-xs transition-colors ${
              i === active ? "bg-bg text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <pre className="overflow-x-auto bg-bg p-5 font-mono text-xs leading-relaxed">
          {tab.code}
        </pre>
        <CopyButton text={tab.code} />
      </div>
    </div>
  );
}
