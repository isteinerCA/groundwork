"use client";

import { getActiveFilterItems } from "@/lib/search-filter-labels";
import { isFilterItemLocked } from "@/lib/search/is-filter-item-locked";
import type { SearchFilters } from "@/lib/types/program";

export function ActiveFilterBar({
  filters,
  onRemove,
  onClearAll,
  lockedFilters,
  embedded = false,
}: {
  filters: SearchFilters;
  onRemove: (patch: Partial<SearchFilters>) => void;
  onClearAll: () => void;
  lockedFilters?: Partial<SearchFilters>;
  embedded?: boolean;
}) {
  const items = getActiveFilterItems(filters);
  if (items.length === 0) return null;

  const removableItems = items.filter(
    (item) => !isFilterItemLocked(item, lockedFilters),
  );
  const hasRemovableFilters = removableItems.length > 0;

  return (
    <div
      className={
        embedded
          ? "border-b border-[var(--color-border)] bg-[var(--color-parchment)]/50 px-4 py-3"
          : "mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-amber-soft)]/40 px-4 py-3"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-[var(--color-navy)] uppercase">
          Active filters
        </span>
        {items.map((item) => {
          const locked = isFilterItemLocked(item, lockedFilters);

          if (locked) {
            return (
              <span
                key={item.key}
                className="inline-flex items-center rounded-full border border-[var(--color-navy-light)]/20 bg-[var(--color-parchment)] px-2.5 py-1 text-xs text-[var(--color-navy)]"
              >
                {item.label}
              </span>
            );
          }

          return (
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
          );
        })}
        {hasRemovableFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto text-xs font-medium text-[var(--color-navy-light)] hover:text-[var(--color-navy)]"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
