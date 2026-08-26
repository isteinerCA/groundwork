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

export function getArticlesByCategory(categoryId: ResourceCategoryId) {
  return RESOURCE_ARTICLES.filter((article) => article.categoryId === categoryId);
}

export function getArticleBySlug(slug: string): ResourceArticle | undefined {
  return RESOURCE_ARTICLES.find((article) => article.slug === slug);
}

export function getCategoryById(id: ResourceCategoryId) {
  return RESOURCE_CATEGORIES.find((category) => category.id === id);
}
