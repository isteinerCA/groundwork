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

function unionUnique<T>(current: T[], patch: T[]): T[] {
  return [...new Set([...current, ...patch])];
}

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
  if (patch.gradesCompleted?.length && current.gradesCompleted.length) {
    next.gradesCompleted = unionUnique(current.gradesCompleted, patch.gradesCompleted);
  }
  if (patch.categories?.length && current.categories.length) {
    next.categories = unionUnique(current.categories, patch.categories);
  }
  if (patch.admissionTypes?.length && current.admissionTypes.length) {
    next.admissionTypes = unionUnique(current.admissionTypes, patch.admissionTypes);
  }
  if (patch.formats?.length && current.formats.length) {
    next.formats = unionUnique(current.formats, patch.formats);
  }
  if (patch.durationBuckets?.length && current.durationBuckets.length) {
    next.durationBuckets = unionUnique(current.durationBuckets, patch.durationBuckets);
  }
  if (patch.includeRegions?.length && current.includeRegions.length) {
    next.includeRegions = unionUnique(current.includeRegions, patch.includeRegions);
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
