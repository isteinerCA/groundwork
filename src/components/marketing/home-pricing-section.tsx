import Link from "next/link";
import { SectionEyebrow, ButtonLink } from "@/components/ui/button-link";
import {
  EARLY_BIRD_LABEL,
  formatSeasonPassPrice,
  isEarlyBirdPricingShown,
} from "@/lib/constants/pricing";

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm text-[var(--color-text)]">
      <span className="mt-0.5 shrink-0 font-bold text-[var(--color-navy-light)]" aria-hidden>
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export function HomePricingSection() {
  const earlyBird = isEarlyBirdPricingShown();

  return (
    <section id="pricing" className="scroll-mt-20 bg-[var(--color-surface)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <SectionEyebrow>Pricing</SectionEyebrow>
        <h2 className="mt-3 text-3xl md:text-4xl">
          Search free. Pay only when you&apos;re ready to commit.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--color-text-muted)]">
          No subscriptions. No sponsored placements. No lead-gen. Ever.
        </p>

        <div className="mt-12 grid gap-6 text-left md:grid-cols-2">
          {/* Browse — free */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-parchment)] p-8">
            <h3 className="text-xl text-[var(--color-navy)]">Browse</h3>
            <p className="mt-2 text-4xl font-normal text-[var(--color-navy)]">Free</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">No account needed.</p>
            <ul className="mt-6 space-y-3">
              <CheckItem>Full search &amp; filtering</CheckItem>
              <CheckItem>All program cards with gotcha flags</CheckItem>
              <CheckItem>Every flag sourced and dated</CheckItem>
              <CheckItem>Direct links to program sites</CheckItem>
            </ul>
            <ButtonLink href="/search" variant="secondary" className="mt-8 w-full">
              Start searching
            </ButtonLink>
          </div>

          {/* Shortlist — season pass */}
          <div className="relative rounded-[var(--radius-lg)] border-2 border-[var(--color-navy)] bg-white p-8 shadow-[var(--shadow-card)]">
            <span className="absolute -top-3 left-6 rounded-full bg-[var(--color-amber)] px-3 py-1 text-xs font-bold tracking-wide text-[var(--color-navy)] uppercase">
              Best value
            </span>
            {earlyBird && (
              <span className="absolute -top-3 right-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white uppercase">
                {EARLY_BIRD_LABEL}
              </span>
            )}
            <h3 className="text-xl text-[var(--color-navy)]">Shortlist workspace</h3>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              {earlyBird && (
                <span className="text-xl text-[var(--color-text-muted)] line-through">
                  {formatSeasonPassPrice()}
                </span>
              )}
              <span className="text-4xl font-normal text-[var(--color-navy)]">
                {earlyBird ? "Free" : formatSeasonPassPrice()}
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">/ season</span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {earlyBird
                ? `Regular price ${formatSeasonPassPrice()} after early bird. Sign in with Google — no card required.`
                : "One-time seasonal pass. Unlimited lists through June 30."}
            </p>
            <ul className="mt-6 space-y-3">
              <CheckItem>Everything in Browse</CheckItem>
              <CheckItem>Saved shortlist with status tracking</CheckItem>
              <CheckItem>Deadline field &amp; program notes</CheckItem>
              <CheckItem>Side-by-side compare + shareable link</CheckItem>
              <CheckItem>Export to CSV (print for PDF)</CheckItem>
            </ul>
            <ButtonLink href="/pricing" variant="primary" className="mt-8 w-full">
              Start a shortlist
            </ButtonLink>
          </div>
        </div>

        <p className="mt-8 text-sm text-[var(--color-text-muted)]">
          One season pass covers unlimited shortlists for your family through June 30.
        </p>
        <Link
          href="/pricing#faq"
          className="mt-3 inline-block text-sm font-medium text-[var(--color-navy-light)] no-underline hover:text-[var(--color-navy)]"
        >
          Pricing FAQ →
        </Link>
      </div>
    </section>
  );
}
