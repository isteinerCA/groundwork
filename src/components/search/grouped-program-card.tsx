"use client";

import Link from "next/link";
import { useState } from "react";
import { ProgramCardDetails } from "@/components/search/program-card-details";
import { ProgramSaveButton } from "@/components/search/program-save-button";
import { SeasonReviewBadge } from "@/components/search/season-review-badge";
import { btnOutline } from "@/components/ui/button-styles";
import { ADMISSION_TYPE_BY_ID } from "@/lib/constants/admission-types";
import {
  categoryLabelForId,
  getProgramCategoryIds,
} from "@/lib/data/matches-category";
import {
  formatPriceDisplay,
  isPriceDisplayMuted,
} from "@/lib/data/format-price-display";
import { gradeEligibilityLabel } from "@/lib/data/format-grade-display";
import { isPendingDatesDisplay } from "@/lib/data/format-season-display";
import {
  formatGroupDateRange,
  formatGroupOptionsSummary,
  formatGroupPriceRange,
  gradeRangeSummary,
  groupProgramsByTrack,
  groupWebsiteUrlsVary,
  uniqueFormatDisplay,
  variantOfferingLabel,
} from "@/lib/data/group-search-results";
import { formatShortlistMembershipLabel } from "@/lib/workspace/shortlist-membership";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type { Program } from "@/lib/types/program";

const categoryBadgeClass =
  "rounded-full bg-[var(--color-parchment-dark)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-navy)]";

function VariantsChevron({ open }: { open: boolean }) {
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

export function GroupedProgramCard({
  programs,
  representative,
  anchorId,
}: {
  programs: Program[];
  representative: Program;
  anchorId?: string;
}) {
  const [variantsOpen, setVariantsOpen] = useState(false);
  const { getShortlistsForProgram, activeShortlist, isSavedInActive, hydrated } =
    useWorkspace();
  const admission = ADMISSION_TYPE_BY_ID[representative.admissionType];
  const trackGroups = groupProgramsByTrack(programs);
  const savedCount = hydrated
    ? programs.filter((p) => isSavedInActive(p.id)).length
    : 0;
  const memberLists = hydrated ? getShortlistsForProgram(representative.id) : [];
  const membershipLabel = formatShortlistMembershipLabel(memberLists, activeShortlist.id);
  const urlsVary = groupWebsiteUrlsVary(programs);

  return (
    <article
      id={anchorId}
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {getProgramCategoryIds(representative).map((categoryId) => (
              <span key={categoryId} className={categoryBadgeClass}>
                {categoryLabelForId(categoryId)}
              </span>
            ))}
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
            {representative.fullyFunded && (
              <span className="rounded-full bg-[var(--color-amber-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-navy)]">
                Fully Funded
              </span>
            )}
            <SeasonReviewBadge program={representative} />
            {savedCount > 0 && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
                Saved {savedCount} of {programs.length}
              </span>
            )}
            {memberLists.length > 0 && (
              <Link
                href="/workspace"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-900 no-underline hover:border-emerald-300"
              >
                In {membershipLabel} →
              </Link>
            )}
          </div>
          <h3 className="mt-2 text-xl text-[var(--color-navy)]">{representative.name}</h3>
          {representative.institution && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {representative.institution}
            </p>
          )}
          <p className="mt-2 text-sm font-medium text-[var(--color-navy-light)]">
            {formatGroupOptionsSummary(programs)}
            {" · "}
            {formatGroupPriceRange(programs)}
            {" · "}
            {formatGroupDateRange(programs)}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-text-muted)]">{gradeEligibilityLabel(representative)}</dt>
          <dd>{gradeRangeSummary(programs)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Format</dt>
          <dd>{uniqueFormatDisplay(programs)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Location</dt>
          <dd>{representative.locationDisplay}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Dates</dt>
          <dd
            className={
              programs.some((p) => isPendingDatesDisplay(p))
                ? "italic text-[var(--color-text-muted)]"
                : ""
            }
          >
            {formatGroupDateRange(programs)}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Cost</dt>
          <dd>{formatGroupPriceRange(programs)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2.5 text-left text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-parchment-dark)]/25"
          aria-expanded={variantsOpen}
          onClick={() => setVariantsOpen((open) => !open)}
        >
          <VariantsChevron open={variantsOpen} />
          <span>
            {programs.length} matching option{programs.length === 1 ? "" : "s"}
          </span>
        </button>

        {variantsOpen && (
          <div className="mt-3 space-y-4">
            {trackGroups.map(({ trackLabel, programs: trackPrograms }) => (
              <div
                key={trackLabel}
                className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]"
              >
                <div className="border-b border-[var(--color-border)] bg-[var(--color-parchment-dark)]/35 px-3 py-2">
                  <h4 className="text-sm font-semibold text-[var(--color-navy)]">{trackLabel}</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                        <th className="px-3 py-2 font-medium">Offering</th>
                        <th className="px-3 py-2 font-medium">Format</th>
                        <th className="px-3 py-2 font-medium">Dates</th>
                        <th className="px-3 py-2 font-medium">Cost</th>
                        <th className="px-3 py-2 font-medium">
                          <span className="sr-only">Save</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trackPrograms.map((program) => (
                        <tr
                          key={program.id}
                          className="border-b border-[var(--color-border)] last:border-b-0"
                        >
                          <td className="px-3 py-2.5 text-[var(--color-navy)]">
                            <div className="flex items-center gap-2">
                              <span>
                                {variantOfferingLabel(program.trackDetail, trackLabel)}
                              </span>
                              {urlsVary && (
                                <a
                                  href={program.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[var(--color-navy-light)] no-underline hover:underline"
                                  aria-label="Visit this offering's program page"
                                >
                                  ↗
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-[var(--color-text-muted)]">
                            {program.formatDisplay}
                          </td>
                          <td
                            className={`px-3 py-2.5 ${isPendingDatesDisplay(program) ? "italic text-[var(--color-text-muted)]" : "text-[var(--color-navy)]"}`}
                          >
                            {program.datesDisplay}
                          </td>
                          <td
                            className={`px-3 py-2.5 ${isPriceDisplayMuted(program) ? "italic text-[var(--color-text-muted)]" : "text-[var(--color-navy)]"}`}
                          >
                            {formatPriceDisplay(program)}
                          </td>
                          <td className="px-3 py-2.5">
                            <ProgramSaveButton programId={program.id} compact />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProgramCardDetails program={representative} />

      {representative.stateRestriction && (
        <p className="mt-3 text-sm text-amber-800">
          Residency restriction: {representative.stateRestriction} residents
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={representative.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={btnOutline}
        >
          Visit program website ↗
        </a>
        {urlsVary && (
          <span className="self-center text-xs text-[var(--color-text-muted)]">
            Site URL varies by track — use ↗ on a specific option above.
          </span>
        )}
        <Link
          href={`/contact?program=${encodeURIComponent(representative.name)}`}
          className="inline-flex items-center px-2 py-2 text-sm text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)]"
        >
          Contact us / report an issue
        </Link>
      </div>
    </article>
  );
}
