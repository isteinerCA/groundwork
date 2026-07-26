/**
 * Quick sanity check for admission + price normalization.
 * Run: npx tsx scripts/verify-normalization.ts
 */
import { normalizeAdmissionType } from "../src/lib/data/normalize-admission";
import { normalizeFormat } from "../src/lib/data/normalize-format";
import { parsePrice } from "../src/lib/data/parse-price";
import { matchesPriceFilter } from "../src/lib/data/matches-price-filter";

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
  ["Residential/Commuter/Online", ["both", "commuter", "online", "residential"]],
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

if (failed === 0) {
  console.log("All normalization checks passed.");
} else {
  process.exit(1);
}
