import type { Program } from "@/lib/types/program";

type PriceProgram = Pick<Program, "priceDisplay" | "priceUnknown" | "formatTags" | "fullyFunded">;

/** True when CSV price is a spreadsheet cross-reference, not real pricing. */
export function isPriceCrossReference(priceDisplay: string): boolean {
  const lower = priceDisplay.trim().toLowerCase();
  return /see\s+.+\s+above/.test(lower) || /pricing above/.test(lower);
}

/** User-facing cost label; rewrites CSV placeholders that don't make sense on cards. */
export function formatPriceDisplay(program: PriceProgram): string {
  const raw = program.priceDisplay.trim();
  if (!raw) return "See program site for pricing";

  if (isPriceCrossReference(raw)) {
    const hasResidential = program.formatTags.includes("residential");
    const hasCommuter = program.formatTags.includes("commuter");
    const hasOnline = program.formatTags.includes("online");
    const formatCount = [hasResidential, hasCommuter, hasOnline].filter(Boolean).length;
    if (formatCount > 1) {
      return "Varies by format — see program site";
    }
    return "See program site for pricing";
  }

  if (program.priceUnknown && /contact program/.test(raw.toLowerCase())) {
    return "Contact program for pricing";
  }

  if (program.priceUnknown && /\bvaries\b/.test(raw.toLowerCase()) && !/\$/.test(raw)) {
    return "Varies — see program site";
  }

  return raw;
}

/** Whether cost should use muted/italic styling on cards. */
export function isPriceDisplayMuted(program: PriceProgram): boolean {
  return (
    program.priceUnknown ||
    isPriceCrossReference(program.priceDisplay) ||
    formatPriceDisplay(program) !== program.priceDisplay.trim()
  );
}
