import type { MonthNumber } from "@/lib/constants/months";
import type { Program } from "@/lib/types/program";

function monthBounds(year: number, month: MonthNumber): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
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

  const year = program.seasonYear || rangeStart.getFullYear();
  const { start: monthStart, end: monthEnd } = monthBounds(year, month);
  return rangeStart <= monthEnd && rangeEnd >= monthStart;
}

export function programMatchesMonthFilter(
  program: Program,
  months: MonthNumber[],
): boolean {
  if (months.length === 0) return true;
  return months.some((month) => programOverlapsMonth(program, month));
}

export function programMatchesExcludeMonthFilter(
  program: Program,
  excludeMonths: MonthNumber[],
): boolean {
  if (excludeMonths.length === 0) return true;
  return !excludeMonths.some((month) => programOverlapsMonth(program, month));
}
