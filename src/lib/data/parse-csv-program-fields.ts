import { normalizeDuration } from "@/lib/data/normalize-duration";
import { normalizeGrade } from "@/lib/data/normalize-grade";
import {
  formatIsoDateRange,
  parseDatesDisplay,
  parseDatesParseQuality,
  parseIsoDate,
  type DatesParseQuality,
} from "@/lib/data/parse-dates-display";
import { parsePrice, type ParsedPrice } from "@/lib/data/parse-price";
import type { Program } from "@/lib/types/program";

export type CsvRow = Record<string, string | undefined>;

/** First non-empty cell among 2027 and legacy column names. */
export function csvCell(row: CsvRow, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key]?.trim();
    if (value) return value;
  }
  return "";
}

export function parseYesNo(raw: string): boolean {
  return /^yes$/i.test(raw.trim());
}

export function parseCatalogOfferingFromCsv(row: CsvRow): boolean {
  return parseYesNo(csvCell(row, "Catalog Offering"));
}

function parseOptionalInt(raw: string): number | null {
  if (!raw.trim()) return null;
  const parsed = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalNumber(raw: string): number | null {
  if (!raw.trim()) return null;
  const parsed = Number.parseFloat(raw.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseGradesFromCsv(row: CsvRow): Pick<
  Program,
  "gradeDisplay" | "gradeCompletedMin" | "gradeCompletedMax" | "gradeSource" | "stateRestriction"
> {
  const display = csvCell(row, "Grades Display", "Grades");
  const minOverride = parseOptionalInt(csvCell(row, "Grade Completed Min"));
  const maxOverride = parseOptionalInt(csvCell(row, "Grade Completed Max"));

  const parsed = normalizeGrade(display || "Grades 6–12");

  if (
    minOverride != null &&
    maxOverride != null &&
    minOverride >= 1 &&
    maxOverride <= 12 &&
    minOverride <= maxOverride
  ) {
    return {
      ...parsed,
      gradeDisplay: display || `Grades ${minOverride}–${maxOverride}`,
      gradeCompletedMin: minOverride,
      gradeCompletedMax: maxOverride,
    };
  }

  return parsed;
}

export function parseDurationFromCsv(row: CsvRow): ReturnType<typeof normalizeDuration> {
  const lengthDisplay = csvCell(row, "Length Display", "Length");
  const duration = normalizeDuration(lengthDisplay || "Unknown");
  const minOverride = parseOptionalInt(csvCell(row, "Length Min Days"));
  const maxOverride = parseOptionalInt(csvCell(row, "Length Max Days"));

  if (minOverride != null) duration.lengthMinDays = minOverride;
  if (maxOverride != null) duration.lengthMaxDays = maxOverride;

  if (duration.lengthMinDays != null && duration.lengthMaxDays == null) {
    duration.lengthMaxDays = duration.lengthMinDays;
  }
  if (duration.lengthMaxDays != null && duration.lengthMinDays == null) {
    duration.lengthMinDays = duration.lengthMaxDays;
  }

  return duration;
}

export function parsePriceFromCsv(row: CsvRow): ParsedPrice & {
  financialAidAvailable: boolean;
} {
  const priceDisplay = csvCell(row, "Price Display", "Price");
  const parsed = parsePrice(priceDisplay);
  const minOverride = parseOptionalNumber(csvCell(row, "Price Min"));
  const maxOverride = parseOptionalNumber(csvCell(row, "Price Max"));
  const fullyFundedRaw = csvCell(row, "Fully Funded");
  const financialAidRaw = csvCell(row, "Financial Aid Available");

  if (minOverride != null) parsed.priceMin = minOverride;
  if (maxOverride != null) parsed.priceMax = maxOverride;
  if (fullyFundedRaw) parsed.fullyFunded = parseYesNo(fullyFundedRaw);
  if (minOverride != null || maxOverride != null) {
    parsed.priceUnknown = false;
  }

  const financialAidAvailable = financialAidRaw
    ? parseYesNo(financialAidRaw)
    : /aid|scholar|need-based|subsid/i.test(priceDisplay);

  return { ...parsed, financialAidAvailable };
}

export function parseCreditFromCsv(row: CsvRow): Pick<Program, "hasCollegeCredit" | "creditDisplay"> {
  const creditDisplay = csvCell(row, "Credit Display", "Credit");
  const hasCollegeCreditRaw = csvCell(row, "Has College Credit");
  const hasCollegeCredit = hasCollegeCreditRaw
    ? parseYesNo(hasCollegeCreditRaw)
    : /^yes/i.test(creditDisplay);

  return { creditDisplay, hasCollegeCredit };
}

export interface ParsedCsvDates {
  datesDisplay: string;
  dateStart: string | null;
  dateEnd: string | null;
  datesParseQuality: DatesParseQuality;
}

export function parseDatesFromCsv(row: CsvRow, seasonYear: number): ParsedCsvDates {
  const dateStart = parseIsoDate(csvCell(row, "Date Start"));
  const dateEnd = parseIsoDate(csvCell(row, "Date End"));
  const qualityOverride = parseDatesParseQuality(csvCell(row, "Dates Parse Quality"));
  let datesDisplay = csvCell(row, "Dates Display", "Dates 2027", "Dates 2026");

  if (dateStart && dateEnd) {
    if (!datesDisplay) datesDisplay = formatIsoDateRange(dateStart, dateEnd);
    return {
      datesDisplay,
      dateStart,
      dateEnd,
      datesParseQuality: qualityOverride ?? "exact",
    };
  }

  const parsed = parseDatesDisplay(datesDisplay, seasonYear);
  if (!datesDisplay && parsed.dateStart && parsed.dateEnd) {
    datesDisplay = formatIsoDateRange(parsed.dateStart, parsed.dateEnd);
  }

  return {
    datesDisplay,
    dateStart: parsed.dateStart,
    dateEnd: parsed.dateEnd,
    datesParseQuality: qualityOverride ?? parsed.datesParseQuality,
  };
}

export function detectInternationalFromCsv(row: CsvRow, locationDisplay: string): boolean {
  const country = csvCell(row, "Country").toLowerCase();
  if (country && country !== "us" && country !== "usa" && country !== "united states") {
    return true;
  }

  const loc = locationDisplay.trim();
  if (/,\s*[A-Z]{2}\b/.test(loc) && !/,\s*UK\b/i.test(loc)) {
    if (
      /,\s*(CA|NY|MA|PA|TX|FL|IL|WA|OR|NC|GA|VA|MD|OH|MI|IN|TN|AZ|CO|UT|NM|HI|AK|AL|SC|LA|MO|WI|MN|IA|KS|NE|OK|KY|CT|RI|NH|VT|ME|DE|NJ|WV|ID|MT|WY|ND|SD|NV|AR|MS|DC)\b/.test(
        loc,
      )
    ) {
      return false;
    }
  }

  return /global|china|bahamas|wales|uk|bvi|canada|eleuthera|paraguay|panama|costa rica|peru|fiji|alps|chamonix|europe|japan|india|africa|international/i.test(
    loc,
  );
}
