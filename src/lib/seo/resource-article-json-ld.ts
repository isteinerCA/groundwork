import { absoluteUrl } from "@/lib/constants/site-url";
import type { ResourceArticle } from "@/lib/constants/resources";
import { getCategoryById } from "@/lib/constants/resources";

export function buildResourceArticleJsonLd(article: ResourceArticle) {
  const url = absoluteUrl(`/resources/${article.slug}`);
  const category = getCategoryById(article.categoryId);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Organization",
      name: "Groundwork",
    },
    publisher: {
      "@type": "Organization",
      name: "Groundwork",
    },
    ...(category && { articleSection: category.label }),
  };
}
