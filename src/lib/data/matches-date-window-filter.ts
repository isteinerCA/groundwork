import { TARGET_SEASON_YEAR } from "@/lib/constants/season-review";
import type { Program } from "@/lib/types/program";

function parseIsoDate(value: string): Date | null {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Program dates fall entirely within the filter window (inclusive). */
export function programContainedInDateWindow(
  program: Program,
  windowStart: string,
  windowEnd: string,
): boolean {
  if (!program.dateStart || !program.dateEnd) return false;

  const rangeStart = parseIsoDate(program.dateStart);
  const rangeEnd = parseIsoDate(program.dateEnd);
  const filterStart = parseIsoDate(windowStart);
  const filterEnd = parseIsoDate(windowEnd);
  if (!rangeStart || !rangeEnd || !filterStart || !filterEnd) return false;

  return rangeStart >= filterStart && rangeEnd <= filterEnd;
}

export function programMatchesDateWindowFilter(
  program: Program,
  windowStart: string | null,
  windowEnd: string | null,
): boolean {
  if (!windowStart || !windowEnd) return true;
  return programContainedInDateWindow(program, windowStart, windowEnd);
}

export function isActiveDateWindowFilter(
  windowStart: string | null,
  windowEnd: string | null,
): boolean {
  return Boolean(windowStart?.trim() && windowEnd?.trim());
}

/** Human-readable chip label for an active date window. */
export function formatDateWindowFilterLabel(windowStart: string, windowEnd: string): string {
  const start = new Date(`${windowStart}T12:00:00`);
  const end = new Date(`${windowEnd}T12:00:00`);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" });
  const year = start.getFullYear() || TARGET_SEASON_YEAR;
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `Fits ${month.format(start)} ${start.getDate()}–${end.getDate()}, ${year}`;
  }
  return `Fits ${month.format(start)} ${start.getDate()} – ${month.format(end)} ${end.getDate()}, ${year}`;
}
