import type { Program } from "@/lib/types/program";

interface UsState {
  name: string;
  abbr: string;
  aliases: string[];
  misspellings: string[];
}

const US_STATES: UsState[] = [
  { name: "alabama", abbr: "AL", aliases: [], misspellings: [] },
  { name: "alaska", abbr: "AK", aliases: [], misspellings: [] },
  { name: "arizona", abbr: "AZ", aliases: ["phoenix", "tucson"], misspellings: [] },
  { name: "arkansas", abbr: "AR", aliases: [], misspellings: [] },
  {
    name: "california",
    abbr: "CA",
    aliases: ["cali", "san diego"],
    misspellings: ["californa", "califronia", "califorina"],
  },
  { name: "colorado", abbr: "CO", aliases: ["denver", "boulder"], misspellings: [] },
  { name: "connecticut", abbr: "CT", aliases: ["new haven"], misspellings: ["conneticut", "connecticutt"] },
  { name: "delaware", abbr: "DE", aliases: [], misspellings: [] },
  { name: "florida", abbr: "FL", aliases: ["miami", "orlando", "tampa"], misspellings: ["flordia", "floridia"] },
  { name: "georgia", abbr: "GA", aliases: ["atlanta"], misspellings: [] },
  { name: "hawaii", abbr: "HI", aliases: [], misspellings: [] },
  { name: "idaho", abbr: "ID", aliases: [], misspellings: [] },
  { name: "illinois", abbr: "IL", aliases: ["chicago", "evanston"], misspellings: ["illinois", "ilinois"] },
  { name: "indiana", abbr: "IN", aliases: ["west lafayette"], misspellings: [] },
  { name: "iowa", abbr: "IA", aliases: [], misspellings: [] },
  { name: "kansas", abbr: "KS", aliases: [], misspellings: [] },
  { name: "kentucky", abbr: "KY", aliases: [], misspellings: [] },
  { name: "louisiana", abbr: "LA", aliases: ["new orleans"], misspellings: [] },
  { name: "maine", abbr: "ME", aliases: [], misspellings: [] },
  { name: "maryland", abbr: "MD", aliases: ["baltimore"], misspellings: [] },
  {
    name: "massachusetts",
    abbr: "MA",
    aliases: ["boston", "cambridge", "waltham", "northampton"],
    misspellings: ["massachusets", "massachusettes", "massachussetts"],
  },
  { name: "michigan", abbr: "MI", aliases: ["ann arbor"], misspellings: [] },
  { name: "minnesota", abbr: "MN", aliases: [], misspellings: [] },
  { name: "mississippi", abbr: "MS", aliases: [], misspellings: [] },
  { name: "missouri", abbr: "MO", aliases: [], misspellings: [] },
  { name: "montana", abbr: "MT", aliases: [], misspellings: [] },
  { name: "nebraska", abbr: "NE", aliases: [], misspellings: [] },
  { name: "nevada", abbr: "NV", aliases: [], misspellings: [] },
  { name: "new hampshire", abbr: "NH", aliases: [], misspellings: [] },
  { name: "new jersey", abbr: "NJ", aliases: ["princeton"], misspellings: [] },
  { name: "new mexico", abbr: "NM", aliases: [], misspellings: [] },
  { name: "new york", abbr: "NY", aliases: ["nyc", "ithaca"], misspellings: ["new yrok"] },
  { name: "north carolina", abbr: "NC", aliases: ["durham"], misspellings: [] },
  { name: "north dakota", abbr: "ND", aliases: [], misspellings: [] },
  { name: "ohio", abbr: "OH", aliases: [], misspellings: [] },
  { name: "oklahoma", abbr: "OK", aliases: [], misspellings: [] },
  { name: "oregon", abbr: "OR", aliases: [], misspellings: [] },
  { name: "pennsylvania", abbr: "PA", aliases: ["philadelphia", "pittsburgh", "bethlehem"], misspellings: ["pennsylvannia", "pennsilvania"] },
  { name: "rhode island", abbr: "RI", aliases: [], misspellings: [] },
  { name: "south carolina", abbr: "SC", aliases: [], misspellings: [] },
  { name: "south dakota", abbr: "SD", aliases: [], misspellings: [] },
  { name: "tennessee", abbr: "TN", aliases: ["nashville"], misspellings: ["tennesee"] },
  { name: "texas", abbr: "TX", aliases: ["austin", "houston", "dallas"], misspellings: [] },
  { name: "utah", abbr: "UT", aliases: [], misspellings: [] },
  { name: "vermont", abbr: "VT", aliases: [], misspellings: [] },
  { name: "virginia", abbr: "VA", aliases: [], misspellings: [] },
  { name: "washington", abbr: "WA", aliases: ["seattle"], misspellings: [] },
  { name: "west virginia", abbr: "WV", aliases: [], misspellings: [] },
  { name: "wisconsin", abbr: "WI", aliases: [], misspellings: [] },
  { name: "wyoming", abbr: "WY", aliases: [], misspellings: [] },
  {
    name: "district of columbia",
    abbr: "DC",
    aliases: ["washington dc", "washington, dc", "washington d.c.", "washington, d.c."],
    misspellings: [],
  },
];

