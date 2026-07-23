import type { SearchFilters } from "@/lib/types/program";

const STORAGE_KEY = "groundwork_last_search_v1";

export function saveLastSearchFilters(filters: SearchFilters): void {
  if (typeof window === "undefined") return;
  if (filters.gradesCompleted.length === 0) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // ignore quota errors
  }
}

export function loadLastSearchFilters(): SearchFilters | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SearchFilters;
  } catch {
    return null;
  }
}
