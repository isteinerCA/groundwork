import { PRICE_FILTERS } from "@/lib/constants/filters";
import type { ParsedPrice } from "@/lib/data/parse-price";
import type { PriceFilterId } from "@/lib/constants/filters";

/**
 * Price filter behavior for programs with unknown pricing ("Contact program").
 *
 * Default (excludeUnknownPrice = false):
 *   Unknown-price programs PASS all price filters so users don't miss
 *   important programs (Harvard, BU, etc.) when filtering by budget.
 *   Cards show "Contact program" / "Price not listed" prominently.
 *
 * Strict mode (excludeUnknownPrice = true):
 *   Unknown-price programs are excluded whenever a specific price filter
 *   is active (not "any").
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
  if (priceFilter === "any") {
    return true;
  }

  if (price.priceUnknown) {
    return !excludeUnknownPrice;
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
