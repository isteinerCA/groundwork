import type { SearchFilters } from "@/lib/types/program";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/types/program";

/** Re-apply locked filter values after any user change. */
export function applyLockedFilters(
  filters: SearchFilters,
  lockedFilters?: Partial<SearchFilters>,
): SearchFilters {
  if (!lockedFilters) return filters;
  return { ...filters, ...lockedFilters };
}

/** Reset optional filters while keeping locked preset values. */
export function clearFiltersKeepingLocked(
  lockedFilters?: Partial<SearchFilters>,
): SearchFilters {
  return applyLockedFilters(DEFAULT_SEARCH_FILTERS, lockedFilters);
}

export function isGradeLocked(
  grade: number,
  lockedFilters?: Partial<SearchFilters>,
): boolean {
  return lockedFilters?.gradesCompleted?.includes(grade) ?? false;
}

export function isCategoryLocked(
  categoryId: string,
  lockedFilters?: Partial<SearchFilters>,
): boolean {
  return lockedFilters?.categories?.includes(categoryId as SearchFilters["categories"][number]) ?? false;
}
