export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="skeleton h-6 w-40" />
      <div className="skeleton mt-2 h-4 w-56" />
      <div className="mt-8 space-y-px overflow-hidden rounded-lg border border-edge">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 bg-surface px-5 py-4">
            <div className="skeleton h-2 w-2 rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton mt-1.5 h-3 w-24" />
            </div>
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>
    </main>
  );
}
