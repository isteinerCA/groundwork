import { TARGET_SEASON_YEAR } from "@/lib/constants/season-review";
import { parseDatesDisplay } from "@/lib/data/parse-dates-display";

export interface ParsedDateWindow {
  dateWindowStart: string | null;
  dateWindowEnd: string | null;
}

const MONTH_PATTERN =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

const MONTH_DAY = `${MONTH_PATTERN}\\.?\\s*\\d{1,2}(?:st|nd|rd|th)?`;

/** Parse a specific calendar window or one-sided date bound from natural language. */
export function parseDateWindowQuery(
  input: string,
  seasonYear = TARGET_SEASON_YEAR,
): ParsedDateWindow | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const range = parseContainedDateRange(trimmed, seasonYear);
  if (range) return range;

  return parseOpenEndedDateBound(trimmed, seasonYear);
}

function parseContainedDateRange(
  trimmed: string,
  seasonYear: number,
): ParsedDateWindow | null {
  const parsed = parseSameMonthDayRange(trimmed, seasonYear);
  if (parsed) return parsed;

  const crossMonthRange = trimmed.match(
    new RegExp(
      `\\b(${MONTH_PATTERN}\\.?\\s*\\d{1,2})\\s*(?:-|–|—|\\bto\\b|\\bthrough\\b|\\buntil\\b)\\s*(${MONTH_PATTERN}\\.?\\s*\\d{1,2})\\b`,
      "i",
    ),
  );
  if (crossMonthRange) {
    const dates = parseDatesDisplay(`${crossMonthRange[1]} - ${crossMonthRange[2]}`, seasonYear);
    if (dates.dateStart && dates.dateEnd) {
      return { dateWindowStart: dates.dateStart, dateWindowEnd: dates.dateEnd };
    }
  }

  return null;
}

function parseSameMonthDayRange(
  input: string,
  seasonYear: number,
): ParsedDateWindow | null {
  const patterns: RegExp[] = [
    new RegExp(
      `\\bbetween\\s+${MONTH_PATTERN}\\.?\\s*(\\d{1,2})\\s+and\\s+(\\d{1,2})\\b`,
      "i",
    ),
    new RegExp(
      `\\b${MONTH_PATTERN}\\.?\\s*(\\d{1,2})\\s*(?:-|–|—|\\bto\\b|\\bthrough\\b|\\buntil\\b|\\band\\b)\\s*(\\d{1,2})\\b`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (!match) continue;

    const monthToken = match[0].match(new RegExp(MONTH_PATTERN, "i"))?.[0]?.replace(/\.$/, "");
    if (!monthToken) continue;

    const parsed = parseDatesDisplay(`${monthToken} ${match[1]}-${match[2]}`, seasonYear);
    if (parsed.dateStart && parsed.dateEnd) {
      return { dateWindowStart: parsed.dateStart, dateWindowEnd: parsed.dateEnd };
    }
  }

  return null;
}

function parseOpenEndedDateBound(
  input: string,
  seasonYear: number,
): ParsedDateWindow | null {
  const endsMatch = input.match(
    new RegExp(
      `\\b(?:ends?|finish(?:es|ed)?|conclude[sd]?|over|done|back|home|return(?:s)?|complete[sd]?|wrap(?:s|ped)?(?:\\s+up)?)\\s+(?:before|by|prior to|no later than)\\s+(${MONTH_DAY})\\b`,
      "i",
    ),
  );
  if (endsMatch?.[1]) {
    return boundEndingBy(endsMatch[1], /before|prior to/i.test(endsMatch[0]), seasonYear);
  }

  const startsMatch = input.match(
    new RegExp(
      `\\b(?:starts?|begin(?:s)?|available)\\s+(?:after|on or after|on|from)\\s+(${MONTH_DAY})\\b`,
      "i",
    ),
  );
  if (startsMatch?.[1]) {
    const exclusive = /\bafter\b/i.test(startsMatch[0]) && !/\bon or after\b/i.test(startsMatch[0]);
    return boundStartingOn(startsMatch[1], exclusive, seasonYear);
  }

  const beforeFallback = input.match(
    new RegExp(`(?:^|\\s)(?:before|no later than|prior to)\\s+(${MONTH_DAY})\\s*$`, "i"),
  );
  if (beforeFallback?.[1]) {
    return boundEndingBy(beforeFallback[1], /before|prior to/i.test(beforeFallback[0]), seasonYear);
  }

  const byFallback = input.match(new RegExp(`(?:^|\\s)by\\s+(${MONTH_DAY})\\s*$`, "i"));
  if (byFallback?.[1]) {
    return boundEndingBy(byFallback[1], false, seasonYear);
  }

  return null;
}

function boundEndingBy(
  token: string,
  exclusive: boolean,
  seasonYear: number,
): ParsedDateWindow | null {
  const iso = parseMonthDayToken(token, seasonYear);
  if (!iso) return null;
  return {
    dateWindowStart: null,
    dateWindowEnd: exclusive ? shiftIsoDate(iso, -1) : iso,
  };
}

function boundStartingOn(
  token: string,
  exclusive: boolean,
  seasonYear: number,
): ParsedDateWindow | null {
  const iso = parseMonthDayToken(token, seasonYear);
  if (!iso) return null;
  return {
    dateWindowStart: exclusive ? shiftIsoDate(iso, 1) : iso,
    dateWindowEnd: null,
  };
}

function parseMonthDayToken(token: string, seasonYear: number): string | null {
  const match = token
    .trim()
    .match(new RegExp(`^(${MONTH_PATTERN})\\.?\\s*(\\d{1,2})(?:st|nd|rd|th)?$`, "i"));
  if (!match) return null;
  const parsed = parseDatesDisplay(`${match[1]} ${match[2]}-${match[2]}`, seasonYear);
  return parsed.dateStart;
}

function shiftIsoDate(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateWindowQuery(input: string): boolean {
  return parseDateWindowQuery(input) !== null;
}

const DATE_ONLY_FILLER =
  /\b(ends?|start(?:s|ing)?|begin(?:s)?|finish(?:es|ed)?|conclude[sd]?|over|done|back|home|return(?:s)?|complete[sd]?|wrap(?:s|ped)?|up|before|after|by|on|or|from|prior|to|no|later|than|between|through|until|and|that|run|runs|fit|fits|include|only|programs?|please|must|should|need|available|find|show|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec|\d{1,2}(?:st|nd|rd|th)?)\b/gi;

/** True when the message is only a date window / one-sided date bound. */
export function isDateOnlyConstraintQuery(input: string): boolean {
  if (!parseDateWindowQuery(input)) return false;
  const leftover = input.replace(DATE_ONLY_FILLER, " ").replace(/[^a-z]+/gi, " ").trim();
  return leftover.length === 0;
}
