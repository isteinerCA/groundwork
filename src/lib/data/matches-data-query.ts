import type { Program } from "@/lib/types/program";
import { matchesLocationQuery, resolveLocationQuery } from "@/lib/data/matches-location";

/** Build searchable text from all CSV-backed program fields and gotcha flags. */
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

export function matchesDataQuery(program: Program, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const resolvedLocation = resolveLocationQuery(trimmed);
  if (resolvedLocation && matchesLocationQuery(program, resolvedLocation)) {
    return true;
  }

  if (matchesLocationQuery(program, trimmed)) {
    return true;
  }

  const haystack = programSearchText(program);
  const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

export function countDataQueryMatches(programs: Program[], query: string): number {
  return programs.filter((program) => matchesDataQuery(program, query)).length;
}
