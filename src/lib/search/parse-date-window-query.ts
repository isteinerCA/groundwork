import { TARGET_SEASON_YEAR } from "@/lib/constants/season-review";
import { parseDatesDisplay } from "@/lib/data/parse-dates-display";

export interface ParsedDateWindow {
  dateWindowStart: string;
  dateWindowEnd: string;
}

const MONTH_PATTERN =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

/** Parse a specific calendar window from natural language (e.g. "July 15-31"). */
export function parseDateWindowQuery(
  input: string,
  seasonYear = TARGET_SEASON_YEAR,
): ParsedDateWindow | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parseSameMonthDayRange(trimmed, seasonYear);
  if (parsed) return parsed;

  const crossMonthRange = trimmed.match(
    new RegExp(
      `\\b(${MONTH_PATTERN}\\.?\\s*\\d{1,2})\\s*(?:-|–|—|\\bto\\b|\\bthrough\\b|\\buntil\\b)\\s*(${MONTH_PATTERN}\\.?\\s*\\d{1,2})\\b`,
      "i",
    ),
  );
  if (crossMonthRange) {
    const parsed = parseDatesDisplay(`${crossMonthRange[1]} - ${crossMonthRange[2]}`, seasonYear);
    if (parsed.dateStart && parsed.dateEnd) {
      return { dateWindowStart: parsed.dateStart, dateWindowEnd: parsed.dateEnd };
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

export function isDateWindowQuery(input: string): boolean {
  return parseDateWindowQuery(input) !== null;
}
