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

function shouldRenderAsGroupedCard(programs: Program[]): boolean {
  const groupId = programs[0]?.programGroupId?.trim();
  if (!groupId) return false;
  if (programs.length >= 2) return true;
  // One matching track at a multi-offering campus (e.g. Interlochen "Harp - 6-Week").
  return programs.some((program) => program.trackDetail?.trim());
}

/**
 * Collapse sorted filter results into display items.
 * Multi-offering campuses use a grouped card; standalone rows stay on a single card.
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
    if (shouldRenderAsGroupedCard(programs)) {
      return {
        kind: "group" as const,
        groupId: programs[0]!.programGroupId!.trim(),
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

function formatDurationOptionsSummary(programs: Program[]): string {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const program of [...programs].sort(
    (a, b) => (a.lengthMinDays ?? 0) - (b.lengthMinDays ?? 0),
  )) {
    const label = program.lengthDisplay?.trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  if (labels.length === 0) return "";
  if (labels.length === 1) return `${labels[0]} options`;
  if (labels.length === 2) return `${labels[0]} and ${labels[1]} options`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)} options`;
}

export function formatGroupDateRange(programs: Program[]): string {
  const dated = programs.filter(
    (program) => program.dateStart && program.dateEnd && !isPendingDatesDisplay(program),
  );
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

  const durationSummary = formatDurationOptionsSummary(dated);
  const sessionLabel = dated.length === 1 ? "session" : "sessions";
  const span = formatIsoSpan(rangeStart, rangeEnd);
  return durationSummary
    ? `${dated.length} ${sessionLabel} between ${span} (${durationSummary})`
    : `${dated.length} ${sessionLabel} between ${span}`;
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
  return `Grades ${min}–${max} (varies by track)`;
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
