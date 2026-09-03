import type { ActiveFilterItem } from "@/lib/search-filter-labels";
import type { SearchFilters } from "@/lib/types/program";

function lockedGradeKeys(lockedFilters?: Partial<SearchFilters>): Set<string> {
  return new Set((lockedFilters?.gradesCompleted ?? []).map((grade) => `grade-${grade}`));
}

function lockedCategoryKeys(lockedFilters?: Partial<SearchFilters>): Set<string> {
  return new Set((lockedFilters?.categories ?? []).map((category) => `cat-${category}`));
}

function lockedAdmissionKeys(lockedFilters?: Partial<SearchFilters>): Set<string> {
  return new Set(
    (lockedFilters?.admissionTypes ?? []).map((admission) => `adm-${admission}`),
  );
}

function lockedFormatKeys(lockedFilters?: Partial<SearchFilters>): Set<string> {
  return new Set((lockedFilters?.formats ?? []).map((format) => `fmt-${format}`));
}

export function isFilterItemLocked(
  item: ActiveFilterItem,
  lockedFilters?: Partial<SearchFilters>,
): boolean {
  if (!lockedFilters) return false;

  if (lockedGradeKeys(lockedFilters).has(item.key)) return true;
  if (lockedCategoryKeys(lockedFilters).has(item.key)) return true;
  if (lockedAdmissionKeys(lockedFilters).has(item.key)) return true;
  if (lockedFormatKeys(lockedFilters).has(item.key)) return true;

  if (item.key.startsWith("dur-") && lockedFilters.durationBuckets?.length) {
    const durationId = item.key.slice("dur-".length);
    return lockedFilters.durationBuckets.includes(
      durationId as SearchFilters["durationBuckets"][number],
    );
  }

  if (item.key === "price" && lockedFilters.priceFilter && lockedFilters.priceFilter !== "any") {
    return true;
  }

  if (item.key === "max-price" && lockedFilters.maxPrice != null) return true;
  if (item.key === "min-price" && lockedFilters.minPrice != null) return true;
  if (item.key === "duration-weeks") {
    return lockedFilters.minDurationWeeks != null || lockedFilters.maxDurationWeeks != null;
  }
  if (item.key === "credit" && lockedFilters.collegeCreditOnly) return true;
  if (item.key === "funded" && lockedFilters.fullyFundedOnly) return true;
  if (item.key === "us" && lockedFilters.usOnly) return true;
  if (item.key === "unknown-price" && lockedFilters.excludeUnknownPrice) return true;
  if (item.key === "data-query" && lockedFilters.dataQuery?.trim()) return true;
  if (item.key === "exclude-location" && lockedFilters.excludeLocation?.trim()) return true;

  if (item.key.startsWith("region-") && lockedFilters.includeRegions?.length) {
    const regionId = item.key.slice("region-".length);
    return lockedFilters.includeRegions.includes(
      regionId as SearchFilters["includeRegions"][number],
    );
  }

  if (item.key.startsWith("loc-") && lockedFilters.includeLocations?.length) {
    const location = item.key.slice("loc-".length);
    return lockedFilters.includeLocations.includes(location);
  }

  if (item.key.startsWith("month-") && lockedFilters.includeMonths?.length) {
    const month = Number(item.key.slice("month-".length));
    return lockedFilters.includeMonths.includes(
      month as SearchFilters["includeMonths"][number],
    );
  }

  if (item.key.startsWith("exclude-month-") && lockedFilters.excludeMonths?.length) {
    const month = Number(item.key.slice("exclude-month-".length));
    return lockedFilters.excludeMonths.includes(
      month as SearchFilters["excludeMonths"][number],
    );
  }

  return false;
}
