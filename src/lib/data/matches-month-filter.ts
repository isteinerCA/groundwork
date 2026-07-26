import type { MonthNumber } from "@/lib/constants/months";
import type { Program } from "@/lib/types/program";

const SEARCH_YEAR = 2026;

function monthBounds(month: MonthNumber): { start: Date; end: Date } {
  const start = new Date(SEARCH_YEAR, month - 1, 1);
  const end = new Date(SEARCH_YEAR, month, 0);
  return { start, end };
}

function parseIsoDate(value: string): Date | null {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** True when a program's parsed date range overlaps a calendar month. */
export function programOverlapsMonth(program: Program, month: MonthNumber): boolean {
  if (!program.dateStart || !program.dateEnd) return false;

  const rangeStart = parseIsoDate(program.dateStart);
  const rangeEnd = parseIsoDate(program.dateEnd);
  if (!rangeStart || !rangeEnd) return false;

  const { start: monthStart, end: monthEnd } = monthBounds(month);
  return rangeStart <= monthEnd && rangeEnd >= monthStart;
}

export function programMatchesMonthFilter(
  program: Program,
  months: MonthNumber[],
): boolean {
  if (months.length === 0) return true;
  return months.some((month) => programOverlapsMonth(program, month));
}
