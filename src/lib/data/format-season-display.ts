import { isPendingSeasonRefresh } from "@/lib/data/normalize-season-review";
import type { Program } from "@/lib/types/program";

/** Mute dates on cards when target-season details are not yet verified. */
export function isDatesDisplayMuted(
  program: Pick<Program, "reviewStatus" | "seasonYear" | "datesDisplay">,
): boolean {
  if (!program.datesDisplay.trim()) return false;
  return isPendingSeasonRefresh(program);
}
