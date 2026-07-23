import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { ContactFormPayload } from "@/lib/contact/types";
import { INQUIRY_TYPES } from "@/lib/contact/types";

export interface StoredSubmission extends ContactFormPayload {
  id: string;
  submittedAt: string;
  clientIp: string;
}

export async function persistSubmission(
  submission: StoredSubmission,
): Promise<void> {
  if (process.env.NODE_ENV !== "development") return;

  const dir = path.join(process.cwd(), "data", "submissions");
  await mkdir(dir, { recursive: true });
  await appendFile(
    path.join(dir, "contact.jsonl"),
    `${JSON.stringify(submission)}\n`,
    "utf-8",
  );
}

export async function sendContactEmail(submission: StoredSubmission): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  const from = process.env.CONTACT_EMAIL_FROM ?? "Groundwork <onboarding@resend.dev>";

  if (!apiKey || !to) return false;

  const typeLabel =
    INQUIRY_TYPES.find((t) => t.id === submission.inquiryType)?.label ?? submission.inquiryType;

  const body = [
    `Inquiry type: ${typeLabel}`,
    submission.programName ? `Program: ${submission.programName}` : null,
    `From: ${submission.name} <${submission.email}>`,
    submission.websiteUrl ? `Website: ${submission.websiteUrl}` : null,
    "",
    submission.message,
    "",
    `Submitted: ${submission.submittedAt}`,
    `Reference: ${submission.id}`,
  ]
    .filter(Boolean)
    .join("\n");

  const subjectSuffix = submission.programName || typeLabel;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: submission.email,
      subject: `[Groundwork] ${typeLabel}: ${subjectSuffix}`,
      text: body,
    }),
  });

  return response.ok;
}
