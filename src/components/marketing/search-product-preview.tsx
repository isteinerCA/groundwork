"use client";

import Link from "next/link";
import { ProgramCard } from "@/components/search/program-card";
import { btnPrimary } from "@/components/ui/button-styles";
import type { Program } from "@/lib/types/program";

export function SearchProductPreview({ programs }: { programs: Program[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-parchment)]/60 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--color-navy)]">Search programs</p>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
            Sample results
          </span>
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Grade · category · budget · hidden details on every card
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

      <div className="relative max-h-[520px] space-y-3 overflow-hidden p-3 sm:p-4">
        {programs.slice(0, 2).map((program) => (
          <ProgramCard key={program.id} program={program} preview />
        ))}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/90 to-transparent"
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
