import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { SITE_NAME, SITE_PRODUCTION_URL } from "@/lib/constants/brand";
import { WAITLIST_SEASON_YEAR, type WaitlistSource } from "@/lib/waitlist/constants";

export interface WaitlistSignup {
  id: string;
  email: string;
  source: WaitlistSource;
  submittedAt: string;
  clientIp: string;
}

async function persistDevSignup(signup: WaitlistSignup): Promise<void> {
  if (process.env.NODE_ENV !== "development") return;

  const dir = path.join(process.cwd(), "data", "submissions");
  await mkdir(dir, { recursive: true });
  await appendFile(
    path.join(dir, "waitlist.jsonl"),
    `${JSON.stringify(signup)}\n`,
    "utf-8",
  );
}

function resendHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function addContactToSegment(email: string, segmentId: string, apiKey: string): Promise<boolean> {
  const createResponse = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: resendHeaders(apiKey),
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    }),
  });

  if (createResponse.ok) return true;

  const addResponse = await fetch(
    `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
    {
      method: "POST",
      headers: resendHeaders(apiKey),
    },
  );

  return addResponse.ok;
}

async function sendConfirmationEmail(email: string, apiKey: string, from: string): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? SITE_PRODUCTION_URL;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: resendHeaders(apiKey),
    body: JSON.stringify({
      from,
      to: [email],
      subject: `You're on the list — ${SITE_NAME} ${WAITLIST_SEASON_YEAR} updates`,
      text: [
        `Thanks for signing up for ${SITE_NAME} ${WAITLIST_SEASON_YEAR} program updates.`,
        "",
        `We're verifying dates, costs, and details for summer ${WAITLIST_SEASON_YEAR} programs now.`,
        "We'll send one email when the catalog is ready to search — no newsletters or spam.",
        "",
        `Explore what's live today: ${siteUrl}/search`,
        "",
        `— ${SITE_NAME}`,
      ].join("\n"),
    }),
  });

  return response.ok;
}

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "resend_failed" };

export async function subscribeToWaitlist(signup: WaitlistSignup): Promise<WaitlistResult> {
  await persistDevSignup(signup);

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_WAITLIST_SEGMENT_ID;
  const from =
    process.env.CONTACT_EMAIL_FROM ?? `${SITE_NAME} <hello@explore-summer.com>`;

  if (!apiKey || !segmentId) {
    if (process.env.NODE_ENV === "development") {
      return { ok: true };
    }
    return { ok: false, reason: "not_configured" };
  }

  const added = await addContactToSegment(signup.email, segmentId, apiKey);
  if (!added) {
    return { ok: false, reason: "resend_failed" };
  }

  await sendConfirmationEmail(signup.email, apiKey, from);
  return { ok: true };
}
