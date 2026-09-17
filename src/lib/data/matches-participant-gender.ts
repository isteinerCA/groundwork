import type { ParticipantGenderFilterId } from "@/lib/constants/participant-gender";
import type { Program } from "@/lib/types/program";

export function participantGenderMatchesFilter(
  program: Pick<Program, "participantGender">,
  filterIds: ParticipantGenderFilterId[],
): boolean {
  if (filterIds.length === 0) return true;

  const gender = program.participantGender ?? "coed";
  if (gender === "coed") return false;

  return filterIds.includes(gender);
}
