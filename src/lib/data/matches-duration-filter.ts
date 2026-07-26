import type { Program } from "@/lib/types/program";

/** Match program length (from CSV) against optional week bounds. Overlap logic. */
export function matchesDurationWeeksFilter(
  program: Pick<Program, "lengthMinDays" | "lengthMaxDays">,
  minDurationWeeks: number | null,
  maxDurationWeeks: number | null,
): boolean {
  if (minDurationWeeks == null && maxDurationWeeks == null) return true;

  const progMin = program.lengthMinDays;
  const progMax = program.lengthMaxDays;

  // Unknown length: include so users don't miss programs; LLM should note in unexpressible
  if (progMin == null && progMax == null) return true;

  const programMin = progMin ?? progMax ?? 0;
  const programMax = progMax ?? progMin ?? programMin;

  const filterMinDays = (minDurationWeeks ?? 0) * 7;
  const filterMaxDays =
    maxDurationWeeks != null ? maxDurationWeeks * 7 : Number.POSITIVE_INFINITY;

  return programMin <= filterMaxDays && programMax >= filterMinDays;
}
