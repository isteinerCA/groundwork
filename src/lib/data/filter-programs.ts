import type { AdmissionTypeId } from "@/lib/constants/admission-types";
import { matchesDataQuery } from "@/lib/data/matches-data-query";
import { matchesPriceFilter } from "@/lib/data/matches-price-filter";
import { formatMatchesFilter } from "@/lib/data/normalize-format";
import { gradeMatchesFilter } from "@/lib/data/normalize-grade";
import type { Program, SearchFilters } from "@/lib/types/program";

export function filterPrograms(programs: Program[], filters: SearchFilters): Program[] {
  return programs.filter((program) => matchesProgram(program, filters));
}

export function matchesProgram(program: Program, filters: SearchFilters): boolean {
  if (filters.gradesCompleted.length === 0) return false;

  if (!gradeMatchesFilter(program, filters.gradesCompleted)) return false;

  if (
    filters.categories.length > 0 &&
    !filters.categories.includes(program.category)
  ) {
    return false;
  }

  if (
    filters.admissionTypes.length > 0 &&
    !filters.admissionTypes.includes(program.admissionType)
  ) {
    return false;
  }

  if (!formatMatchesFilter(program.formatTags, filters.formats)) return false;

  if (
    filters.durationBuckets.length > 0 &&
    !filters.durationBuckets.includes(program.durationBucket)
  ) {
    return false;
  }

  if (filters.collegeCreditOnly && !program.hasCollegeCredit) return false;

  if (filters.fullyFundedOnly && !program.fullyFunded) return false;

  if (
    !matchesPriceFilter(
      program,
      filters.priceFilter,
      filters.excludeUnknownPrice,
    )
  ) {
    return false;
  }

  if (filters.usOnly && program.isInternational) return false;

  if (!matchesDataQuery(program, filters.dataQuery)) return false;

  return true;
}

export type SortOption = "name" | "price" | "selectivity" | "duration";

const ADMISSION_ORDER: Record<AdmissionTypeId, number> = {
  highly_competitive: 0,
  application: 1,
  first_come: 2,
};

export function sortPrograms(programs: Program[], sort: SortOption): Program[] {
  const sorted = [...programs];

  sorted.sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price": {
        const aPrice = a.priceUnknown ? Number.POSITIVE_INFINITY : (a.priceMin ?? a.priceMax ?? 0);
        const bPrice = b.priceUnknown ? Number.POSITIVE_INFINITY : (b.priceMin ?? b.priceMax ?? 0);
        return aPrice - bPrice;
      }
      case "selectivity":
        return ADMISSION_ORDER[a.admissionType] - ADMISSION_ORDER[b.admissionType];
      case "duration":
        return a.lengthDisplay.localeCompare(b.lengthDisplay);
      default:
        return 0;
    }
  });

  return sorted;
}
