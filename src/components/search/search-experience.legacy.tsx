/**
 * LEGACY SEARCH LAYOUT (pre PRD v1.2, 2026-07-23)
 * Filters + results in the left column; assistant in a 320px right sidebar.
 * To revert: replace search-experience.tsx with this file’s contents.
 */
"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ActiveFilterBar } from "@/components/search/active-filter-bar";
import { SearchChat } from "@/components/search/search-chat";
import { Chip } from "@/components/ui/chip";
import { ProgramCard } from "@/components/search/program-card";
import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES, type ProgramCategoryId } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  GRADE_CHIPS,
  PRICE_FILTERS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
import { filterPrograms, sortPrograms, type SortOption } from "@/lib/data/filter-programs";
import { summarizeSearchFilters, trackEvent } from "@/lib/analytics";
import type { Program, SearchFilters } from "@/lib/types/program";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/types/program";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function mergeFilters(current: SearchFilters, patch: Partial<SearchFilters>): SearchFilters {
  return { ...current, ...patch };
}

export function SearchExperience({
  programs,
  dataVerifiedAt,
  initialCategory,
  initialFullyFunded,
  initialFormat,
}: {
  programs: Program[];
  dataVerifiedAt: string | null;
  initialCategory?: ProgramCategoryId;
  initialFullyFunded?: boolean;
  initialFormat?: import("@/lib/constants/filters").ProgramFormatId;
}) {
  const validCategory =
    initialCategory &&
    PROGRAM_CATEGORIES.some((c) => c.id === initialCategory)
      ? initialCategory
      : undefined;

  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_SEARCH_FILTERS,
    categories: validCategory ? [validCategory] : [],
    fullyFundedOnly: initialFullyFunded ?? false,
    formats: initialFormat ? [initialFormat] : [],
  });
  const [sort, setSort] = useState<SortOption>("selectivity");
  const [gradeError, setGradeError] = useState(false);

  const results = useMemo(() => {
    if (filters.gradesCompleted.length === 0) return [];
    return sortPrograms(filterPrograms(programs, filters), sort);
  }, [programs, filters, sort]);

  const runSearch = () => {
    if (filters.gradesCompleted.length === 0) {
      setGradeError(true);
      return;
    }
    setGradeError(false);
    trackEvent("search_run", {
      ...summarizeSearchFilters(filters),
      result_count: results.length,
    });
  };

  const applyFilters = (next: SearchFilters) => {
    setFilters(next);
    if (next.gradesCompleted.length > 0) setGradeError(false);
  };

  const update = (patch: Partial<SearchFilters>) => {
    applyFilters(mergeFilters(filters, patch));
  };

  const clearAll = () => {
    applyFilters(DEFAULT_SEARCH_FILTERS);
    setGradeError(false);
  };

  const hasActiveFilters =
    filters.gradesCompleted.length > 0 ||
    filters.categories.length > 0 ||
    filters.admissionTypes.length > 0 ||
    filters.formats.length > 0 ||
    filters.durationBuckets.length > 0 ||
    filters.collegeCreditOnly ||
    filters.fullyFundedOnly ||
    filters.priceFilter !== "any" ||
    filters.usOnly ||
    filters.excludeUnknownPrice;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-[var(--color-text-muted)] no-underline">
            ← Groundwork
          </Link>
          <h1 className="mt-2 text-3xl">Search programs</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            {programs.length} programs · Last verified {dataVerifiedAt ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg text-[var(--color-navy)]">
              What grade did your child just complete? <span className="text-red-600">*</span>
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {GRADE_CHIPS.map((grade) => (
                <Chip
                  key={grade}
                  label={`${grade}th`}
                  selected={filters.gradesCompleted.includes(grade)}
                  onClick={() =>
                    update({ gradesCompleted: toggle(filters.gradesCompleted, grade) })
                  }
                />
              ))}
            </div>
            {gradeError && (
              <p className="mt-2 text-sm text-red-600">Select at least one grade to search.</p>
            )}

            <div className="mt-6 space-y-5">
              <FilterGroup title="Category">
                {PROGRAM_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.label}
                    selected={filters.categories.includes(cat.id)}
                    onClick={() =>
                      update({ categories: toggle(filters.categories, cat.id) })
                    }
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Admission type">
                {ADMISSION_TYPES.map((a) => (
                  <Chip
                    key={a.id}
                    label={a.label}
                    selected={filters.admissionTypes.includes(a.id)}
                    variant={a.chipColor as "green" | "amber" | "red"}
                    onClick={() =>
                      update({ admissionTypes: toggle(filters.admissionTypes, a.id) })
                    }
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Format">
                {PROGRAM_FORMATS.map((f) => (
                  <Chip
                    key={f.id}
                    label={f.label}
                    selected={filters.formats.includes(f.id)}
                    onClick={() => update({ formats: toggle(filters.formats, f.id) })}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Duration">
                {DURATION_BUCKETS.map((d) => (
                  <Chip
                    key={d.id}
                    label={d.label}
                    selected={filters.durationBuckets.includes(d.id)}
                    onClick={() =>
                      update({ durationBuckets: toggle(filters.durationBuckets, d.id) })
                    }
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Max price">
                {PRICE_FILTERS.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.label}
                    selected={filters.priceFilter === p.id}
                    onClick={() => update({ priceFilter: p.id })}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="More">
                <Chip
                  label="College credit only"
                  selected={filters.collegeCreditOnly}
                  onClick={() => update({ collegeCreditOnly: !filters.collegeCreditOnly })}
                />
                <Chip
                  label="Fully funded only"
                  selected={filters.fullyFundedOnly}
                  onClick={() => update({ fullyFundedOnly: !filters.fullyFundedOnly })}
                />
                <Chip
                  label="US only"
                  selected={filters.usOnly}
                  onClick={() => update({ usOnly: !filters.usOnly })}
                />
                <Chip
                  label="Hide unlisted prices"
                  selected={filters.excludeUnknownPrice}
                  onClick={() =>
                    update({ excludeUnknownPrice: !filters.excludeUnknownPrice })
                  }
                />
              </FilterGroup>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runSearch}
                className="rounded-[var(--radius-md)] bg-[var(--color-navy)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-navy-light)]"
              >
                Search
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text-muted)]"
                >
                  Clear all
                </button>
              )}
            </div>
          </section>

          <ActiveFilterBar filters={filters} onRemove={update} onClearAll={clearAll} />

          {hasActiveFilters && filters.gradesCompleted.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-[var(--color-navy)]">
                {results.length} result{results.length === 1 ? "" : "s"}
              </span>
              <label className="ml-auto flex items-center gap-2 text-[var(--color-text-muted)]">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded border border-[var(--color-border)] bg-white px-2 py-1 text-sm"
                >
                  <option value="selectivity">Selectivity</option>
                  <option value="price">Price</option>
                  <option value="duration">Duration</option>
                  <option value="name">Name</option>
                </select>
              </label>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {filters.gradesCompleted.length === 0 && (
              <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-8 text-center text-[var(--color-text-muted)]">
                Select a grade above to see matching programs — or ask the assistant on the
                right.
              </p>
            )}

            {filters.gradesCompleted.length > 0 && results.length === 0 && (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-8 text-center">
                <p className="text-lg text-[var(--color-navy)]">No programs match these filters.</p>
                <p className="mt-2 text-[var(--color-text-muted)]">
                  Try removing a category, broadening your price range, or ask the assistant
                  to relax filters.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 text-sm font-medium text-[var(--color-navy-light)]"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {results.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>

        <SearchChat
          programs={programs}
          filters={filters}
          resultCount={results.length}
          onApplyFilters={applyFilters}
        />
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
