"use client";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-edge bg-surface p-6 text-center">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The dashboard hit an unexpected error. Your data is fine.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
