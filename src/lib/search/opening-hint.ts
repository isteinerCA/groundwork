import type { SearchFilters } from "@/lib/types/program";

export interface OpeningHintContext {
  filters: SearchFilters;
  resultCount: number;
}

export function getOpeningHint(context: OpeningHintContext): string {
  if (context.filters.gradesCompleted.length === 0) {
    return 'Start with a grade — e.g. "just finished 10th grade" — then try "in California only" or budget filters.';
  }
  if (context.resultCount === 0) {
    return 'No matches — ask me to broaden categories, raise your budget, or say "start over."';
  }
  if (context.resultCount <= 8) {
    return `${context.resultCount} programs — want to broaden categories or relax price?`;
  }
  if (context.resultCount >= 25) {
    return `${context.resultCount} programs — try narrowing by budget, format, or admission type.`;
  }
  return `${context.resultCount} programs — refine with plain English (budget, location, gotchas).`;
}
