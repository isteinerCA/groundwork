import type { PredefinedList } from "@/lib/constants/predefined-lists";
import { filterPrograms, sortPrograms } from "@/lib/data/filter-programs";
import type { Program } from "@/lib/types/program";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/types/program";

export function predefinedListPageTitle(list: PredefinedList): string {
  return `Start exploring ${list.titleLabel} for ${list.audienceLabel}`;
}

export function programListLabel(program: Program): string {
  return program.trackDetail ? `${program.name} — ${program.trackDetail}` : program.name;
}

/** Programs matching a predefined list's locked filters, in default search order. */
export function getProgramsForPredefinedList(
  programs: Program[],
  list: PredefinedList,
): Program[] {
  return sortPrograms(
    filterPrograms(programs, {
      ...DEFAULT_SEARCH_FILTERS,
      ...list.lockedFilters,
    }),
    "selectivity",
  );
}
