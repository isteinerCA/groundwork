import Link from "next/link";
import type { ResourceArticle } from "@/lib/constants/resources";

type RelatedArticle = ResourceArticle & {
  categoryLabel: string;
};

export function RelatedArticles({ articles }: { articles: RelatedArticle[] }) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-articles-heading"
      className="mt-8 border-t border-[var(--color-border)] pt-8"
    >
      <p className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        Keep reading
      </p>
      <h2
        id="related-articles-heading"
        className="mt-1 font-serif text-xl font-normal text-[var(--color-navy)]"
      >
        Related articles
      </h2>

      <ol className="mt-5 divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        {articles.map((article, index) => (
          <li key={article.slug}>
            <Link
              href={`/resources/${article.slug}`}
              className="group flex items-start gap-4 px-4 py-4 no-underline transition hover:bg-[var(--color-parchment-dark)]/35 sm:px-5"
            >
              <span
                aria-hidden
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-sage)]/50 bg-[var(--color-parchment)] font-serif text-sm text-[var(--color-sage)] transition group-hover:border-[var(--color-sage)] group-hover:text-[var(--color-navy)]"
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-[var(--color-text-muted)]">
                  {article.categoryLabel}
                </span>
                <span className="mt-1 block text-base leading-snug text-[var(--color-navy-light)] transition group-hover:text-[var(--color-navy)]">
                  {article.title}
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
