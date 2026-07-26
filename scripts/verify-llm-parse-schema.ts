/**
 * Schema and merge tests for LLM search parser (no live OpenAI calls).
 * Run: npm run verify:chat
 */
import { DEFAULT_SEARCH_FILTERS } from "../src/lib/types/program";
import { filterPrograms } from "../src/lib/data/filter-programs";
import { mergeFilterPatch, isExpandIntent } from "../src/lib/search/merge-filter-patch";
import {
  filterPatchSchema,
  llmParseResponseSchema,
  parseLlmResponse,
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

// expand location: union existing NY with new CA/WA
const nyOnly = {
  ...DEFAULT_SEARCH_FILTERS,
  gradesCompleted: [10],
  dataQuery: "new york",
};
const expandedLocations = mergeFilterPatch(
  nyOnly,
  { includeLocations: ["california", "washington"] },
  { expandFilters: true },
);
assert(
  expandedLocations.includeLocations.includes("new york") &&
    expandedLocations.includeLocations.includes("california") &&
    expandedLocations.includeLocations.includes("washington"),
  "expandFilters keeps NY when expanding to CA and WA",
);
assert(expandedLocations.dataQuery === "", "expandFilters clears dataQuery after location merge");

const replacedLocations = mergeFilterPatch(nyOnly, {
  includeLocations: ["california", "washington"],
});
assert(
  !replacedLocations.includeLocations.includes("new york") &&
    replacedLocations.includeLocations.includes("california"),
  "replace mode drops NY when setting new includeLocations",
);

// expand category: union wilderness + marine science
const wildernessOnly = {
  ...DEFAULT_SEARCH_FILTERS,
  gradesCompleted: [10],
  categories: ["outdoor-wilderness" as const],
};
const expandedCategories = mergeFilterPatch(
  wildernessOnly,
  { categories: ["marine-science"] },
  { expandFilters: true },
);
assert(
  expandedCategories.categories.includes("outdoor-wilderness") &&
    expandedCategories.categories.includes("marine-science"),
  "expandFilters keeps wilderness when expanding to marine science",
);

// expand format: union residential + online
const residentialOnly = {
  ...DEFAULT_SEARCH_FILTERS,
  gradesCompleted: [10],
  formats: ["residential" as const],
};
const expandedFormats = mergeFilterPatch(
  residentialOnly,
  { formats: ["online"] },
  { expandFilters: true },
);
assert(
  expandedFormats.formats.includes("residential") &&
    expandedFormats.formats.includes("online"),
  "expandFilters keeps residential when expanding to online",
);

assert(isExpandIntent("expand to CA and WA state"), "detects expand intent");
assert(isExpandIntent("expand to marine science"), "detects expand for categories");
assert(isExpandIntent("expand to online programs"), "detects expand for formats");
assert(!isExpandIntent("only CA and WA"), "detects replace-only intent");
assert(!isExpandIntent("online only"), "detects format replace intent");

// month filter from dataQuery promotion
const junePatch = sanitizeFilterPatch({ dataQuery: "programs only in June" });
assert(
  junePatch.includeMonths?.includes(6) && junePatch.dataQuery === "",
  "promotes June dataQuery to includeMonths",
);

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
  const data = JSON.parse(readFileSync("data/seed/programs.json", "utf-8")) as {
    programs: Program[];
  };
  const juneFilters: SearchFilters = {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    includeMonths: [6],
  };
  const juneResults = filterPrograms(data.programs, juneFilters);
  assert(juneResults.length > 0, "June month filter returns results");
  assert(
    juneResults.some((p) => p.name.includes("Rosetta Institute")),
    "Rosetta matches June overlap filter",
  );
  const julyOnlyFilters: SearchFilters = {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    includeMonths: [7],
  };
  const cosmosJuly = filterPrograms(data.programs, julyOnlyFilters).some(
    (p) => p.name === "COSMOS UC Davis",
  );
  assert(cosmosJuly, "COSMOS Jul 5 - Aug 1 matches July filter");
  const cosmosNotJune = !filterPrograms(data.programs, {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
    includeMonths: [6],
  }).some((p) => p.name === "COSMOS UC Davis");
  assert(cosmosNotJune, "COSMOS Jul-only program excluded from June-only filter");
}

if (failed === 0) {
  const data = JSON.parse(readFileSync("data/seed/programs.json", "utf-8")) as {
    programs: Program[];
  };
  const stonyBrook = data.programs.find((p) =>
    p.name.includes("Stony Brook Pre-College") &&
    p.trackDetail?.includes("Personal Branding"),
  );
  assert(stonyBrook?.priceUnknown, "Stony Brook course row has unknown price");
  if (stonyBrook) {
    const withUnlistedHidden = filterPrograms(data.programs, {
      ...DEFAULT_SEARCH_FILTERS,
      gradesCompleted: [10],
      excludeUnknownPrice: true,
    });
    assert(
      !withUnlistedHidden.some((p) => p.id === stonyBrook.id),
      "hide unlisted prices excludes Stony Brook course rows",
    );
    const withUnlistedShown = filterPrograms(data.programs, {
      ...DEFAULT_SEARCH_FILTERS,
      gradesCompleted: [10],
      excludeUnknownPrice: false,
    });
    assert(
      withUnlistedShown.some((p) => p.id === stonyBrook.id),
      "Stony Brook included when hide unlisted prices is off",
    );
  }
}

if (failed === 0) {
  console.log("All LLM parse schema checks passed.");
} else {
  process.exit(1);
}
