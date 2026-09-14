/** Target summer season shown in search filters and program cards. */
export const TARGET_SEASON_YEAR = 2027;

export const PUBLISHED_REVIEW_STATUSES = [
  "verified",
  "provisional",
  "awaiting_source",
] as const;

export type PublishedReviewStatus = (typeof PUBLISHED_REVIEW_STATUSES)[number];

/** Default when legacy CSV rows omit Review Status. */
export const DEFAULT_REVIEW_STATUS: PublishedReviewStatus = "provisional";

/** Default season year for legacy 2026 catalog rows. */
export const LEGACY_CATALOG_SEASON_YEAR = 2026;

export const INCLUDE_PENDING_SEASON_REFRESH_DEFAULT = true;

export const INCLUDE_PENDING_SEASON_REFRESH_LABEL =
  "Include programs pending 2027 update";

export const INCLUDE_PENDING_SEASON_REFRESH_TOOLTIP =
  "Shows programs that match your filters even when 2027 dates have not been updated. Verify dates and cost on the program site.";

export const SEASON_VERIFIED_BADGE = "Updated for 2027";

export const SEASON_PENDING_BADGE = "Pending 2027 refresh";

export const SEASON_PENDING_DATES_DISPLAY = `Not confirmed for ${TARGET_SEASON_YEAR}`;

export function isPublishedReviewStatus(value: string): value is PublishedReviewStatus {
  return (PUBLISHED_REVIEW_STATUSES as readonly string[]).includes(value);
}
