import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import type { SearchFilters } from "@/lib/types/program";

export type PredefinedList = {
  slug: string;
  /** Used in the page heading: "Start exploring programs for {exploreLabel}" */
  exploreLabel: string;
  description: string;
  lockedFilters: Partial<SearchFilters>;
};

const HIGH_SCHOOL_GRADES = [9, 10, 11, 12] as const;

/** Each list combines one category with high school grades (9th–12th) pre-selected. */
export const PREDEFINED_LISTS: PredefinedList[] = PROGRAM_CATEGORIES.map((category) => ({
  slug: category.id,
  exploreLabel: `${category.label} for high schoolers`,
  description: `${category.description} Programs open to students who have completed 9th through 12th grade.`,
  lockedFilters: {
    categories: [category.id],
    gradesCompleted: [...HIGH_SCHOOL_GRADES],
  },
}));

export function getPredefinedListBySlug(slug: string): PredefinedList | undefined {
  return PREDEFINED_LISTS.find((list) => list.slug === slug);
}
