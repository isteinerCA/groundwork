"use client";

import { useEffect, useState } from "react";
import { getActiveFilterItems } from "@/lib/search-filter-labels";
import type { SearchFilters } from "@/lib/types/program";

export function ActiveFilterBar({
  filters,
  onRemove,
  onClearAll,
  assistantHint,
  onScrollToAssistant,
  showAssistantTip = false,
  assistantRefreshKey,
}: {
  filters: SearchFilters;
  onRemove: (patch: Partial<SearchFilters>) => void;
  onClearAll: () => void;
  assistantHint?: string;
  onScrollToAssistant?: () => void;
  showAssistantTip?: boolean;
  assistantRefreshKey?: string;
}) {
  const items = getActiveFilterItems(filters);
  const [assistantPulse, setAssistantPulse] = useState(false);

  useEffect(() => {
    if (!showAssistantTip || !assistantRefreshKey) return;
    setAssistantPulse(true);
    const timer = window.setTimeout(() => setAssistantPulse(false), 2600);
    return () => window.clearTimeout(timer);
  }, [assistantRefreshKey, showAssistantTip]);

  if (items.length === 0 && !showAssistantTip) return null;

  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-amber-soft)]/40 px-4 py-3">
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-[var(--color-navy)] uppercase">
            Active filters
          </span>
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onRemove(item.remove)}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--color-navy-light)]/30 bg-white px-2.5 py-1 text-xs text-[var(--color-navy)] hover:border-[var(--color-navy)]"
            >
              {item.label}
              <span aria-hidden className="text-[var(--color-text-muted)]">
                ×
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto text-xs font-medium text-[var(--color-navy-light)] hover:text-[var(--color-navy)]"
          >
            Clear all
          </button>
        </div>
      )}

      {showAssistantTip && assistantHint && onScrollToAssistant && (
        <div
          className={`${
            items.length > 0
              ? "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--color-border)]/80 pt-2"
              : "flex flex-wrap items-center gap-x-3 gap-y-1"
          } ${assistantPulse ? "assistant-hint-pulse rounded-[var(--radius-sm)] px-2 py-1.5" : ""}`}
        >
          <span className="text-sm text-[var(--color-text)]">{assistantHint}</span>
          <button
            type="button"
            onClick={onScrollToAssistant}
            className="text-sm font-semibold text-[var(--color-navy-light)] hover:text-[var(--color-navy)]"
          >
            Refine with search assistant →
          </button>
        </div>
      )}
    </div>
  );
}
