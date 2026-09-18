import Link from "next/link";
import type { RelatedListItem } from "@/lib/content/predefined-list-related";

export function RelatedLists({
  lists,
  heading,
  eyebrow = "Keep exploring",
  headingId = "related-lists-heading",
}: {
  lists: RelatedListItem[];
  heading: string;
  eyebrow?: string;
  headingId?: string;
}) {
  if (lists.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="mt-8 border-t border-[var(--color-border)] pt-8"
    >
      <p className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className="mt-1 font-serif text-xl font-normal text-[var(--color-navy)]"
      >
        {heading}
      </h2>

      <ol className="mt-5 divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        {lists.map((list, index) => (
          <li key={list.slug}>
            <Link
              href={list.href}
              className="group flex items-start gap-4 px-4 py-4 no-underline transition hover:bg-[var(--color-parchment-dark)]/35 sm:px-5"
            >
              <span
                aria-hidden
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-sage)]/50 bg-[var(--color-parchment)] font-serif text-sm text-[var(--color-sage)] transition group-hover:border-[var(--color-sage)] group-hover:text-[var(--color-navy)]"
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-base leading-snug text-[var(--color-navy-light)] transition group-hover:text-[var(--color-navy)]">
                  {list.linkLabel}
                </span>
              </span>
              <span
                aria-hidden
                className="ml-auto hidden shrink-0 self-center text-[var(--color-sage)] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 sm:inline"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
