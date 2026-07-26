import { filterPrograms } from "@/lib/data/filter-programs";
import { getMonthLabel } from "@/lib/constants/months";
import type { LlmParseResponse } from "@/lib/search/llm-parse-schema";
import type { Program, SearchFilters } from "@/lib/types/program";

/** Strip LLM-guessed result counts — the client computes the real total. */
function stripGuessedCounts(message: string): string {
  return message
    .replace(/\s*you now have \d+ programs?[^.!?]*[.!?]?/gi, "")
    .replace(/\s*\d+ programs? (?:that )?match(?:es)?[^.!?]*[.!?]?/gi, "")
    .replace(/\s*showing \d+ programs?[^.!?]*[.!?]?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function resultCountSentence(count: number): string {
  if (count === 0) {
    return "No programs match — try broadening your filters.";
  }
  return `${count} program${count === 1 ? "" : "s"} match your filters.`;
}

function monthFilterNote(filters: SearchFilters, programs: Program[]): string | null {
  if (filters.includeMonths.length === 0) return null;

  const monthLabels = filters.includeMonths.map((month) => getMonthLabel(month)).join(" or ");
  const matching = filterPrograms(programs, filters);
  const approximateCount = matching.filter(
    (program) => program.datesParseQuality === "approximate",
  ).length;

  if (approximateCount === 0) {
    return `These programs run during ${monthLabels}. Check each program's site for specific session dates.`;
  }

  return `These programs run during ${monthLabels} based on our date ranges — some use approximate summer windows. Check each program's site for which sessions start in ${monthLabels}.`;
}

/** Build chat text with an accurate post-filter result count. */
export function formatAssistantMessage(
  result: LlmParseResponse,
  nextFilters: SearchFilters,
  programs: Program[],
): string {
  const hadPatch = result.clearAll || Object.keys(result.filterPatch).length > 0;
  const text = result.assistantMessage.trim();
  const limitation = result.unexpressible.trim();

  if (!hadPatch) {
    return text || limitation;
  }

  if (nextFilters.gradesCompleted.length === 0) {
    return text || limitation;
  }

  const nextCount = filterPrograms(programs, nextFilters).length;
  const withoutGuess = stripGuessedCounts(text);
  const countSentence = resultCountSentence(nextCount);
  const monthNote = monthFilterNote(nextFilters, programs);

  const parts = [withoutGuess, countSentence, monthNote].filter(Boolean);
  return parts.join(" ");
}
