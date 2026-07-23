/**
 * Plausible custom events (PRD §11). No PII in props.
 * Falls back to localStorage queue when Plausible is not configured.
 */

export type AnalyticsEvent =
  | "search_run"
  | "chat_sent"
  | "program_saved"
  | "programs_bulk_saved"
  | "program_unsaved"
  | "contact_form_submitted"
  | "status_changed"
  | "flag_clicked"
  | "payment_completed";

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventProps }) => void;
  }
}

const FALLBACK_KEY = "groundwork_analytics_events";
const MAX_FALLBACK = 100;

function persistFallback(event: AnalyticsEvent, props?: EventProps): void {
  try {
    const existing = JSON.parse(localStorage.getItem(FALLBACK_KEY) ?? "[]") as unknown[];
    const entry = { event, props, at: new Date().toISOString() };
    localStorage.setItem(
      FALLBACK_KEY,
      JSON.stringify([...existing, entry].slice(-MAX_FALLBACK)),
    );
  } catch {
    // Ignore storage errors.
  }
}

export function trackEvent(event: AnalyticsEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;

  if (typeof window.plausible === "function") {
    window.plausible(event, props ? { props } : undefined);
  } else if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, props);
  }

  persistFallback(event, props);
}

export function summarizeSearchFilters(filters: {
  gradesCompleted: number[];
  categories: unknown[];
  fullyFundedOnly: boolean;
  priceFilter: string;
}): EventProps {
  return {
    grade_count: filters.gradesCompleted.length,
    category_count: filters.categories.length,
    fully_funded: filters.fullyFundedOnly,
    price_filter: filters.priceFilter,
  };
}
