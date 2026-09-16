import type { AdmissionTypeId } from "@/lib/constants/admission-types";
import { programMatchesCategory } from "@/lib/data/matches-category";
import { matchesDataQuery } from "@/lib/data/matches-data-query";
import { matchesDurationWeeksFilter } from "@/lib/data/matches-duration-filter";
import { matchesLocationQuery, programMatchesAnyLocation } from "@/lib/data/matches-location";
import { programMatchesAnyRegion } from "@/lib/data/us-regions";
import { programMatchesDateWindowFilter } from "@/lib/data/matches-date-window-filter";
import { programMatchesExcludeMonthFilter, programMatchesMonthFilter } from "@/lib/data/matches-month-filter";
import {
  isVerifiedForTargetSeason,
  matchesSeasonReviewFilter,
} from "@/lib/data/normalize-season-review";
import { matchesNumericPriceFilter, matchesPriceFilter } from "@/lib/data/matches-price-filter";
import { formatMatchesFilter } from "@/lib/data/normalize-format";
import { gradeMatchesFilter } from "@/lib/data/normalize-grade";
import type { Program, SearchFilters } from "@/lib/types/program";

export function filterPrograms(programs: Program[], filters: SearchFilters): Program[] {
  const matched = programs.filter((program) => matchesProgram(program, filters));
  if (matched.length > 0 || !filters.dataQuery.trim()) return matched;

  return programs.filter((program) =>
    matchesProgram(program, filters, { relaxInstitutionSuffixes: true }),
  );
}

export function matchesProgram(
  program: Program,
  filters: SearchFilters,
  options?: { relaxInstitutionSuffixes?: boolean },
): boolean {
  if (filters.gradesCompleted.length === 0) return false;

  if (!gradeMatchesFilter(program, filters.gradesCompleted)) return false;

  if (
    filters.categories.length > 0 &&
    !filters.categories.some((categoryId) => programMatchesCategory(program, categoryId))
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

  if (
    !matchesNumericPriceFilter(
      program,
      filters.minPrice,
      filters.maxPrice,
      filters.excludeUnknownPrice,
    )
  ) {
    return false;
  }

  if (filters.usOnly && program.isInternational) return false;

  const excludeLocation = filters.excludeLocation.trim();
  if (excludeLocation && matchesLocationQuery(program, excludeLocation)) return false;

  if (
    filters.includeRegions.length > 0 &&
    !programMatchesAnyRegion(program, filters.includeRegions)
  ) {
    return false;
  }

  if (
    filters.includeLocations.length > 0 &&
    !programMatchesAnyLocation(program, filters.includeLocations)
  ) {
    return false;
  }

  if (!programMatchesMonthFilter(program, filters.includeMonths ?? [])) {
    return false;
  }

  if (!programMatchesExcludeMonthFilter(program, filters.excludeMonths ?? [])) {
    return false;
  }

  if (
    !programMatchesDateWindowFilter(
      program,
      filters.dateWindowStart,
      filters.dateWindowEnd,
    )
  ) {
    return false;
  }

  if (
    !matchesDurationWeeksFilter(
      program,
      filters.minDurationWeeks,
      filters.maxDurationWeeks,
    )
  ) {
    return false;
  }

  if (!matchesDataQuery(program, filters.dataQuery, options)) return false;

  if (
    !matchesSeasonReviewFilter(program, filters.includePendingSeasonRefresh)
  ) {
    return false;
  }

  return true;
}

export type SortOption = "name" | "price" | "selectivity" | "duration";

const ADMISSION_ORDER: Record<AdmissionTypeId, number> = {
  highly_competitive: 0,
  application: 1,
  first_come: 2,
};

function compareProgramsBySort(a: Program, b: Program, sort: SortOption): number {
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
    case "duration": {
      const aDays = a.lengthMinDays ?? Number.POSITIVE_INFINITY;
      const bDays = b.lengthMinDays ?? Number.POSITIVE_INFINITY;
      return aDays - bDays;
    }
    default:
      return 0;
  }
}

/** Verified target-season rows sort above pending when primary sort ties. */
function seasonReviewSortRank(program: Pick<Program, "reviewStatus" | "seasonYear">): number {
  return isVerifiedForTargetSeason(program) ? 0 : 1;
}

export function sortPrograms(programs: Program[], sort: SortOption): Program[] {
  return [...programs].sort((a, b) => {
    const primary = compareProgramsBySort(a, b, sort);
    if (primary !== 0) return primary;
    return seasonReviewSortRank(a) - seasonReviewSortRank(b);
  });
}
