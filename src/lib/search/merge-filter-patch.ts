import {
  parseMultiStateLocations,
  resolveLocationQuery,
} from "@/lib/data/matches-location";
import { resolveRegionQuery } from "@/lib/data/us-regions";
import type { SearchFilters } from "@/lib/types/program";

function resolvedLocationKey(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return resolveLocationQuery(trimmed) ?? trimmed.toLowerCase();
}

export function mergeFilterPatch(
  current: SearchFilters,
  patch: Partial<SearchFilters>,
): SearchFilters {
  const next: SearchFilters = { ...current, ...patch };

  const includeKey = resolvedLocationKey(next.dataQuery);
  const excludeKey = resolvedLocationKey(next.excludeLocation);

  if (includeKey && excludeKey && includeKey === excludeKey) {
    if (patch.excludeLocation !== undefined) {
      next.dataQuery = "";
    } else if (patch.dataQuery !== undefined) {
      next.excludeLocation = "";
    }
  }

  if (patch.includeRegions !== undefined && patch.includeRegions.length > 0) {
    const queryRegion = resolveRegionQuery(next.dataQuery);
    const queryState = resolvedLocationKey(next.dataQuery);
    if (queryRegion || queryState) {
      next.dataQuery = "";
    }
    next.includeLocations = [];
  }

  if (patch.includeLocations !== undefined && patch.includeLocations.length > 0) {
    const queryRegion = resolveRegionQuery(next.dataQuery);
    const queryState = resolvedLocationKey(next.dataQuery);
    if (queryRegion || queryState) {
      next.dataQuery = "";
    }
    next.includeRegions = [];
  }

  return next;
}
