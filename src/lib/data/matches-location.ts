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
    aliases: ["cali", "los angeles", "san francisco", "berkeley", "stanford", "san diego"],
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
  { name: "district of columbia", abbr: "DC", aliases: ["washington dc", "washington, dc"], misspellings: [] },
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

function findStateByToken(token: string): UsState | null {
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

  for (const state of US_STATES) {
    if (normalized.length >= 5 && levenshtein(normalized, state.name) <= 2) return state;
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

/** Resolve free-text location input to a canonical state name for filtering. */
export function resolveLocationQuery(input: string): string | undefined {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return undefined;

  const whole = findStateByToken(trimmed.replace(/\s+only$/, "").trim());
  if (whole) return whole.name;

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  for (const token of tokens) {
    const state = findStateByToken(token);
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

function segmentHasStateAbbrev(segment: string, abbr: string): boolean {
  const normalized = segment.trim();
  if (!normalized) return false;
  return new RegExp(`(?:^|[,\\s])${abbr}(?:\\b|$)`, "i").test(normalized);
}

function residencyMatchesState(program: Program, state: UsState): boolean {
  if (!program.stateRestriction) return false;
  return program.stateRestriction.toUpperCase() === state.abbr;
}

function segmentMatchesState(segment: string, state: UsState): boolean {
  if (segmentHasStateAbbrev(segment, state.abbr)) return true;

  const lower = segment.toLowerCase();
  if (lower.includes(state.name)) return true;

  for (const alias of state.aliases) {
    if (new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lower)) {
      return true;
    }
  }

  return false;
}

export function matchesLocationQuery(program: Program, query: string): boolean {
  const state = resolveState(query);
  if (state) {
    if (residencyMatchesState(program, state)) return true;

    for (const segment of locationSegments(program.locationDisplay)) {
      if (segmentMatchesState(segment, state)) return true;
    }

    return false;
  }

  const needle = query.trim().toLowerCase();
  if (!needle) return false;

  const locationText = [program.locationDisplay, program.stateRestriction]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return locationText.includes(needle);
}

export function getStateAbbrev(stateName: string): string | undefined {
  return US_STATES.find((state) => state.name === stateName)?.abbr;
}

export { US_STATES, STATE_BY_ABBR };
