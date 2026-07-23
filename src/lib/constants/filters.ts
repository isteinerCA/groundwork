export const PROGRAM_FORMATS = [
  { id: "residential", label: "Residential" },
  { id: "online", label: "Online" },
  { id: "both", label: "Both" },
] as const;

export type ProgramFormatId = (typeof PROGRAM_FORMATS)[number]["id"];

export const DURATION_BUCKETS = [
  { id: "under_2_weeks", label: "Under 2 weeks", maxDays: 13 },
  { id: "two_to_four_weeks", label: "2–4 weeks", minDays: 14, maxDays: 28 },
  { id: "four_plus_weeks", label: "4+ weeks", minDays: 29 },
] as const;

export type DurationBucketId = (typeof DURATION_BUCKETS)[number]["id"];

export const PRICE_FILTERS = [
  { id: "any", label: "Any price" },
  { id: "under_2k", label: "Under $2k", max: 2000 },
  { id: "2k_5k", label: "$2k–5k", min: 2000, max: 5000 },
  { id: "5k_10k", label: "$5k–10k", min: 5000, max: 10000 },
  { id: "10k_plus", label: "$10k+", min: 10000 },
] as const;

/** Price chips shown in the UI — "any" is the default when none selected. */
export const PRICE_FILTER_OPTIONS = PRICE_FILTERS.filter((p) => p.id !== "any");

export type PriceFilterId = (typeof PRICE_FILTERS)[number]["id"];

/**
 * When true, programs with unknown price ("Contact program") are excluded
 * whenever any specific price filter is active. Default: false (include them).
 */
export const DEFAULT_EXCLUDE_UNKNOWN_PRICE = false;

export const GRADE_CHIPS = [6, 7, 8, 9, 10, 11, 12] as const;

export type GradeCompleted = (typeof GRADE_CHIPS)[number];

export const FLAG_TYPES = [
  "safety",
  "deposit",
  "selectivity",
  "residency",
  "physical",
  "turnover",
  "other",
] as const;

export type FlagType = (typeof FLAG_TYPES)[number];

export const FLAG_SEVERITY = ["info", "warning"] as const;

export type FlagSeverity = (typeof FLAG_SEVERITY)[number];
