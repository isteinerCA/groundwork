import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionEyebrow } from "@/components/ui/button-link";
import { PREDEFINED_LISTS } from "@/lib/constants/predefined-lists";
import {
  getArticlesByCategory,
  MAIN_RESOURCE_CATEGORIES,
} from "@/lib/constants/resources";

export default function ResourcesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <SectionEyebrow>Resources</SectionEyebrow>
        <h1 className="sr-only">Resources</h1>
        <p className="mt-2 text-lg leading-relaxed text-[var(--color-text-muted)]">
          Practical advice on planning, choosing, and making the most of summer programs, drawn
          from our own experience navigating the process.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-start lg:gap-8">
          {MAIN_RESOURCE_CATEGORIES.map((category) => {
            const articles = getArticlesByCategory(category.id);

            return (
              <section
                key={category.id}
                id={category.id}
                className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
              >
                <div className="min-h-[10.5rem] border-b border-[var(--color-sage)] bg-[var(--color-sage-soft)] px-6 py-4 sm:py-5">
                  <h2 className="text-2xl leading-snug md:text-[1.75rem]">{category.label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {category.description}
                  </p>
                </div>

                <ul className="space-y-3 px-6 py-5">
                  {articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/resources/${article.slug}`}
                        className="text-base leading-snug text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <section className="mt-14 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-sage)] bg-[var(--color-sage-soft)] px-6 py-5">
            <h2 className="text-2xl leading-snug md:text-[1.75rem]">Popular ways to explore</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              Start with one of these ready-made searches, then adjust the filters to fit your
              student.
            </p>
          </div>

          <div className="px-6 py-5">
            <ul className="columns-1 gap-x-8 sm:columns-2 lg:columns-3">
              {PREDEFINED_LISTS.map((list) => (
                <li key={list.slug} className="mb-2 break-inside-avoid">
                  <Link
                    href={`/resources/lists/${list.slug}`}
                    className="text-base leading-snug text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
                  >
                    {list.exploreLabel} for high schoolers
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/resources/lists"
              className="mt-6 inline-block text-sm font-medium text-[var(--color-navy)] underline decoration-[var(--color-sage)] underline-offset-[0.2em] hover:decoration-[var(--color-navy)]"
            >
              View all ready-made searches
            </Link>
          </div>
        </section>

        <p className="mt-10 border-t border-[var(--color-border)] pt-8 text-base leading-relaxed text-[var(--color-text-muted)]">
          Also from Groundwork: See what we learned from analyzing our 2026 catalog in{" "}
          <Link
            href="/resources/summer-programs-by-the-numbers"
            className="font-medium text-[var(--color-navy)] underline decoration-[var(--color-sage)] underline-offset-[0.2em] hover:decoration-[var(--color-navy)]"
          >
            Summer Programs by the Numbers
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
