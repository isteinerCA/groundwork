/**
 * Sanity checks for analytics helpers.
 * Run: npx tsx scripts/verify-analytics.ts
 */
import { chatQueryPreview, gaString, summarizeSearchFilters } from "../src/lib/analytics";
import { buildChatLogRecord } from "../src/lib/search/chat-log";
import { redactPii } from "../src/lib/search/redact-pii";
import { DEFAULT_SEARCH_FILTERS } from "../src/lib/types/program";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

assert(redactPii("in California only") === "in California only", "plain text should pass through");
assert(
  redactPii("email me at parent@example.com please") === "email me at [email] please",
  "emails should be redacted",
);
assert(redactPii("call 415-555-1212") === "call [phone]", "phones should be redacted");

const long = "x".repeat(120);
assert(gaString(long).length === 100, "gaString should cap at 100");
assert(gaString(long).endsWith("…"), "gaString should ellipsize");
assert(chatQueryPreview("parent@example.com wants Stanford").includes("[email]"), "preview redacts email");
assert(!chatQueryPreview("parent@example.com wants Stanford").includes("parent@"), "preview drops raw email");

const summary = summarizeSearchFilters({
  ...DEFAULT_SEARCH_FILTERS,
  gradesCompleted: [10, 11],
  categories: ["marine-science", "stem-engineering"],
  formats: ["residential"],
  fullyFundedOnly: true,
  includeLocations: ["california"],
  includeMonths: [6, 7],
  priceFilter: "under_2k",
});

assert(summary.grades === "10,11", `grades snapshot, got ${summary.grades}`);
assert(
  summary.categories === "marine-science,stem-engineering",
  `categories snapshot, got ${summary.categories}`,
);
assert(summary.formats === "residential", "formats snapshot");
assert(summary.locations === "california", "locations snapshot");
assert(summary.months === "6,7", "months snapshot");
assert(summary.fully_funded === true, "fully funded flag");
assert(summary.price_filter === "under_2k", "price filter");
assert(summary.has_data_query === false, "empty data query");
assert(summary.admission === undefined, "unused list filters should be omitted");

const record = buildChatLogRecord({
  rawText: "only fully funded in california — parent@home.com",
  filters: {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [11],
    fullyFundedOnly: true,
  },
  resultCount: 12,
  patchKeys: ["fullyFundedOnly", "includeLocations"],
  applied: "Fully funded + California",
});

assert(record.message.includes("[email]"), "chat log redacts email");
assert(!record.message.includes("parent@home.com"), "chat log drops raw email");
assert(record.messageHash.length === 16, "message hash is truncated sha256");
assert(record.hadPatch === true, "patch keys mark hadPatch");
assert(record.filterSummary.fully_funded === true, "chat log includes filter snapshot");

if (failed > 0) {
  console.error(`${failed} analytics check(s) failed.`);
  process.exit(1);
}

console.log("All analytics checks passed.");
