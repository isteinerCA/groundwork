"use client";

const RESULTS_ANCHOR_ID = "search-results";

export function scrollToSearchResults() {
  document.getElementById(RESULTS_ANCHOR_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <p className="mt-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-parchment)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
        No programs match — try broadening your filters.
      </p>
    );
  }

  const label = `${count} program${count === 1 ? "" : "s"} to compare`;

  return (
    <button
      type="button"
      onClick={scrollToSearchResults}
      className="mt-3 flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-sage)] bg-[var(--color-sage-soft)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-sage)] hover:bg-[color-mix(in_srgb,var(--color-sage-soft)_85%,var(--color-sage))] lg:pointer-events-none lg:cursor-default"
    >
      <span>{label}</span>
      <span className="text-xs font-medium text-[var(--color-navy-light)] lg:hidden" aria-hidden>
        View results →
      </span>
    </button>
  );
}

export { RESULTS_ANCHOR_ID };
