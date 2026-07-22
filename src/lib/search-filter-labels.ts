import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  PRICE_FILTERS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
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

  return items;
}
