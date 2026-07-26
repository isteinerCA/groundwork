import type { SearchFilters } from "@/lib/types/program";

export function mergeFilterPatch(
  current: SearchFilters,
  patch: Partial<SearchFilters>,
): SearchFilters {
  return { ...current, ...patch };
}
