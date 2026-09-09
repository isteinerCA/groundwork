import { summarizeSearchFilters } from "@/lib/analytics";
import { redactPii } from "@/lib/search/redact-pii";
import type { SearchFilters } from "@/lib/types/program";

const STORAGE_KEY = "groundwork_chat_events";
const MAX_EVENTS = 200;

export interface ChatAnalyticsEvent {
  timestamp: string;
  rawText: string;
  clearAll: boolean;
  hadPatch: boolean;
  resultCount: number;
  error?: boolean;
  applied?: string;
  unexpressible?: string;
  filterSummary: ReturnType<typeof summarizeSearchFilters>;
}

export function logChatEvent(event: {
  rawText: string;
  clearAll: boolean;
  hadPatch: boolean;
  filters: SearchFilters;
  resultCount: number;
  applied?: string;
  unexpressible?: string;
  error?: boolean;
}): void {
  if (typeof window === "undefined") return;

  const record: ChatAnalyticsEvent = {
    timestamp: new Date().toISOString(),
    rawText: redactPii(event.rawText).slice(0, 500),
    clearAll: event.clearAll,
    hadPatch: event.hadPatch,
    resultCount: event.resultCount,
    error: event.error,
    applied: event.applied?.slice(0, 200),
    unexpressible: event.unexpressible?.slice(0, 200),
    filterSummary: summarizeSearchFilters(event.filters),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ChatAnalyticsEvent[];
    const next = [...existing, record].slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures in private browsing or quota errors.
  }
}
