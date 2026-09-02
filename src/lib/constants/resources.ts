export type ResourceCategoryId =
  | "planning"
  | "choosing-a-program"
  | "what-weve-learned"
  | "also-from-groundwork";

export type ArticleBlock =
  | { type: "paragraph"; text: string; links?: { text: string; slug: string }[] }
  | { type: "list"; items: string[]; links?: { text: string; slug: string }[] }
  | { type: "subheading"; text: string }
  | { type: "tip"; text: string };

export type ResourceArticle = {
  slug: string;
  categoryId: ResourceCategoryId;
  title: string;
  excerpt: string;
  blocks: ArticleBlock[];
};

export const RESOURCE_CATEGORIES = [
  {
    id: "planning" as const,
    label: "Planning your summer",
    description: "Practical guidance on structuring the summer and timing of decisions.",
  },
  {
    id: "choosing-a-program" as const,
    label: "Choosing a Program",
    description: "How to evaluate and compare different options.",
  },
  {
    id: "what-weve-learned" as const,
    label: "What We've Learned",
    description: "Lessons we've learned from navigating summer programs firsthand.",
  },
  {
    id: "also-from-groundwork" as const,
    label: "Also from Groundwork",
    description: "Insights drawn from Groundwork's program research and catalog data.",
  },
] as const;

export const MAIN_RESOURCE_CATEGORIES = RESOURCE_CATEGORIES.filter(
  (category) => category.id !== "also-from-groundwork",
);

export { RESOURCE_ARTICLES } from "@/lib/content/resource-articles";

import { RESOURCE_ARTICLES } from "@/lib/content/resource-articles";
import { RESOURCE_ARTICLE_RECOMMENDATIONS } from "@/lib/content/resource-article-recommendations";

const ARTICLE_ORDER: Record<ResourceCategoryId, readonly string[]> = {
  planning: [
    "research-vs-pre-college-vs-enrichment",
    "summer-program-vs-internship",
    "do-summer-programs-help-college-admissions",
    "how-can-a-student-build-momentum-after-the-program-ends",
    "when-should-you-start-applying",
    "what-should-a-9th-grader-do",
    "what-should-a-10th-grader-do",
    "what-should-an-11th-grader-do",
  ],
  "choosing-a-program": [
    "how-to-tell-if-a-summer-program-is-a-good-fit",
    "online-or-in-person",
    "are-expensive-pre-college-programs-worth-it",
    "what-does-selective-mean",
    "how-to-evaluate-an-ai-summer-program",
    "how-much-do-summer-programs-cost",
  ],
  "what-weve-learned": [
    "what-does-college-experience-really-look-like",
    "what-makes-a-great-summer-program",
    "fitting-programs-into-family-calendars-and-budgets",
    "supporting-student-independence-without-over-managing",
    "when-summer-plans-dont-go-as-planned",
    "when-a-summer-program-changes-the-question",
  ],
  "also-from-groundwork": ["summer-programs-by-the-numbers"],
};

export function getArticlesByCategory(categoryId: ResourceCategoryId) {
  const articles = RESOURCE_ARTICLES.filter((article) => article.categoryId === categoryId);
  const order = ARTICLE_ORDER[categoryId];

  return [...articles].sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug),
  );
}

export function getArticleBySlug(slug: string): ResourceArticle | undefined {
  return RESOURCE_ARTICLES.find((article) => article.slug === slug);
}

export function getCategoryById(id: ResourceCategoryId) {
  return RESOURCE_CATEGORIES.find((category) => category.id === id);
}

export function getRelatedArticles(slug: string) {
  const relatedSlugs = RESOURCE_ARTICLE_RECOMMENDATIONS[slug] ?? [];

  return relatedSlugs.flatMap((relatedSlug) => {
    const article = getArticleBySlug(relatedSlug);
    const category = article ? getCategoryById(article.categoryId) : undefined;

    if (!article || !category) {
      return [];
    }

    return [{ ...article, categoryLabel: category.label }];
  });
}
