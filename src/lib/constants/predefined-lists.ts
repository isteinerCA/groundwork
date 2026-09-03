import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import { filterPrograms } from "@/lib/data/filter-programs";
import { getPrograms } from "@/lib/programs";
import type { SearchFilters } from "@/lib/types/program";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/types/program";

export type GradeBand = "high-school" | "middle-school";

export type PredefinedList = {
  slug: string;
  gradeBand: GradeBand;
  /** Category display label for list links, e.g. "Pre-College & Credit" */
  exploreLabel: string;
  /** Full middle phrase for page titles, e.g. "Pre-college programs" or "Traditional Camps" */
  titleLabel: string;
  /** e.g. "high schoolers" or "middle schoolers" */
  audienceLabel: string;
  description: string;
  lockedFilters: Partial<SearchFilters>;
};

const MIDDLE_SCHOOL_GRADES = [6, 7, 8] as const;
const HIGH_SCHOOL_GRADES = [9, 10, 11, 12] as const;

/** Middle school lists are omitted when a category has fewer matches than this. */
const MIN_MIDDLE_SCHOOL_RESULTS = 6;

function pageTitleLabel(category: (typeof PROGRAM_CATEGORIES)[number]): string {
  if (category.id === "traditional-camp") return "Traditional Camps";
  if (category.id === "college-credit-pre-college") return "Pre-college programs";
  if (category.id === "arts") return "Arts programs";
  return `${category.label} programs`;
}

function gradeDescription(
  category: (typeof PROGRAM_CATEGORIES)[number],
  gradeBand: GradeBand,
): string {
  const gradeRange =
    gradeBand === "high-school"
      ? "9th through 12th grade"
      : "6th through 8th grade";

  return `${category.label} Programs open to students who have completed ${gradeRange}. Select more filters below to refine your search.`;
}

function countCategoryMatches(
  categoryId: (typeof PROGRAM_CATEGORIES)[number]["id"],
  gradesCompleted: readonly number[],
): number {
  return filterPrograms(getPrograms(), {
    ...DEFAULT_SEARCH_FILTERS,
    categories: [categoryId],
    gradesCompleted: [...gradesCompleted],
  }).length;
}

function buildList(
  category: (typeof PROGRAM_CATEGORIES)[number],
  gradeBand: GradeBand,
): PredefinedList | null {
  const grades =
    gradeBand === "high-school" ? HIGH_SCHOOL_GRADES : MIDDLE_SCHOOL_GRADES;

  if (gradeBand === "middle-school") {
    const count = countCategoryMatches(category.id, grades);
    if (count < MIN_MIDDLE_SCHOOL_RESULTS) return null;
  }

  const slugSuffix =
    gradeBand === "high-school" ? "programs" : "middle-school-programs";

  return {
    slug: `${category.id}-${slugSuffix}`,
    gradeBand,
    exploreLabel: category.label,
    titleLabel: pageTitleLabel(category),
    audienceLabel: gradeBand === "high-school" ? "high schoolers" : "middle schoolers",
    description: gradeDescription(category, gradeBand),
    lockedFilters: {
      categories: [category.id],
      gradesCompleted: [...grades],
    },
  };
}

export const PREDEFINED_LISTS: PredefinedList[] = PROGRAM_CATEGORIES.flatMap((category) => {
  const highSchool = buildList(category, "high-school");
  const middleSchool = buildList(category, "middle-school");
  return [highSchool, middleSchool].filter((list): list is PredefinedList => list != null);
});

export function getPredefinedListBySlug(slug: string): PredefinedList | undefined {
  return PREDEFINED_LISTS.find((list) => list.slug === slug);
}

export function getListsByGradeBand(gradeBand: GradeBand): PredefinedList[] {
  return PREDEFINED_LISTS.filter((list) => list.gradeBand === gradeBand);
}
