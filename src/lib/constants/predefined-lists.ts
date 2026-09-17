import { PROGRAM_CATEGORIES, type ProgramCategoryId } from "@/lib/constants/categories";
import {
  GLOBAL_ADVENTURE_LIST_DEFS,
  type GlobalAdventureGroupId,
  type GlobalAdventureListDef,
} from "@/lib/constants/global-adventure-lists";
import { GRADE_CHIPS } from "@/lib/constants/filters";
import { filterPrograms } from "@/lib/data/filter-programs";
import { getPrograms } from "@/lib/programs";
import type { SearchFilters } from "@/lib/types/program";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/types/program";

export type GradeBand = "high-school" | "middle-school" | "all-grades";

export type PredefinedListKind = "category-grade" | "global-adventure";

export type PredefinedList = {
  slug: string;
  kind: PredefinedListKind;
  gradeBand: GradeBand;
  /** Category display label for list links, e.g. "Pre-College & Credit" */
  exploreLabel: string;
  /** Short label for index links, e.g. "Japan" or "Tech & AI programs for high schoolers" */
  linkLabel: string;
  /** Full middle phrase for page titles, e.g. "Pre-college programs" or "Traditional Camps" */
  titleLabel: string;
  /** e.g. "high schoolers" or "middle schoolers" */
  audienceLabel: string;
  description: string;
  lockedFilters: Partial<SearchFilters>;
  globalAdventureGroup?: GlobalAdventureGroupId;
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

function buildCategoryList(
  category: (typeof PROGRAM_CATEGORIES)[number],
  gradeBand: "high-school" | "middle-school",
): PredefinedList | null {
  const grades =
    gradeBand === "high-school" ? HIGH_SCHOOL_GRADES : MIDDLE_SCHOOL_GRADES;

  if (gradeBand === "middle-school") {
    const count = countCategoryMatches(category.id, grades);
    if (count < MIN_MIDDLE_SCHOOL_RESULTS) return null;
  }

  const slugSuffix =
    gradeBand === "high-school" ? "programs" : "middle-school-programs";
  const titleLabel = pageTitleLabel(category);
  const audienceLabel =
    gradeBand === "high-school" ? "high schoolers" : "middle schoolers";

  return {
    slug: `${category.id}-${slugSuffix}`,
    kind: "category-grade",
    gradeBand,
    exploreLabel: category.label,
    linkLabel: `${titleLabel} for ${audienceLabel}`,
    titleLabel,
    audienceLabel,
    description: gradeDescription(category, gradeBand),
    lockedFilters: {
      categories: [category.id],
      gradesCompleted: [...grades],
    },
  };
}

function buildGlobalAdventureList(def: GlobalAdventureListDef): PredefinedList {
  const titleLabel = def.titleLabel ?? `${def.linkLabel} programs`;

  return {
    slug: def.slug,
    kind: "global-adventure",
    gradeBand: "all-grades",
    globalAdventureGroup: def.group,
    exploreLabel: def.linkLabel,
    linkLabel: def.linkLabel,
    titleLabel,
    audienceLabel: "students in grades 6–12",
    description: `${titleLabel} for students in grades 6–12. Select more filters below to refine your search.`,
    lockedFilters: {
      gradesCompleted: [...GRADE_CHIPS],
      dataQuery: def.dataQuery,
    },
  };
}

const CATEGORY_GRADE_LISTS: PredefinedList[] = PROGRAM_CATEGORIES.flatMap((category) => {
  const highSchool = buildCategoryList(category, "high-school");
  const middleSchool = buildCategoryList(category, "middle-school");
  return [highSchool, middleSchool].filter((list): list is PredefinedList => list != null);
});

export const GLOBAL_ADVENTURE_LISTS: PredefinedList[] =
  GLOBAL_ADVENTURE_LIST_DEFS.map(buildGlobalAdventureList);

export const PREDEFINED_LISTS: PredefinedList[] = [
  ...CATEGORY_GRADE_LISTS,
  ...GLOBAL_ADVENTURE_LISTS,
];

export function getPredefinedListBySlug(slug: string): PredefinedList | undefined {
  return PREDEFINED_LISTS.find((list) => list.slug === slug);
}

export function getListsByGradeBand(
  gradeBand: "high-school" | "middle-school",
): PredefinedList[] {
  return PREDEFINED_LISTS.filter(
    (list) => list.kind === "category-grade" && list.gradeBand === gradeBand,
  );
}

export function getGlobalAdventureListsByGroup(
  groupId: GlobalAdventureGroupId,
): PredefinedList[] {
  return GLOBAL_ADVENTURE_LISTS.filter((list) => list.globalAdventureGroup === groupId);
}

export function getPredefinedListForCategory(
  categoryId: ProgramCategoryId,
  gradeBand: "high-school" | "middle-school",
): PredefinedList | undefined {
  return PREDEFINED_LISTS.find(
    (list) =>
      list.kind === "category-grade" &&
      list.gradeBand === gradeBand &&
      list.lockedFilters.categories?.[0] === categoryId,
  );
}

/** List page when one exists; otherwise the category search fallback. */
export function getCategoryExploreHref(
  categoryId: ProgramCategoryId,
  gradeBand: "high-school" | "middle-school",
): string {
  const list = getPredefinedListForCategory(categoryId, gradeBand);
  return list ? `/resources/lists/${list.slug}` : `/search?category=${categoryId}`;
}
