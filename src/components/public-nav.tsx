import Link from "next/link";

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-20 border-b border-edge bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-3.5 w-3.5 border-2 border-accent" />
          Trackify
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/demo"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            Demo
          </Link>
          <Link
            href="/docs"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            Docs
          </Link>
          <Link
            href="/login"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-accent px-3 py-1.5 font-medium text-bg transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
