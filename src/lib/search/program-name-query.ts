import { parseMonthList } from "@/lib/constants/months";
import { resolveLocationQuery } from "@/lib/data/matches-location";
import { resolveRegionQuery } from "@/lib/data/us-regions";
import type { LlmParseResponse } from "@/lib/search/llm-parse-schema";
import type { SearchFilters } from "@/lib/types/program";

/** Words that signal structured filter intent, not a bare program name search. */
const FILTER_INTENT_PATTERN =
  /\b(only|just|under|over|above|below|expand|also|add|include|exclude|not in|instead|switch|change|narrow|broaden|plus|as well|first.?come|application|selective|competitive|residential|commuter|online|funded|credit|deposit|sevp|safety|wilderness|marine|stem|camps?|programs?|weeks?|days?|east coast|west coast|midwest|northeast|\$\d)\b/i;

const MONTH_ONLY_PATTERN =
  /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)$/i;

/**
 * True when the user likely typed a program/institution keyword, not filter criteria.
 * Examples: "UCLA", "COSMO", "stony brook", "Rosetta"
 */
export function isLikelyProgramNameQuery(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 50) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 3) return false;

  if (FILTER_INTENT_PATTERN.test(trimmed)) return false;
  if (MONTH_ONLY_PATTERN.test(trimmed)) return false;
  if (resolveLocationQuery(trimmed)) return false;
  if (resolveRegionQuery(trimmed)) return false;
  if (parseMonthList(trimmed).length > 0) return false;

  return true;
}

/** Strip inferred structured filters when the user only searched a program name. */
export function constrainFilterPatchForProgramNameQuery(
  message: string,
  patch: Partial<SearchFilters>,
): Partial<SearchFilters> {
  if (!isLikelyProgramNameQuery(message)) return patch;

  const dataQuery = patch.dataQuery?.trim() || message.trim().toLowerCase();
  return { dataQuery };
}

/** Deterministic parse for bare program/institution name searches (no LLM). */
export function buildProgramNameParseResponse(message: string): LlmParseResponse {
  const dataQuery = message.trim().toLowerCase();
  return {
    clearAll: false,
    filterPatch: { dataQuery },
    applied: `Search: ${dataQuery}`,
    unexpressible: "",
    assistantMessage: `Searching for "${dataQuery}" in program names and descriptions.`,
  };
}

/** Rewrite LLM copy so it doesn't claim filters the user didn't ask for. */
export function constrainProgramNameSearchResponse(
  message: string,
  response: LlmParseResponse,
): LlmParseResponse {
  if (!isLikelyProgramNameQuery(message)) return response;

  const dataQuery =
    response.filterPatch.dataQuery?.trim() || message.trim().toLowerCase();

  return {
    ...response,
    filterPatch: { dataQuery },
    applied: `Search: ${dataQuery}`,
    unexpressible: "",
    assistantMessage: `Searching for "${dataQuery}" in program names and descriptions.`,
  };
}
