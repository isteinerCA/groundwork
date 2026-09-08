import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ArticleContent } from "@/components/resources/article-content";
import { ArticleCta } from "@/components/resources/article-cta";
import { ArticleJsonLd } from "@/components/resources/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/resources/breadcrumb-json-ld";
import { Breadcrumbs } from "@/components/resources/breadcrumbs";
import { RelatedArticles } from "@/components/resources/related-articles";
import { SectionEyebrow } from "@/components/ui/button-link";
import {
  getArticleBySlug,
  getCategoryById,
  getRelatedArticles,
  RESOURCE_ARTICLES,
} from "@/lib/constants/resources";
import { buildResourceArticleMetadata } from "@/lib/seo/resource-article-metadata";
import { getArticleBreadcrumbs } from "@/lib/seo/resource-breadcrumbs";

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
  return buildResourceArticleMetadata(article);
}

export default async function ResourceArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategoryById(article.categoryId);
  if (!category) notFound();

  const relatedArticles = getRelatedArticles(slug);
  const breadcrumbs = getArticleBreadcrumbs(article);

  return (
    <>
      <ArticleJsonLd article={article} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <Breadcrumbs items={breadcrumbs} />

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
