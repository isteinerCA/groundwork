import Link from "next/link";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import { getDataVerifiedAt } from "@/lib/programs";

export default function HomePage() {
  const dataVerifiedAt = getDataVerifiedAt();

  return (
    <main>
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-8 px-6 py-16">
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
        {dataVerifiedAt && (
          <p className="self-center text-sm text-[var(--color-text-muted)]">
            Program data last verified {dataVerifiedAt}
          </p>
        )}
      </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl">Explore program categories</h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Twelve pathways. Countless opportunities.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAM_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/search?category=${cat.id}`}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 text-left no-underline shadow-[var(--shadow-card)] transition hover:border-[var(--color-navy-light)]"
              >
                <h3 className="text-lg text-[var(--color-navy)]">{cat.label}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
