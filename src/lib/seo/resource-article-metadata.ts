import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/constants/site-url";
import type { ResourceArticle } from "@/lib/constants/resources";
import { getCategoryById } from "@/lib/constants/resources";

export function buildResourceArticleMetadata(article: ResourceArticle): Metadata {
  const url = absoluteUrl(`/resources/${article.slug}`);
  const category = getCategoryById(article.categoryId);
  const title = `${article.title} · Resources · Groundwork`;

  return {
    title,
    description: article.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      siteName: "Groundwork",
      ...(category && { section: category.label }),
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.excerpt,
    },
  };
}
