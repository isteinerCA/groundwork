import { SITE_NAME } from "@/lib/constants/brand";

/** Resend "from" with a friendly display name (Explore Summer), not bare email. */
export function getEmailFromAddress(): string {
  const configured = process.env.CONTACT_EMAIL_FROM?.trim();
  if (!configured) {
    return `${SITE_NAME} <hello@explore-summer.com>`;
  }

  if (configured.includes("<") && configured.includes(">")) {
    return configured;
  }

  return `${SITE_NAME} <${configured}>`;
}
