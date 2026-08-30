import type { ReactNode } from "react";

/** Compact static mock of the shortlist flow — filters left, abbreviated results right. */
export function HeroShortlistMock() {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-parchment)]/70 px-3 py-2.5">
        <p className="text-xs font-semibold text-[var(--color-navy)]">Build your shortlist</p>
        <span className="rounded-full bg-[var(--color-sage-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-navy-dark)]">
          Filter → ♡ save
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,44%)_minmax(0,1fr)]">
        <div className="space-y-2.5 border-r border-[var(--color-border)] bg-[var(--color-parchment)]/30 p-3">
          <FilterRow label="Grade">
            <MockChip label="9th" />
            <MockChip label="10th" selected />
            <MockChip label="11th" />
            <MockChip label="12th" />
          </FilterRow>
          <FilterRow label="Category">
            <MockChip label="STEM" selected />
            <MockChip label="Marine" />
            <MockChip label="Arts" />
          </FilterRow>
          <FilterRow label="Format">
            <MockChip label="Residential" selected />
            <MockChip label="Day" />
            <MockChip label="Online" />
          </FilterRow>
          <FilterRow label="Availability in">
            <MockChip label="Anytime" />
            <MockChip label="June" />
            <MockChip label="July" selected />
            <MockChip label="Aug" />
          </FilterRow>
          <FilterRow label="Admission">
            <MockChip label="Selective" selected variant="red" />
            <MockChip label="Application" variant="amber" />
          </FilterRow>
          <FilterRow label="Max price">
            <MockChip label="Free" />
            <MockChip label="Under $5k" />
            <MockChip label="Any" selected />
          </FilterRow>
        </div>

        <div className="space-y-2 p-3">
          <p className="text-[11px] text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-navy)]">24 programs</span> to compare
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Heart <span aria-hidden>♡</span> programs to add them to your shortlist.
          </p>
          <MockProgramCard
            categoryLabel="STEM"
            admissionLabel="Selective"
            admissionTone="red"
            name="COSMOS UC Davis"
            meta="Jul 5 – Aug 1 · CA residents"
            showHiddenDetails
          />
          <MockProgramCard
            categoryLabel="AI & CS"
            admissionLabel="Selective"
            admissionTone="red"
            fundedLabel="Fully Funded"
            name="Stanford AI4ALL"
            meta="Residential · Summer session"
            compact
          />
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
        {label}
      </p>
      <div className="mt-1 flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function MockChip({
  label,
  selected = false,
  variant = "default",
}: {
  label: string;
  selected?: boolean;
  variant?: "default" | "amber" | "red";
}) {
  const variantClass =
    variant === "red"
      ? "border-red-200 bg-red-50 text-red-900"
      : variant === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-[var(--color-border)] bg-white text-[var(--color-text)]";

  return (
    <span
      className={
        selected
          ? "inline-block rounded-full border border-[var(--color-navy)] bg-[var(--color-navy)] px-2 py-0.5 text-[10px] text-white"
          : `inline-block rounded-full border px-2 py-0.5 text-[10px] ${variantClass}`
      }
    >
      {label}
    </span>
  );
}

function MockProgramCard({
  categoryLabel,
  admissionLabel,
  admissionTone,
  fundedLabel,
  name,
  meta,
  showHiddenDetails = false,
  compact = false,
}: {
  categoryLabel: string;
  admissionLabel: string;
  admissionTone: "red" | "amber" | "green";
  fundedLabel?: string;
  name: string;
  meta: string;
  showHiddenDetails?: boolean;
  compact?: boolean;
}) {
  const admissionClass =
    admissionTone === "red"
      ? "bg-red-50 text-red-900"
      : admissionTone === "amber"
        ? "bg-amber-50 text-amber-900"
        : "bg-emerald-50 text-emerald-900";

  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white ${
        compact ? "p-2" : "p-2.5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-1">
        <span className="rounded-full bg-[var(--color-parchment-dark)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-navy)]">
          {categoryLabel}
        </span>
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${admissionClass}`}>
          {admissionLabel}
        </span>
        {fundedLabel && (
          <span className="rounded-full bg-[var(--color-amber-soft)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--color-navy)]">
            {fundedLabel}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`truncate font-semibold text-[var(--color-navy)] ${
              compact ? "text-[11px]" : "text-xs"
            }`}
          >
            {name}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-muted)]">{meta}</p>
        </div>
        <span className="shrink-0 text-sm text-[var(--color-navy-light)]" aria-hidden>
          ♡
        </span>
      </div>
      {showHiddenDetails && (
        <span className="mt-1.5 inline-block rounded-full bg-[var(--color-amber-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-navy)]">
          The hidden details
        </span>
      )}
    </div>
  );
}
