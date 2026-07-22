import type { ProgramFormatId } from "@/lib/constants/filters";

export interface FormatNormalization {
  formatDisplay: string;
  /** Which PRD filter chips this program matches */
  formatTags: ProgramFormatId[];
}

export function normalizeFormat(raw: string): FormatNormalization {
  const formatDisplay = raw.trim() || "Varies";
  const lower = formatDisplay.toLowerCase();

  const hasOnline = /\bonline\b/.test(lower);
  const hasResidential =
    /\bresidential\b/.test(lower) ||
    /\bexpedition\b/.test(lower) ||
    /\bovernight\b/.test(lower) ||
    /\bhomestay\b/.test(lower);
  const hasCommuter = /\bcommuter\b/.test(lower);
  const hasDay = /\bday\b/.test(lower) && !hasCommuter;

  const formatTags = new Set<ProgramFormatId>();

  if (hasOnline) formatTags.add("online");
  if (hasResidential || hasCommuter || hasDay || lower === "varies") {
    formatTags.add("residential");
  }

  if (formatTags.size === 0) {
    formatTags.add("residential");
  }

  if (hasOnline && (hasResidential || hasCommuter)) {
    formatTags.add("both");
  }

  return {
    formatDisplay,
    formatTags: [...formatTags],
  };
}

export function formatMatchesFilter(
  formatTags: ProgramFormatId[],
  selected: ProgramFormatId[],
): boolean {
  if (selected.length === 0) return true;
  return selected.some((f) => {
    if (f === "both") return formatTags.includes("both") || formatTags.length > 1;
    return formatTags.includes(f);
  });
}
