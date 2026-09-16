import type { Program } from "@/lib/types/program";
import { termMatchesInText } from "@/lib/data/fuzzy-text-match";
import { matchesLocationQuery, resolveLocationQuery } from "@/lib/data/matches-location";
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

export interface DataQueryMatchOptions {
  /**
   * When true, unmatched institution suffixes are ignored if the distinctive
   * name tokens still match. Prefer using this only as a zero-result fallback
   * so "Boston University" still wins over a looser "Boston" match.
   */
  relaxInstitutionSuffixes?: boolean;
}

/** Build searchable text from CSV-backed fields and gotcha flags (not day-to-day notes). */
export function programSearchText(program: Program): string {
  const flagText = program.flags
    .map((flag) => `${flag.title} ${flag.body} ${flag.type}`)
    .join(" ");

  return [
    program.name,
    program.institution,
    program.locationDisplay,
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

  const haystack = programSearchText(program);
  const terms = distinctiveDataQueryTerms(trimmed);
  if (terms.length === 0) return true;

  const identityHaystack = programIdentitySearchText(program);
  // Single-term discipline queries must hit name/institution/offering label so cross-track
  // description mentions (e.g. photography collaborating with acting) do not false-match.
  // Catalog offerings opt out: description lists chooser options (instruments, etc.) intentionally.
  if (
    terms.length === 1 &&
    program.trackDetail?.trim() &&
    !program.catalogOffering &&
    !termMatchesInText(terms[0], identityHaystack)
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
