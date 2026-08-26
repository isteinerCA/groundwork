export type ResourceCategoryId = "planning" | "choosing-a-program" | "what-weve-learned";

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
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
    label: "Planning",
    description: "Practical guidance on timing and structuring the summer.",
  },
  {
    id: "choosing-a-program" as const,
    label: "Choosing a Program",
    description: "How to evaluate and compare different options.",
  },
  {
    id: "what-weve-learned" as const,
    label: "What We've Learned",
    description:
      "The things we wish we'd known, and what we've learned from navigating summer programs firsthand.",
  },
] as const;

export { RESOURCE_ARTICLES } from "@/lib/content/resource-articles";

import { RESOURCE_ARTICLES } from "@/lib/content/resource-articles";

const ARTICLE_ORDER: Record<ResourceCategoryId, readonly string[]> = {
  planning: [
    "research-vs-pre-college-vs-enrichment",
    "summer-program-vs-internship",
    "do-summer-programs-help-college-admissions",
    "when-should-you-start-applying",
    "what-should-a-9th-grader-do",
    "what-should-a-10th-grader-do",
    "what-should-an-11th-grader-do",
  ],
  "choosing-a-program": [
    "online-or-in-person",
    "are-expensive-pre-college-programs-worth-it",
    "what-does-selective-mean",
    "how-to-evaluate-an-ai-summer-program",
    "how-much-do-summer-programs-cost",
  ],
  "what-weve-learned": [
    "what-does-college-experience-really-look-like",
    "what-makes-a-great-summer-program",
    "when-summer-plans-dont-go-as-planned",
  ],
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
