"use client";

import Link from "next/link";
import { ProgramCard } from "@/components/search/program-card";
import { btnPrimary } from "@/components/ui/button-styles";
import { MARKETING_PROGRAM_COUNT_LABEL } from "@/lib/programs/preview-programs";
import type { Program } from "@/lib/types/program";

export function SearchProductPreview({
  programs,
  resultCount,
}: {
  programs: Program[];
  resultCount: number;
}) {
  const visible = programs.slice(0, 2);
  const moreCount = Math.max(0, resultCount - visible.length);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-parchment)]/60 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--color-navy)]">Search programs</p>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
            {MARKETING_PROGRAM_COUNT_LABEL} in catalog
          </span>
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Pick a grade — compare dozens of matches at once
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["6th", "7th", "8th", "9th", "10th", "11th", "12th"].map((grade) => (
            <span
              key={grade}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                grade === "10th"
                  ? "bg-[var(--color-navy)] text-white"
                  : "bg-white text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]"
              }`}
            >
              {grade}
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-[var(--color-border)] bg-[var(--color-parchment)]/40 px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-[var(--color-navy)]">
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">Sort by Selectivity</p>
        </div>
      </div>

      <div className="relative space-y-3 p-3 sm:p-4">
        {visible.map((program) => (
          <ProgramCard key={program.id} program={program} preview compact />
        ))}
        {moreCount > 0 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-sm font-medium text-[var(--color-navy-light)]">
            +{moreCount} more program{moreCount === 1 ? "" : "s"} in this search
          </p>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/95 to-transparent"
          aria-hidden
        />
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-parchment)]/40 px-4 py-3">
        <Link href="/search" className={`${btnPrimary} w-full justify-center text-sm`}>
          Start your shortlist
        </Link>
      </div>
    </div>
  );
}
