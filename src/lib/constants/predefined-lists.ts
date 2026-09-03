import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import type { SearchFilters } from "@/lib/types/program";

export type PredefinedList = {
  slug: string;
  /** Category display label for list links, e.g. "Pre-College & Credit" */
  exploreLabel: string;
  /** Full middle phrase for page titles, e.g. "pre-college programs" or "Traditional Camps" */
  titleLabel: string;
  description: string;
  lockedFilters: Partial<SearchFilters>;
};

const HIGH_SCHOOL_GRADES = [9, 10, 11, 12] as const;

function pageTitleLabel(category: (typeof PROGRAM_CATEGORIES)[number]): string {
  if (category.id === "traditional-camp") return "Traditional Camps";
  if (category.id === "college-credit-pre-college") return "pre-college programs";
  if (category.id === "arts") return "Arts programs";
  return `${category.label} programs`;
}

/** Each list combines one category with high school grades (9th–12th) pre-selected. */
export const PREDEFINED_LISTS: PredefinedList[] = PROGRAM_CATEGORIES.map((category) => ({
  slug: `${category.id}-programs`,
  exploreLabel: category.label,
  titleLabel: pageTitleLabel(category),
  description: `${category.label} Programs open to students who have completed 9th through 12th grade. Select more filters below to refine your search.`,
  lockedFilters: {
    categories: [category.id],
    gradesCompleted: [...HIGH_SCHOOL_GRADES],
  },
}));

export function getPredefinedListBySlug(slug: string): PredefinedList | undefined {
  return PREDEFINED_LISTS.find((list) => list.slug === slug);
}
