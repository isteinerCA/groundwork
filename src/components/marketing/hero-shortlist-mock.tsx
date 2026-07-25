/** Compact static mock of the shortlist flow — filters left, one result right. */
export function HeroShortlistMock() {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-parchment)]/70 px-3 py-2">
        <p className="text-xs font-semibold text-[var(--color-navy)]">Build your shortlist</p>
        <span className="rounded-full bg-[var(--color-sage-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-navy-dark)]">
          Filter → ♡ save
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)]">
        <div className="space-y-3 border-r border-[var(--color-border)] bg-[var(--color-parchment)]/30 p-3">
          <div>
            <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              Grade
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <MockChip label="9th" />
              <MockChip label="10th" selected />
              <MockChip label="11th" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              Category
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <MockChip label="STEM" selected />
              <MockChip label="Marine" />
              <MockChip label="Arts" />
            </div>
          </div>
        </div>

        <div className="p-3">
          <p className="text-[11px] text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-navy)]">24 programs</span> to compare
          </p>
          <div className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[var(--color-navy)]">
                  COSMOS UC Davis
                </p>
                <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-muted)]">
                  Selective · 4 weeks · CA residents
                </p>
              </div>
              <span className="shrink-0 text-sm text-[var(--color-navy-light)]" aria-hidden>
                ♡
              </span>
            </div>
            <span className="mt-2 inline-block rounded-full bg-[var(--color-amber-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-navy)]">
              The hidden details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockChip({ label, selected = false }: { label: string; selected?: boolean }) {
  return (
    <span
      className={
        selected
          ? "inline-block rounded-full border border-[var(--color-navy)] bg-[var(--color-navy)] px-2 py-0.5 text-[10px] text-white"
          : "inline-block rounded-full border border-[var(--color-border)] bg-white px-2 py-0.5 text-[10px] text-[var(--color-text)]"
      }
    >
      {label}
    </span>
  );
}
