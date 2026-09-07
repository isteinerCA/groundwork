export const WAITLIST_SEASON_YEAR = 2027;

export const WAITLIST_SOURCES = ["home", "search"] as const;
export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

export function isWaitlistSource(value: unknown): value is WaitlistSource {
  return typeof value === "string" && WAITLIST_SOURCES.includes(value as WaitlistSource);
}
