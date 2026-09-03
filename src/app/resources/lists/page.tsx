import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionEyebrow } from "@/components/ui/button-link";
import { PREDEFINED_LISTS } from "@/lib/constants/predefined-lists";

export const metadata = {
  title: "Popular ways to explore · Resources · Groundwork",
  description:
    "Start with one of these ready-made searches, then adjust the filters to fit your student.",
};

export default function PredefinedListsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <nav className="text-sm text-[var(--color-text-muted)]">
          <Link
            href="/resources"
            className="font-medium no-underline hover:text-[var(--color-navy)]"
          >
            Resources
          </Link>
        </nav>

        <SectionEyebrow className="mt-6">Pre-defined lists</SectionEyebrow>
        <h1 className="mt-2 text-3xl md:text-4xl">Popular ways to explore</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)]">
          Start with one of these ready-made searches, then adjust the filters to fit your
          student.
        </p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PREDEFINED_LISTS.map((list) => (
            <li
              key={list.slug}
              className="rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
            >
              <Link
                href={`/resources/lists/${list.slug}`}
                className="text-base font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
              >
                {list.exploreLabel} for high schoolers
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {list.description}
              </p>
            </li>
          ))}
        </ul>

        <Link
          href="/resources"
          className="mt-12 inline-block text-sm font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
        >
          ← Back to all resources
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
