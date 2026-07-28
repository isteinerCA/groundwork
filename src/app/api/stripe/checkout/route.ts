import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isEarlyBirdFreeEnabled, isStripeCheckoutEnabled } from "@/lib/constants/pricing";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST() {
  if (isEarlyBirdFreeEnabled() && !isStripeCheckoutEnabled()) {
    return NextResponse.json(
      {
        error: "Early bird is active — workspace access is free. No payment required.",
      },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Contact support." },
      { status: 503 },
    );
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/workspace?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 });
  }
}
