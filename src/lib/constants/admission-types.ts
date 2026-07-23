/**
 * Normalized admission types (PRD §7.1).
 * Raw CSV strings are mapped to one of these three values at import time.
 */
export const ADMISSION_TYPES = [
  {
    id: "first_come",
    label: "First-Come",
    chipColor: "green",
    description:
      "First-come or rolling — register before the program fills; no competitive selection process.",
  },
  {
    id: "application",
    label: "Application",
    chipColor: "amber",
    description:
      "Application required — if your student meets the criteria, they have a good chance of getting in.",
  },
  {
    id: "highly_competitive",
    label: "Selective",
    chipColor: "red",
    description:
      "Highly selective — competition for seats is high. Polish the application and keep backup options ready.",
  },
] as const;

export type AdmissionTypeId = (typeof ADMISSION_TYPES)[number]["id"];

export const ADMISSION_TYPE_BY_ID = Object.fromEntries(
  ADMISSION_TYPES.map((a) => [a.id, a]),
) as Record<AdmissionTypeId, (typeof ADMISSION_TYPES)[number]>;
