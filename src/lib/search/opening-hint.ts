import type { SearchFilters } from "@/lib/types/program";

/** Result count at which we nudge users to narrow (mobile Step 2 callout). */
export const MANY_SEARCH_RESULTS_THRESHOLD = 25;

export interface OpeningHintContext {
  filters: SearchFilters;
  resultCount: number;
}

export function getOpeningHint(context: OpeningHintContext): string {
  if (context.filters.gradesCompleted.length === 0) {
    return "Select a grade above to see programs, then fine-tune here.";
  }
  if (context.resultCount === 0) {
    return 'No programs match — broaden categories or say "start over."';
  }
  const label = `${context.resultCount} program${context.resultCount === 1 ? "" : "s"} found`;
  return `${label}. Refine with plain English (location, theme, specific dates, etc.).`;
}
