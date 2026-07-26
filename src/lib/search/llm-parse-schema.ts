import { z } from "zod";
import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  GRADE_CHIPS,
  PRICE_FILTERS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
import { DEFAULT_SEARCH_FILTERS, type SearchFilters } from "@/lib/types/program";

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
const gradeValues = [...GRADE_CHIPS] as [number, ...number[]];

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
    usOnly: z.boolean().optional(),
    excludeUnknownPrice: z.boolean().optional(),
    dataQuery: z.string().optional(),
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
  usOnly: z.boolean(),
  excludeUnknownPrice: z.boolean(),
  dataQuery: z.string(),
});

export const llmParseResponseSchema = z.object({
  clearAll: z.boolean(),
  filterPatch: filterPatchSchema,
  applied: z.string().max(500),
  unexpressible: z.string().max(500),
  assistantMessage: z.string().max(1000),
});

export type LlmParseResponse = z.infer<typeof llmParseResponseSchema>;

export const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().max(500),
});

export const parseRequestSchema = z.object({
  message: z.string().trim().min(1).max(500),
  currentFilters: searchFiltersSchema,
  resultCount: z.number().int().min(0),
  history: z.array(chatHistoryMessageSchema).max(12).optional(),
});

export type ParseRequest = z.infer<typeof parseRequestSchema>;

function clampGrades(grades: number[]): number[] {
  const valid = new Set<number>(GRADE_CHIPS);
  return [...new Set(grades.filter((g) => valid.has(g as (typeof GRADE_CHIPS)[number])))];
}

function sanitizeDataQuery(value: string): string {
  return value.trim().slice(0, 100);
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
  if (patch.usOnly !== undefined) {
    sanitized.usOnly = patch.usOnly;
  }
  if (patch.excludeUnknownPrice !== undefined) {
    sanitized.excludeUnknownPrice = patch.excludeUnknownPrice;
  }
  if (patch.dataQuery !== undefined) {
    sanitized.dataQuery = sanitizeDataQuery(patch.dataQuery);
  }

  return sanitized;
}

/** Parse and sanitize the full LLM response. Throws ZodError on invalid shape. */
export function parseLlmResponse(raw: unknown): LlmParseResponse {
  const parsed = llmParseResponseSchema.parse(raw);
  return {
    ...parsed,
    applied: parsed.applied.trim(),
    unexpressible: parsed.unexpressible.trim(),
    assistantMessage: parsed.assistantMessage.trim(),
    filterPatch: sanitizeFilterPatch(parsed.filterPatch),
  };
}

export function emptySearchFilters(): SearchFilters {
  return { ...DEFAULT_SEARCH_FILTERS };
}
