import { NextResponse } from "next/server";
import { INQUIRY_TYPES, slaForInquiry, type InquiryTypeId } from "@/lib/contact/types";
import { clientIpFromRequest, isRateLimited } from "@/lib/contact/rate-limit";
import { persistSubmission, sendContactEmail, type StoredSubmission } from "@/lib/contact/store";
import { isValidEmail, isValidUrl, sanitizeText } from "@/lib/sanitize";

function parseInquiryType(value: unknown): InquiryTypeId | null {
  if (typeof value !== "string") return null;
  return INQUIRY_TYPES.some((t) => t.id === value) ? (value as InquiryTypeId) : null;
}

export async function POST(request: Request) {
  const clientIp = clientIpFromRequest(request);

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a minute and try again." },
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
  const name = sanitizeText(String(raw.name ?? ""), 120);
  const email = sanitizeText(String(raw.email ?? ""), 254);
  const programName = sanitizeText(String(raw.programName ?? ""), 200);
  const message = sanitizeText(String(raw.message ?? ""), 5000);
  const websiteUrl = sanitizeText(String(raw.websiteUrl ?? ""), 500);
  const inquiryType = parseInquiryType(raw.inquiryType);

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!programName) {
    return NextResponse.json({ error: "Please enter a program name." }, { status: 400 });
  }
  if (!inquiryType) {
    return NextResponse.json({ error: "Please select an inquiry type." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please include a message (at least 10 characters)." },
      { status: 400 },
    );
  }
  if (!isValidUrl(websiteUrl)) {
    return NextResponse.json({ error: "Please enter a valid website URL." }, { status: 400 });
  }

  const submission: StoredSubmission = {
    id: crypto.randomUUID(),
    name,
    email,
    programName,
    inquiryType,
    message,
    websiteUrl,
    submittedAt: new Date().toISOString(),
    clientIp,
  };

  try {
    await persistSubmission(submission);
    await sendContactEmail(submission);
  } catch (err) {
    console.error("Contact submission error:", err);
    return NextResponse.json(
      { error: "Unable to process your submission. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    referenceId: submission.id,
    sla: slaForInquiry(inquiryType),
  });
}
