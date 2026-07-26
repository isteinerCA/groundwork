import { z } from "zod";
import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  GRADE_CHIPS,
  PRICE_FILTERS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
import { parseMonthList, isNegatedMonthQuery, MONTH_NUMBERS, type MonthNumber } from "@/lib/constants/months";
import { parseMultiStateLocations, resolveLocationQuery } from "@/lib/data/matches-location";
import { resolveRegionQuery, US_REGION_IDS } from "@/lib/data/us-regions";
import { stripNoOpFilterPatch } from "@/lib/search/filter-patch-delta";
import { isAdditiveFilterRequest } from "@/lib/search/filter-request-intent";
import { DEFAULT_SEARCH_FILTERS, type SearchFilters } from "@/lib/types/program";
import type { ProgramCategoryId } from "@/lib/constants/categories";

const categoryIds = PROGRAM_CATEGORIES.map((c) => c.id) as [
  (typeof PROGRAM_CATEGORIES)[number]["id"],
  ...(typeof PROGRAM_CATEGORIES)[number]["id"][],
];
const admissionIds = ADMISSION_TYPES.map((a) => a.id) as [
  (typeof ADMISSION_TYPES)[number]["id"],
  ...(typeof ADMISSION_TYPES)[number]["id"][],
];
const formatIds = PROGRAM_FORMATS.map((f) => f.id) as [
  (typeof PROGRAM_FORMATS)[number]["id"],
  ...(typeof PROGRAM_FORMATS)[number]["id"][],
];
const durationIds = DURATION_BUCKETS.map((d) => d.id) as [
  (typeof DURATION_BUCKETS)[number]["id"],
  ...(typeof DURATION_BUCKETS)[number]["id"][],
];
const priceIds = PRICE_FILTERS.map((p) => p.id) as [
  (typeof PRICE_FILTERS)[number]["id"],
  ...(typeof PRICE_FILTERS)[number]["id"][],
];

// Use numeric bounds (not z.custom) so OpenAI structured-output JSON Schema stays valid.
const monthNumberSchema = z
  .number()
  .int()
  .min(MONTH_NUMBERS[0])
  .max(MONTH_NUMBERS[MONTH_NUMBERS.length - 1]);

export const filterPatchSchema = z
  .object({
    gradesCompleted: z.array(z.number().int()).optional(),
    categories: z.array(z.enum(categoryIds)).optional(),
    admissionTypes: z.array(z.enum(admissionIds)).optional(),
    formats: z.array(z.enum(formatIds)).optional(),
    durationBuckets: z.array(z.enum(durationIds)).optional(),
    collegeCreditOnly: z.boolean().optional(),
    fullyFundedOnly: z.boolean().optional(),
    priceFilter: z.enum(priceIds).optional(),
    maxPrice: z.number().int().min(0).nullable().optional(),
    minPrice: z.number().int().min(0).nullable().optional(),
    usOnly: z.boolean().optional(),
    excludeUnknownPrice: z.boolean().optional(),
    dataQuery: z.string().optional(),
    excludeLocation: z.string().optional(),
    includeRegions: z.array(z.enum(US_REGION_IDS)).optional(),
    includeLocations: z.array(z.string()).optional(),
    includeMonths: z.array(monthNumberSchema).optional(),
    excludeMonths: z.array(monthNumberSchema).optional(),
    minDurationWeeks: z.number().min(0).nullable().optional(),
    maxDurationWeeks: z.number().min(0).nullable().optional(),
  })
  .strict();

export const searchFiltersSchema = z.object({
  gradesCompleted: z.array(z.number().int()),
  categories: z.array(z.enum(categoryIds)),
  admissionTypes: z.array(z.enum(admissionIds)),
  formats: z.array(z.enum(formatIds)),
  durationBuckets: z.array(z.enum(durationIds)),
  collegeCreditOnly: z.boolean(),
  fullyFundedOnly: z.boolean(),
  priceFilter: z.enum(priceIds),
  maxPrice: z.number().int().min(0).nullable(),
  minPrice: z.number().int().min(0).nullable(),
  usOnly: z.boolean(),
  excludeUnknownPrice: z.boolean(),
  dataQuery: z.string(),
  excludeLocation: z.string(),
  includeRegions: z.array(z.enum(US_REGION_IDS)),
  includeLocations: z.array(z.string()),
  includeMonths: z.array(monthNumberSchema),
  excludeMonths: z.array(monthNumberSchema),
  minDurationWeeks: z.number().min(0).nullable(),
  maxDurationWeeks: z.number().min(0).nullable(),
});

