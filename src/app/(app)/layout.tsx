import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b border-edge bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="inline-block h-3.5 w-3.5 border-2 border-accent" />
            Trackify
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Settings
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
