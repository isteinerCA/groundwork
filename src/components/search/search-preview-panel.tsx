"use client";

import { ProgramCard } from "@/components/search/program-card";
import type { Program } from "@/lib/types/program";

export function SearchPreviewPanel({
  programs,
  headline = "Pick your child's grade to personalize these results",
  subline = "Sample programs from our catalog — select a grade on the left to filter by eligibility.",
  compact = false,
}: {
  programs: Program[];
  headline?: string;
  subline?: string;
  compact?: boolean;
}) {
  if (programs.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-sage)]/30 bg-[var(--color-sage-soft)]/40 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-[var(--color-navy)]">{headline}</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subline}</p>
      </div>

      <div className={`relative space-y-4 ${compact ? "p-3" : "p-4"}`}>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[var(--color-surface)] to-transparent"
          aria-hidden
        />
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} preview />
        ))}
      </div>
    </div>
  );
}
