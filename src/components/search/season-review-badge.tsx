import {
  SEASON_PENDING_BADGE,
  SEASON_VERIFIED_BADGE,
} from "@/lib/constants/season-review";
import { isPendingSeasonRefresh, isVerifiedForTargetSeason } from "@/lib/data/normalize-season-review";
import type { Program } from "@/lib/types/program";

export function SeasonReviewBadge({
  program,
}: {
  program: Pick<Program, "reviewStatus" | "seasonYear">;
}) {
  if (isVerifiedForTargetSeason(program)) {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
        {SEASON_VERIFIED_BADGE}
      </span>
    );
  }

  if (isPendingSeasonRefresh(program)) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900">
        {SEASON_PENDING_BADGE}
      </span>
    );
  }

  return null;
}
