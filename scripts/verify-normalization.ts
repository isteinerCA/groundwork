/**
 * Quick sanity check for admission + price normalization.
 * Run: npx tsx scripts/verify-normalization.ts
 */
import { normalizeAdmissionType } from "../src/lib/data/normalize-admission";
import { normalizeFormat } from "../src/lib/data/normalize-format";
import { normalizeGrade, gradeMatchesFilter } from "../src/lib/data/normalize-grade";
import { matchesDataQuery } from "../src/lib/data/matches-data-query";
import { resolveLocationQuery } from "../src/lib/data/matches-location";
import { parsePrice } from "../src/lib/data/parse-price";
import { matchesPriceFilter } from "../src/lib/data/matches-price-filter";
import type { Program } from "../src/lib/types/program";

const admissionCases: [string, string][] = [
  ["First-come", "first_come"],
  ["Rolling", "first_come"],
  ["Highly competitive (4% acceptance)", "highly_competitive"],
  ["Selective (deadline Feb 28)", "application"],
  ["Rolling/selective", "application"],
];

let failed = 0;

for (const [raw, expected] of admissionCases) {
  const { admissionType } = normalizeAdmissionType(raw);
  if (admissionType !== expected) {
    console.error(`FAIL admission: "${raw}" → ${admissionType}, expected ${expected}`);
    failed++;
  }
}

const contact = parsePrice("Contact program");
if (!contact.priceUnknown) {
  console.error("FAIL: Contact program should be priceUnknown");
  failed++;
}

const included = matchesPriceFilter(contact, "under_2k", false);
const excluded = matchesPriceFilter(contact, "under_2k", true);
if (!included || excluded) {
  console.error("FAIL: Contact program price filter behavior");
  failed++;
}

const free = parsePrice("Free");
if (!free.fullyFunded || free.priceMin !== 0) {
  console.error("FAIL: Free price parsing");
  failed++;
}

const formatCases: [string, string[]][] = [
  ["Commuter", ["commuter"]],
  ["Day", ["commuter"]],
  ["Residential", ["residential"]],
  ["Residential/Commuter", ["residential", "commuter"]],
  ["Residential/Commuter/Online", ["commuter", "online", "residential"]],
];

for (const [raw, expected] of formatCases) {
  const { formatTags } = normalizeFormat(raw);
  const sorted = [...formatTags].sort();
  const expectedSorted = [...expected].sort();
  if (sorted.join(",") !== expectedSorted.join(",")) {
    console.error(`FAIL format: "${raw}" → [${sorted.join(", ")}], expected [${expectedSorted.join(", ")}]`);
    failed++;
  }
}

const stubProgram = (overrides: Partial<Program> & Pick<Program, "name" | "locationDisplay">): Program =>
  ({
    id: "stub",
    slug: "stub",
    category: "stem-engineering",
    secondaryTags: [],
    gradeDisplay: "9-12",
    gradeCompletedMin: 9,
    gradeCompletedMax: 12,
    admissionType: "application",
    admissionDisplay: "Application",
    formatDisplay: "Residential",
    formatTags: ["residential"],
    durationBucket: "two_to_four_weeks",
    lengthDisplay: "4 weeks",
    datesDisplay: "",
    isInternational: false,
    hasCollegeCredit: false,
    creditDisplay: "No",
    priceDisplay: "$0",
    priceMin: 0,
    priceMax: 0,
    priceUnknown: false,
    fullyFunded: false,
    financialAidAvailable: false,
    websiteUrl: "https://example.com",
    flags: [],
    dataVerifiedAt: "2026-01-01",
    ...overrides,
  }) as Program;

const cosmos = stubProgram({
  name: "COSMOS UC Davis",
  locationDisplay: "UC Davis, CA",
  stateRestriction: "CA",
});

const stanford = stubProgram({
  name: "Stanford AI4ALL",
  locationDisplay: "Stanford CA",
});

if (resolveLocationQuery("stanford") !== undefined) {
  console.error('FAIL: "stanford" should not resolve to a state');
  failed++;
}

if (resolveLocationQuery("california") !== "california") {
  console.error('FAIL: "california" should still resolve to california');
  failed++;
}

if (matchesDataQuery(cosmos, "stanford")) {
  console.error("FAIL: COSMOS should not match dataQuery stanford");
  failed++;
}

if (!matchesDataQuery(stanford, "stanford")) {
  console.error("FAIL: Stanford program should match dataQuery stanford");
  failed++;
}

const mathPathAge = normalizeGrade("Ages 11-14");
if (mathPathAge.gradeCompletedMax !== 8) {
  console.error(
    `FAIL: Ages 11-14 should map to max grade 8, got ${mathPathAge.gradeCompletedMax}`,
  );
  failed++;
}

const mathPathGrade = {
  gradeCompletedMin: mathPathAge.gradeCompletedMin,
  gradeCompletedMax: mathPathAge.gradeCompletedMax,
  gradeSource: mathPathAge.gradeSource,
};
if (gradeMatchesFilter(mathPathGrade, [12])) {
  console.error("FAIL: Ages 11-14 program should not match completed grade 12");
  failed++;
}

if (failed === 0) {
  console.log("All normalization checks passed.");
} else {
  process.exit(1);
}
