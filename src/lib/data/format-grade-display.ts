import { ageRangeToGrades } from "@/lib/data/normalize-grade";
import type { Program } from "@/lib/types/program";

/** Card / table label for the eligibility row. */
export function gradeEligibilityLabel(
  program: Pick<Program, "gradeSource">,
): string {
  if (program.gradeSource === "age") return "Ages";
  if (program.gradeSource === "mixed") return "Eligibility";
  return "Grades";
}

function extractAgePhrase(gradeDisplay: string): string | null {
  const match = gradeDisplay.match(/ages?\s*(\d+)\s*[–-]\s*(\d+)/i);
  if (!match) return null;
  return `Ages ${match[1]}-${match[2]}`;
}

function formatCompletedGradesForFilter(min: number, max: number): string {
  if (min === max) return `grade ${min}`;
  return `grades ${min}–${max}`;
}

function extractMinimumAgeByStart(gradeDisplay: string): number | null {
  const match = gradeDisplay.match(/\bmust be\s+(\d+)\s+by\s+(?:program\s+)?start\b/i);
  return match ? Number(match[1]) : null;
}

/** Keep comma-separated rising-grade lists; strip trailing parentheticals. */
function siteEligibilityPhrase(gradeDisplay: string): string {
  return gradeDisplay.split("(")[0]?.trim().replace(/[,\s]+$/, "") || gradeDisplay;
}

/**
 * Parent-facing eligibility line for program cards and compare view.
 * Age-based rows: site ages first, then why the program matched grade filters.
 */
export function formatGradeEligibilityDisplay(
  program: Pick<
    Program,
    "gradeSource" | "gradeDisplay" | "gradeCompletedMin" | "gradeCompletedMax"
  >,
): string {
  if (program.gradeSource === "age" || program.gradeSource === "mixed") {
    const ageRange = extractAgePhrase(program.gradeDisplay);
    if (ageRange) {
      const gradeMatch = formatCompletedGradesForFilter(
        program.gradeCompletedMin,
        program.gradeCompletedMax,
      );
      return `${ageRange} per program site (matches completed ${gradeMatch} in search filters)`;
    }

    const sitePhrase = siteEligibilityPhrase(program.gradeDisplay);
    const minimumAge = extractMinimumAgeByStart(program.gradeDisplay);
    if (minimumAge != null) {
      const [floorGrade] = ageRangeToGrades(minimumAge, minimumAge);
      return `${sitePhrase} (matches completed grade ${floorGrade} in search filters)`;
    }

    const gradeMatch = formatCompletedGradesForFilter(
      program.gradeCompletedMin,
      program.gradeCompletedMax,
    );
    return `${sitePhrase} (matches completed ${gradeMatch} in search filters)`;
  }

  return program.gradeDisplay;
}
