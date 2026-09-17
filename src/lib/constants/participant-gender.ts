export const PARTICIPANT_GENDERS = [
  { id: "coed", label: "Coed" },
  { id: "boys", label: "Boys only" },
  { id: "girls", label: "Girls only" },
  { id: "girls-inclusive", label: "Girls + GNB (female housing)" },
] as const;

export type ParticipantGenderId = (typeof PARTICIPANT_GENDERS)[number]["id"];

/** Filterable values — coed is the default and excluded when this filter is active. */
export const PARTICIPANT_GENDER_FILTER_IDS = ["boys", "girls", "girls-inclusive"] as const;

export type ParticipantGenderFilterId =
  (typeof PARTICIPANT_GENDER_FILTER_IDS)[number];

export function participantGenderLabel(id: ParticipantGenderId): string {
  return PARTICIPANT_GENDERS.find((entry) => entry.id === id)?.label ?? id;
}

/** Short badge copy for non-coed programs; null when no badge is needed. */
export function participantGenderBadgeLabel(id: ParticipantGenderId): string | null {
  switch (id) {
    case "boys":
      return "Boys camp";
    case "girls":
      return "Girls program";
    case "girls-inclusive":
      return "Girls + GNB (female housing)";
    default:
      return null;
  }
}

export function participantGenderFilterLabel(
  ids: readonly ParticipantGenderFilterId[],
): string {
  if (ids.includes("boys") && !ids.includes("girls") && !ids.includes("girls-inclusive")) {
    return "Boys only";
  }
  if (ids.includes("girls") || ids.includes("girls-inclusive")) {
    return "Girls only";
  }
  return ids.map(participantGenderLabel).join(" or ");
}

export function isParticipantGenderFilterId(
  value: string,
): value is ParticipantGenderFilterId {
  return (PARTICIPANT_GENDER_FILTER_IDS as readonly string[]).includes(value);
}

export function isParticipantGenderId(value: string): value is ParticipantGenderId {
  return (PARTICIPANT_GENDERS as readonly { id: string }[]).some(
    (entry) => entry.id === value,
  );
}
