import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getEmailFromAddress } from "@/lib/email/from-address";
import {
  waitlistConfirmationHtml,
  waitlistConfirmationSubject,
  waitlistConfirmationText,
} from "@/lib/waitlist/confirmation-email";
import { type WaitlistSource } from "@/lib/waitlist/constants";

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

async function readResendError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; name?: string };
    return body.message ?? body.name ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

async function addContactToSegment(
  email: string,
  segmentId: string,
  apiKey: string,
): Promise<{ ok: true } | { ok: false; reason: "restricted_key" | "resend_failed"; detail: string }> {
  const createWithSegment = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: resendHeaders(apiKey),
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    }),
  });

  if (createWithSegment.ok) return { ok: true };

  let detail = await readResendError(createWithSegment);
  if (detail.includes("restricted to only send emails")) {
    return { ok: false, reason: "restricted_key", detail };
  }

  const createContact = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: resendHeaders(apiKey),
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  if (!createContact.ok) {
    detail = await readResendError(createContact);
    if (detail.includes("restricted to only send emails")) {
      return { ok: false, reason: "restricted_key", detail };
    }
  }

  const addResponse = await fetch(
    `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
    {
      method: "POST",
      headers: resendHeaders(apiKey),
    },
  );

  if (addResponse.ok) return { ok: true };

  detail = await readResendError(addResponse);
  if (detail.includes("restricted to only send emails")) {
    return { ok: false, reason: "restricted_key", detail };
  }

  console.error("Resend waitlist segment error:", detail);
  return { ok: false, reason: "resend_failed", detail };
}

async function sendConfirmationEmail(email: string, apiKey: string): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: resendHeaders(apiKey),
    body: JSON.stringify({
      from: getEmailFromAddress(),
      to: [email],
      subject: waitlistConfirmationSubject(),
      html: waitlistConfirmationHtml(),
      text: waitlistConfirmationText(),
    }),
  });

  return response.ok;
}

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "restricted_key" | "resend_failed" };

export async function subscribeToWaitlist(signup: WaitlistSignup): Promise<WaitlistResult> {
  await persistDevSignup(signup);

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_WAITLIST_SEGMENT_ID?.trim();

  if (!apiKey || !segmentId) {
    if (process.env.NODE_ENV === "development") {
      return { ok: true };
    }
    return { ok: false, reason: "not_configured" };
  }

  const added = await addContactToSegment(signup.email, segmentId, apiKey);
  if (!added.ok) {
    if (added.reason === "restricted_key") {
      console.error(
        "Resend API key cannot manage contacts. Create a Full Access key in Resend and update RESEND_API_KEY.",
      );
    }
    return { ok: false, reason: added.reason };
  }

  await sendConfirmationEmail(signup.email, apiKey);
  return { ok: true };
}
