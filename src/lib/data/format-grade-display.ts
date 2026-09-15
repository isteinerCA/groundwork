import type { Program } from "@/lib/types/program";

/** Card / table label for the eligibility row. */
export function gradeEligibilityLabel(
  program: Pick<Program, "gradeSource">,
): string {
  if (program.gradeSource === "age") return "Ages";
  if (program.gradeSource === "mixed") return "Eligibility";
  return "Grades";
}

/** Muted subline when age-based eligibility is mapped to grade filters. */
export function gradeSearchMatchHint(
  program: Pick<Program, "gradeSource" | "gradeCompletedMin" | "gradeCompletedMax">,
): string | null {
  if (program.gradeSource !== "age" && program.gradeSource !== "mixed") return null;

  const { gradeCompletedMin: min, gradeCompletedMax: max } = program;
  if (min === max) return `Search matches grade completed ${min}`;
  return `Search matches grades completed ${min}–${max}`;
}
