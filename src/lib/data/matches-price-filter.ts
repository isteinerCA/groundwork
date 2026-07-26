import { PRICE_FILTERS } from "@/lib/constants/filters";
import type { ParsedPrice } from "@/lib/data/parse-price";
import type { PriceFilterId } from "@/lib/constants/filters";

/**
 * Price filter behavior for programs with unknown pricing ("Contact program").
 *
 * excludeUnknownPrice = true:
 *   Unknown-price programs are always excluded.
 *
 * excludeUnknownPrice = false (default):
 *   Unknown-price programs pass bucket/numeric filters so users don't miss
 *   important programs (Harvard, BU, etc.) when filtering by budget.
 *
 * Overlap rule when price is known:
 *   Program passes if [priceMin, priceMax] overlaps the filter range.
 *   Fully funded ($0) passes "under_2k" and fullyFundedOnly.
 */
export function matchesPriceFilter(
  price: Pick<ParsedPrice, "priceMin" | "priceMax" | "priceUnknown" | "fullyFunded">,
  priceFilter: PriceFilterId,
  excludeUnknownPrice: boolean,
): boolean {
  if (price.priceUnknown) {
    return !excludeUnknownPrice;
  }

  if (priceFilter === "any") {
    return true;
  }

  const spec = PRICE_FILTERS.find((p) => p.id === priceFilter);
  if (!spec) return true;

  const min = price.priceMin ?? price.priceMax ?? 0;
  const max = price.priceMax ?? price.priceMin ?? min;

  if (price.fullyFunded && priceFilter === "under_2k") {
    return true;
  }

  const filterMin = "min" in spec ? spec.min : 0;
  const filterMax = "max" in spec ? spec.max : Number.POSITIVE_INFINITY;

  // Range overlap: [min, max] intersects [filterMin, filterMax]
  return min <= filterMax && max >= filterMin;
}

/** Numeric price cap/floor using parsed priceMin/priceMax from the program table. */
export function matchesNumericPriceFilter(
  price: Pick<ParsedPrice, "priceMin" | "priceMax" | "priceUnknown" | "fullyFunded">,
  minPrice: number | null,
  maxPrice: number | null,
  excludeUnknownPrice: boolean,
): boolean {
  if (price.priceUnknown) {
    return !excludeUnknownPrice;
  }

  if (minPrice == null && maxPrice == null) return true;

  if (price.fullyFunded && (maxPrice == null || maxPrice >= 0)) {
    return minPrice == null || minPrice <= 0;
  }

  const programMin = price.priceMin ?? price.priceMax ?? 0;
  const programMax = price.priceMax ?? price.priceMin ?? programMin;

  const filterMin = minPrice ?? 0;
  const filterMax = maxPrice ?? Number.POSITIVE_INFINITY;

  return programMin <= filterMax && programMax >= filterMin;
}
