import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PredefinedListLinks } from "@/components/resources/predefined-list-links";
import { SectionEyebrow } from "@/components/ui/button-link";
import { getListsByGradeBand } from "@/lib/constants/predefined-lists";

export const metadata = {
  title: "Popular ways to explore · Resources · Groundwork",
  description:
    "Start with one of these ready-made searches, then adjust the filters to fit your student.",
};

export default function PredefinedListsPage() {
  const highSchoolLists = getListsByGradeBand("high-school");
  const middleSchoolLists = getListsByGradeBand("middle-school");

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

        <section className="mt-10 space-y-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-surface)] px-5 py-4 shadow-[var(--shadow-card)] sm:mt-12 sm:px-6 sm:py-5">
          <PredefinedListLinks lists={highSchoolLists} title="High schoolers" />
          <PredefinedListLinks lists={middleSchoolLists} title="Middle schoolers" />
        </section>

        <Link
          href="/resources"
          className="mt-10 inline-block text-sm font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)] sm:mt-12"
        >
          ← Back to all resources
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
