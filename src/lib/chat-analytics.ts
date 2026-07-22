import type { SearchFilters } from "@/lib/types/program";

const STORAGE_KEY = "groundwork_chat_events";
const MAX_EVENTS = 200;

export interface ChatAnalyticsEvent {
  timestamp: string;
  rawText: string;
  parseType: string;
  resultCount: number;
  filterSummary: {
    grades: number[];
    categoryCount: number;
    fullyFundedOnly: boolean;
    priceFilter: string;
  };
}

function summarizeFilters(filters: SearchFilters) {
  return {
    grades: filters.gradesCompleted,
    categoryCount: filters.categories.length,
    fullyFundedOnly: filters.fullyFundedOnly,
    priceFilter: filters.priceFilter,
  };
}

export function logChatEvent(
  rawText: string,
  parseType: string,
  filters: SearchFilters,
  resultCount: number,
): void {
  if (typeof window === "undefined") return;

  const event: ChatAnalyticsEvent = {
    timestamp: new Date().toISOString(),
    rawText: rawText.slice(0, 500),
    parseType,
    resultCount,
    filterSummary: summarizeFilters(filters),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ChatAnalyticsEvent[];
    const next = [...existing, event].slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures in private browsing or quota errors.
  }
}
