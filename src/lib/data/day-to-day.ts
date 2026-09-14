import {
  DAY_TO_DAY_SOURCE_TYPES,
  type DayToDaySourceType,
} from "@/lib/constants/day-to-day";
import type { ProgramDayToDay } from "@/lib/types/program";

/** True when day-to-day content should appear on a tile or in search text. */
export function isValidDayToDay(
  dayToDay: ProgramDayToDay | undefined | null,
): dayToDay is ProgramDayToDay {
  if (!dayToDay) return false;
  const notes = dayToDay.notes?.trim();
  if (!notes) return false;
  return DAY_TO_DAY_SOURCE_TYPES.includes(dayToDay.sourceType);
}

export function dayToDaySearchText(dayToDay: ProgramDayToDay | undefined): string {
  if (!isValidDayToDay(dayToDay)) return "";
  return `${dayToDay.notes} ${dayToDay.sourceCitation ?? ""}`.trim();
}

export type { DayToDaySourceType };