const STATE_BY_ABBR = Object.fromEntries(US_STATES.map((state) => [state.abbr, state])) as Record<
  string,
  UsState
>;

const STATE_BY_NAME = Object.fromEntries(US_STATES.map((state) => [state.name, state])) as Record<
  string,
  UsState
>;

const LOCATION_STOP_WORDS = new Set([
  "in",
  "at",
  "on",
  "or",
  "to",
  "of",
  "an",
  "as",
  "is",
  "no",
  "so",
  "we",
  "by",
  "up",
  "do",
  "go",
  "if",
  "us",
  "it",
  "my",
  "me",
  "he",
  "only",
  "camp",
  "camps",
  "programs",
  "program",
]);

/** Destinations that look like US-state typos but are distinct places. */
const NON_STATE_LOCATION_TOKENS = new Set(["india", "indian"]);

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

function findStateByTokenExact(token: string): UsState | null {
  const normalized = token.trim().toLowerCase().replace(/\./g, "");
  if (!normalized || LOCATION_STOP_WORDS.has(normalized)) return null;

  if (normalized.length === 2) {
    const byAbbr = STATE_BY_ABBR[normalized.toUpperCase()];
    if (byAbbr) return byAbbr;
  }

  for (const state of US_STATES) {
    if (normalized === state.name) return state;
    if (state.aliases.includes(normalized)) return state;
    if (state.misspellings.includes(normalized)) return state;
  }

  return null;
}

function isPrefixExtension(a: string, b: string): boolean {
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return longer.startsWith(shorter) && longer.length - shorter.length >= 2;
}

function findStateByToken(token: string): UsState | null {
  const exact = findStateByTokenExact(token);
  if (exact) return exact;

  const normalized = token.trim().toLowerCase().replace(/\./g, "");
  if (!normalized || normalized.length < 5) return null;
  if (NON_STATE_LOCATION_TOKENS.has(normalized)) return null;

  for (const state of US_STATES) {
    if (levenshtein(normalized, state.name) > 2) continue;
    // Avoid fuzzy state matches that diverge early (e.g. Marin → Maine).
    if (
      normalized.length >= 4 &&
      state.name.length >= 4 &&
      normalized.slice(0, 3) !== state.name.slice(0, 3)
    ) {
      continue;
    }
    // Avoid treating a different place as a typo of a longer state (India → Indiana).
    if (isPrefixExtension(normalized, state.name)) continue;
    return state;
  }

  return null;
}

function resolveState(query: string): UsState | null {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return null;

  const direct = findStateByToken(trimmed);
  if (direct) return direct;

  return STATE_BY_NAME[trimmed] ?? null;
}

const LOCATION_PREPOSITIONS = new Set(["in", "at", "near"]);

/** City searches that should also match nearby catalog locations. */
const CITY_QUERY_ALIASES: Record<string, readonly string[]> = {
  "los angeles": ["malibu"],
};

/**
 * Resolve free-text location input to a canonical state name.
 * Two-letter abbreviations match only as a standalone query ("ID", "in ID")
 * or a trailing qualifier ("Cambridge, MA") — not as the first token of a
 * brand name like "ID Tech".
 */
export function resolveLocationQuery(input: string): string | undefined {
  const trimmed = input.trim().toLowerCase().replace(/\s+only$/, "").trim();
  if (!trimmed) return undefined;

  const whole = findStateByToken(trimmed);
  if (whole) return whole.name;

  const commaParts = trimmed.split(",").map((part) => part.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    const trailing = findStateByToken(commaParts[commaParts.length - 1] ?? "");
    if (trailing) return trailing.name;
  }

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  const contentTokens = tokens.filter(
    (token) => !LOCATION_STOP_WORDS.has(token) && token !== "only",
  );

  if (contentTokens.length === 1) {
    const state = findStateByToken(contentTokens[0] ?? "");
    if (state) return state.name;
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    if (LOCATION_PREPOSITIONS.has(tokens[i] ?? "") && (tokens[i + 1]?.length ?? 0) === 2) {
      const state = findStateByToken(tokens[i + 1] ?? "");
      if (state) return state.name;
    }
  }

  // Multi-word queries like "marine biology" must not fuzzy-resolve a token to Maine.
  const tokenLookup = contentTokens.length > 1 ? findStateByTokenExact : findStateByToken;
  for (const token of contentTokens) {
    if (token.length === 2) continue;
    const state = tokenLookup(token);
    if (state) return state.name;
  }

  return undefined;
}

