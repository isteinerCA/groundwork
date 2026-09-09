/**
 * Custom events (PRD §11). No emails/phones in props.
 * Sends to Plausible and/or Google Analytics when configured.
 * Falls back to a localStorage queue when neither script is loaded.
 */

import { redactPii } from "@/lib/search/redact-pii";
import type { SearchFilters } from "@/lib/types/program";

export type AnalyticsEvent =
  | "search_run"
  | "chat_sent"
  | "program_saved"
  | "programs_bulk_saved"
  | "program_unsaved"
  | "contact_form_submitted"
  | "waitlist_signup"
  | "status_changed"
  | "flag_clicked"
  | "payment_completed";

export type EventProps = Record<string, string | number | boolean>;

/** GA4 event-parameter value cap. */
export const GA_PARAM_MAX = 100;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventProps }) => void;
    gtag?: (...args: unknown[]) => void;
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

export function gaString(value: string, max = GA_PARAM_MAX): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function joinList(values: Array<string | number>, max = GA_PARAM_MAX): string {
  return gaString(values.map(String).join(","), max);
}

export function trackEvent(
  event: AnalyticsEvent,
  props?: EventProps,
  extra?: { ga?: EventProps },
): void {
  if (typeof window === "undefined") return;

  if (typeof window.plausible === "function") {
    window.plausible(event, props ? { props } : undefined);
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", event, extra?.ga ? { ...props, ...extra.ga } : props);
  }
  if (
    typeof window.plausible !== "function" &&
    typeof window.gtag !== "function" &&
    process.env.NODE_ENV === "development"
  ) {
    console.debug("[analytics]", event, props, extra?.ga);
  }

  persistFallback(event, extra?.ga ? { ...props, ...extra.ga } : props);
}

export function summarizeSearchFilters(filters: SearchFilters): EventProps {
  const durationWeeks =
    filters.minDurationWeeks == null && filters.maxDurationWeeks == null
      ? ""
      : `${filters.minDurationWeeks ?? ""}-${filters.maxDurationWeeks ?? ""}`;
  const priceBounds =
    filters.minPrice == null && filters.maxPrice == null
      ? ""
      : `${filters.minPrice ?? ""}-${filters.maxPrice ?? ""}`;

  const props: EventProps = {
    grade_count: filters.gradesCompleted.length,
    category_count: filters.categories.length,
    grades: joinList(filters.gradesCompleted),
    categories: joinList(filters.categories),
    admission: joinList(filters.admissionTypes),
    formats: joinList(filters.formats),
    duration: joinList(filters.durationBuckets),
    duration_weeks: gaString(durationWeeks),
    months: joinList(filters.includeMonths),
    locations: joinList(filters.includeLocations),
    regions: joinList(filters.includeRegions),
    exclude_loc: gaString(filters.excludeLocation),
    price_filter: filters.priceFilter,
    price_bounds: gaString(priceBounds),
    fully_funded: filters.fullyFundedOnly,
    college_credit: filters.collegeCreditOnly,
    us_only: filters.usOnly,
    hide_unknown_price: filters.excludeUnknownPrice,
    has_data_query: filters.dataQuery.trim().length > 0,
  };

  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== ""),
  ) as EventProps;
}

export function chatQueryPreview(rawText: string): string {
  return gaString(redactPii(rawText));
}
