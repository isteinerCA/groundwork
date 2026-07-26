import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  PRICE_FILTERS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
import { getMonthLabel } from "@/lib/constants/months";
import { formatDataQueryLabel } from "@/lib/search/format-data-query-label";
import { getRegionLabel } from "@/lib/data/us-regions";
import type { SearchFilters } from "@/lib/types/program";

export interface ActiveFilterItem {
  key: string;
  label: string;
  remove: Partial<SearchFilters>;
}

export function getActiveFilterItems(filters: SearchFilters): ActiveFilterItem[] {
  const items: ActiveFilterItem[] = [];

  for (const grade of filters.gradesCompleted) {
    items.push({
      key: `grade-${grade}`,
      label: `${grade}th grade`,
      remove: {
        gradesCompleted: filters.gradesCompleted.filter((g) => g !== grade),
      },
    });
  }

  for (const categoryId of filters.categories) {
    const label = PROGRAM_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
    items.push({
      key: `cat-${categoryId}`,
      label,
      remove: {
        categories: filters.categories.filter((c) => c !== categoryId),
      },
    });
  }

  for (const admissionId of filters.admissionTypes) {
    const label = ADMISSION_TYPES.find((a) => a.id === admissionId)?.label ?? admissionId;
    items.push({
      key: `adm-${admissionId}`,
      label,
      remove: {
        admissionTypes: filters.admissionTypes.filter((a) => a !== admissionId),
      },
    });
  }

  for (const formatId of filters.formats) {
    const label = PROGRAM_FORMATS.find((f) => f.id === formatId)?.label ?? formatId;
    items.push({
      key: `fmt-${formatId}`,
      label,
      remove: { formats: filters.formats.filter((f) => f !== formatId) },
    });
  }

  for (const durationId of filters.durationBuckets) {
    const label = DURATION_BUCKETS.find((d) => d.id === durationId)?.label ?? durationId;
    items.push({
      key: `dur-${durationId}`,
      label,
      remove: {
        durationBuckets: filters.durationBuckets.filter((d) => d !== durationId),
      },
    });
  }

  if (filters.priceFilter !== "any") {
    const label = PRICE_FILTERS.find((p) => p.id === filters.priceFilter)?.label ?? filters.priceFilter;
    items.push({
      key: "price",
      label,
      remove: { priceFilter: "any" },
    });
  }

  if (filters.maxPrice != null) {
    items.push({
      key: "max-price",
      label: `Under $${filters.maxPrice.toLocaleString()}`,
      remove: { maxPrice: null },
    });
  }

  if (filters.minPrice != null) {
    items.push({
      key: "min-price",
      label: `$${filters.minPrice.toLocaleString()}+`,
      remove: { minPrice: null },
    });
  }

  if (filters.minDurationWeeks != null || filters.maxDurationWeeks != null) {
    const min = filters.minDurationWeeks;
    const max = filters.maxDurationWeeks;
    let label: string;
    if (min != null && max != null && min === max) {
      label = `${min} week${min === 1 ? "" : "s"}`;
    } else if (min != null && max != null) {
      label = `${min}–${max} weeks`;
    } else if (min != null) {
      label = `${min}+ weeks`;
    } else if (max != null) {
      label = `Up to ${max} weeks`;
    } else {
      label = "Any duration";
    }
    items.push({
      key: "duration-weeks",
      label,
      remove: { minDurationWeeks: null, maxDurationWeeks: null },
    });
  }

  if (filters.collegeCreditOnly) {
    items.push({
      key: "credit",
      label: "College credit only",
      remove: { collegeCreditOnly: false },
    });
  }

  if (filters.fullyFundedOnly) {
    items.push({
      key: "funded",
      label: "Fully funded only",
      remove: { fullyFundedOnly: false },
    });
  }

  if (filters.usOnly) {
    items.push({
      key: "us",
      label: "US only",
      remove: { usOnly: false },
    });
  }

  if (filters.excludeUnknownPrice) {
    items.push({
      key: "unknown-price",
      label: "Hide unlisted prices",
      remove: { excludeUnknownPrice: false },
    });
  }

  if (filters.dataQuery.trim()) {
    items.push({
      key: "data-query",
      label: formatDataQueryLabel(filters.dataQuery),
      remove: { dataQuery: "" },
    });
  }

  if (filters.excludeLocation.trim()) {
    items.push({
      key: "exclude-location",
      label: `Exclude ${formatDataQueryLabel(filters.excludeLocation)}`,
      remove: { excludeLocation: "" },
    });
  }

  for (const regionId of filters.includeRegions) {
    items.push({
      key: `region-${regionId}`,
      label: getRegionLabel(regionId),
      remove: {
        includeRegions: filters.includeRegions.filter((id) => id !== regionId),
      },
    });
  }

  for (const location of filters.includeLocations) {
    items.push({
      key: `loc-${location}`,
      label: formatDataQueryLabel(location),
      remove: {
        includeLocations: filters.includeLocations.filter((loc) => loc !== location),
      },
    });
  }

  for (const month of filters.includeMonths) {
    items.push({
      key: `month-${month}`,
      label: `Runs in ${getMonthLabel(month)}`,
      remove: {
        includeMonths: filters.includeMonths.filter((m) => m !== month),
      },
    });
  }

  for (const month of filters.excludeMonths) {
    items.push({
      key: `exclude-month-${month}`,
      label: `Exclude ${getMonthLabel(month)}`,
      remove: {
        excludeMonths: filters.excludeMonths.filter((m) => m !== month),
      },
    });
  }

  return items;
}
