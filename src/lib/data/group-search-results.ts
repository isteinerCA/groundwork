import { formatGradeEligibilityDisplay } from "@/lib/data/format-grade-display";
import { formatPriceDisplay } from "@/lib/data/format-price-display";
import {
  formatDatesDisplay,
  isPendingDatesDisplay,
} from "@/lib/data/format-season-display";
import type { Program } from "@/lib/types/program";

export type SearchResultItem =
  | { kind: "single"; program: Program }
  | {
      kind: "group";
      groupId: string;
      programs: Program[];
      representative: Program;
    };

/** Stable bucket for collapsing search results (programGroupId or lone offering). */
export function searchResultGroupKey(program: Program): string {
  return program.programGroupId?.trim() || `id:${program.id}`;
}

/** Track name within a campus group, e.g. "Core Acting" from "Core Acting - Session 1 2WK (Day)". */
export function trackGroupLabel(trackDetail: string | undefined): string {
  if (!trackDetail?.trim()) return "General";
  const match = trackDetail.match(/^(.+?)\s-\sSession/i);
  return match ? match[1].trim() : trackDetail.trim();
}

/** Session/format suffix within a track group for variant rows. */
export function variantOfferingLabel(
  trackDetail: string | undefined,
  trackLabel: string,
): string {
  if (!trackDetail?.trim()) return "General";
  const prefix = `${trackLabel} - `;
  if (trackDetail.startsWith(prefix)) return trackDetail.slice(prefix.length);
  return trackDetail;
}

/**
 * Collapse sorted filter results into display items.
 * One row in a group → single card; 2+ rows with programGroupId → grouped card.
 */
export function buildSearchResultItems(sortedPrograms: Program[]): SearchResultItem[] {
  const buckets = new Map<string, Program[]>();
  const order: string[] = [];

  for (const program of sortedPrograms) {
    const key = searchResultGroupKey(program);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(program);
  }

  return order.map((key) => {
    const programs = buckets.get(key)!;
    const groupId = programs[0]?.programGroupId?.trim();
    if (programs.length >= 2 && groupId) {
      return {
        kind: "group" as const,
        groupId,
        programs,
        representative: programs[0],
      };
    }
    return { kind: "single" as const, program: programs[0] };
  });
}

export function countSearchResultItems(sortedPrograms: Program[]): number {
  return buildSearchResultItems(sortedPrograms).length;
}

export function groupProgramsByTrack(
  programs: Program[],
): { trackLabel: string; programs: Program[] }[] {
  const map = new Map<string, Program[]>();
  const order: string[] = [];
  for (const program of programs) {
    const label = trackGroupLabel(program.trackDetail);
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(program);
  }
  return order.map((trackLabel) => ({
    trackLabel,
    programs: map.get(trackLabel)!,
  }));
}

export function formatGroupOptionsSummary(programs: Program[]): string {
  const trackCount = new Set(programs.map((p) => trackGroupLabel(p.trackDetail))).size;
  const optionLabel = programs.length === 1 ? "option" : "options";
  const trackLabel = trackCount === 1 ? "track" : "tracks";
  return `${trackCount} ${trackLabel} · ${programs.length} ${optionLabel}`;
}

export function formatGroupPriceRange(programs: Program[]): string {
  const priced = programs.filter((p) => !p.priceUnknown && p.priceMin != null);
  if (priced.length === 0) {
    return formatPriceDisplay(programs[0]);
  }
  const min = Math.min(...priced.map((p) => p.priceMin!));
  const max = Math.max(...priced.map((p) => p.priceMax ?? p.priceMin!));
  if (min === max) return `$${min.toLocaleString("en-US")}`;
  return `$${min.toLocaleString("en-US")}–$${max.toLocaleString("en-US")}`;
}

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatIsoSpan(start: string, end: string): string {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  const monthDay: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startPart = startDate.toLocaleDateString("en-US", monthDay);
  const endPart = endDate.toLocaleDateString("en-US", monthDay);
  const year = endDate.getFullYear();
  return `${startPart}–${endPart}, ${year}`;
}

export function formatGroupDateRange(programs: Program[]): string {
  if (programs.some((p) => isPendingDatesDisplay(p))) {
    return formatDatesDisplay(programs[0]);
  }

  const dated = programs.filter((p) => p.dateStart && p.dateEnd);
  if (dated.length === 0) return formatDatesDisplay(programs[0]);

  const starts = dated.map((p) => p.dateStart!).sort();
  const ends = dated.map((p) => p.dateEnd!).sort();
  const rangeStart = starts[0]!;
  const rangeEnd = ends[ends.length - 1]!;

  if (dated.length === 1) return formatDatesDisplay(dated[0]);

  const singleSpan = dated.every(
    (p) => p.dateStart === rangeStart && p.dateEnd === rangeEnd,
  );
  if (singleSpan) return formatDatesDisplay(dated[0]);

  return formatIsoSpan(rangeStart, rangeEnd);
}

export function uniqueFormatDisplay(programs: Program[]): string {
  const formats = [...new Set(programs.map((p) => p.formatDisplay))];
  if (formats.length === 1) return formats[0];
  return formats.join(" / ");
}

export function gradeRangeSummary(programs: Program[]): string {
  const displays = [...new Set(programs.map((p) => formatGradeEligibilityDisplay(p)))];
  if (displays.length === 1) return displays[0];
  const min = Math.min(...programs.map((p) => p.gradeCompletedMin));
  const max = Math.max(...programs.map((p) => p.gradeCompletedMax));
  return `Completed grades ${min}–${max} (varies by track)`;
}

export function groupWebsiteUrlsVary(programs: Program[]): boolean {
  return new Set(programs.map((p) => p.websiteUrl)).size > 1;
}

export function countSavedInPrograms(
  programs: Program[],
  isSaved: (id: string) => boolean,
): number {
  return programs.filter((p) => isSaved(p.id)).length;
}
