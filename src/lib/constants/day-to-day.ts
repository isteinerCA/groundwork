/** How day-to-day notes were sourced — shown on program tiles for trust. */
export const DAY_TO_DAY_SOURCE_TYPES = [
  "official_policy",
  "program_faq",
  "third_party_synthesis",
  "not_found",
] as const;

export type DayToDaySourceType = (typeof DAY_TO_DAY_SOURCE_TYPES)[number];

export const DAY_TO_DAY_SOURCE_LABELS: Record<DayToDaySourceType, string> = {
  official_policy: "Official policy / handbook",
  program_faq: "Program FAQ",
  third_party_synthesis: "Third-party synthesis",
  not_found: "Details not published",
};

/** Required on every day-to-day rule in day-to-day.json when notes are present. */
export function isDayToDaySourceType(value: string): value is DayToDaySourceType {
  return (DAY_TO_DAY_SOURCE_TYPES as readonly string[]).includes(value);
}
