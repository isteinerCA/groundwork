"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PricingFaq, PriceDisplay } from "@/components/marketing/pricing-faq";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  formatSeasonPassPrice,
  isEarlyBirdPricingShown,
  isStripeCheckoutEnabled,
} from "@/lib/constants/pricing";

export default function PricingPage() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const earlyBird = isEarlyBirdPricingShown();
  const stripeEnabled = isStripeCheckoutEnabled();
  const hasPass = session?.user?.seasonPassActive;

  useEffect(() => {
    if (earlyBird && session?.user && !hasPass) {
      void update();
    }
  }, [earlyBird, session?.user, hasPass, update]);

  const startCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Checkout unavailable.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-[var(--color-amber)] uppercase">
          Season pass
        </p>
        <h1 className="mt-2 text-4xl">Unlock your shortlist workspace</h1>
        <p className="mt-4 text-lg text-[var(--color-text-muted)]">
          Search is free forever. Saving programs, tracking deadlines, comparing side by side,
          and sharing your shortlist with family uses the season pass
          {earlyBird ? (
            <>
              {" "}
              — <strong>free during early bird</strong>, {formatSeasonPassPrice()} per season
              afterward.
            </>
          ) : (
            <> — {formatSeasonPassPrice()} one-time per season.</>
          )}
        </p>

        <div className="mt-10 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
          <PriceDisplay large />

          <ul className="mt-6 space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>• Unlimited named shortlists through June 30</li>
            <li>• Status pipeline, deadlines, and notes</li>
            <li>• Compare up to 4 programs side by side</li>
            <li>• CSV export and read-only share links</li>
            <li>• No auto-renewal — renew next summer if you want</li>
          </ul>

          {status === "loading" ? (
            <p className="mt-8 text-sm text-[var(--color-text-muted)]">Loading…</p>
          ) : hasPass ? (
            <div className="mt-8">
              <p className="rounded-[var(--radius-md)] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {earlyBird ? "Early bird access is active" : "Your season pass is active"}
                {session?.user?.seasonPassExpires
                  ? ` through ${session.user.seasonPassExpires}`
                  : ""}
                .
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block rounded-[var(--radius-md)] bg-[var(--color-navy)] px-6 py-3 text-sm font-medium text-white no-underline"
              >
                Go to dashboard
              </Link>
            </div>
          ) : !session ? (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/pricing" })}
              className="mt-8 w-full rounded-[var(--radius-md)] bg-[var(--color-navy)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-navy-light)]"
            >
              {earlyBird
                ? "Sign in with Google — free early bird access"
                : "Sign in with Google to continue"}
            </button>
          ) : earlyBird ? (
            <div className="mt-8 space-y-3">
              <p className="text-sm text-[var(--color-text-muted)]">
                Signed in as {session.user?.email}. Activating your free pass…
              </p>
              <button
                type="button"
                onClick={() => void update()}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-6 py-3 text-sm"
              >
                Refresh access
              </button>
            </div>
          ) : stripeEnabled ? (
            <button
              type="button"
              onClick={startCheckout}
              disabled={loading}
              className="mt-8 w-full rounded-[var(--radius-md)] bg-[var(--color-navy)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
            >
              {loading
                ? "Redirecting to checkout…"
                : `Get season pass — ${formatSeasonPassPrice()}`}
            </button>
          ) : (
            <p className="mt-8 text-sm text-[var(--color-text-muted)]">
              Payment is not open yet. Contact us if you need access.
            </p>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        <PricingFaq />

        <p className="mt-12 text-sm text-[var(--color-text-muted)]">
          Still have questions?{" "}
          <Link href="/contact" className="text-[var(--color-navy-light)]">
            Contact us
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
