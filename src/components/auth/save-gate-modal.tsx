"use client";

import Link from "next/link";
import { btnPrimary, btnSecondary } from "@/components/ui/button-styles";
import { formatSeasonPassPrice } from "@/lib/constants/pricing";

export function SaveGateModal({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: "signin" | "pay";
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal
        aria-labelledby="save-gate-title"
        className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-xl"
      >
        {mode === "signin" ? (
          <>
            <h2 id="save-gate-title" className="text-xl text-[var(--color-navy)]">
              Sign up to save into your shortlist
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Create an account to save programs and access your workspace.
            </p>
            <Link href="/sign-up" className={`${btnPrimary} mt-6 w-full`} onClick={onClose}>
              Sign up to save
            </Link>
            <Link href="/sign-in" className={`${btnSecondary} mt-3 w-full`} onClick={onClose}>
              Already have an account? Sign in
            </Link>
          </>
        ) : (
          <>
            <h2 id="save-gate-title" className="text-xl text-[var(--color-navy)]">
              Season pass required
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Saving programs, notes, and compare tools are included with the{" "}
              {formatSeasonPassPrice()} seasonal pass (valid through June 30).
            </p>
            <Link href="/pricing" className={`${btnPrimary} mt-6 w-full`}>
              View pricing
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-sm text-[var(--color-text-muted)]"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
