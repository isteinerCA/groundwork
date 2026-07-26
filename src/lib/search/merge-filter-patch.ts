import { resolveLocationQuery } from "@/lib/data/matches-location";
import { resolveRegionQuery } from "@/lib/data/us-regions";
import type { SearchFilters } from "@/lib/types/program";

function resolvedLocationKey(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return resolveLocationQuery(trimmed) ?? trimmed.toLowerCase();
}

/** Active single/multi-state location includes from current filters (not regions). */
export function getActiveLocationIncludes(filters: SearchFilters): string[] {
  const locations = [...filters.includeLocations];
  const fromQuery = resolvedLocationKey(filters.dataQuery);
  if (fromQuery && !locations.includes(fromQuery)) {
    locations.push(fromQuery);
  }
  return locations;
}

function getIncomingLocationIncludes(patch: Partial<SearchFilters>): string[] {
  const incoming: string[] = [];
  if (patch.includeLocations !== undefined) {
    incoming.push(...patch.includeLocations);
  }
  if (patch.dataQuery !== undefined) {
    const state = resolvedLocationKey(patch.dataQuery);
    if (state) incoming.push(state);
  }
  return [...new Set(incoming)];
}

/** OR-logic array fields that can be expanded (union) rather than replaced. */
const EXPANDABLE_ARRAY_KEYS = [
  "gradesCompleted",
  "categories",
  "admissionTypes",
  "formats",
  "durationBuckets",
  "includeRegions",
] as const satisfies readonly (keyof SearchFilters)[];

/** Detect when the user wants to add criteria rather than replace them. */
export function isExpandIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const expand = /\b(expand|also|add|include|broaden|widen|plus|as well|in addition)\b/.test(
    lower,
  );
  const replace = /\b(only|instead|switch to|change to|narrow to|just|replace with|move to)\b/.test(
    lower,
  );
  if (expand && !replace) return true;
  if (replace && !expand) return false;
  return expand;
}

/** @deprecated Use isExpandIntent */
export const isLocationExpandIntent = isExpandIntent;

export interface MergeFilterPatchOptions {
  /** When true, union OR-array filters (categories, formats, locations, etc.) instead of replacing. */
  expandFilters?: boolean;
  /** @deprecated Use expandFilters */
  unionLocations?: boolean;
}

function unionExpandableArrays(
  current: SearchFilters,
  patch: Partial<SearchFilters>,
  next: SearchFilters,
): void {
  for (const key of EXPANDABLE_ARRAY_KEYS) {
    const patchVal = patch[key];
    if (patchVal === undefined || !Array.isArray(patchVal) || patchVal.length === 0) {
      continue;
    }
    const currentVal = current[key];
    if (!Array.isArray(currentVal) || currentVal.length === 0) {
      continue;
    }
    next[key] = [...new Set([...currentVal, ...patchVal])] as SearchFilters[typeof key];
  }
}

function unionExpandableLocations(
  current: SearchFilters,
  patch: Partial<SearchFilters>,
  next: SearchFilters,
): void {
  const existing = getActiveLocationIncludes(current);
  const incoming = getIncomingLocationIncludes(patch);
  if (existing.length > 0 && incoming.length > 0) {
    next.includeLocations = [...new Set([...existing, ...incoming])];
    next.dataQuery = "";
    next.includeRegions = [];
  }
}

export function mergeFilterPatch(
  current: SearchFilters,
  patch: Partial<SearchFilters>,
  options?: MergeFilterPatchOptions,
): SearchFilters {
  const expandFilters = options?.expandFilters ?? options?.unionLocations ?? false;
  const next: SearchFilters = { ...current, ...patch };

  if (expandFilters) {
    unionExpandableArrays(current, patch, next);
    unionExpandableLocations(current, patch, next);
  }

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
    if (!expandFilters) {
      next.includeLocations = [];
    }
  }

  if (patch.includeLocations !== undefined && patch.includeLocations.length > 0) {
    const queryRegion = resolveRegionQuery(next.dataQuery);
    const queryState = resolvedLocationKey(next.dataQuery);
    if (queryRegion || queryState) {
      next.dataQuery = "";
    }
    if (!expandFilters) {
      next.includeRegions = [];
    }
  }

  return next;
}