export const llmParseResponseSchema = z.object({
  clearAll: z.boolean(),
  filterPatch: filterPatchSchema,
  applied: z.string().max(500),
  unexpressible: z.string().max(500),
  assistantMessage: z.string().max(1000),
});

export type LlmParseResponse = Omit<z.infer<typeof llmParseResponseSchema>, "filterPatch"> & {
  filterPatch: Partial<SearchFilters>;
};

export const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().max(500),
});

export const parseRequestSchema = z.object({
  message: z.string().trim().min(1).max(500),
  currentFilters: z.preprocess((val) => {
    const merged = { ...DEFAULT_SEARCH_FILTERS, ...(val as Partial<SearchFilters>) };
    return {
      ...merged,
      includeMonths: clampMonths(merged.includeMonths ?? []),
      excludeMonths: clampMonths(merged.excludeMonths ?? []),
    };
  }, searchFiltersSchema),
  resultCount: z.number().int().min(0),
  history: z.array(chatHistoryMessageSchema).max(12).optional(),
});

export type ParseRequest = Omit<z.infer<typeof parseRequestSchema>, "currentFilters"> & {
  currentFilters: SearchFilters;
};

function clampGrades(grades: number[]): number[] {
  const valid = new Set<number>(GRADE_CHIPS);
  return [...new Set(grades.filter((g) => valid.has(g as (typeof GRADE_CHIPS)[number])))];
}

function sanitizeDataQuery(value: string): string {
  return value.trim().slice(0, 100);
}

function sanitizeExcludeLocation(value: string): string {
  const trimmed = value.trim().slice(0, 100);
  if (!trimmed) return "";
  return resolveLocationQuery(trimmed) ?? trimmed.toLowerCase();
}

function sanitizeIncludeLocations(values: string[]): string[] {
  const resolved = values
    .map((value) => resolveLocationQuery(value) ?? value.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(resolved)];
}

function resolvedLocationKey(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return resolveLocationQuery(trimmed) ?? trimmed.toLowerCase();
}

function clampMonths(months: number[]): MonthNumber[] {
  const valid = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  return [...new Set(months.filter((m) => valid.has(m)))] as MonthNumber[];
}

const CATEGORY_PHRASES: Record<string, ProgramCategoryId[]> = {
  tech: ["artificial-intelligence"],
  "tech camps": ["artificial-intelligence"],
  "tech camp": ["artificial-intelligence"],
  coding: ["artificial-intelligence"],
  ai: ["artificial-intelligence"],
  "tech & ai": ["artificial-intelligence"],
  stem: ["stem-engineering"],
  "marine science": ["marine-science"],
  math: ["mathematics"],
  humanities: ["writing-humanities"],
  arts: ["arts"],
  wilderness: ["outdoor-wilderness"],
  "pre-med": ["biomedical"],
};

function categoryIdsFromCategoryPhrase(query: string): ProgramCategoryId[] | undefined {
  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/^(add|also include|include|plus)\s+/, "");
  return CATEGORY_PHRASES[normalized];
}

