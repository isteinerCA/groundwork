import { NextResponse } from "next/server";
import { clientIpFromRequest, isRateLimited } from "@/lib/contact/rate-limit";
import { isValidEmail, sanitizeText } from "@/lib/sanitize";
import { isWaitlistSource } from "@/lib/waitlist/constants";
import { subscribeToWaitlist } from "@/lib/waitlist/store";

export async function POST(request: Request) {
  const clientIp = clientIpFromRequest(request);

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const email = sanitizeText(String(raw.email ?? ""), 254).toLowerCase();
  const source = isWaitlistSource(raw.source) ? raw.source : "home";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const result = await subscribeToWaitlist({
    id: crypto.randomUUID(),
    email,
    source,
    submittedAt: new Date().toISOString(),
    clientIp,
  });

  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json(
        { error: "Sign-ups are temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Unable to complete sign-up. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
