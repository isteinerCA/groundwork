"use client";

import { getActiveFilterItems } from "@/lib/search-filter-labels";
import type { SearchFilters } from "@/lib/types/program";

export function ActiveFilterBar({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: SearchFilters;
  onRemove: (patch: Partial<SearchFilters>) => void;
  onClearAll: () => void;
}) {
  const items = getActiveFilterItems(filters);
  if (items.length === 0) return null;

  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-amber-soft)]/40 px-4 py-3">
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
    </div>
  );
}
