/**
 * Normalized admission types (PRD §7.1).
 * Raw CSV strings are mapped to one of these three values at import time.
 */
export const ADMISSION_TYPES = [
  {
    id: "first_come",
    label: "First-Come",
    chipColor: "green",
    description: "Open or rolling enrollment without competitive selection",
  },
  {
    id: "application",
    label: "Application",
    chipColor: "amber",
    description: "Application required; selective but not elite-tier",
  },
  {
    id: "highly_competitive",
    label: "Highly Competitive",
    chipColor: "red",
    description: "Low acceptance rates or highly selective admission",
  },
] as const;

export type AdmissionTypeId = (typeof ADMISSION_TYPES)[number]["id"];

export const ADMISSION_TYPE_BY_ID = Object.fromEntries(
  ADMISSION_TYPES.map((a) => [a.id, a]),
) as Record<AdmissionTypeId, (typeof ADMISSION_TYPES)[number]>;
