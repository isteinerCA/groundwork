import { PROGRAM_CATEGORIES, type ProgramCategoryId } from "@/lib/constants/categories";
import {
  GRADE_CHIPS,
  PROGRAM_FORMATS,
  type GradeCompleted,
  type ProgramFormatId,
} from "@/lib/constants/filters";
import type { PredefinedList } from "@/lib/constants/predefined-lists";
import type { SearchFilters } from "@/lib/types/program";

function isValidCategory(value: string): value is ProgramCategoryId {
  return PROGRAM_CATEGORIES.some((category) => category.id === value);
}

function isValidFormat(value: string): value is ProgramFormatId {
  return PROGRAM_FORMATS.some((format) => format.id === value);
}

function parseGradesParam(value: string): number[] {
  return value
    .split(",")
    .map((grade) => Number.parseInt(grade.trim(), 10))
    .filter(
      (grade): grade is GradeCompleted =>
        GRADE_CHIPS.includes(grade as GradeCompleted),
    );
}

/** Build `/search` URL query string from optional filter seeds (unlocked on the search page). */
export function buildSearchUrl(filters: Partial<SearchFilters>): string {
  const params = new URLSearchParams();

  const dataQuery = filters.dataQuery?.trim();
  if (dataQuery) {
    params.set("q", dataQuery);
  }

  if (filters.usOnly) {
    params.set("us", "1");
  }

  if (filters.internationalOnly) {
    params.set("international", "1");
  }

  if (filters.includeLocations?.length) {
    params.set("locations", filters.includeLocations.join(","));
  }

  if (filters.categories?.length === 1) {
    params.set("category", filters.categories[0]);
  }

  if (filters.gradesCompleted?.length) {
    params.set("grades", filters.gradesCompleted.join(","));
  }

  if (filters.fullyFundedOnly) {
    params.set("fullyFunded", "1");
  }

  if (filters.formats?.length === 1) {
    params.set("format", filters.formats[0]);
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

/** Seed the main search page from a ready-made list's locked topic filters. */
export function buildSearchUrlFromList(list: PredefinedList): string {
  const { lockedFilters } = list;
  const seed: Partial<SearchFilters> = {};

  if (lockedFilters.dataQuery?.trim()) {
    seed.dataQuery = lockedFilters.dataQuery.trim();
  }

  if (lockedFilters.internationalOnly) {
    seed.internationalOnly = true;
  }

  if (lockedFilters.usOnly) {
    seed.usOnly = true;
  }

  if (lockedFilters.includeLocations?.length) {
    seed.includeLocations = [...lockedFilters.includeLocations];
  }

  if (lockedFilters.categories?.length) {
    seed.categories = [...lockedFilters.categories];
  }

  const lockedGrades = lockedFilters.gradesCompleted ?? [];
  const isAllGrades =
    lockedGrades.length === GRADE_CHIPS.length &&
    GRADE_CHIPS.every((grade) => lockedGrades.includes(grade));

  if (lockedGrades.length > 0 && !isAllGrades) {
    seed.gradesCompleted = [...lockedGrades];
  }

  return buildSearchUrl(seed);
}

export function parseSearchFiltersFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): Partial<SearchFilters> {
  const value = (key: string): string | undefined => {
    const raw = params[key];
    return typeof raw === "string" ? raw : undefined;
  };

  const seed: Partial<SearchFilters> = {};

  const dataQuery = value("q");
  if (dataQuery) {
    seed.dataQuery = dataQuery;
  }

  if (value("us") === "1") {
    seed.usOnly = true;
  }

  if (value("international") === "1") {
    seed.internationalOnly = true;
  }

  const locations = value("locations");
  if (locations) {
    seed.includeLocations = locations
      .split(",")
      .map((location) => location.trim())
      .filter(Boolean);
  }

  const category = value("category");
  if (category && isValidCategory(category)) {
    seed.categories = [category];
  }

  const grades = value("grades");
  if (grades) {
    seed.gradesCompleted = parseGradesParam(grades);
  }

  if (value("fullyFunded") === "1") {
    seed.fullyFundedOnly = true;
  }

  const format = value("format");
  if (format && isValidFormat(format)) {
    seed.formats = [format];
  }

  return seed;
}

export function hasSearchUrlSeed(filters: Partial<SearchFilters>): boolean {
  return Boolean(
    filters.dataQuery?.trim() ||
      filters.usOnly ||
      filters.internationalOnly ||
      filters.includeLocations?.length ||
      filters.categories?.length ||
      filters.gradesCompleted?.length ||
      filters.fullyFundedOnly ||
      filters.formats?.length,
  );
}
