"use client";

const RESULTS_ANCHOR_ID = "search-results";
const REFINE_FILTERS_ANCHOR_ID = "search-refine-filters";

export function scrollToSearchResults() {
  document.getElementById(RESULTS_ANCHOR_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function scrollToRefineFilters() {
  document.getElementById(REFINE_FILTERS_ANCHOR_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function FilterResultsCounter({
  count,
  hasGrade,
}: {
  count: number;
  hasGrade: boolean;
}) {
  if (!hasGrade) return null;

  if (count === 0) {
    return (
      <div className="mt-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-parchment)] px-3 py-3">
        <p className="text-sm text-[var(--color-text-muted)]">
          No programs match — try broadening your filters.
        </p>
        <button
          type="button"
          onClick={scrollToRefineFilters}
          className="btn btn-secondary mt-2.5 w-full px-3 py-2 text-sm lg:hidden"
        >
          Refine filters
        </button>
      </div>
    );
  }

  const label = `${count} program${count === 1 ? "" : "s"} to compare`;

  return (
    <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-sage)] bg-[var(--color-sage-soft)] px-3 py-3 lg:py-2.5">
      <p className="text-sm font-semibold text-[var(--color-navy)]">{label}</p>
      <div className="mt-2.5 grid grid-cols-2 gap-2 lg:hidden">
        <button
          type="button"
          onClick={scrollToSearchResults}
          className="btn btn-primary px-3 py-2 text-sm"
        >
          View results
        </button>
        <button
          type="button"
          onClick={scrollToRefineFilters}
          className="btn btn-secondary px-3 py-2 text-sm"
        >
          Refine filters
        </button>
      </div>
    </div>
  );
}

export { RESULTS_ANCHOR_ID, REFINE_FILTERS_ANCHOR_ID };
