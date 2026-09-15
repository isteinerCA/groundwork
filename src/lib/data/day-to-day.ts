import {
  DAY_TO_DAY_SOURCE_TYPES,
  type DayToDaySourceType,
} from "@/lib/constants/day-to-day";
import type { ProgramDayToDay } from "@/lib/types/program";

/** True when day-to-day content should appear on a program card. */
export function isValidDayToDay(
  dayToDay: ProgramDayToDay | undefined | null,
): dayToDay is ProgramDayToDay {
  if (!dayToDay) return false;
  const notes = dayToDay.notes?.trim();
  if (!notes) return false;
  return DAY_TO_DAY_SOURCE_TYPES.includes(dayToDay.sourceType);
}

export type { DayToDaySourceType };
