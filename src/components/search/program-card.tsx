"use client";

import Link from "next/link";
import { ADMISSION_TYPE_BY_ID } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES, type ProgramCategoryId } from "@/lib/constants/categories";
import type { Program } from "@/lib/types/program";

function categoryLabel(id: ProgramCategoryId): string {
  return PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ProgramCard({ program }: { program: Program }) {
  const admission = ADMISSION_TYPE_BY_ID[program.admissionType];

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--color-parchment-dark)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-navy)]">
              {categoryLabel(program.category)}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background:
                  admission.chipColor === "green"
                    ? "#ecfdf5"
                    : admission.chipColor === "amber"
                      ? "#fffbeb"
                      : "#fef2f2",
                color:
                  admission.chipColor === "green"
                    ? "#065f46"
                    : admission.chipColor === "amber"
                      ? "#92400e"
                      : "#991b1b",
              }}
            >
              {admission.label}
            </span>
            {program.fullyFunded && (
              <span className="rounded-full bg-[var(--color-amber-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-navy)]">
                Fully Funded
              </span>
            )}
          </div>
          <h3 className="mt-2 text-xl text-[var(--color-navy)]">{program.name}</h3>
          {program.trackDetail && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{program.trackDetail}</p>
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-text-muted)]">Grades</dt>
          <dd>{program.gradeDisplay}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Format</dt>
          <dd>{program.formatDisplay}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Location</dt>
          <dd>{program.locationDisplay}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Dates</dt>
          <dd>{program.datesDisplay || "See program site"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Length</dt>
          <dd>{program.lengthDisplay}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Cost</dt>
          <dd className={program.priceUnknown ? "italic text-[var(--color-text-muted)]" : ""}>
            {program.priceDisplay}
          </dd>
        </div>
      </dl>

      {program.flags.length > 0 && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-amber)]/30 bg-[var(--color-amber-soft)]/40 p-4">
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

      {program.stateRestriction && (
        <p className="mt-3 text-sm text-amber-800">
          Residency restriction: {program.stateRestriction} residents
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={program.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-navy)] px-4 py-2 text-sm font-medium text-[var(--color-navy)] no-underline hover:bg-[var(--color-navy)] hover:text-white"
        >
          Visit program website ↗
        </a>
        <Link
          href={`/contact?program=${encodeURIComponent(program.name)}`}
          className="inline-flex items-center px-2 py-2 text-sm text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)]"
        >
          Report an issue
        </Link>
      </div>
    </article>
  );
}
