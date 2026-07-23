"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { SaveGateModal } from "@/components/auth/save-gate-modal";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { btnOutline, btnPrimary } from "@/components/ui/button-styles";
import { isEarlyBirdPricingShown } from "@/lib/constants/pricing";
import type { Program } from "@/lib/types/program";

export function SearchShortlistCta({ programs }: { programs: Program[] }) {
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

  return (
    <>
      <SaveGateModal
        open={gateMode !== null}
        mode={gateMode ?? "signin"}
        onClose={() => setGateMode(null)}
      />
      <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-navy)]">Start your shortlist</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Tap <span aria-hidden>♡</span> on programs you want to explore, or save every result
            below in one step.
          </p>
          {justSavedCount !== null && justSavedCount > 0 && (
            <p className="mt-2 text-sm font-medium text-emerald-800">
              Saved {justSavedCount} program{justSavedCount === 1 ? "" : "s"} to your shortlist.
            </p>
          )}
        </div>
        <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2 sm:mt-0">
          {unsavedPrograms.length > 0 ? (
            <button type="button" onClick={runBulkSave} className={btnPrimary}>
              ♡ Heart all {unsavedPrograms.length} program
              {unsavedPrograms.length === 1 ? "" : "s"}
            </button>
          ) : (
            <span className="text-sm font-medium text-emerald-800">All results saved</span>
          )}
          <Link href="/dashboard" className={btnOutline}>
            View shortlist
          </Link>
        </div>
      </div>
    </>
  );
}
