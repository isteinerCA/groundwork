import { SEASON_PENDING_DATES_DISPLAY } from "@/lib/constants/season-review";
import { isPendingSeasonRefresh } from "@/lib/data/normalize-season-review";
import type { Program } from "@/lib/types/program";

/** Parent-facing dates line on cards and workspace views. */
export function formatDatesDisplay(
  program: Pick<Program, "reviewStatus" | "seasonYear" | "datesDisplay">,
): string {
  if (isPendingSeasonRefresh(program)) return SEASON_PENDING_DATES_DISPLAY;
  return program.datesDisplay.trim() || "See program site";
}

export function isPendingDatesDisplay(
  program: Pick<Program, "reviewStatus" | "seasonYear">,
): boolean {
  return isPendingSeasonRefresh(program);
}
