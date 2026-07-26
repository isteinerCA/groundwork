import { filterPrograms } from "@/lib/data/filter-programs";
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
  const main = withoutGuess ? `${withoutGuess} ${countSentence}` : countSentence;

  return limitation ? `${main} ${limitation}`.trim() : main;
}
