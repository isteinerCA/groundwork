import { parseMonthList } from "@/lib/constants/months";
import { resolveLocationQuery } from "@/lib/data/matches-location";
import { resolveRegionQuery } from "@/lib/data/us-regions";
import { isDateWindowQuery } from "@/lib/search/parse-date-window-query";
import type { LlmParseResponse } from "@/lib/search/llm-parse-schema";
import type { SearchFilters } from "@/lib/types/program";

/** Words that signal structured filter intent, not a bare program name search. */
const FILTER_INTENT_PATTERN =
  /\b(only|just|under|over|above|below|before|after|until|through|between|ends?|starts?|expand|also|add|include|exclude|not in|instead|switch|change|narrow|broaden|plus|as well|first.?come|application|selective|competitive|residential|commuter|online|funded|credit|deposit|sevp|safety|wilderness|marine|stem|camps?|programs?|weeks?|days?|east coast|west coast|midwest|northeast|\$\d)\b/i;

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
  if (isDateWindowQuery(trimmed)) return false;

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
  const dataQuery = normalizeProgramNameQuery(message);
  return {
    clearAll: false,
    filterPatch: { dataQuery },
    applied: `Search: ${dataQuery}`,
    unexpressible: "",
    assistantMessage: `Searching for "${dataQuery}" in program names and descriptions.`,
  };
}

/**
 * Keep "ID Tech" as one token (idtech) so the two-letter prefix is not
 * matched as the word "id" inside unrelated program text.
 */
export function normalizeProgramNameQuery(name: string): string {
  const trimmed = name.trim().toLowerCase();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[0]?.length === 2) {
    return parts.join("");
  }
  return trimmed;
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

const NAME_SEARCH_INTENT =
  /\b(named|called|program name|name of (the )?program|not (about )?(the )?location|about the name)\b/i;

const REJECTS_LOCATION =
  /\b(not (about |in |a )?(the )?location|is not in |not in |removed the .+ filter|for any location|any location)\b/i;

function leftoverAfterName(message: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return message.replace(new RegExp(escaped, "ig"), " ");
}

/** Pull a quoted or "named/called X" program title from a longer question. */
export function extractProgramNameSearch(message: string): string | undefined {
  const trimmed = message.trim();
  if (!trimmed || !NAME_SEARCH_INTENT.test(trimmed)) return undefined;

  const quoted = trimmed.match(/["“”]([^"“”]{1,50})["“”]/);
  if (quoted?.[1]?.trim()) return quoted[1].trim();

  const named = trimmed.match(
    /\b(?:named|called)\s+([A-Za-z0-9][A-Za-z0-9.&'-]*(?:\s+(?!in\b|on\b|for\b|from\b|please\b|and\b)[A-Za-z0-9.&'-]+){0,3})/i,
  );
  const candidate = named?.[1]?.trim().replace(/\s+(please|thanks)$/i, "");
  if (candidate) return candidate;

  return undefined;
}

function nameFromHistory(
  history?: Array<{ role: string; text: string }>,
): string | undefined {
  if (!history?.length) return undefined;
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (entry?.role !== "user") continue;
    const extracted = extractProgramNameSearch(entry.text);
    if (extracted) return extracted;
    if (isLikelyProgramNameQuery(entry.text)) return entry.text.trim();
  }
  return undefined;
}

function buildNameSearchResponse(name: string): LlmParseResponse {
  const dataQuery = normalizeProgramNameQuery(name);
  return {
    clearAll: false,
    filterPatch: {
      dataQuery,
      includeLocations: [],
      includeRegions: [],
      excludeLocation: "",
    },
    applied: `Search: ${dataQuery}`,
    unexpressible: "",
    assistantMessage: `Searching for "${name.trim()}" in program names and descriptions — not as a location.`,
  };
}

/**
 * When the user says they want a program name (or that a location guess was
 * wrong), force a name search and clear location chips. Skip if they also
 * asked for a different real location in the same message.
 */
export function buildNameSearchOverride(
  message: string,
  currentFilters: SearchFilters,
  history?: Array<{ role: string; text: string }>,
): LlmParseResponse | undefined {
  if (!NAME_SEARCH_INTENT.test(message)) return undefined;

  const extracted = extractProgramNameSearch(message);
  const name =
    extracted ??
    nameFromHistory(history) ??
    (!resolveLocationQuery(currentFilters.dataQuery) ? currentFilters.dataQuery.trim() : "");

  if (extracted && !REJECTS_LOCATION.test(message)) {
    const leftoverLocation = resolveLocationQuery(leftoverAfterName(message, extracted));
    if (leftoverLocation) return undefined;
  }

  if (name) return buildNameSearchResponse(name);

  if (REJECTS_LOCATION.test(message)) {
    return {
      clearAll: false,
      filterPatch: {
        includeLocations: [],
        includeRegions: [],
        excludeLocation: "",
        dataQuery: !resolveLocationQuery(currentFilters.dataQuery)
          ? currentFilters.dataQuery
          : "",
      },
      applied: "Cleared location filters",
      unexpressible: "",
      assistantMessage:
        "I'll search by program name, not location. Tell me the name to look for if it isn't already in the search box.",
    };
  }

  return undefined;
}