/** Normalize and validate a filter patch from the LLM before applying. */
export function sanitizeFilterPatch(
  patch: z.infer<typeof filterPatchSchema>,
): Partial<SearchFilters> {
  const sanitized: Partial<SearchFilters> = {};

  if (patch.gradesCompleted !== undefined) {
    sanitized.gradesCompleted = clampGrades(patch.gradesCompleted);
  }
  if (patch.categories !== undefined) {
    sanitized.categories = patch.categories;
  }
  if (patch.admissionTypes !== undefined) {
    sanitized.admissionTypes = patch.admissionTypes;
  }
  if (patch.formats !== undefined) {
    sanitized.formats = patch.formats;
  }
  if (patch.durationBuckets !== undefined) {
    sanitized.durationBuckets = patch.durationBuckets;
  }
  if (patch.collegeCreditOnly !== undefined) {
    sanitized.collegeCreditOnly = patch.collegeCreditOnly;
  }
  if (patch.fullyFundedOnly !== undefined) {
    sanitized.fullyFundedOnly = patch.fullyFundedOnly;
  }
  if (patch.priceFilter !== undefined) {
    sanitized.priceFilter = patch.priceFilter;
  }
  if (patch.maxPrice !== undefined) {
    sanitized.maxPrice = patch.maxPrice;
  }
  if (patch.minPrice !== undefined) {
    sanitized.minPrice = patch.minPrice;
  }
  if (patch.usOnly !== undefined) {
    sanitized.usOnly = patch.usOnly;
  }
  if (patch.excludeUnknownPrice !== undefined) {
    sanitized.excludeUnknownPrice = patch.excludeUnknownPrice;
  }
  if (patch.dataQuery !== undefined) {
    sanitized.dataQuery = sanitizeDataQuery(patch.dataQuery);
  }
  if (patch.excludeLocation !== undefined) {
    sanitized.excludeLocation = sanitizeExcludeLocation(patch.excludeLocation);
  }
  if (patch.includeRegions !== undefined) {
    sanitized.includeRegions = [...new Set(patch.includeRegions)];
  }
  if (patch.includeLocations !== undefined) {
    sanitized.includeLocations = sanitizeIncludeLocations(patch.includeLocations);
  }
  if (patch.includeMonths !== undefined) {
    sanitized.includeMonths = clampMonths(patch.includeMonths).sort((a, b) => a - b);
  }
  if (patch.excludeMonths !== undefined) {
    sanitized.excludeMonths = clampMonths(patch.excludeMonths).sort((a, b) => a - b);
  }
  if (patch.minDurationWeeks !== undefined) {
    sanitized.minDurationWeeks = patch.minDurationWeeks;
  }
  if (patch.maxDurationWeeks !== undefined) {
    sanitized.maxDurationWeeks = patch.maxDurationWeeks;
  }

  // Prefer exact numeric price over coarse bucket when LLM sets maxPrice/minPrice.
  if (sanitized.maxPrice != null || sanitized.minPrice != null) {
    sanitized.priceFilter = sanitized.priceFilter ?? "any";
  }

  // Promote regional phrases mistakenly placed in dataQuery.
  if (sanitized.dataQuery !== undefined) {
    const regionFromQuery = resolveRegionQuery(sanitized.dataQuery);
    if (regionFromQuery) {
      const existing = sanitized.includeRegions ?? patch.includeRegions ?? [];
      sanitized.includeRegions = [...new Set([...existing, regionFromQuery])];
      sanitized.dataQuery = "";
    } else {
      const monthsFromQuery = parseMonthList(sanitized.dataQuery);
      const monthFillerPattern =
        /^(?:in|during|for|programs?|program|only|summer|session|sessions|that|run|runs|starting|\s|&|and|\/)+$/i;
      const strippedForMonths = sanitized.dataQuery
        .replace(
          /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/gi,
          "",
        )
        .trim();
      if (
        monthsFromQuery.length > 0 &&
        (isNegatedMonthQuery(sanitized.dataQuery) ||
          !strippedForMonths ||
          monthFillerPattern.test(strippedForMonths))
      ) {
        if (isNegatedMonthQuery(sanitized.dataQuery)) {
          const existing = sanitized.excludeMonths ?? patch.excludeMonths ?? [];
          sanitized.excludeMonths = clampMonths([...existing, ...monthsFromQuery]).sort(
            (a, b) => a - b,
          );
        } else {
          const existing = sanitized.includeMonths ?? patch.includeMonths ?? [];
          sanitized.includeMonths = clampMonths([...existing, ...monthsFromQuery]).sort(
            (a, b) => a - b,
          );
        }
        sanitized.dataQuery = "";
      } else {
        const statesFromQuery = parseMultiStateLocations(sanitized.dataQuery);
        if (statesFromQuery.length > 0) {
          const existing = sanitized.includeLocations ?? patch.includeLocations ?? [];
          sanitized.includeLocations = [...new Set([...existing, ...statesFromQuery])];
          sanitized.dataQuery = "";
        } else {
          const fromCategoryPhrase = categoryIdsFromCategoryPhrase(sanitized.dataQuery);
          if (fromCategoryPhrase) {
            sanitized.categories = [
              ...new Set([...(sanitized.categories ?? []), ...fromCategoryPhrase]),
            ];
            sanitized.dataQuery = "";
          }
        }
      }
    }
  }

  // Location include vs exclude are mutually exclusive for the same place.
  const includeKey =
    sanitized.dataQuery !== undefined
      ? resolvedLocationKey(sanitized.dataQuery)
      : undefined;
  const excludeKey =
    sanitized.excludeLocation !== undefined
      ? resolvedLocationKey(sanitized.excludeLocation)
      : undefined;
  if (includeKey && excludeKey && includeKey === excludeKey) {
    sanitized.dataQuery = "";
  }

  // Same month cannot be both included and excluded.
  if (sanitized.includeMonths?.length && sanitized.excludeMonths?.length) {
    const excludeSet = new Set(sanitized.excludeMonths);
    sanitized.includeMonths = sanitized.includeMonths.filter((m) => !excludeSet.has(m));
  }

  return sanitized;
}

