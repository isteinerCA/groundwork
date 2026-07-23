import type { AdmissionTypeId } from "@/lib/constants/admission-types";
import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import type { ProgramCategoryId } from "@/lib/constants/categories";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import type { PriceFilterId, ProgramFormatId } from "@/lib/constants/filters";
import { filterPrograms } from "@/lib/data/filter-programs";
import { matchesDataQuery, programSearchText } from "@/lib/data/matches-data-query";
import { resolveLocationQuery } from "@/lib/data/matches-location";
import type { Program, SearchFilters } from "@/lib/types/program";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/types/program";

export type ChatParseResult = {
  type: "filter" | "question" | "clear" | "unknown";
  filterPatch?: Partial<SearchFilters>;
  message: string;
};

export interface ChatParserContext {
  filters: SearchFilters;
  resultCount: number;
  programs: Program[];
}

const CATEGORY_KEYWORDS: [RegExp, ProgramCategoryId][] = [
  [/\b(?:ai|artificial intelligence|tech|computer|coding|robotics)\b/i, "artificial-intelligence"],
  [/\b(?:science|stem|engineering|research)\b/i, "stem-engineering"],
  [/\b(?:math|mathematics)\b/i, "mathematics"],
  [/\b(?:pre-?college|college credit)\b/i, "college-credit-pre-college"],
  [/\b(?:marine|ocean|oceanography)\b/i, "marine-science"],
  [/\b(?:writing|humanities|journalism|history|philosophy)\b/i, "writing-humanities"],
  [/\b(?:sleepaway|traditional camp|summer camp)\b/i, "traditional-camp"],
  [/\b(?:wilderness|outdoor|adventure|expedition)\b/i, "outdoor-wilderness"],
  [/\b(?:international|global|language|exchange|travel abroad)\b/i, "cultural-exchange"],
  [/\b(?:leadership|gifted|enrichment)\b/i, "leadership-gifted"],
  [/\b(?:pre-?med|biomedical|medicine|healthcare|life sciences?)\b/i, "biomedical"],
  [/\b(?:arts?|music|theater|theatre|performing|film|visual arts?)\b/i, "arts"],
];

