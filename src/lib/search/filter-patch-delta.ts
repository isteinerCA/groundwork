import type { SearchFilters } from "@/lib/types/program";

const MONTH_PATTERN =
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i;

export const MONTH_FILTER_UNEXPRESSIBLE =
  "We can't filter by start month yet — check the Dates line on each program card.";

/** True when the user asks to include or exclude programs by calendar month. */
export function isMonthOrDateFilterRequest(message: string): boolean {
  return MONTH_PATTERN.test(message.trim());
}

function sortedJson(arr: readonly unknown[]): string {
  return JSON.stringify([...arr].sort());
}

function patchValueEqualsCurrent(
  key: keyof SearchFilters,
  patchValue: unknown,
  current: SearchFilters,
): boolean {
  const currentValue = current[key];
  if (Array.isArray(patchValue) && Array.isArray(currentValue)) {
    return sortedJson(patchValue) === sortedJson(currentValue);
  }
  return patchValue === currentValue;
}

/** Remove patch fields that do not change the current filters (including no-op clears). */
export function stripNoOpFilterPatch(
  current: SearchFilters,
  patch: Partial<SearchFilters>,
): Partial<SearchFilters> {
  const stripped: Partial<SearchFilters> = {};

  for (const [key, value] of Object.entries(patch) as [keyof SearchFilters, unknown][]) {
    if (value === undefined) continue;

    if (key === "dataQuery" && value === "" && current.dataQuery === "") continue;
    if (key === "excludeLocation" && value === "" && current.excludeLocation === "") continue;
    if (
      key === "includeRegions" &&
      Array.isArray(value) &&
      value.length === 0 &&
      current.includeRegions.length === 0
    ) {
      continue;
    }
    if (
      key === "includeLocations" &&
      Array.isArray(value) &&
      value.length === 0 &&
      current.includeLocations.length === 0
    ) {
      continue;
    }

    if (patchValueEqualsCurrent(key, value, current)) continue;

    (stripped as Record<string, unknown>)[key] = value;
  }

  return stripped;
}

/** Drop unsupported constraint patches and ensure a helpful unexpressible note. */
export function applyUnsupportedConstraintGuards(
  message: string,
  patch: Partial<SearchFilters>,
  unexpressible: string,
): { filterPatch: Partial<SearchFilters>; unexpressible: string } {
  if (isMonthOrDateFilterRequest(message)) {
    return {
      filterPatch: {},
      unexpressible: unexpressible || MONTH_FILTER_UNEXPRESSIBLE,
    };
  }

  return { filterPatch: patch, unexpressible };
}
