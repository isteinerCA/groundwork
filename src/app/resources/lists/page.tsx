import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionEyebrow } from "@/components/ui/button-link";
import { PREDEFINED_LISTS } from "@/lib/constants/predefined-lists";

export const metadata = {
  title: "Pre-defined lists · Resources · Groundwork",
  description:
    "Curated starting points for high schoolers exploring summer programs — one list per category.",
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
        <h1 className="mt-2 text-3xl md:text-4xl">Start exploring faster</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)]">
          Ready-made lists for high schoolers — each focused on one category with grades 9th–12th
          already selected. Browse live results, heart programs, and build your shortlist.
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
                {list.exploreLabel}
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
