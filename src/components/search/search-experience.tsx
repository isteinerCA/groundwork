"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ActiveFilterBar } from "@/components/search/active-filter-bar";
import { SearchChat } from "@/components/search/search-chat";
import { SearchShortlistCta } from "@/components/search/search-shortlist-cta";
import { Chip } from "@/components/ui/chip";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ProgramCard } from "@/components/search/program-card";
import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES, type ProgramCategoryId } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  GRADE_CHIPS,
  PRICE_FILTER_OPTIONS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
import { filterPrograms, sortPrograms, type SortOption } from "@/lib/data/filter-programs";
import { btnPrimary } from "@/components/ui/button-styles";
import { summarizeSearchFilters, trackEvent } from "@/lib/analytics";
import { getChatOpeningPrompt } from "@/lib/chat-parser";
import { loadLastSearchFilters, saveLastSearchFilters } from "@/lib/search/last-filters";
import type { Program, SearchFilters } from "@/lib/types/program";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/types/program";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function mergeFilters(current: SearchFilters, patch: Partial<SearchFilters>): SearchFilters {
  return { ...current, ...patch };
}

function hasUrlSeed(
  initialCategory?: ProgramCategoryId,
  initialFullyFunded?: boolean,
  initialFormat?: import("@/lib/constants/filters").ProgramFormatId,
): boolean {
  return Boolean(initialCategory || initialFullyFunded || initialFormat);
}

function focusSearchAssistant() {
  document.getElementById("search-assistant")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  window.setTimeout(() => {
    document.getElementById("search-chat-input")?.focus();
  }, 300);
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

  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...DEFAULT_SEARCH_FILTERS,
    categories: validCategory ? [validCategory] : [],
    fullyFundedOnly: initialFullyFunded ?? false,
    formats: initialFormat ? [initialFormat] : [],
  }));
  const [sort, setSort] = useState<SortOption>("selectivity");
  const [gradeError, setGradeError] = useState(false);
  const [restoredLastSearch, setRestoredLastSearch] = useState(false);

  useEffect(() => {
    if (restoredLastSearch) return;
    if (hasUrlSeed(validCategory, initialFullyFunded, initialFormat)) {
      setRestoredLastSearch(true);
      return;
    }
    const last = loadLastSearchFilters();
    if (last) setFilters(last);
    setRestoredLastSearch(true);
  }, [restoredLastSearch, validCategory, initialFullyFunded, initialFormat]);

  const results = useMemo(() => {
    if (filters.gradesCompleted.length === 0) return [];
    return sortPrograms(filterPrograms(programs, filters), sort);
  }, [programs, filters, sort]);

  const assistantHint = useMemo(
    () => getChatOpeningPrompt({ filters, resultCount: results.length }),
    [filters, results.length],
  );

  const assistantRefreshKey = useMemo(
    () =>
      JSON.stringify({
        grades: filters.gradesCompleted,
        categories: filters.categories,
        admissionTypes: filters.admissionTypes,
        formats: filters.formats,
        durationBuckets: filters.durationBuckets,
        priceFilter: filters.priceFilter,
        collegeCreditOnly: filters.collegeCreditOnly,
        fullyFundedOnly: filters.fullyFundedOnly,
        usOnly: filters.usOnly,
        excludeUnknownPrice: filters.excludeUnknownPrice,
        resultCount: results.length,
      }),
    [filters, results.length],
  );

  const runSearch = () => {
    if (filters.gradesCompleted.length === 0) {
      setGradeError(true);
      return;
    }
    setGradeError(false);
    saveLastSearchFilters(filters);
    trackEvent("search_run", {
      ...summarizeSearchFilters(filters),
      result_count: results.length,
    });
  };

  const applyFilters = (next: SearchFilters) => {
    setFilters(next);
    if (next.gradesCompleted.length > 0) {
      setGradeError(false);
      saveLastSearchFilters(next);
    }
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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

      {/* Filters left; results + search assistant right (assistant sits below active filters). */}
      <div className="grid gap-6 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg text-[var(--color-navy)]">
              What grade did your child just complete? <span className="text-red-600">*</span>
            </h2>
            <div className="mt-3 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {GRADE_CHIPS.map((grade) => (
                <Chip
                  key={grade}
                  compact
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
            {filters.gradesCompleted.length === 0 && (
              <p className="mt-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-parchment)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                Select a grade above to see matching programs.
              </p>
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

              <div>
                <h3 className="mb-2 flex items-center text-sm font-medium text-[var(--color-text-muted)]">
                  Admission type
                  <InfoTooltip label="Admission type definitions">
                    <strong className="text-[var(--color-navy)]">First-Come / Rolling:</strong>{" "}
                    register before the program fills.
                    <br />
                    <strong className="mt-1 inline-block text-[var(--color-navy)]">
                      Application:
                    </strong>{" "}
                    apply formally; qualified students have a good chance.
                    <br />
                    <strong className="mt-1 inline-block text-[var(--color-navy)]">
                      Selective:
                    </strong>{" "}
                    high competition — polish the application and plan backups.
                  </InfoTooltip>
                </h3>
                <div className="flex flex-wrap gap-2">
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
                </div>
              </div>

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

              <FilterGroup title="Max price" singleRow>
                {PRICE_FILTER_OPTIONS.map((p) => (
                  <Chip
                    key={p.id}
                    compact
                    label={p.label}
                    selected={filters.priceFilter === p.id}
                    onClick={() =>
                      update({
                        priceFilter: filters.priceFilter === p.id ? "any" : p.id,
                      })
                    }
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
                className={btnPrimary}
              >
                Search
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-[var(--radius-md)] border-2 border-[var(--color-navy)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] hover:bg-[var(--color-parchment-dark)]"
                >
                  Clear all
                </button>
              )}
            </div>
          </section>
        </aside>

        <div className="min-w-0">
          <ActiveFilterBar
            filters={filters}
            onRemove={update}
            onClearAll={clearAll}
            assistantHint={assistantHint}
            onFocusAssistant={focusSearchAssistant}
            showAssistantTip={filters.gradesCompleted.length > 0}
            assistantRefreshKey={assistantRefreshKey}
          />

          {filters.gradesCompleted.length > 0 && (
            <div className="mt-3">
              <SearchChat
                embedded
                filters={filters}
                resultCount={results.length}
                onApplyFilters={applyFilters}
              />
            </div>
          )}

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

          {filters.gradesCompleted.length > 0 && results.length > 0 && (
            <SearchShortlistCta programs={results} />
          )}

          <div className="mt-6 space-y-4">
            {filters.gradesCompleted.length > 0 && results.length === 0 && (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-8 text-center">
                <p className="text-lg text-[var(--color-navy)]">No programs match these filters.</p>
                <p className="mt-2 text-[var(--color-text-muted)]">
                  Try removing a category, broadening your price range, or ask the assistant to
                  relax filters.
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
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
  singleRow,
}: {
  title: string;
  children: ReactNode;
  singleRow?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">{title}</h3>
      <div
        className={
          singleRow
            ? "flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex flex-wrap gap-2"
        }
      >
        {children}
      </div>
    </div>
  );
}
