import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants/brand";
import { absoluteUrl } from "@/lib/constants/site-url";
import { OPEN_GRAPH_IMAGE, TWITTER_CARD_METADATA } from "@/lib/seo/og-image";
import type { ResourceArticle } from "@/lib/constants/resources";
import { getCategoryById } from "@/lib/constants/resources";

export function buildResourceArticleMetadata(article: ResourceArticle): Metadata {
  const url = absoluteUrl(`/resources/${article.slug}`);
  const category = getCategoryById(article.categoryId);
  const title = `${article.title} · Resources · ${SITE_NAME}`;

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
      siteName: SITE_NAME,
      images: [OPEN_GRAPH_IMAGE],
      ...(category && { section: category.label }),
    },
    twitter: {
      ...TWITTER_CARD_METADATA,
      title: article.title,
      description: article.excerpt,
    },
  };
}
