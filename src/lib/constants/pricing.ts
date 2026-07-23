/** Standard season pass price (USD). */
export const SEASON_PASS_PRICE = 49;

/** Shown in UI when early bird is active. */
export const EARLY_BIRD_LABEL = "Early bird — limited time";

/**
 * Server: auto-grant season pass on sign-in without Stripe.
 * Set EARLY_BIRD_FREE=true in .env.local / Vercel.
 */
export function isEarlyBirdFreeEnabled(): boolean {
  return process.env.EARLY_BIRD_FREE === "true";
}

/**
 * Client: show early bird pricing UX (strikethrough $49, free now).
 * Must match EARLY_BIRD_FREE on the server.
 */
export function isEarlyBirdPricingShown(): boolean {
  return process.env.NEXT_PUBLIC_EARLY_BIRD === "true";
}

/** Stripe checkout button — off until keys are configured and this flag is set. */
export function isStripeCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED === "true";
}

export function formatSeasonPassPrice(): string {
  return `$${SEASON_PASS_PRICE}`;
}