/** If LLM wrongly used includeMonths for a negated month query, flip to excludeMonths. */
export function correctNegatedMonthPatch(
  message: string,
  patch: Partial<SearchFilters>,
): Partial<SearchFilters> {
  if (!isNegatedMonthQuery(message)) return patch;

  const next = { ...patch };
  if (next.includeMonths?.length && !next.excludeMonths?.length) {
    next.excludeMonths = next.includeMonths;
    delete next.includeMonths;
  }
  return next;
}

const SIMPLE_QUERY_FILTER_KEYWORDS =
  /\b(only|under|over|above|below|fund|funded|credit|residential|commuter|online|both|week|weeks|application|applications|selective|competitive|category|categories|stem|math|science|humanities|arts|deposit|free|price|cost|dollar|\$\d|east coast|west coast|midwest|northeast|south|california|texas|exclude|not in|outside|clear|reset|start over|college|pre-college|format|duration|rolling|first come|highly|us only|domestic|international|gender|pool|single.?sex|tech|camp|camps|coding|robotics|marine|wilderness|pre-med|biomedical|humanities|writing|leadership|gifted|language|global|traditional)\b/i;

export { isAdditiveFilterRequest, isReplaceOnlyCategoryRequest } from "@/lib/search/filter-request-intent";

/** True when the message is a bare institution/program/place name without explicit filter intent. */
export function isSimpleInstitutionOrNameQuery(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed || trimmed.includes("?")) return false;
  if (isAdditiveFilterRequest(trimmed)) return false;
  if (SIMPLE_QUERY_FILTER_KEYWORDS.test(trimmed)) return false;
  if (trimmed.split(/\s+/).length > 5) return false;
  return true;
}

const LOCATION_PATCH_KEYS = [
  "dataQuery",
  "excludeLocation",
  "includeRegions",
  "includeLocations",
] as const;

/** Strip inferred chip filters when the user only named a school or program. */
export function restrictPatchForSimpleQuery(
  message: string,
  patch: Partial<SearchFilters>,
): Partial<SearchFilters> {
  if (!isSimpleInstitutionOrNameQuery(message)) return patch;

  const restricted: Partial<SearchFilters> = {};
  for (const key of LOCATION_PATCH_KEYS) {
    if (patch[key] !== undefined) {
      (restricted as Record<string, unknown>)[key] = patch[key];
    }
  }

  if (
    !restricted.dataQuery &&
    !(restricted.includeLocations?.length ?? 0) &&
    !(restricted.includeRegions?.length ?? 0)
  ) {
    restricted.dataQuery = message.trim().toLowerCase();
  }

  return restricted;
}

/** Parse and sanitize the full LLM response. Throws ZodError on invalid shape. */
export function parseLlmResponse(
  raw: unknown,
  message?: string,
  currentFilters?: SearchFilters,
): LlmParseResponse {
  const parsed = llmParseResponseSchema.parse(raw);
  let filterPatch = sanitizeFilterPatch(parsed.filterPatch);
  const unexpressible = parsed.unexpressible.trim();
  if (message) {
    filterPatch = correctNegatedMonthPatch(message, filterPatch);
    filterPatch = restrictPatchForSimpleQuery(message, filterPatch);
  }
  if (currentFilters) {
    filterPatch = stripNoOpFilterPatch(currentFilters, filterPatch);
  }
  return {
    ...parsed,
    applied: parsed.applied.trim(),
    unexpressible,
    assistantMessage: parsed.assistantMessage.trim(),
    filterPatch,
  };
}

export function emptySearchFilters(): SearchFilters {
  return { ...DEFAULT_SEARCH_FILTERS };
}
