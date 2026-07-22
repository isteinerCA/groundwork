import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-parchment)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 no-underline">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-navy)] text-sm text-white"
            aria-hidden
          >
            G
          </span>
          <span className="font-serif text-xl text-[var(--color-navy)] group-hover:text-[var(--color-navy-light)]">
            Groundwork
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <Link
            href="/dashboard"
            className="hidden text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)] sm:inline"
          >
            Dashboard
          </Link>
          <Link
            href="/search"
            className="hidden text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)] sm:inline"
          >
            Search programs
          </Link>
          <Link
            href="/#about"
            className="hidden text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)] md:inline"
          >
            About this list
          </Link>
          <Link
            href="/search"
            className="rounded-[var(--radius-md)] bg-[var(--color-navy)] px-4 py-2 text-sm font-medium text-white no-underline hover:bg-[var(--color-navy-light)]"
          >
            Start searching
          </Link>
        </nav>
      </div>
    </header>
  );
}
