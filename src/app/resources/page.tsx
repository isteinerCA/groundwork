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
        <h1 className="mt-2 max-w-3xl text-3xl leading-snug md:text-4xl">
          Practical advice on planning, choosing, and making the most of summer programs, drawn
          from our own experience navigating the process.
        </h1>

        <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {RESOURCE_CATEGORIES.map((category) => {
            const articles = getArticlesByCategory(category.id);

            return (
              <section key={category.id} id={category.id}>
                <h2 className="text-xl md:text-2xl">{category.label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {category.description}
                </p>

                <ul className="mt-5 space-y-3">
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
      </main>
      <SiteFooter />
    </>
  );
}
