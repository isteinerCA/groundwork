/**
 * Schema and merge tests for LLM search parser (no live OpenAI calls).
 * Run: npm run verify:chat
 */
import { DEFAULT_SEARCH_FILTERS } from "../src/lib/types/program";
import { filterPrograms } from "../src/lib/data/filter-programs";
import { mergeFilterPatch } from "../src/lib/search/merge-filter-patch";
import {
  filterPatchSchema,
  llmParseResponseSchema,
  isSimpleInstitutionOrNameQuery,
  parseLlmResponse,
  restrictPatchForSimpleQuery,
  sanitizeFilterPatch,
} from "../src/lib/search/llm-parse-schema";
import { resolveRegionQuery } from "../src/lib/data/us-regions";
import { parseMultiStateLocations } from "../src/lib/data/matches-location";
import { readFileSync } from "node:fs";
import type { Program, SearchFilters } from "../src/lib/types/program";

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

// excludeLocation for negated location
const excludeResponse = parseLlmResponse({
  clearAll: false,
  filterPatch: {
    excludeLocation: "california",
    dataQuery: "",
  },
  applied: "Excluded California programs",
  unexpressible: "",
  assistantMessage: "Excluded programs in California.",
});
assert(
  excludeResponse.filterPatch.excludeLocation === "california",
  "excludeLocation resolves california",
);
assert(excludeResponse.filterPatch.dataQuery === "", "exclude clears conflicting dataQuery");

const mergedExclude = mergeFilterPatch(
  {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    dataQuery: "california",
  },
  { excludeLocation: "california" },
);
assert(mergedExclude.dataQuery === "", "merge clears dataQuery when excluding same location");
assert(mergedExclude.excludeLocation === "california", "merge keeps excludeLocation");

// east coast region from dataQuery promotion
const eastCoastPatch = sanitizeFilterPatch({ dataQuery: "east coast only" });
assert(
  eastCoastPatch.includeRegions?.[0] === "east-coast",
  "promotes east coast dataQuery to includeRegions",
);
assert(eastCoastPatch.dataQuery === "", "clears dataQuery after region promotion");
assert(resolveRegionQuery("east coast only") === "east-coast", "resolveRegionQuery east coast");

// multi-state OR from dataQuery promotion
const nyMaPatch = sanitizeFilterPatch({ dataQuery: "NY or MA only" });
const nyMaLocations = nyMaPatch.includeLocations ?? [];
assert(
  nyMaLocations.includes("new york") && nyMaLocations.includes("massachusetts"),
  "promotes NY or MA to includeLocations",
);
assert(nyMaPatch.dataQuery === "", "clears dataQuery after multi-state promotion");
assert(
  parseMultiStateLocations("new york or massachusetts").length === 2,
  "parseMultiStateLocations NY or MA",
);

// numeric price cap
const pricePatch = sanitizeFilterPatch({ maxPrice: 3000, priceFilter: "under_2k" });
assert(pricePatch.maxPrice === 3000, "sanitizeFilterPatch maxPrice");
assert(pricePatch.priceFilter === "under_2k", "keeps explicit priceFilter when set");

// duration weeks
const durPatch = sanitizeFilterPatch({ minDurationWeeks: 3, maxDurationWeeks: 3 });
assert(durPatch.minDurationWeeks === 3 && durPatch.maxDurationWeeks === 3, "duration weeks patch");

// commuter format in schema
const fmtPatch = filterPatchSchema.parse({ formats: ["commuter"] });
assert(fmtPatch.formats?.[0] === "commuter", "commuter format valid in schema");

// admission type in schema
const admPatch = filterPatchSchema.parse({ admissionTypes: ["first_come"] });
assert(admPatch.admissionTypes?.[0] === "first_come", "first_come admission valid in schema");

assert(isSimpleInstitutionOrNameQuery("stanford"), "stanford is simple name query");
assert(!isSimpleInstitutionOrNameQuery("fully funded only"), "fully funded is not simple query");

const stanfordRestricted = restrictPatchForSimpleQuery("stanford", {
  dataQuery: "stanford",
  categories: ["college-credit-pre-college"],
  admissionTypes: ["application"],
  formats: ["residential"],
  durationBuckets: ["two_to_four_weeks"],
  collegeCreditOnly: true,
});
assert(stanfordRestricted.dataQuery === "stanford", "simple query keeps dataQuery only");
assert(stanfordRestricted.categories === undefined, "simple query strips categories");
assert(stanfordRestricted.admissionTypes === undefined, "simple query strips admission");
assert(stanfordRestricted.formats === undefined, "simple query strips formats");

