import { GLOBAL_ADVENTURE_LIST_DEFS } from "@/lib/constants/global-adventure-lists";
import type { Program } from "@/lib/types/program";
import { termMatchesInText } from "@/lib/data/fuzzy-text-match";
import {
  matchesLocationQuery,
  programMatchesAnyLocation,
  resolveLocationQuery,
} from "@/lib/data/matches-location";
import { programMatchesAnyRegion, resolveRegionQuery } from "@/lib/data/us-regions";

/**
 * Generic school-type words parents often append that are missing from titles
 * like "Marist Pre-College" or "Stanford AI4ALL".
 */
const OPTIONAL_INSTITUTION_TERMS = new Set([
  "university",
  "universities",
  "univ",
  "college",
  "colleges",
  "institute",
  "institution",
  "of",
  "the",
  "at",
]);

/** Generic words parents append that are not distinctive program content. */
const DATA_QUERY_STOPWORDS = new Set([
  "program",
  "programs",
  "camp",
  "camps",
  "course",
  "courses",
  "class",
  "classes",
  "summer",
  "school",
  "schools",
  "intensive",
  "intensives",
  "academy",
  "academies",
]);

function distinctiveDataQueryTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .filter((term) => !DATA_QUERY_STOPWORDS.has(term));
}

/** Identity fields for discipline-style queries (track name, not cross-track prose). */
function programIdentitySearchText(program: Program): string {
  return [program.name, program.institution, program.trackDetail]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Schedule-oriented offering labels (dates/departures) vs discipline names (Photography, Acting). */
function hasGenericTrackDetail(trackDetail: string): boolean {
  const track = trackDetail.trim();
  if (!track) return true;
  if (/^departure\s+\d+$/i.test(track)) return true;
  if (/^session(\s+(i+|ii+|\d+))?(\s*\(|$)/i.test(track)) return true;
  if (/\bdeparture\b/i.test(track)) return true;
  if (/^\d+-[\d]*\s*day\b/i.test(track)) return true;
  if (/\bindividual courses\b/i.test(track)) return true;
  return false;
}

/** Synonym groups for common activity searches on adventure/travel programs. */
/** Domestic destination buckets for curated list pages and natural-language search. */
const DOMESTIC_LOCATION_REGION_QUERIES: Record<string, readonly string[]> = {
  "new england": [
    "maine",
    "new hampshire",
    "vermont",
    "massachusetts",
    "rhode island",
    "connecticut",
  ],
  "pacific northwest": [
    "pacific northwest",
    "olympic",
    "seattle",
    "portland",
    "eugene",
    "friday harbor",
    "oregon",
  ],
  "washington dc": [
    "district of columbia",
    "washington dc",
    "washington, dc",
    "washington, d.c.",
  ],
  "washington d.c.": [
    "district of columbia",
    "washington dc",
    "washington, dc",
    "washington, d.c.",
  ],
  "los angeles": ["los angeles", "malibu"],
};

const ACTIVITY_QUERY_GROUPS: Record<string, readonly string[]> = {
  backpacking: ["backpacking", "hiking", "trekking", "mountain travel", "mountain trek"],
  "international relations": [
    "diplomacy",
    "geopolitics",
    "international relations",
    "international law",
    "international diplomacy",
    "governing america",
    "world in action",
  ],
  "marine biology": [
    "marine biology",
    "marine ecology",
    "marine science",
    "oceanography",
  ],
  theater: ["theater", "theatre", "acting"],
  business: ["business", "biz"],
};

/**
 * Search terms for continent-style queries. Matching uses location and identity fields only
 * (not description) so incidental prose like "non-Caribbean" or "Caribbean coast" in Costa Rica
 * does not pull programs into regional buckets.
 */
const AFRICA_SEARCH_TERMS: readonly string[] = [
  "africa",
  "algeria",
  "angola",
  "benin",
  "botswana",
  "burkina faso",
  "burundi",
  "cabo verde",
  "cape verde",
  "cameroon",
  "central african republic",
  "chad",
  "comoros",
  "congo",
  "democratic republic of the congo",
  "djibouti",
  "egypt",
  "equatorial guinea",
  "eritrea",
  "eswatini",
  "swaziland",
  "ethiopia",
  "gabon",
  "gambia",
  "ghana",
  "guinea",
  "guinea-bissau",
  "ivory coast",
  "cote d'ivoire",
  "kenya",
  "lesotho",
  "liberia",
  "libya",
  "madagascar",
  "malawi",
  "mali",
  "mauritania",
  "mauritius",
  "morocco",
  "mozambique",
  "namibia",
  "niger",
  "nigeria",
  "rwanda",
  "sao tome",
  "senegal",
  "seychelles",
  "sierra leone",
  "somalia",
  "south africa",
  "south sudan",
  "sudan",
  "tanzania",
  "zanzibar",
  "togo",
  "tunisia",
  "uganda",
  "zambia",
  "zimbabwe",
];

const SOUTH_AMERICA_SEARCH_TERMS: readonly string[] = [
  "argentina",
  "bolivia",
  "brazil",
  "chile",
  "colombia",
  "ecuador",
  "galapagos",
  "galápagos",
  "guyana",
  "paraguay",
  "peru",
  "suriname",
  "uruguay",
  "venezuela",
  "french guiana",
  "patagonia",
  "andes",
  "sacred valley",
  "machu picchu",
  "são paulo",
  "sao paulo",
  "buenos aires",
  "lima",
  "cusco",
  "cuzco",
  "quito",
  "bogota",
  "bogotá",
];

const CARIBBEAN_SEARCH_TERMS: readonly string[] = [
  "caribbean",
  "cuba",
  "dominican republic",
  "puerto rico",
  "jamaica",
  "haiti",
  "bahamas",
  "belize",
  "trinidad",
  "tobago",
  "barbados",
  "antigua and barbuda",
  "grenada",
  "st. lucia",
  "saint lucia",
  "st. martin",
  "st. barths",
  "virgin islands",
  "leeward islands",
  "windward islands",
  "turks and caicos",
  "cayman islands",
  "aruba",
  "curacao",
  "bonaire",
  "saba",
  "st. kitts",
  "nevis",
  "st. barts",
];

const REGION_QUERY_GROUPS: Record<string, readonly string[]> = {
  africa: AFRICA_SEARCH_TERMS,
  "south america": SOUTH_AMERICA_SEARCH_TERMS,
  caribbean: CARIBBEAN_SEARCH_TERMS,
};

/** Country/place list queries — match location and identity only, not description comparisons. */
const DESTINATION_PLACE_QUERIES = new Set(
  GLOBAL_ADVENTURE_LIST_DEFS.filter((def) => def.group === "where")
    .map((def) => def.dataQuery.trim().toLowerCase())
    .filter(Boolean),
);

function expandedActivityTerms(query: string): readonly string[] | null {
  return ACTIVITY_QUERY_GROUPS[query.trim().toLowerCase()] ?? null;
}

function expandedRegionTerms(query: string): readonly string[] | null {
  return REGION_QUERY_GROUPS[query.trim().toLowerCase()] ?? null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Word-boundary place matching — avoids compact-substring false positives (e.g. Ghana in "through … Anafiotika"). */
function placeTermMatchesInText(term: string, text: string): boolean {
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return true;

  const parts = trimmed.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (parts.length === 0) return true;

  const pattern = new RegExp(`\\b${parts.join("\\s+")}\\b`, "i");
  return pattern.test(text);
}

function programRegionSearchText(program: Program): string {
  return [program.locationDisplay, program.name, program.institution, program.trackDetail]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesRegionDataQuery(program: Program, terms: readonly string[]): boolean {
  const regionText = programRegionSearchText(program);
  return terms.some((term) => placeTermMatchesInText(term, regionText));
}

function singleTermMatchesOffering(program: Program, term: string): boolean {
  if (termMatchesInText(term, programIdentitySearchText(program))) return true;

  if (!hasGenericTrackDetail(program.trackDetail?.trim() ?? "")) return false;

  const description = program.description?.trim().toLowerCase() ?? "";
  return Boolean(description && termMatchesInText(term, description));
}

export interface DataQueryMatchOptions {
  /**
   * When true, unmatched institution suffixes are ignored if the distinctive
   * name tokens still match. Prefer using this only as a zero-result fallback
   * so "Boston University" still wins over a looser "Boston" match.
   */
  relaxInstitutionSuffixes?: boolean;
}

/** Build searchable text from CSV-backed fields and gotcha flags (not day-to-day notes). */
function programPrimarySearchText(program: Program): string {
  return [
    program.locationDisplay,
    program.name,
    program.institution,
    program.trackDetail,
    program.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function programFlagSearchText(program: Program): string {
  return program.flags
    .map((flag) => `${flag.title} ${flag.body}`)
    .join(" ")
    .toLowerCase();
}

function queryMatchesOnlyInFlags(program: Program, terms: string[]): boolean {
  const flagText = programFlagSearchText(program);
  const primaryText = programPrimarySearchText(program);

  const matchesFlags = terms.every((term) => termMatchesInText(term, flagText));
  if (!matchesFlags) return false;

  return !terms.every((term) => termMatchesInText(term, primaryText));
}

export function programSearchText(program: Program): string {
  const flagText = program.flags
    .map((flag) => `${flag.title} ${flag.body} ${flag.type}`)
    .join(" ");

  return [
    program.name,
    program.institution,
    program.locationDisplay,
    program.state,
    program.stateRestriction,
    program.gradeDisplay,
    program.trackDetail,
    program.description,
    program.creditDisplay,
    program.admissionDisplay,
    program.priceDisplay,
    program.lengthDisplay,
    program.datesDisplay,
    ...program.secondaryTags,
    flagText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesDataQuery(
  program: Program,
  query: string,
  options?: DataQueryMatchOptions,
): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const domesticRegionLocations = DOMESTIC_LOCATION_REGION_QUERIES[trimmed.toLowerCase()];
  if (domesticRegionLocations) {
    return programMatchesAnyLocation(program, [...domesticRegionLocations]);
  }

  const resolvedRegion = resolveRegionQuery(trimmed);
  if (resolvedRegion) {
    return programMatchesAnyRegion(program, [resolvedRegion]);
  }

  const resolvedLocation = resolveLocationQuery(trimmed);
  if (resolvedLocation) {
    return matchesLocationQuery(program, resolvedLocation);
  }

  if (matchesLocationQuery(program, trimmed)) {
    return true;
  }

  const terms = distinctiveDataQueryTerms(trimmed);
  if (terms.length === 0) return true;

  // Multi-word place queries must not match incidental mentions in gotcha flags
  // (e.g. Panama programs comparing themselves to Costa Rica).
  if (terms.length >= 2 && queryMatchesOnlyInFlags(program, terms)) {
    return false;
  }

  const activityTerms = expandedActivityTerms(trimmed);
  if (activityTerms) {
    return activityTerms.some((term) => singleTermMatchesOffering(program, term));
  }

  const regionTerms = expandedRegionTerms(trimmed);
  if (regionTerms) {
    return matchesRegionDataQuery(program, regionTerms);
  }

  if (DESTINATION_PLACE_QUERIES.has(trimmed.toLowerCase())) {
    return matchesRegionDataQuery(program, [trimmed.toLowerCase()]);
  }

  const haystack = programSearchText(program);

  const identityHaystack = programIdentitySearchText(program);
  // Single-term discipline queries must hit name/institution/offering label so cross-track
  // description mentions (e.g. photography collaborating with acting) do not false-match.
  // Catalog offerings opt out: description lists chooser options (instruments, etc.) intentionally.
  if (
    terms.length === 1 &&
    program.trackDetail?.trim() &&
    !program.catalogOffering &&
    !singleTermMatchesOffering(program, terms[0])
  ) {
    return false;
  }

  if (terms.every((term) => termMatchesInText(term, haystack))) return true;
  if (!options?.relaxInstitutionSuffixes) return false;

  const distinctiveTerms = terms.filter((term) => !OPTIONAL_INSTITUTION_TERMS.has(term));
  if (distinctiveTerms.length === 0 || distinctiveTerms.length === terms.length) {
    return false;
  }

  return distinctiveTerms.every((term) => termMatchesInText(term, haystack));
}

export function countDataQueryMatches(programs: Program[], query: string): number {
  const strictCount = programs.filter((program) => matchesDataQuery(program, query)).length;
  if (strictCount > 0) return strictCount;
  return programs.filter((program) =>
    matchesDataQuery(program, query, { relaxInstitutionSuffixes: true }),
  ).length;
}
