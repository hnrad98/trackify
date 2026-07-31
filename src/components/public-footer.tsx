import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 text-sm text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 border-2 border-edge" />
          Trackify
        </div>
        <div className="flex gap-6">
          <Link href="/docs" className="transition-colors hover:text-ink">
            Docs
          </Link>
          <Link href="/login" className="transition-colors hover:text-ink">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
