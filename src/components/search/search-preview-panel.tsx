"use client";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-[var(--color-parchment-dark)]/80 ${className ?? ""}`}
      aria-hidden
    />
  );
}

function ProgramCardSkeleton({ showGotchaTeaser = false }: { showGotchaTeaser?: boolean }) {
  return (
    <article
      className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
      aria-hidden
    >
      <div className="select-none blur-[3px]">
        <div className="flex flex-wrap gap-2">
          <SkeletonBar className="h-5 w-24" />
          <SkeletonBar className="h-5 w-20" />
          <SkeletonBar className="h-5 w-28" />
        </div>
        <SkeletonBar className="mt-3 h-6 w-full max-w-md" />
        <SkeletonBar className="mt-2 h-4 w-full max-w-xs" />
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonBar className="h-3 w-14" />
              <SkeletonBar className="h-4 w-full max-w-[140px]" />
            </div>
          ))}
        </dl>
      </div>

      {showGotchaTeaser && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-amber)]/25 bg-[var(--color-amber-soft)]/35 p-4">
          <p className="text-xs font-semibold tracking-wide text-[var(--color-amber)] uppercase">
            The hidden details
          </p>
          <div className="mt-2 select-none blur-[2px]">
            <SkeletonBar className="h-4 w-full max-w-sm" />
            <SkeletonBar className="mt-2 h-3 w-full" />
            <SkeletonBar className="mt-1.5 h-3 w-[85%]" />
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Sourced gotchas appear on every real program card.
          </p>
        </div>
      )}
    </article>
  );
}

export function SearchPreviewPanel() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-sage)]/40 bg-[var(--color-sage-soft)]/50 px-5 py-8 sm:px-8 sm:py-10">
        <p className="text-xs font-semibold tracking-wide text-[var(--color-sage)] uppercase">
          Step 1 · Grade required
        </p>
        <h2 className="mt-2 text-2xl text-[var(--color-navy)] sm:text-3xl">
          Pick a grade to see eligible programs
        </h2>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-[var(--color-text-muted)]">
          Programs are filtered by eligibility first. Choose the grade your child just completed —
          then results, gotchas, and filters unlock here.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-navy)]/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-navy)]">
          <span className="hidden lg:inline" aria-hidden>
            ←
          </span>
          <span className="lg:hidden">Select a grade above</span>
          <span className="hidden lg:inline">Select a grade on the left</span>
        </p>
      </div>

      <div className="relative space-y-4 p-4 sm:p-5">
        <p className="text-center text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Preview — not your results yet
        </p>
        <ProgramCardSkeleton showGotchaTeaser />
        <ProgramCardSkeleton />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/90 to-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
}