function normalizeInput(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

function isQuestion(input: string): boolean {
  if (input.includes("?")) return true;
  return /^(why|what|how|when|who|where|can you explain|help me understand)\b/i.test(
    input,
  );
}

function parseGrade(input: string): number | null {
  const rising = input.match(/\brising\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (rising) {
    const next = Number(rising[1]);
    if (next >= 6 && next <= 12) return next - 1;
  }

  const finished = input.match(
    /\b(?:finished|completed|done with|just finished)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
  );
  if (finished) {
    const grade = Number(finished[1]);
    if (grade >= 6 && grade <= 12) return grade;
  }

  const named: Record<string, number> = {
    freshman: 9,
    sophomore: 10,
    junior: 11,
    senior: 12,
  };
  for (const [name, grade] of Object.entries(named)) {
    if (new RegExp(`\\b${name}\\b`, "i").test(input)) return grade;
  }

  const gradeWord = input.match(/\b(6|7|8|9|10|11|12)(?:st|nd|rd|th)?\s+grade\b/i);
  if (gradeWord) return Number(gradeWord[1]);

  const bare = input.match(/\bgrade\s+(6|7|8|9|10|11|12)\b/i);
  if (bare) return Number(bare[1]);

  return null;
}

function parseCategories(input: string): ProgramCategoryId[] {
  const found = new Set<ProgramCategoryId>();
  for (const [pattern, id] of CATEGORY_KEYWORDS) {
    if (pattern.test(input)) found.add(id);
  }
  return [...found];
}

function parseAdmission(input: string): AdmissionTypeId | null {
  if (/\b(?:highly competitive|most selective|elite|very selective)\b/i.test(input)) {
    return "highly_competitive";
  }
  if (/\b(?:first[- ]come|rolling enrollment|open enrollment)\b/i.test(input)) {
    return "first_come";
  }
  if (/\b(?:application required|apply required|selective application)\b/i.test(input)) {
    return "application";
  }
  return null;
}

function parseFormat(input: string): ProgramFormatId[] | null {
  const wantsResidential =
    /\b(?:residential only|in[- ]person only|on campus only|not online|no online)\b/i.test(
      input,
    ) || (/\bresidential\b/i.test(input) && /\bonly\b/i.test(input));

  if (wantsResidential) return ["residential"];

  if (/\b(?:online only|virtual only|remote only)\b/i.test(input)) {
    return ["online"];
  }

  if (/\b(?:residential|on campus|in person)\b/i.test(input) && !/\bonline\b/i.test(input)) {
    return ["residential"];
  }

  if (/\bonline\b/i.test(input) && !/\bresidential\b/i.test(input)) {
    return ["online"];
  }

  return null;
}

function parsePriceFilter(input: string): PriceFilterId | null {
  if (/\b(?:under|below|less than|max)\s*\$?\s*2,?000\b/i.test(input)) {
    return "under_2k";
  }
  if (/\b(?:under|below|less than|max)\s*\$?\s*5,?000\b/i.test(input)) {
    return "2k_5k";
  }
  if (/\b(?:under|below|less than|max)\s*\$?\s*10,?000\b/i.test(input)) {
    return "5k_10k";
  }
  if (/\b(?:over|above|more than)\s*\$?\s*10,?000\b/i.test(input) || /\b\$10k\+|\b10k\+/i.test(input)) {
    return "10k_plus";
  }
  if (/\$?\s*2,?000\s*[-–]\s*\$?\s*5,?000\b/i.test(input)) {
    return "2k_5k";
  }
  if (/\$?\s*5,?000\s*[-–]\s*\$?\s*10,?000\b/i.test(input)) {
    return "5k_10k";
  }
  return null;
}

function parseDataQuery(input: string): string | undefined {
  if (/\b(?:clear|remove|drop)\s+(?:location|data|text|search)\b/i.test(input)) {
    return "";
  }
  if (/^(?:anywhere|any location|all locations)$/i.test(input)) {
    return "";
  }

  const direct = resolveLocationQuery(input);
  if (direct) return direct;

  const inMatch = input.match(
    /\b(?:in|from|near|around)\s+([a-z][a-z\s,.-]{1,40}?)(?:\s+only|\s+programs?|\s+camps?)?\s*$/i,
  );
  if (inMatch) {
    const resolved = resolveLocationQuery(inMatch[1]) ?? inMatch[1].trim().toLowerCase();
    if (resolved.length >= 2) return resolved;
  }

  const onlyMatch = input.match(/^([a-z][a-z\s,.-]{1,40}?)\s+only\s*$/i);
  if (onlyMatch) {
    const raw = onlyMatch[1].trim().toLowerCase();
    if (/^(fully funded|residential|online|selective)$/i.test(raw)) return undefined;
    const resolved = resolveLocationQuery(raw) ?? raw;
    if (resolved.length >= 2) return resolved;
  }

  return undefined;
}

function gradeScopedPrograms(context: ChatParserContext): Program[] {
  if (context.filters.gradesCompleted.length === 0) return [];
  return filterPrograms(context.programs, {
    ...context.filters,
    dataQuery: "",
    categories: [],
    admissionTypes: [],
    formats: [],
    durationBuckets: [],
    collegeCreditOnly: false,
    fullyFundedOnly: false,
    priceFilter: "any",
    usOnly: false,
    excludeUnknownPrice: false,
  });
}

function answerQuestion(input: string, context: ChatParserContext): string {
  const lower = input.toLowerCase();
  const scoped = gradeScopedPrograms(context);

  if (lower.includes("harvard") && lower.includes("ssp")) {
    const gradeSelected = context.filters.gradesCompleted.length > 0;
    return gradeSelected
      ? "Harvard SSP still appears because it matches your grade filter and any active category or format filters. It is not hidden by default — check the Hidden Details panel on its card for SEVP and safety context. Try adding Selective or Pre-College filters, or search for a specific program name in the results list."
      : "Harvard SSP will appear once you select a grade it accepts (typically grades 10–12). Select a grade chip first, then narrow with categories or admission type if you want fewer results.";
  }

  if (/\bwhy\b.*\b(show|appear|still)\b/i.test(input)) {
    return `Programs stay visible when they match your active filters. You currently have ${context.resultCount} result${context.resultCount === 1 ? "" : "s"}. Try tightening admission type, price, or format — or say "start over" to reset.`;
  }

  if (/\bwhat\b.*\bgrade\b/i.test(input)) {
    return 'Groundwork uses the grade your child just completed (not rising grade). Try: "my son just finished 11th grade" or tap a grade chip above.';
  }

  if (/\bhow\b.*\b(price|cost|filter)\b/i.test(input)) {
    return 'Try phrases like "under 5000 dollars", "only fully funded programs", or "hide unlisted prices". Price filters include programs marked "Contact program" unless you hide unlisted prices.';
  }

  const locationTerm = resolveLocationQuery(input);
  if (locationTerm && scoped.length > 0) {
    const count = scoped.filter((program) => matchesDataQuery(program, locationTerm)).length;
    return `${count} program${count === 1 ? "" : "s"} in your grade range mention ${locationTerm} (location, residency, or gotchas). Say "in ${locationTerm} only" to filter your results.`;
  }

  if (/\b(?:gotcha|hidden detail|flag|deposit|safety|sevp)\b/i.test(input)) {
    const flagged = scoped.filter((program) => program.flags.length > 0);
    if (flagged.length === 0) {
      return "No gotcha flags in your current grade range. Select a grade first, then ask about a specific program name.";
    }
    const examples = flagged
      .slice(0, 3)
      .map((program) => `${program.name} (${program.flags[0]?.title ?? "flag"})`)
      .join("; ");
    return `${flagged.length} program${flagged.length === 1 ? "" : "s"} in your grade range have hidden-detail flags — e.g. ${examples}. Say a location or topic to narrow, or open a program card for full citations.`;
  }

  if (/\bhow many\b/i.test(input) && scoped.length > 0) {
    return `You have ${context.resultCount} program${context.resultCount === 1 ? "" : "s"} with your current filters. I can also search location and gotchas from our program data — try "in California only" or "programs with deposit flags".`;
  }

  return "Groundwork doesn't have that information at this point. I can search program locations, gotchas, and descriptions — or adjust grade, category, budget, format, and admission filters.";
}

function buildUnknownMessage(input: string): string {
  if (/\b(?:girl|boy|boys|girls|women|men|female|male|single[- ]sex|gender)\b/i.test(input)) {
    return "Groundwork doesn't have that information at this point — we can't filter by gender or single-sex programs yet, but we hope to support more search options in the future. Try category, format, budget, or admission type, or browse your results.";
  }

  const summary = input.length > 72 ? `${input.slice(0, 69)}…` : input;

  if (/\b(?:find|show|filter|only|looking for|want|need|programs?)\b/i.test(input)) {
    return `Groundwork doesn't have that information at this point — I couldn't match "${summary}" in our program data or filters. Try a location ("in California only"), budget, category, or a gotcha keyword like "deposit".`;
  }

  return "Groundwork doesn't have that information at this point. I can search locations, gotchas, and program details — or adjust grade, category, budget, format, and admission filters.";
}

function describePatch(patch: Partial<SearchFilters>): string {
  const parts: string[] = [];

  if (patch.gradesCompleted?.length) {
    parts.push(`grade ${patch.gradesCompleted.join(", ")}`);
  }
  if (patch.categories?.length) {
    const labels = patch.categories.map(
      (id) => PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id,
    );
    parts.push(`categories: ${labels.join(", ")}`);
  }
  if (patch.admissionTypes?.length) {
    const labels = patch.admissionTypes.map(
      (id) => ADMISSION_TYPES.find((a) => a.id === id)?.label ?? id,
    );
    parts.push(`admission: ${labels.join(", ")}`);
  }
  if (patch.formats?.length) {
    parts.push(`format: ${patch.formats.join(", ")}`);
  }
  if (patch.fullyFundedOnly) parts.push("fully funded only");
  if (patch.collegeCreditOnly) parts.push("college credit only");
  if (patch.usOnly) parts.push("US only");
  if (patch.excludeUnknownPrice) parts.push("hide unlisted prices");
  if (patch.priceFilter && patch.priceFilter !== "any") {
    parts.push(`max price: ${patch.priceFilter.replace(/_/g, " ")}`);
  }
  if (patch.dataQuery?.trim()) {
    parts.push(`search: "${patch.dataQuery.trim()}"`);
  }

  return parts.length > 0 ? parts.join(" · ") : "filters updated";
}

export function parseChatMessage(
  raw: string,
  context: ChatParserContext = {
    filters: DEFAULT_SEARCH_FILTERS,
    resultCount: 0,
    programs: [],
  },
): ChatParseResult {
  const input = normalizeInput(raw);
  if (!input) {
    return { type: "unknown", message: "Type a message to refine your search." };
  }

  if (/^(?:start over|clear all|reset(?: filters)?|start fresh)$/i.test(input)) {
    return {
      type: "clear",
      filterPatch: DEFAULT_SEARCH_FILTERS,
      message: "Cleared all filters. Select a grade to search again.",
    };
  }

  if (isQuestion(input)) {
    return {
      type: "question",
      message: answerQuestion(input, context),
    };
  }

  const patch: Partial<SearchFilters> = {};
  let changed = false;

  const grade = parseGrade(input);
  if (grade !== null) {
    patch.gradesCompleted = [grade];
    changed = true;
  }

  const categories = parseCategories(input);
  if (categories.length > 0) {
    const replace = /\bonly\b/i.test(input) && !/\bor\b/i.test(input);
    patch.categories = replace
      ? categories
      : [...new Set([...context.filters.categories, ...categories])];
    changed = true;
  }

  const admission = parseAdmission(input);
  if (admission) {
    patch.admissionTypes = [admission];
    changed = true;
  }

  const formats = parseFormat(input);
  if (formats) {
    patch.formats = formats;
    changed = true;
  }

  const priceFilter = parsePriceFilter(input);
  if (priceFilter) {
    patch.priceFilter = priceFilter;
    changed = true;
  }

  if (/\b(?:fully funded|full(?:y)? scholarship|free programs?|no cost)\b/i.test(input)) {
    patch.fullyFundedOnly = true;
    changed = true;
  }

  if (/\bcollege credit\b/i.test(input) && !/\bpre-?college\b/i.test(input)) {
    patch.collegeCreditOnly = true;
    changed = true;
  }

  if (/\b(?:us only|united states only|domestic only)\b/i.test(input)) {
    patch.usOnly = true;
    changed = true;
  }

  if (/\b(?:hide unlisted|unlisted prices?|contact program prices?)\b/i.test(input)) {
    patch.excludeUnknownPrice = true;
    changed = true;
  }

  const dataQuery = parseDataQuery(input);
  if (dataQuery !== undefined) {
    patch.dataQuery = dataQuery;
    changed = true;
  }

  if (!changed) {
    const fallbackQuery = input
      .replace(/\b(?:find|show|list|programs?|options?|looking for)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (fallbackQuery.length >= 3 && context.programs.length > 0) {
      const scoped = gradeScopedPrograms(context);
      const matches = scoped.filter((program) =>
        programSearchText(program).includes(fallbackQuery.toLowerCase()),
      );
      if (matches.length > 0 && matches.length < scoped.length) {
        patch.dataQuery = fallbackQuery;
        changed = true;
      }
    }
  }

  if (!changed) {
    return { type: "unknown", message: buildUnknownMessage(input) };
  }

  const nextFilters = mergeFilterPatch(context.filters, patch);
  const nextCount =
    context.programs.length > 0
      ? filterPrograms(context.programs, nextFilters).length
      : context.resultCount;

  const followUp =
    nextCount >= 25
      ? " Still a long list — try narrowing budget or admission type."
      : nextCount <= 8 && nextFilters.gradesCompleted.length > 0
        ? " Short list — ask me to broaden if you want more options."
        : "";

  const countNote =
    patch.dataQuery !== undefined && context.programs.length > 0
      ? ` ${nextCount} program${nextCount === 1 ? "" : "s"} match.`
      : "";

  return {
    type: "filter",
    filterPatch: patch,
    message: `Applied ${describePatch(patch)}.${countNote}${followUp}`,
  };
}

export function getChatOpeningPrompt(context: ChatParserContext): string {
  if (context.filters.gradesCompleted.length === 0) {
    return 'Start with a grade — e.g. "just finished 10th grade" — then try "in California only" or budget filters.';
  }
  if (context.resultCount === 0) {
    return "No matches — ask me to broaden categories, raise your budget, or say \"start over.\"";
  }
  if (context.resultCount <= 8) {
    return `${context.resultCount} programs — want to broaden categories or relax price?`;
  }
  if (context.resultCount >= 25) {
    return `${context.resultCount} programs — try narrowing by budget, format, or admission type.`;
  }
  return `${context.resultCount} programs — refine with plain English (budget, location, gotchas).`;
}

export function mergeFilterPatch(
  current: SearchFilters,
  patch: Partial<SearchFilters>,
): SearchFilters {
  return { ...current, ...patch };
}
