import type { AdmissionTypeId } from "@/lib/constants/admission-types";
import type { ProgramCategoryId } from "@/lib/constants/categories";
import type {
  DurationBucketId,
  FlagSeverity,
  FlagType,
  ProgramFormatId,
} from "@/lib/constants/filters";

export interface ProgramFlag {
  id: string;
  type: FlagType;
  title: string;
  body: string;
  sourceCitation: string;
  sourceDate?: string;
  severity: FlagSeverity;
}

/**
 * Canonical program record after CSV import + normalization.
 * Field names align with the reworked CSV schema.
 */
export interface Program {
  id: string;
  slug: string;
  name: string;
  institution?: string;
  category: ProgramCategoryId;
  secondaryTags: string[];
  trackDetail?: string;
  description?: string;

  /** Grade completed range (PRD §4.4 — normalized at import) */
  gradeCompletedMin: number;
  gradeCompletedMax: number;
  gradeDisplay: string;
  gradeSource: "grade" | "age" | "mixed";

  admissionType: AdmissionTypeId;
  admissionDisplay: string;

  format: ProgramFormatId;
  durationBucket: DurationBucketId;
  lengthDisplay: string;
  datesDisplay: string;
  locationDisplay: string;
  isInternational: boolean;
  stateRestriction?: string;

  hasCollegeCredit: boolean;
  creditDisplay: string;

  /** Raw price string from CSV (may be "Contact program", ranges, etc.) */
  priceDisplay: string;
  priceMin: number | null;
  priceMax: number | null;
  /** True when price could not be parsed (e.g. "Contact program") */
  priceUnknown: boolean;
  fullyFunded: boolean;
  financialAidAvailable: boolean;

  websiteUrl: string;
  flags: ProgramFlag[];

  dataVerifiedAt: string;
}

export interface SearchFilters {
  gradesCompleted: number[];
  categories: ProgramCategoryId[];
  admissionTypes: AdmissionTypeId[];
  formats: ProgramFormatId[];
  durationBuckets: DurationBucketId[];
  collegeCreditOnly: boolean;
  fullyFundedOnly: boolean;
  priceFilter: import("@/lib/constants/filters").PriceFilterId;
  usOnly: boolean;
  /**
   * When false (default), programs with priceUnknown still appear under active
   * price filters. Set true to hide them when filtering by price.
   */
  excludeUnknownPrice: boolean;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  gradesCompleted: [],
  categories: [],
  admissionTypes: [],
  formats: [],
  durationBuckets: [],
  collegeCreditOnly: false,
  fullyFundedOnly: false,
  priceFilter: "any",
  usOnly: false,
  excludeUnknownPrice: false,
};

/** Expected columns in the final CSV (gotcha flags may be JSON column or separate sheet) */
export interface ProgramCsvRow {
  "Program Name": string;
  "Primary Category": string;
  "Secondary Tags"?: string;
  "Any additional details about specific track"?: string;
  Grades: string;
  "Admission Type": string;
  Length: string;
  "Dates 2026"?: string;
  Location: string;
  Format: string;
  Credit: string;
  Price: string;
  URL: string;
  /** JSON array or pipe-delimited — finalize when CSV is ready */
  Flags?: string;
}
