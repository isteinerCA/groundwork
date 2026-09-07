import { SITE_NAME, SITE_PRODUCTION_URL } from "@/lib/constants/brand";
import { WAITLIST_SEASON_YEAR } from "@/lib/waitlist/constants";

const SEARCH_URL = `${SITE_PRODUCTION_URL}/search`;
const LOGO_URL = `${SITE_PRODUCTION_URL}/images/explore-summer-logo.png`;

export function waitlistConfirmationSubject(): string {
  return `You're on the list — ${SITE_NAME} ${WAITLIST_SEASON_YEAR} updates`;
}

export function waitlistConfirmationText(): string {
  return [
    `Thanks for signing up for ${SITE_NAME} ${WAITLIST_SEASON_YEAR} program updates.`,
    "",
    "We're currently verifying details for summer 2027 programs now. We'll let you know when the 2027 catalog is ready to search.",
    "",
    `In the meantime, explore what's live today to get a sense of options available: ${SEARCH_URL}`,
    "",
    `— ${SITE_NAME}`,
  ].join("\n");
}

export function waitlistConfirmationHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${waitlistConfirmationSubject()}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#fcfaf7;font-family:Georgia,'Times New Roman',serif;color:#12222e;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fcfaf7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e0d8;border-radius:12px;">
            <tr>
              <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #e5e0d8;">
                <img src="${LOGO_URL}" alt="${SITE_NAME}" width="240" style="display:block;margin:0 auto;max-width:240px;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 32px;font-size:16px;line-height:1.6;">
                <p style="margin:0 0 16px;">Thanks for signing up for ${SITE_NAME} ${WAITLIST_SEASON_YEAR} program updates.</p>
                <p style="margin:0 0 16px;">We're currently verifying details for summer 2027 programs now. We'll let you know when the 2027 catalog is ready to search.</p>
                <p style="margin:0 0 16px;">In the meantime, explore what's live today to get a sense of options available: <a href="${SEARCH_URL}" style="color:#2a4254;">${SEARCH_URL}</a></p>
                <p style="margin:24px 0 0;">— ${SITE_NAME}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
