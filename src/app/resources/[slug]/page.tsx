import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ArticleContent } from "@/components/resources/article-content";
import { ArticleCta } from "@/components/resources/article-cta";
import { RelatedArticles } from "@/components/resources/related-articles";
import { SectionEyebrow } from "@/components/ui/button-link";
import {
  getArticleBySlug,
  getCategoryById,
  getRelatedArticles,
  RESOURCE_ARTICLES,
} from "@/lib/constants/resources";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return RESOURCE_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return { title: `${article.title} · Resources · Groundwork` };
}

export default async function ResourceArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategoryById(article.categoryId);
  if (!category) notFound();

  const relatedArticles = getRelatedArticles(slug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <nav className="text-sm text-[var(--color-text-muted)]">
          <Link href="/resources" className="font-medium no-underline hover:text-[var(--color-navy)]">
            Resources
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span>{category.label}</span>
        </nav>

        <SectionEyebrow className="mt-6">{category.label}</SectionEyebrow>
        <h1 className="mt-2 text-3xl md:text-4xl">{article.title}</h1>

        <div className="mt-8">
          <ArticleContent blocks={article.blocks} />
          <ArticleCta />
          <RelatedArticles articles={relatedArticles} />
        </div>

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
