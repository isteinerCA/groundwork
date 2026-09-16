/**
 * Round catalog counts for marketing copy — never show raw totals like 157 or 413.
 * Under 200: floor to nearest 10 (168 → "160+").
 * 200 and above: floor to nearest 50 (413 → "400+").
 */
export function roundMarketingCount(count: number): string {
  if (count <= 0) return "0";

  const step = count < 200 ? 10 : 50;
  const rounded = Math.floor(count / step) * step;
  const display = rounded === 0 ? step : rounded;
  return `${display}+`;
}
