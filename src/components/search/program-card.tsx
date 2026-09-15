"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { SaveGateModal } from "@/components/auth/save-gate-modal";
import { btnOutline } from "@/components/ui/button-styles";
import { ADMISSION_TYPE_BY_ID } from "@/lib/constants/admission-types";
import { DAY_TO_DAY_SOURCE_LABELS } from "@/lib/constants/day-to-day";
import { isValidDayToDay } from "@/lib/data/day-to-day";
import {
  categoryLabelForId,
  getProgramCategoryIds,
} from "@/lib/data/matches-category";
import {
  formatPriceDisplay,
  isPriceDisplayMuted,
} from "@/lib/data/format-price-display";
import {
  formatGradeEligibilityDisplay,
  gradeEligibilityLabel,
} from "@/lib/data/format-grade-display";
import { formatDatesDisplay, isPendingDatesDisplay } from "@/lib/data/format-season-display";
import { SeasonReviewBadge } from "@/components/search/season-review-badge";
import { formatShortlistMembershipLabel } from "@/lib/workspace/shortlist-membership";
import { queuePendingSaves } from "@/lib/workspace/pending-saves";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type { Program } from "@/lib/types/program";

const categoryBadgeClass =
  "rounded-full bg-[var(--color-parchment-dark)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-navy)]";

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

export function ProgramCard({
  program,
  preview = false,
  compact = false,
  anchorId,
  emphasizeTrack = false,
}: {
  program: Program;
  preview?: boolean;
  compact?: boolean;
  /** Stable in-page anchor for predefined list pages and structured data. */
  anchorId?: string;
  /** When multiple cards share the same program name, lead with the track/session. */
  emphasizeTrack?: boolean;
}) {
  const admission = ADMISSION_TYPE_BY_ID[program.admissionType];
  const { isSignedIn } = useAuth();
  const { isSavedInActive, getShortlistsForProgram, activeShortlist, toggleSave, hydrated } =
    useWorkspace();
  const [gateOpen, setGateOpen] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hasDayToDay = isValidDayToDay(program.dayToDay);
  const hasFlags = program.flags.length > 0;
  const hasExpandableDetails = hasDayToDay || hasFlags;
  const savedInActive = hydrated && isSavedInActive(program.id);
  const memberLists = hydrated ? getShortlistsForProgram(program.id) : [];
  const membershipLabel = formatShortlistMembershipLabel(memberLists, activeShortlist.id);
  const handleSaveClick = () => {
    if (!isSignedIn) {
      queuePendingSaves([program.id]);
      setGateOpen(true);
      return;
    }
    const wasSaved = savedInActive;
    const ok = toggleSave(program.id);
    if (ok && !wasSaved) setShowSavedBanner(true);
    if (wasSaved) setShowSavedBanner(false);
  };

  return (
    <>
      {!preview && (
        <SaveGateModal
          open={gateOpen}
          mode="signin"
          onClose={() => setGateOpen(false)}
        />
      )}
      <article
        id={anchorId}
        className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${
          compact ? "p-3.5" : "p-5"
        } ${preview ? "opacity-95" : ""}`}
      >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {getProgramCategoryIds(program).map((categoryId) => (
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
            {program.fullyFunded && (
              <span className="rounded-full bg-[var(--color-amber-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-navy)]">
                Fully Funded
              </span>
            )}
            <SeasonReviewBadge program={program} />
            {!preview && memberLists.length > 0 && (
              <Link
                href="/workspace"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-900 no-underline hover:border-emerald-300"
              >
                In {membershipLabel} →
              </Link>
            )}
          </div>
          <h3 className="mt-2 text-xl text-[var(--color-navy)]">
            {emphasizeTrack && program.trackDetail
              ? `${program.name} — ${program.trackDetail}`
              : program.name}
          </h3>
          {program.trackDetail && !emphasizeTrack && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{program.trackDetail}</p>
          )}
        </div>
        {!preview && (
          <button
            type="button"
            onClick={handleSaveClick}
            aria-pressed={savedInActive}
            aria-label={
              savedInActive
                ? `Remove from ${activeShortlist.name}`
                : `Save to ${activeShortlist.name}`
            }
            title={
              savedInActive
                ? `Saved to ${activeShortlist.name} — open workspace`
                : `Save to ${activeShortlist.name}`
            }
            className={`shrink-0 rounded-full border p-2 text-lg leading-none transition ${
              savedInActive
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-red-200 hover:text-red-500"
            }`}
          >
            {savedInActive ? "♥" : "♡"}
          </button>
        )}
      </div>

      {showSavedBanner && savedInActive && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span>
            Saved to <strong>{activeShortlist.name}</strong>
          </span>
          <Link
            href="/workspace"
            className="font-semibold text-[var(--color-navy)] no-underline hover:text-[var(--color-navy-light)]"
          >
            Open workspace →
          </Link>
        </div>
      )}

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-text-muted)]">{gradeEligibilityLabel(program)}</dt>
          <dd>{formatGradeEligibilityDisplay(program)}</dd>
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
          <dd
            className={
              isPendingDatesDisplay(program) ? "italic text-[var(--color-text-muted)]" : ""
            }
          >
            {formatDatesDisplay(program)}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Length</dt>
          <dd>{program.lengthDisplay}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-text-muted)]">Cost</dt>
          <dd className={isPriceDisplayMuted(program) ? "italic text-[var(--color-text-muted)]" : ""}>
            {formatPriceDisplay(program)}
          </dd>
        </div>
      </dl>

      {hasExpandableDetails && (
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
      )}

      {program.stateRestriction && (
        <p className="mt-3 text-sm text-amber-800">
          Residency restriction: {program.stateRestriction} residents
        </p>
      )}

      {!preview && (
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={program.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnOutline}
          >
            Visit program website ↗
          </a>
          <Link
            href={`/contact?program=${encodeURIComponent(program.name)}`}
            className="inline-flex items-center px-2 py-2 text-sm text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)]"
          >
            Contact us / report an issue
          </Link>
        </div>
      )}
    </article>
    </>
  );
}
