import type { AdmissionTypeId } from "@/lib/constants/admission-types";
import type { MonthNumber } from "@/lib/constants/months";
import type { ProgramCategoryId } from "@/lib/constants/categories";
import type { DayToDaySourceType } from "@/lib/constants/day-to-day";
import type { PublishedReviewStatus } from "@/lib/constants/season-review";
import { INCLUDE_PENDING_SEASON_REFRESH_DEFAULT } from "@/lib/constants/season-review";
import type {
  DurationBucketId,
  FlagSeverity,
  FlagType,
  ProgramFormatId,
} from "@/lib/constants/filters";
import type {
  ParticipantGenderFilterId,
  ParticipantGenderId,
} from "@/lib/constants/participant-gender";

export interface ProgramFlag {
  id: string;
  type: FlagType;
  title: string;
  body: string;
  sourceCitation: string;
  sourceDate?: string;
  severity: FlagSeverity;
}

/** Curated prose about daily structure and independence — merged from day-to-day.json at import. */
export interface ProgramDayToDay {
  /** Required whenever this object is attached to a program. Includes not_found explanations. */
  notes: string;
  /** Required whenever this object is attached — drives tile rendering and source attribution. */
  sourceType: DayToDaySourceType;
  verifiedAt: string;
  /** Handbook title, FAQ page, or URL — expected for official_policy and program_faq. */
  sourceCitation?: string;
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
  /** 2027 CSV — used for day-to-day and flag rule matching. */
  programGroupId?: string;
  category: ProgramCategoryId;
  secondaryTags: string[];
  trackDetail?: string;
  description?: string;
  /**
   * When true, free-text search may match single terms in description (not just identity
   * fields). Use for consolidated catalog rows where parents pick one option from a list.
   */
  catalogOffering?: boolean;

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
  /** US state/DC abbreviation from the CSV State column — program location, not residency. */
  state?: string;
  /** Residency eligibility (e.g. CA) parsed from grades/flags — not the program's location. */
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
  /** Present when curated day-to-day notes exist for this program/group. */
  dayToDay?: ProgramDayToDay;
  /** Curated participant gender — merged from participant-gender.json at import. */
  participantGender: ParticipantGenderId;

  /** Summer season this row describes (e.g. 2027). */
  seasonYear: number;
  /** Editorial freshness for target-season data. */
  reviewStatus: PublishedReviewStatus;

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
  /** When true, exclude US programs (international destinations only). Mutually exclusive with usOnly. */
  internationalOnly: boolean;
  /**
   * When false (default), programs with priceUnknown still appear under active
   * price filters. Set true to hide them when filtering by price.
   */
  excludeUnknownPrice: boolean;
  /**
   * When true (default), include programs whose target-season details are not yet
   * verified (`provisional` / `awaiting_source`). When false, only `verified` rows.
   */
  includePendingSeasonRefresh: boolean;
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
  /** Inclusive ISO start bound — program must start on or after this date. Pair with dateWindowEnd for a contained window. */
  dateWindowStart: string | null;
  /** Inclusive ISO end bound — program must end on or before this date. Pair with dateWindowStart for a contained window. */
  dateWindowEnd: string | null;
  /** OR logic — coed programs are excluded when any value is set. */
  participantGenders: ParticipantGenderFilterId[];
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
  internationalOnly: false,
  excludeUnknownPrice: false,
  includePendingSeasonRefresh: INCLUDE_PENDING_SEASON_REFRESH_DEFAULT,
  dataQuery: "",
  excludeLocation: "",
  includeRegions: [],
  includeLocations: [],
  includeMonths: [],
  excludeMonths: [],
  minDurationWeeks: null,
  maxDurationWeeks: null,
  dateWindowStart: null,
  dateWindowEnd: null,
  participantGenders: [],
};

/** Expected columns in the program CSV (2027 names with legacy 2026 fallbacks at import). */
export interface ProgramCsvRow extends Record<string, string | undefined> {
  "Program Name": string;
  "Primary Category": string;
  "Program Group ID"?: string;
  "Offering Label"?: string;
  Institution?: string;
  "Secondary Tags"?: string;
  "Track/Session"?: string;
  Format?: string;
  /** 2027 */
  "Grades Display"?: string;
  /** 2026 legacy */
  Grades?: string;
  "Grade Completed Min"?: string;
  "Grade Completed Max"?: string;
  "Admission Type"?: string;
  /** 2027 */
  "Length Display"?: string;
  /** 2026 legacy */
  Length?: string;
  "Length Min Days"?: string;
  "Length Max Days"?: string;
  "Date Start"?: string;
  "Date End"?: string;
  "Dates Display"?: string;
  "Dates Parse Quality"?: string;
  "Dates 2026"?: string;
  "Dates 2027"?: string;
  /** 2027 */
  "Location Display"?: string;
  /** 2026 legacy */
  Location?: string;
  State?: string;
  Country?: string;
  /** 2027 */
  "Credit Display"?: string;
  "Has College Credit"?: string;
  /** 2026 legacy */
  Credit?: string;
  /** 2027 */
  "Price Display"?: string;
  "Price Min"?: string;
  "Price Max"?: string;
  "Fully Funded"?: string;
  "Financial Aid Available"?: string;
  /** 2026 legacy */
  Price?: string;
  URL?: string;
  Description?: string;
  /** Optional JSON array of ProgramFlag objects */
  Flags?: string;
  "Season Year"?: string;
  "Review Status"?: string;
  "Review Notes"?: string;
  "Data Verified At"?: string;
  /** Yes when description lists chooser options (consolidated catalog row). */
  "Catalog Offering"?: string;
}
