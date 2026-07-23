"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { btnPrimary } from "@/components/ui/button-styles";
import {
  formatSeasonPassPrice,
  isEarlyBirdPricingShown,
} from "@/lib/constants/pricing";

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
        className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-xl"
      >
        {mode === "signin" ? (
          <>
            <h2 className="text-xl text-[var(--color-navy)]">Sign in to save programs</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {isEarlyBirdPricingShown()
                ? `Early bird: workspace is free for a limited time (regular price ${formatSeasonPassPrice()}/season). Sign in with Google to save programs — search stays free.`
                : "Create your shortlist with Google — search stays free."}
            </p>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/pricing" })}
              className={`${btnPrimary} mt-6 w-full`}
            >
              Continue with Google
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl text-[var(--color-navy)]">Season pass required</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Saving programs, notes, and compare tools are included with the{" "}
              {formatSeasonPassPrice()} seasonal pass (valid through June 30). Search remains
              free.
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
