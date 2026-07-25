"use client";

import { ProgramCard } from "@/components/search/program-card";
import type { Program } from "@/lib/types/program";

export function SearchPreviewPanel({
  programs,
  headline = "Pick a grade to start your shortlist",
  subline = "Sample programs below — filter on the left, then heart favorites to save.",
  compact = false,
  maxCards = 2,
}: {
  programs: Program[];
  headline?: string;
  subline?: string;
  compact?: boolean;
  maxCards?: number;
}) {
  if (programs.length === 0) return null;

  const shown = programs.slice(0, maxCards);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-sage)]/30 bg-[var(--color-sage-soft)]/40 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-[var(--color-navy)]">{headline}</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subline}</p>
      </div>

      <div className={`relative space-y-4 ${compact ? "p-3" : "p-4"}`}>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[var(--color-surface)] to-transparent"
          aria-hidden
        />
        {shown.map((program) => (
          <ProgramCard key={program.id} program={program} preview />
        ))}
      </div>
    </div>
  );
}
