export default function PipelineLoading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="skeleton h-4 w-24" />
      <div className="mt-4 flex items-center gap-3">
        <div className="skeleton h-2 w-2 rounded-full" />
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-5 w-32 rounded-full" />
      </div>
      <div className="skeleton mt-2 h-4 w-56" />

      <div className="skeleton mt-10 h-24 rounded-lg" />

      <div className="mt-10 overflow-hidden rounded-lg border border-edge">
        <div className="bg-surface px-4 py-2">
          <div className="skeleton h-3 w-full max-w-md" />
        </div>
        <div className="space-y-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-6 bg-surface px-4 py-3">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-3 w-12" />
              <div className="skeleton h-3 w-14" />
              <div className="skeleton h-3 w-8" />
              <div className="skeleton h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
