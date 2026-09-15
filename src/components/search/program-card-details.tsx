"use client";

import Link from "next/link";
import { useState } from "react";
import { DAY_TO_DAY_SOURCE_LABELS } from "@/lib/constants/day-to-day";
import { isValidDayToDay } from "@/lib/data/day-to-day";
import type { Program } from "@/lib/types/program";

function DetailsChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`shrink-0 text-[var(--color-text-muted)] transition-transform ${open ? "rotate-90" : ""}`}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function programDetailsLabel(program: Program): string {
  const hasDayToDay = isValidDayToDay(program.dayToDay);
  const flagCount = program.flags.length;
  const parts: string[] = [];
  if (hasDayToDay) parts.push("Day-to-day");
  if (flagCount === 1) parts.push("1 hidden detail");
  else if (flagCount > 1) parts.push(`${flagCount} hidden details`);
  return parts.join(" · ");
}

export function ProgramCardDetails({ program }: { program: Program }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hasDayToDay = isValidDayToDay(program.dayToDay);
  const hasFlags = program.flags.length > 0;
  const hasExpandableDetails = hasDayToDay || hasFlags;

  if (!hasExpandableDetails) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-parchment-dark)]/25 px-3 py-2.5 text-left text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-parchment-dark)]/45"
        aria-expanded={detailsOpen}
        onClick={() => setDetailsOpen((open) => !open)}
      >
        <DetailsChevron open={detailsOpen} />
        <span>{programDetailsLabel(program)}</span>
      </button>

      {detailsOpen && (
        <div className="mt-3 space-y-3">
          {hasDayToDay && program.dayToDay && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-parchment-dark)]/30 p-4">
              <p className="text-xs font-semibold tracking-wide text-[var(--color-navy)] uppercase">
                Day-to-day
              </p>
              <p className="mt-2 text-sm text-[var(--color-navy)]">{program.dayToDay.notes}</p>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                Source: {DAY_TO_DAY_SOURCE_LABELS[program.dayToDay.sourceType]}
                {program.dayToDay.sourceCitation ? ` — ${program.dayToDay.sourceCitation}` : ""}
                {program.dayToDay.verifiedAt ? ` · Verified ${program.dayToDay.verifiedAt}` : ""}
              </p>
              <p className="mt-2 text-xs">
                <Link
                  href="/resources/what-does-college-experience-really-look-like"
                  className="text-[var(--color-navy-light)] no-underline hover:underline"
                >
                  Questions we use to research day-to-day experience →
                </Link>
              </p>
            </div>
          )}

          {hasFlags && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-amber)]/30 bg-[var(--color-amber-soft)]/40 p-4">
              <p className="text-xs font-semibold tracking-wide text-[var(--color-amber)] uppercase">
                The hidden details
              </p>
              <ul className="mt-2 space-y-3">
                {program.flags.map((flag) => (
                  <li key={flag.id} className="text-sm">
                    <p className="font-medium text-[var(--color-navy)]">{flag.title}</p>
                    <p className="text-[var(--color-text-muted)]">{flag.body}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      Source: {flag.sourceCitation}
                      {flag.sourceDate ? ` (${flag.sourceDate})` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
