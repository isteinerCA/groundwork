"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SaveGateModal } from "@/components/auth/save-gate-modal";
import { btnOutline } from "@/components/ui/button-styles";
import { isEarlyBirdPricingShown } from "@/lib/constants/pricing";
import { ADMISSION_TYPE_BY_ID } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES, type ProgramCategoryId } from "@/lib/constants/categories";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type { Program } from "@/lib/types/program";

function categoryLabel(id: ProgramCategoryId): string {
  return PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ProgramCard({
  program,
  preview = false,
  compact = false,
  emphasizeTrack = false,
}: {
  program: Program;
  preview?: boolean;
  compact?: boolean;
  /** When multiple cards share the same program name, lead with the track/session. */
  emphasizeTrack?: boolean;
}) {
  const admission = ADMISSION_TYPE_BY_ID[program.admissionType];
  const { data: session, update } = useSession();
  const { isSaved, toggleSave, hydrated } = useWorkspace();
  const [gateMode, setGateMode] = useState<"signin" | "pay" | null>(null);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const saved = hydrated && isSaved(program.id);

  const handleSaveClick = async () => {
    if (!session?.user) {
      setGateMode("signin");
      return;
    }
    if (!session.user.seasonPassActive) {
      if (isEarlyBirdPricingShown()) {
        const refreshed = await update();
        if (refreshed?.user?.seasonPassActive) {
          const ok = toggleSave(program.id);
          if (ok && !saved) setShowSavedBanner(true);
        }
        return;
      }
      setGateMode("pay");
      return;
    }
    const wasSaved = saved;
    const ok = toggleSave(program.id);
    if (ok && !wasSaved) setShowSavedBanner(true);
    if (wasSaved) setShowSavedBanner(false);
  };

  return (
    <>
      {!preview && (
        <SaveGateModal
          open={gateMode !== null}
          mode={gateMode ?? "signin"}
          onClose={() => setGateMode(null)}
        />
      )}
      <article
        className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${
          compact ? "p-3.5" : "p-5"
        } ${preview ? "opacity-95" : ""}`}
      >
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
            aria-pressed={saved}
            aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
            title={saved ? "Saved — view on dashboard" : "Save to shortlist"}
            className={`shrink-0 rounded-full border p-2 text-lg leading-none transition ${
              saved
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-red-200 hover:text-red-500"
            }`}
          >
            {saved ? "♥" : "♡"}
          </button>
        )}
      </div>

      {showSavedBanner && saved && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span>Saved to your shortlist!</span>
          <Link
            href="/dashboard"
            className="font-semibold text-[var(--color-navy)] no-underline hover:text-[var(--color-navy-light)]"
          >
            View dashboard →
          </Link>
        </div>
      )}

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
            href="/dashboard"
            className="inline-flex items-center px-2 py-2 text-sm text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)]"
          >
            My shortlist
          </Link>
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
