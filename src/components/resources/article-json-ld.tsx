import { buildResourceArticleJsonLd } from "@/lib/seo/resource-article-json-ld";
import type { ResourceArticle } from "@/lib/constants/resources";

export function ArticleJsonLd({ article }: { article: ResourceArticle }) {
  const jsonLd = buildResourceArticleJsonLd(article);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
