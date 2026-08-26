import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionEyebrow } from "@/components/ui/button-link";
import {
  getArticlesByCategory,
  RESOURCE_CATEGORIES,
} from "@/lib/constants/resources";

export default function ResourcesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <SectionEyebrow>Resources</SectionEyebrow>
        <h1 className="mt-2 text-3xl md:text-4xl">Guides for parents</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)]">
          Practical advice on planning, choosing, and making the most of summer programs — drawn
          from our own experience navigating the process.
        </p>

        <div className="mt-14 space-y-16">
          {RESOURCE_CATEGORIES.map((category) => {
            const articles = getArticlesByCategory(category.id);

            return (
              <section key={category.id} id={category.id}>
                <h2 className="text-2xl md:text-3xl">{category.label}</h2>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)]">
                  {category.description}
                </p>

                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/resources/${article.slug}`}
                        className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] no-underline transition-shadow hover:shadow-[0_4px_16px_rgb(18_34_46_/_10%)]"
                      >
                        <h3 className="text-lg font-normal leading-snug text-[var(--color-navy)] group-hover:text-[var(--color-navy-light)]">
                          {article.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                          {article.excerpt}
                        </p>
                        <span className="mt-4 text-sm font-medium text-[var(--color-navy-light)]">
                          Read article →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
