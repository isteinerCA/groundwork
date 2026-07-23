"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { SaveGateModal } from "@/components/auth/save-gate-modal";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { btnOutline, btnPrimary } from "@/components/ui/button-styles";
import { isEarlyBirdPricingShown } from "@/lib/constants/pricing";
import type { Program } from "@/lib/types/program";

export function SearchShortlistCta({
  programs,
  compact = false,
}: {
  programs: Program[];
  compact?: boolean;
}) {
  const { data: session, update } = useSession();
  const { isSaved, savePrograms, hydrated } = useWorkspace();
  const [gateMode, setGateMode] = useState<"signin" | "pay" | null>(null);
  const [justSavedCount, setJustSavedCount] = useState<number | null>(null);

  const unsavedPrograms = useMemo(() => {
    if (!hydrated) return programs;
    return programs.filter((program) => !isSaved(program.id));
  }, [programs, hydrated, isSaved]);

  const runBulkSave = async () => {
    if (unsavedPrograms.length === 0) return;

    if (!session?.user) {
      setGateMode("signin");
      return;
    }

    if (!session.user.seasonPassActive) {
      if (isEarlyBirdPricingShown()) {
        const refreshed = await update();
        if (refreshed?.user?.seasonPassActive) {
          const count = unsavedPrograms.length;
          const ok = savePrograms(unsavedPrograms.map((p) => p.id));
          if (ok) setJustSavedCount(count);
        }
        return;
      }
      setGateMode("pay");
      return;
    }

    const count = unsavedPrograms.length;
    const ok = savePrograms(unsavedPrograms.map((p) => p.id));
    if (ok) setJustSavedCount(count);
  };

  if (programs.length === 0) return null;

  if (compact) {
    return (
      <>
        <SaveGateModal
          open={gateMode !== null}
          mode={gateMode ?? "signin"}
          onClose={() => setGateMode(null)}
        />
        <div className="flex flex-wrap items-center gap-2">
          {justSavedCount !== null && justSavedCount > 0 && (
            <span className="text-xs font-medium text-emerald-800">
              Saved {justSavedCount}
            </span>
          )}
          {unsavedPrograms.length > 0 ? (
            <button type="button" onClick={runBulkSave} className={`${btnPrimary} px-3 py-1.5 text-xs`}>
              ♡ Heart all {unsavedPrograms.length}
            </button>
          ) : (
            <span className="text-xs font-medium text-emerald-800">All saved</span>
          )}
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
          >
            View shortlist →
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SaveGateModal
        open={gateMode !== null}
        mode={gateMode ?? "signin"}
        onClose={() => setGateMode(null)}
      />
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-parchment)]/60 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-navy)]">Start your shortlist</p>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
            Tap <span aria-hidden>♡</span> on favorites below, or save every result at once.
          </p>
          {justSavedCount !== null && justSavedCount > 0 && (
            <p className="mt-1 text-xs font-medium text-emerald-800">
              Saved {justSavedCount} program{justSavedCount === 1 ? "" : "s"} to your shortlist.
            </p>
          )}
        </div>
        <div className="mt-2 flex shrink-0 flex-wrap items-center gap-2 sm:mt-0">
          {unsavedPrograms.length > 0 ? (
            <button type="button" onClick={runBulkSave} className={`${btnPrimary} px-3 py-2 text-sm`}>
              ♡ Heart all {unsavedPrograms.length}
            </button>
          ) : (
            <span className="text-sm font-medium text-emerald-800">All results saved</span>
          )}
          <Link href="/dashboard" className={`${btnOutline} px-3 py-2 text-sm`}>
            View shortlist
          </Link>
        </div>
      </div>
    </>
  );
}
