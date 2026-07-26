import type { AdmissionTypeId } from "@/lib/constants/admission-types";
import type { MonthNumber } from "@/lib/constants/months";
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

  formatDisplay: string;
  formatTags: ProgramFormatId[];
  durationBucket: DurationBucketId;
  lengthDisplay: string;
  /** Parsed from CSV Length column (days). Null when unknown/varies. */
  lengthMinDays: number | null;
  lengthMaxDays: number | null;
  datesDisplay: string;
  /** Parsed inclusive start/end from datesDisplay (ISO YYYY-MM-DD). Null when unknown. */
  dateStart: string | null;
  dateEnd: string | null;
  /** How confidently dateStart/dateEnd represent the offering window. */
  datesParseQuality: "exact" | "approximate" | "unknown";
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
  /** Exact week bounds parsed from user query (uses program lengthMinDays/MaxDays). */
  minDurationWeeks: number | null;
  maxDurationWeeks: number | null;
  collegeCreditOnly: boolean;
  fullyFundedOnly: boolean;
  priceFilter: import("@/lib/constants/filters").PriceFilterId;
  /** Exact max total price from parsed program data (overrides bucket when set). */
  maxPrice: number | null;
  /** Exact min total price from parsed program data. */
  minPrice: number | null;
  usOnly: boolean;
  /**
   * When false (default), programs with priceUnknown still appear under active
   * price filters. Set true to hide them when filtering by price.
   */
  excludeUnknownPrice: boolean;
  /** Free-text search across location, gotchas, descriptions, and other CSV fields. */
  dataQuery: string;
  /** Canonical state/location name to exclude (e.g. "california" for "not in California"). */
  excludeLocation: string;
  /** US region IDs to include (OR logic), e.g. ["east-coast"] for "east coast only". */
  includeRegions: import("@/lib/data/us-regions").UsRegionId[];
  /** Canonical state names to include with OR logic, e.g. ["new york", "massachusetts"]. */
  includeLocations: string[];
  /** Calendar months (1–12) the program must overlap (OR logic), e.g. [6] for June. */
  includeMonths: MonthNumber[];
  /** Calendar months (1–12) to exclude — programs overlapping these months are hidden. */
  excludeMonths: MonthNumber[];
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
  maxPrice: null,
  minPrice: null,
  usOnly: false,
  excludeUnknownPrice: false,
  dataQuery: "",
  excludeLocation: "",
  includeRegions: [],
  includeLocations: [],
  includeMonths: [],
  excludeMonths: [],
  minDurationWeeks: null,
  maxDurationWeeks: null,
};

/** Expected columns in the program CSV */
export interface ProgramCsvRow {
  "Program Name": string;
  "Primary Category": string;
  "Secondary Tags"?: string;
  "Track/Session"?: string;
  Format: string;
  Grades: string;
  "Admission Type": string;
  Length: string;
  "Dates 2026"?: string;
  Location: string;
  Credit: string;
  Price: string;
  URL: string;
  /** Optional JSON array of ProgramFlag objects */
  Flags?: string;
}
