import {
  DEFAULT_REVIEW_STATUS,
  isPublishedReviewStatus,
  LEGACY_CATALOG_SEASON_YEAR,
  type PublishedReviewStatus,
  TARGET_SEASON_YEAR,
} from "@/lib/constants/season-review";
import type { Program } from "@/lib/types/program";

export function parseReviewStatus(raw?: string): PublishedReviewStatus | "needs_review" {
  const normalized = raw?.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "needs_review") return "needs_review";
  if (normalized && isPublishedReviewStatus(normalized)) return normalized;
  return DEFAULT_REVIEW_STATUS;
}

export function parseSeasonYear(raw?: string): number {
  const parsed = Number.parseInt(raw?.trim() ?? "", 10);
  if (Number.isFinite(parsed) && parsed >= 2000 && parsed <= 2100) return parsed;
  return LEGACY_CATALOG_SEASON_YEAR;
}

export function isVerifiedForTargetSeason(
  program: Pick<Program, "reviewStatus" | "seasonYear">,
  targetSeasonYear = TARGET_SEASON_YEAR,
): boolean {
  return program.reviewStatus === "verified" && program.seasonYear === targetSeasonYear;
}

export function isPendingSeasonRefresh(
  program: Pick<Program, "reviewStatus" | "seasonYear">,
  targetSeasonYear = TARGET_SEASON_YEAR,
): boolean {
  return !isVerifiedForTargetSeason(program, targetSeasonYear);
}

export function matchesSeasonReviewFilter(
  program: Pick<Program, "reviewStatus" | "seasonYear">,
  includePendingSeasonRefresh: boolean,
  targetSeasonYear = TARGET_SEASON_YEAR,
): boolean {
  if (includePendingSeasonRefresh) return true;
  return isVerifiedForTargetSeason(program, targetSeasonYear);
}

export interface SeasonCoverageSummary {
  total: number;
  verified: number;
  pending: number;
  targetSeasonYear: number;
}

export function summarizeSeasonCoverage(
  programs: Pick<Program, "reviewStatus" | "seasonYear">[],
  targetSeasonYear = TARGET_SEASON_YEAR,
): SeasonCoverageSummary {
  let verified = 0;
  for (const program of programs) {
    if (isVerifiedForTargetSeason(program, targetSeasonYear)) verified += 1;
  }
  return {
    total: programs.length,
    verified,
    pending: programs.length - verified,
    targetSeasonYear,
  };
}
