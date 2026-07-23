import {
  EARLY_BIRD_LABEL,
  formatSeasonPassPrice,
  isEarlyBirdPricingShown,
} from "@/lib/constants/pricing";

const faqs = [
  {
    q: "What's included in the season pass?",
    a: "Saving programs to your shortlist, status tracking, deadlines, notes, compare view (up to 4 programs), CSV export, and read-only share links — through June 30 of the current season.",
  },
  {
    q: "Why is it free right now?",
    a: `We're in an early bird period while we refine Groundwork with real families. Regular price is ${formatSeasonPassPrice()} per season; early bird access is free for a limited time with the same features.`,
  },
  {
    q: `Will it really be ${formatSeasonPassPrice()} later?`,
    a: `Yes. After early bird ends, new users will pay a one-time ${formatSeasonPassPrice()} seasonal pass (no subscription, no auto-renewal). Early bird users who sign in now keep access through June 30 at no charge.`,
  },
  {
    q: "Is search still free?",
    a: "Always. Browsing, filtering, and reading program details — including hidden gotcha flags — never requires a pass.",
  },
  {
    q: "Do I need a credit card today?",
    a: isEarlyBirdPricingShown()
      ? "No. Sign in with Google to unlock the workspace during early bird. Payment setup is coming later; we'll notify users before early bird ends."
      : `Yes. Checkout is handled securely through Stripe for the ${formatSeasonPassPrice()} one-time season pass.`,
  },
  {
    q: "When does my pass expire?",
    a: "Season passes run through June 30 (August–June academic cycle). You can renew next summer if you'd like.",
  },
];

export function PricingFaq() {
  return (
    <section id="faq" className="mt-16 border-t border-[var(--color-border)] pt-12">
      <h2 className="text-2xl">Frequently asked questions</h2>
      {isEarlyBirdPricingShown() && (
        <p className="mt-2 text-sm text-[var(--color-amber)]">{EARLY_BIRD_LABEL}</p>
      )}
      <dl className="mt-8 space-y-6">
        {faqs.map((item) => (
          <div key={item.q}>
            <dt className="font-medium text-[var(--color-navy)]">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-sm text-[var(--color-text-muted)]">
        Something wrong with a listing?{" "}
        <a href="/contact" className="font-medium text-[var(--color-navy)] no-underline hover:text-[var(--color-navy-light)]">
          Contact us / report an issue
        </a>
        .
      </p>
    </section>
  );
}

export function EarlyBirdBanner({ className = "" }: { className?: string }) {
  if (!isEarlyBirdPricingShown()) return null;

  return (
    <p
      className={`rounded-[var(--radius-md)] border border-[var(--color-amber)]/40 bg-[var(--color-amber-soft)]/60 px-4 py-3 text-sm text-[var(--color-navy)] ${className}`}
    >
      <span className="font-semibold">{EARLY_BIRD_LABEL}:</span> Workspace features are{" "}
      <strong>free</strong> for now (regular price {formatSeasonPassPrice()}/season).{" "}
      <a href="/pricing" className="font-medium text-[var(--color-navy-light)]">
        See pricing →
      </a>
    </p>
  );
}

export function PriceDisplay({ large = false }: { large?: boolean }) {
  const earlyBird = isEarlyBirdPricingShown();

  if (earlyBird) {
    return (
      <div>
        <p className="text-sm font-medium text-[var(--color-amber)]">{EARLY_BIRD_LABEL}</p>
        <div className={`mt-2 flex flex-wrap items-baseline gap-3 ${large ? "" : "text-2xl"}`}>
          <span
            className={`text-[var(--color-text-muted)] line-through ${large ? "text-2xl" : "text-lg"}`}
          >
            {formatSeasonPassPrice()}
          </span>
          <span className={`font-normal text-[var(--color-navy)] ${large ? "text-5xl" : "text-3xl"}`}>
            Free
            <span className={`text-[var(--color-text-muted)] ${large ? "text-lg" : "text-base"}`}>
              {" "}
              / season
            </span>
          </span>
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Regular price {formatSeasonPassPrice()} when early bird ends. No credit card required
          today.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[var(--color-text-muted)]">One-time payment</p>
      <p className={`mt-1 text-[var(--color-navy)] ${large ? "text-5xl" : "text-3xl"}`}>
        {formatSeasonPassPrice()}
        <span className={`font-normal text-[var(--color-text-muted)] ${large ? "text-lg" : "text-base"}`}>
          {" "}
          / season
        </span>
      </p>
    </div>
  );
}