export function expandLocationQuery(query: string): string[] {
  const state = resolveState(query);
  if (state) {
    return [state.name, state.abbr.toLowerCase(), ...state.aliases];
  }
  return [query.trim().toLowerCase()].filter(Boolean);
}

/** Location segments — split combined formats like "Cambridge, MA & Online". */
function locationSegments(locationDisplay: string): string[] {
  return locationDisplay
    .split(/\s*&\s*|\s*;\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeLocationSegment(segment: string): string {
  return segment
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
}

function segmentIndicatesDc(segment: string): boolean {
  const normalized = normalizeLocationSegment(segment);
  if (!normalized) return false;
  if (normalized.includes("district of columbia")) return true;
  if (/\bwashington,?\s*d\s*c\b/.test(normalized)) return true;
  return /,\s*dc\b/.test(normalized);
}

function segmentHasStateAbbrev(segment: string, abbr: string): boolean {
  const normalized = segment.trim();
  if (!normalized) return false;
  const compact = normalized.replace(/\./g, "");
  return new RegExp(`(?:^|[,\\s])${abbr}(?:\\b|$)`, "i").test(compact);
}

function catalogStateMatches(program: Program, state: UsState): boolean {
  if (program.state?.toUpperCase() === state.abbr) return true;
  if (program.stateRestriction?.toUpperCase() === state.abbr) return true;
  return false;
}

function segmentMatchesState(segment: string, state: UsState): boolean {
  if (state.abbr === "DC") {
    return segmentIndicatesDc(segment) || segmentHasStateAbbrev(segment, state.abbr);
  }

  if (state.abbr === "WA" && segmentIndicatesDc(segment)) {
    return false;
  }

  if (segmentHasStateAbbrev(segment, state.abbr)) return true;

  const normalized = normalizeLocationSegment(segment);
  if (state.abbr === "WA" && /\bu washington\b/.test(normalized)) {
    return false;
  }

  if (normalized.includes(state.name)) return true;

  for (const alias of state.aliases) {
    const normalizedAlias = normalizeLocationSegment(alias);
    const aliasPattern = normalizedAlias
      .split(/\s+/)
      .filter(Boolean)
      .map(escapeRegExp)
      .join("\\s+");
    if (new RegExp(`\\b${aliasPattern}\\b`, "i").test(normalized)) {
      return true;
    }
  }

  return false;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Word-boundary city/place matching — avoids "marin" matching inside "Maine". */
function locationNeedleMatchesInText(locationText: string, needle: string): boolean {
  const trimmed = needle.trim().toLowerCase();
  if (!trimmed) return false;

  const normalizedText = normalizeLocationSegment(locationText);
  const normalizedNeedle = normalizeLocationSegment(trimmed);
  if (!normalizedNeedle) return false;

  const parts = normalizedNeedle.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (parts.length === 0) return false;

  const pattern = new RegExp(`\\b${parts.join("\\s+")}\\b`, "i");
  return pattern.test(normalizedText);
}

export function matchesLocationQuery(program: Program, query: string): boolean {
  const state = resolveState(query);
  if (state) {
    if (catalogStateMatches(program, state)) return true;

    for (const segment of locationSegments(program.locationDisplay)) {
      if (segmentMatchesState(segment, state)) return true;
    }

    return false;
  }

  const needle = query.trim().toLowerCase();
  if (!needle) return false;

  const locationText = [program.locationDisplay, program.state, program.stateRestriction]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const needles = [needle, ...(CITY_QUERY_ALIASES[needle] ?? [])];
  return needles.some((alias) => locationNeedleMatchesInText(locationText, alias));
}

/** Parse multi-state phrases like "NY or MA" into canonical state names. */
export function parseMultiStateLocations(input: string): string[] {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/\s+only$/, "")
    .replace(/\s+programs?$/, "")
    .trim();
  if (!normalized) return [];

  const hasSeparator = /\s+or\s+|\s*,\s*|\s+and\s+/i.test(normalized);
  if (!hasSeparator) {
    const single = resolveLocationQuery(normalized);
    return single ? [single] : [];
  }

  const parts = normalized
    .split(/\s+or\s+|\s*,\s*|\s+and\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const states = parts
    .map((part) => resolveLocationQuery(part))
    .filter((state): state is string => Boolean(state));

  return [...new Set(states)];
}

export function programMatchesAnyLocation(program: Program, locations: string[]): boolean {
  if (locations.length === 0) return true;
  return locations.some((location) => matchesLocationQuery(program, location));
}

export function getStateAbbrev(stateName: string): string | undefined {
  return US_STATES.find((state) => state.name === stateName)?.abbr;
}

export { US_STATES, STATE_BY_ABBR };
