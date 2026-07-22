import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
        Groundwork
      </p>
      <h1 className="text-4xl leading-tight font-normal md:text-5xl">
        The summer that changes everything starts here.
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-[var(--color-text-muted)]">
        Hundreds of programs across science, arts, wilderness, pre-college, and
        more — filter by grade, interest, format, and budget to build a
        shortlist in minutes, not hours.
      </p>
      <p className="text-[var(--color-text-muted)]">
        Plus the fine print — acceptance floors, deposit policies, and safety
        records — so you can apply with confidence.
      </p>
      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/search"
          className="rounded-[var(--radius-md)] bg-[var(--color-navy)] px-5 py-2.5 text-sm font-medium text-white no-underline shadow-[var(--shadow-card)] hover:bg-[var(--color-navy-light)]"
        >
          Search programs
        </Link>
        <span className="self-center text-sm text-[var(--color-text-muted)]">
          Sprint 1 scaffold — search UI coming in Sprint 2
        </span>
      </div>
    </main>
  );
}
