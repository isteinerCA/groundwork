/**
 * Schema and merge tests for LLM search parser (no live OpenAI calls).
 * Run: npm run verify:chat
 */
import { DEFAULT_SEARCH_FILTERS } from "../src/lib/types/program";
import { mergeFilterPatch } from "../src/lib/search/merge-filter-patch";
import {
  filterPatchSchema,
  llmParseResponseSchema,
  parseLlmResponse,
  sanitizeFilterPatch,
} from "../src/lib/search/llm-parse-schema";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL ${message}`);
    failed++;
  }
}

// mergeFilterPatch
const merged = mergeFilterPatch(DEFAULT_SEARCH_FILTERS, {
  gradesCompleted: [11],
  fullyFundedOnly: true,
});
assert(merged.fullyFundedOnly === true, "mergeFilterPatch sets fullyFundedOnly");
assert(merged.gradesCompleted[0] === 11, "mergeFilterPatch sets grade");

// Valid LLM response
const validResponse = {
  clearAll: false,
  filterPatch: {
    gradesCompleted: [11],
    categories: ["stem-engineering", "mathematics"],
    dataQuery: "california",
  },
  applied: "Set grade 11, STEM and math categories, California location",
  unexpressible: "",
  assistantMessage: "Applied grade 11, STEM/math, and California filter.",
};
const parsed = parseLlmResponse(validResponse);
assert(parsed.filterPatch.gradesCompleted?.[0] === 11, "parseLlmResponse grade");
assert(parsed.filterPatch.dataQuery === "california", "parseLlmResponse dataQuery");

// Reject invalid category
try {
  filterPatchSchema.parse({ categories: ["not-a-category"] });
  assert(false, "should reject invalid category");
} catch {
  // expected
}

// Reject invalid LLM response shape
try {
  llmParseResponseSchema.parse({ clearAll: false });
  assert(false, "should reject incomplete response");
} catch {
  // expected
}

// Clamp invalid grades
const sanitized = sanitizeFilterPatch({
  gradesCompleted: [5, 11, 99, 11],
});
assert(
  JSON.stringify(sanitized.gradesCompleted) === JSON.stringify([11]),
  "sanitizeFilterPatch clamps grades",
);

// Truncate dataQuery
const longQuery = sanitizeFilterPatch({ dataQuery: "a".repeat(150) });
assert(
  (longQuery.dataQuery?.length ?? 0) === 100,
  "sanitizeFilterPatch truncates dataQuery",
);

// clearAll response
const clearResponse = parseLlmResponse({
  clearAll: true,
  filterPatch: {},
  applied: "Cleared all filters",
  unexpressible: "",
  assistantMessage: "Cleared all filters. Select a grade to search again.",
});
assert(clearResponse.clearAll === true, "clearAll response parses");

if (failed === 0) {
  console.log("All LLM parse schema checks passed.");
} else {
  process.exit(1);
}
