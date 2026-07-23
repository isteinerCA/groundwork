"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { isEarlyBirdPricingShown } from "@/lib/constants/pricing";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-xs text-[var(--color-text-muted)]">…</span>;
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="hidden text-sm text-[var(--color-text-muted)] hover:text-[var(--color-navy)] sm:inline"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      {session.user.seasonPassActive ? (
        <span className="rounded-full bg-[var(--color-amber-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-navy)]">
          {isEarlyBirdPricingShown() ? "Early bird" : "Pass active"}
        </span>
      ) : (
        <Link href="/pricing" className="text-xs font-medium text-[var(--color-navy-light)]">
          {isEarlyBirdPricingShown() ? "Free access" : "Get pass"}
        </Link>
      )}
      <span className="max-w-[120px] truncate text-xs text-[var(--color-text-muted)]">
        {session.user.name ?? session.user.email}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-navy)]"
      >
        Sign out
      </button>
    </div>
  );
}
