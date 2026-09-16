import { inclusiveDaySpanFromIso } from "@/lib/data/parse-dates-display";
import type { Program } from "@/lib/types/program";

function formatDayCount(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}

/** Compare-table length: calendar days from dates when available. */
export function formatCompareLength(
  program: Pick<
    Program,
    "dateStart" | "dateEnd" | "lengthMinDays" | "lengthMaxDays" | "lengthDisplay"
  >,
): string {
  if (program.dateStart && program.dateEnd) {
    return formatDayCount(inclusiveDaySpanFromIso(program.dateStart, program.dateEnd));
  }

  const { lengthMinDays, lengthMaxDays } = program;
  if (lengthMinDays != null && lengthMaxDays != null) {
    if (lengthMinDays === lengthMaxDays) return formatDayCount(lengthMinDays);
    return `${lengthMinDays}–${lengthMaxDays} days`;
  }
  if (lengthMinDays != null) return formatDayCount(lengthMinDays);

  return program.lengthDisplay?.trim() || "—";
}
