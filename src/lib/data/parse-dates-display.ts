/** Parse free-text date strings and format ISO ranges for program cards. */

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

export type DatesParseQuality = "exact" | "approximate" | "unknown";

export interface ParsedDates {
  dateStart: string | null;
  dateEnd: string | null;
  datesParseQuality: DatesParseQuality;
}

function monthNum(token: string): number | null {
  return MONTHS[token.toLowerCase().replace(/\.$/, "")] ?? null;
}

function defaultDay(modifier: string | undefined, edge: "start" | "end"): number {
  if (modifier === "early") return edge === "start" ? 1 : 10;
  if (modifier === "mid") return 15;
  if (modifier === "late") return edge === "start" ? 20 : 28;
  return edge === "start" ? 1 : 28;
}

function makeDate(year: number, month: number, day: number): Date {
  const last = new Date(year, month, 0).getDate();
  return new Date(year, month - 1, Math.min(Math.max(day, 1), last), 12);
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const parsed = new Date(`${trimmed}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : trimmed;
}

/** Inclusive calendar days between two ISO dates (start and end both count). */
export function inclusiveDaySpanFromIso(start: string, end: string): number {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  return Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
}

export function formatIsoDateRange(start: string, end: string): string {
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" });
  const year = s.getFullYear();
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();

  if (sameMonth && s.getDate() === e.getDate()) {
    return `${month.format(s)} ${s.getDate()}, ${year}`;
  }
  if (sameMonth) {
    return `${month.format(s)} ${s.getDate()}–${e.getDate()}, ${year}`;
  }
  return `${month.format(s)} ${s.getDate()} – ${month.format(e)} ${e.getDate()}, ${year}`;
}

/** Port of scripts/generate_seed.py date parsing for legacy text date fields. */
export function parseDatesDisplay(raw: string, seasonYear = 2026): ParsedDates {
  const display = raw.trim();
  if (!display) {
    return { dateStart: null, dateEnd: null, datesParseQuality: "unknown" };
  }

  const lower = display.toLowerCase();
  if (/(available anytime|self-paced|year-round)/.test(lower)) {
    return { dateStart: null, dateEnd: null, datesParseQuality: "unknown" };
  }

  if (
    /\bsummer\b/.test(lower) &&
    !/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(lower)
  ) {
    return {
      dateStart: `${seasonYear}-06-01`,
      dateEnd: `${seasonYear}-08-31`,
      datesParseQuality: "approximate",
    };
  }

  const collected: Date[] = [];
  let hasExactDay = false;

  for (const match of display.matchAll(
    /(early|mid|late)?\s*([A-Za-z]+)\.?\s*(\d{1,2})\s*[-–—]\s*(\d{1,2})/gi,
  )) {
    const month = monthNum(match[2]);
    if (!month) continue;
    collected.push(
      makeDate(seasonYear, month, Number(match[3])),
      makeDate(seasonYear, month, Number(match[4])),
    );
    hasExactDay = true;
  }

  for (const match of display.matchAll(
    /(early|mid|late)?\s*([A-Za-z]+)\.?\s*(\d{1,2})?\s*[-–—]\s*(early|mid|late)?\s*([A-Za-z]+)\.?\s*(\d{1,2})?/gi,
  )) {
    const month1 = monthNum(match[2]);
    const month2 = monthNum(match[5]);
    if (!month1 || !month2) continue;
    if (month1 === month2 && match[3] && match[6] && !match[6]) {
      continue;
    }
    const day1 = match[3] ? Number(match[3]) : defaultDay(match[1], "start");
    const day2 = match[6] ? Number(match[6]) : defaultDay(match[4], "end");
    if (month1 === month2 && match[3] && match[6]) continue;
    collected.push(makeDate(seasonYear, month1, day1), makeDate(seasonYear, month2, day2));
    if (match[3] && match[6]) hasExactDay = true;
  }

  for (const match of display.matchAll(
    /(early|mid|late)?\s*([A-Za-z]+)\.?\s*(?:[-–—&]|and)\s*(early|mid|late)?\s*([A-Za-z]+)\.?/gi,
  )) {
    const month1 = monthNum(match[2]);
    const month2 = monthNum(match[4]);
    if (!month1 || !month2) continue;
    collected.push(
      makeDate(seasonYear, month1, defaultDay(match[1], "start")),
      makeDate(seasonYear, month2, defaultDay(match[3], "end")),
    );
  }

  for (const match of display.matchAll(
    /(early|mid|late)\s*([A-Za-z]+)\.?|([A-Za-z]+)\.?\s*(early|mid|late)/gi,
  )) {
    const monthToken = match[2] || match[3];
    const month = monthToken ? monthNum(monthToken) : null;
    if (!month) continue;
    const modifier = match[1] || match[4];
    collected.push(
      makeDate(seasonYear, month, defaultDay(modifier, "start")),
      makeDate(seasonYear, month, defaultDay(modifier, "end")),
    );
  }

  if (collected.length === 0) {
    for (const match of display.matchAll(/\b([A-Za-z]{3,9})\.?\b/g)) {
      const month = monthNum(match[1]);
      if (month) {
        collected.push(
          makeDate(seasonYear, month, 1),
          makeDate(seasonYear, month, new Date(seasonYear, month, 0).getDate()),
        );
      }
    }
  }

  if (collected.length === 0) {
    return { dateStart: null, dateEnd: null, datesParseQuality: "unknown" };
  }

  const start = new Date(Math.min(...collected.map((d) => d.getTime())));
  const end = new Date(Math.max(...collected.map((d) => d.getTime())));

  return {
    dateStart: toIso(start),
    dateEnd: toIso(end),
    datesParseQuality: hasExactDay ? "exact" : "approximate",
  };
}

export function parseDatesParseQuality(raw: string): DatesParseQuality | null {
  const value = raw.trim().toLowerCase();
  if (value === "exact" || value === "approximate" || value === "unknown") return value;
  return null;
}
