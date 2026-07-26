import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  PRICE_FILTERS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
import { filterPrograms } from "@/lib/data/filter-programs";
import { getRegionLabel } from "@/lib/data/us-regions";
import type { LlmParseResponse } from "@/lib/search/llm-parse-schema";
import { formatDataQueryLabel } from "@/lib/search/format-data-query-label";
import type { Program, SearchFilters } from "@/lib/types/program";

function resultCountSentence(count: number): string {
  if (count === 0) {
    return "No programs match — try broadening your filters.";
  }
  return `${count} program${count === 1 ? "" : "s"} match your filters.`;
}

/** Describe only filters present in the patch — never infer chips that were not applied. */
function describeFilterPatch(patch: Partial<SearchFilters>): string {
  const parts: string[] = [];

  if (patch.dataQuery !== undefined) {
    if (patch.dataQuery.trim()) {
      parts.push(`matching "${formatDataQueryLabel(patch.dataQuery)}"`);
    } else {
      parts.push("with text search cleared");
    }
  }

  if (patch.excludeLocation !== undefined) {
    if (patch.excludeLocation.trim()) {
      parts.push(`excluding ${formatDataQueryLabel(patch.excludeLocation)}`);
    } else {
      parts.push("with location exclusion cleared");
    }
  }

  if (patch.includeRegions?.length) {
    const labels = patch.includeRegions.map((id) => getRegionLabel(id));
    parts.push(`in ${labels.join(" or ")}`);
  }

  if (patch.includeLocations?.length) {
    const labels = patch.includeLocations.map((loc) => formatDataQueryLabel(loc));
    parts.push(`in ${labels.join(" or ")}`);
  }

  if (patch.categories?.length) {
    const labels = patch.categories.map(
      (id) => PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id,
    );
    parts.push(`in ${labels.join(" or ")}`);
  }

  if (patch.admissionTypes?.length) {
    const labels = patch.admissionTypes.map(
      (id) => ADMISSION_TYPES.find((a) => a.id === id)?.label ?? id,
    );
    parts.push(`admission: ${labels.join(" or ")}`);
  }

  if (patch.formats?.length) {
    const labels = patch.formats.map(
      (id) => PROGRAM_FORMATS.find((f) => f.id === id)?.label ?? id,
    );
    parts.push(`format: ${labels.join(" or ")}`);
  }

  if (patch.durationBuckets?.length) {
    const labels = patch.durationBuckets.map(
      (id) => DURATION_BUCKETS.find((d) => d.id === id)?.label ?? id,
    );
    parts.push(`duration: ${labels.join(" or ")}`);
  }

  if (patch.minDurationWeeks != null || patch.maxDurationWeeks != null) {
    const min = patch.minDurationWeeks;
    const max = patch.maxDurationWeeks;
    if (min != null && max != null && min === max) {
      parts.push(`${min} week${min === 1 ? "" : "s"}`);
    } else if (min != null && max != null) {
      parts.push(`${min}–${max} weeks`);
    } else if (max != null) {
      parts.push(`up to ${max} weeks`);
    } else if (min != null) {
      parts.push(`at least ${min} weeks`);
    }
  }

  if (patch.fullyFundedOnly) {
    parts.push("fully funded only");
  }

  if (patch.collegeCreditOnly) {
    parts.push("college credit only");
  }

  if (patch.usOnly) {
    parts.push("US programs only");
  }

  if (patch.excludeUnknownPrice) {
    parts.push("hiding unlisted prices");
  }

  if (patch.priceFilter && patch.priceFilter !== "any") {
    const label = PRICE_FILTERS.find((p) => p.id === patch.priceFilter)?.label;
    if (label) parts.push(label);
  }

  if (patch.maxPrice != null) {
    parts.push(`under $${patch.maxPrice.toLocaleString()}`);
  }

  if (patch.minPrice != null) {
    parts.push(`over $${patch.minPrice.toLocaleString()}`);
  }

  if (patch.gradesCompleted?.length) {
    const grades = patch.gradesCompleted.map((g) => `${g}th grade`).join(", ");
    parts.push(`grade: ${grades}`);
  }

  if (parts.length === 0) {
    return "Updated your filters.";
  }

  return `Showing programs ${parts.join(", ")}.`;
}

/** Build chat text from applied filters and an accurate post-filter result count. */
export function formatAssistantMessage(
  result: LlmParseResponse,
  nextFilters: SearchFilters,
  programs: Program[],
): string {
  const limitation = result.unexpressible.trim();

  if (result.clearAll) {
    const countSentence =
      nextFilters.gradesCompleted.length > 0
        ? ` ${resultCountSentence(filterPrograms(programs, nextFilters).length)}`
        : "";
    return `Cleared all filters.${countSentence}${limitation ? ` ${limitation}` : ""}`.trim();
  }

  const hadPatch = Object.keys(result.filterPatch).length > 0;

  if (!hadPatch) {
    const text = result.assistantMessage.trim();
    return [text, limitation].filter(Boolean).join(" ");
  }

  if (nextFilters.gradesCompleted.length === 0) {
    return (
      describeFilterPatch(result.filterPatch) +
      (limitation ? ` ${limitation}` : "")
    ).trim();
  }

  const nextCount = filterPrograms(programs, nextFilters).length;
  const described = describeFilterPatch(result.filterPatch);
  const countSentence = resultCountSentence(nextCount);

  return [described, limitation, countSentence].filter(Boolean).join(" ");
}
