/**
 * PRD §14.2 chat parser scenarios.
 * Run: npx tsx scripts/verify-chat-parser.ts
 */
import {
  DEFAULT_SEARCH_FILTERS,
  type SearchFilters,
} from "../src/lib/types/program";
import { mergeFilterPatch, parseChatMessage } from "../src/lib/chat-parser";
import { programMatchesCategory } from "../src/lib/data/matches-category";
import type { Program } from "../src/lib/types/program";

const baseContext = {
  filters: { ...DEFAULT_SEARCH_FILTERS, gradesCompleted: [10] },
  resultCount: 42,
  programs: [] as import("../src/lib/types/program").Program[],
};

type Case = {
  input: string;
  expectType: "filter" | "question" | "clear" | "unknown";
  assert?: (patch: Partial<SearchFilters> | undefined, message: string) => void;
};

const cases: Case[] = [
  {
    input: "only fully funded programs",
    expectType: "filter",
    assert: (patch) => {
      if (!patch?.fullyFundedOnly) throw new Error("expected fullyFundedOnly");
    },
  },
  {
    input: "my son just finished 11th grade",
    expectType: "filter",
    assert: (patch) => {
      if (!patch?.gradesCompleted?.includes(11)) throw new Error("expected grade 11");
    },
  },
  {
    input: "something in science or math",
    expectType: "filter",
    assert: (patch) => {
      const cats = patch?.categories ?? [];
      if (!cats.includes("stem-engineering") || !cats.includes("mathematics")) {
        throw new Error(`expected STEM + math, got ${cats.join(",")}`);
      }
    },
  },
  {
    input: "residential only, not online",
    expectType: "filter",
    assert: (patch) => {
      if (!patch?.formats?.includes("residential")) throw new Error("expected residential");
    },
  },
  {
    input: "highly competitive only",
    expectType: "filter",
    assert: (patch) => {
      if (!patch?.admissionTypes?.includes("highly_competitive")) {
        throw new Error("expected highly_competitive");
      }
    },
  },
  {
    input: "under 5000 dollars",
    expectType: "filter",
    assert: (patch) => {
      if (patch?.priceFilter !== "2k_5k") throw new Error("expected 2k_5k price filter");
    },
  },
  {
    input: "start over",
    expectType: "clear",
  },
  {
    input: "why is Harvard SSP still showing?",
    expectType: "question",
    assert: (_patch, message) => {
      if (!/harvard ssp/i.test(message)) throw new Error("expected Harvard SSP explanation");
    },
  },
  {
    input: "find girl only programs",
    expectType: "unknown",
    assert: (_patch, message) => {
      if (!/doesn't have that information at this point/i.test(message)) {
        throw new Error("expected honest limitation message");
      }
    },
  },
  {
    input: "in california only",
    expectType: "filter",
    assert: (patch) => {
      if (patch?.dataQuery !== "california") throw new Error("expected california dataQuery");
    },
  },
  {
    input: "camps in Massachusets",
    expectType: "filter",
    assert: (patch) => {
      if (patch?.dataQuery !== "massachusetts") throw new Error("expected massachusetts dataQuery");
    },
  },
  {
    input: "in MA only",
    expectType: "filter",
    assert: (patch) => {
      if (patch?.dataQuery !== "massachusetts") throw new Error("expected massachusetts from MA");
    },
  },
];

let failed = 0;

for (const testCase of cases) {
  const result = parseChatMessage(testCase.input, baseContext);
  if (result.type !== testCase.expectType) {
    console.error(
      `FAIL "${testCase.input}": type ${result.type}, expected ${testCase.expectType}`,
    );
    failed++;
    continue;
  }
  try {
    testCase.assert?.(result.filterPatch, result.message);
  } catch (err) {
    console.error(`FAIL "${testCase.input}": ${(err as Error).message}`);
    failed++;
  }
}

const merged = mergeFilterPatch(DEFAULT_SEARCH_FILTERS, {
  gradesCompleted: [11],
  fullyFundedOnly: true,
});
if (!merged.fullyFundedOnly || merged.gradesCompleted[0] !== 11) {
  console.error("FAIL mergeFilterPatch");
  failed++;
}

if (failed === 0) {
  const rsi = {
    category: "stem-engineering",
    secondaryTags: ["Leadership/Gifted"],
  } as Program;
  if (!programMatchesCategory(rsi, "leadership-gifted")) {
    console.error("FAIL secondary tag category match for RSI");
    failed++;
  }
}

if (failed === 0) {
  console.log("All chat parser checks passed.");
} else {
  process.exit(1);
}