const stanfordParsed = parseLlmResponse(
  {
    clearAll: false,
    filterPatch: {
      dataQuery: "stanford",
      categories: ["college-credit-pre-college"],
      formats: ["residential"],
    },
    applied: "bad",
    unexpressible: "",
    assistantMessage: "bad",
  },
  "stanford",
);
assert(
  stanfordParsed.filterPatch.categories === undefined,
  "parseLlmResponse strips inferred filters for stanford",
);

if (failed === 0) {
  const data = JSON.parse(readFileSync("data/seed/programs.json", "utf-8")) as {
    programs: Program[];
  };
  const nyMaFilters = {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    includeLocations: ["new york", "massachusetts"],
  };
  const nyMaResults = filterPrograms(data.programs, nyMaFilters);
  assert(nyMaResults.length > 0, "NY or MA filter returns results");
  const hasNy = nyMaResults.some((p) => /,\s*NY\b/i.test(p.locationDisplay));
  const hasMa = nyMaResults.some((p) => /,\s*MA\b/i.test(p.locationDisplay));
  const hasPa = nyMaResults.some((p) => /,\s*PA\b/i.test(p.locationDisplay));
  assert(hasNy || hasMa, "NY or MA includes NY or MA programs");
  assert(!hasPa, "NY or MA excludes PA programs");
}

if (failed === 0) {
  const data = JSON.parse(readFileSync("data/seed/programs.json", "utf-8")) as {
    programs: Program[];
  };
  const eastCoastFilters: SearchFilters = {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    includeRegions: ["east-coast"],
  };
  const eastCoastResults = filterPrograms(data.programs, eastCoastFilters);
  assert(eastCoastResults.length > 0, "east coast filter returns results");
  const hasNy = eastCoastResults.some((p) => /,\s*NY\b/i.test(p.locationDisplay));
  const hasCa = eastCoastResults.some((p) => /,\s*CA\b/i.test(p.locationDisplay));
  assert(hasNy, "east coast includes NY programs");
  assert(!hasCa, "east coast excludes CA programs");

  const adirondack = data.programs.find((p) => p.name === "Adirondack Camp");
  if (adirondack) {
    const wildernessFilters: SearchFilters = {
      ...DEFAULT_SEARCH_FILTERS,
      gradesCompleted: [10],
      categories: ["outdoor-wilderness"],
      includeRegions: ["east-coast"],
    };
    const wildernessResults = filterPrograms(data.programs, wildernessFilters);
    assert(
      wildernessResults.some((p) => p.name === "Adirondack Camp"),
      "Adirondack matches wilderness via Outdoor/Wilderness secondary tag",
    );
  }

  const apogee = data.programs.find((p) => p.name === "Apogee Adventures");
  if (apogee) {
    const apogeeEastCoast = filterPrograms(data.programs, {
      ...DEFAULT_SEARCH_FILTERS,
      gradesCompleted: [10],
      categories: ["outdoor-wilderness"],
      includeRegions: ["east-coast"],
    });
    assert(
      apogeeEastCoast.some((p) => p.name === "Apogee Adventures"),
      "east coast matches New England in location text (Apogee)",
    );
  }
}

if (failed === 0) {
  const data = JSON.parse(readFileSync("data/seed/programs.json", "utf-8")) as {
    programs: Program[];
  };
  const commuterFilters: SearchFilters = {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    formats: ["commuter"],
  };
  const commuterResults = filterPrograms(data.programs, commuterFilters);
  assert(commuterResults.length > 0, "commuter filter returns results");
  assert(
    commuterResults.every((p) => p.formatTags.includes("commuter")),
    "commuter filter only commuter-tagged programs",
  );

  const priceCapFilters = {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    maxPrice: 2000,
  };
  const priceResults = filterPrograms(data.programs, priceCapFilters);
  assert(priceResults.length > 0, "maxPrice filter returns results");
  const overCap = priceResults.filter(
    (p) =>
      !p.priceUnknown &&
      !p.fullyFunded &&
      (p.priceMin ?? p.priceMax ?? 0) > 2000 &&
      (p.priceMax ?? p.priceMin ?? 0) > 2000,
  );
  assert(overCap.length === 0, "maxPrice excludes programs above cap");

  const threeWeekFilters = {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    minDurationWeeks: 3,
    maxDurationWeeks: 3,
  };
  const threeWeekResults = filterPrograms(data.programs, threeWeekFilters);
  assert(threeWeekResults.length > 0, "3-week duration filter returns results");
  const badLength = threeWeekResults.filter(
    (p) =>
      p.lengthMinDays != null &&
      p.lengthMaxDays != null &&
      (p.lengthMaxDays < 21 || p.lengthMinDays > 21),
  );
  assert(badLength.length === 0, "3-week filter uses lengthMinDays/MaxDays overlap");
}

if (failed === 0) {
  console.log("All LLM parse schema checks passed.");
} else {
  process.exit(1);
}
