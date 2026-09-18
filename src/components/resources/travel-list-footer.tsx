import Link from "next/link";
import { RelatedArticles } from "@/components/resources/related-articles";
import { RelatedLists } from "@/components/resources/related-lists";
import type { PredefinedList } from "@/lib/constants/predefined-lists";
import {
  getCategoryById,
  getArticleBySlug,
  type ResourceArticle,
} from "@/lib/constants/resources";
import {
  getRelatedListsForTravelList,
  getRelatedListsHeading,
  getTravelListHubLink,
  TRAVEL_LIST_ARTICLE_SLUGS,
} from "@/lib/content/predefined-list-related";

type ArticleWithCategory = ResourceArticle & {
  categoryLabel: string;
};

function getTravelListArticles(): ArticleWithCategory[] {
  return TRAVEL_LIST_ARTICLE_SLUGS.flatMap((slug) => {
    const article = getArticleBySlug(slug);
    const category = article ? getCategoryById(article.categoryId) : undefined;

    if (!article || !category) {
      return [];
    }

    return [{ ...article, categoryLabel: category.label }];
  });
}

export function TravelListFooter({ list }: { list: PredefinedList }) {
  const articles = getTravelListArticles();
  const relatedLists = getRelatedListsForTravelList(list);
  const relatedListsHeading = getRelatedListsHeading(list);
  const hubLink = getTravelListHubLink(list);

  return (
    <>
      <RelatedArticles
        articles={articles}
        eyebrow="Recommended reading"
        heading="Teen travel planning"
      />
      <RelatedLists lists={relatedLists} heading={relatedListsHeading} />
      {hubLink ? (
        <Link
          href={hubLink.href}
          className="mt-8 inline-block text-sm font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
        >
          {hubLink.label}
        </Link>
      ) : null}
    </>
  );
}
