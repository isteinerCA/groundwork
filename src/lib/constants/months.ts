export const MONTHS = [
  { number: 1, label: "January", aliases: ["jan", "january"] },
  { number: 2, label: "February", aliases: ["feb", "february"] },
  { number: 3, label: "March", aliases: ["mar", "march"] },
  { number: 4, label: "April", aliases: ["apr", "april"] },
  { number: 5, label: "May", aliases: ["may"] },
  { number: 6, label: "June", aliases: ["jun", "june"] },
  { number: 7, label: "July", aliases: ["jul", "july"] },
  { number: 8, label: "August", aliases: ["aug", "august"] },
  { number: 9, label: "September", aliases: ["sep", "sept", "september"] },
  { number: 10, label: "October", aliases: ["oct", "october"] },
  { number: 11, label: "November", aliases: ["nov", "november"] },
  { number: 12, label: "December", aliases: ["dec", "december"] },
] as const;

export type MonthNumber = (typeof MONTHS)[number]["number"];

export const MONTH_NUMBERS = MONTHS.map((m) => m.number) as [
  MonthNumber,
  ...MonthNumber[],
];

export function getMonthLabel(month: MonthNumber): string {
  return MONTHS.find((m) => m.number === month)?.label ?? String(month);
}

/** Resolve month name/alias from free text (e.g. "june", "in July"). */
export function resolveMonthQuery(input: string): MonthNumber | undefined {
  const trimmed = input.trim().toLowerCase().replace(/\./g, "");
  if (!trimmed) return undefined;

  for (const month of MONTHS) {
    for (const alias of month.aliases) {
      const pattern = new RegExp(`\\b${alias}\\b`, "i");
      if (pattern.test(trimmed)) return month.number;
    }
  }
  return undefined;
}

/** Parse multiple months from phrases like "June and July" or "Jun/Jul". */
export function parseMonthList(input: string): MonthNumber[] {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return [];

  const found = new Set<MonthNumber>();
  for (const month of MONTHS) {
    for (const alias of month.aliases) {
      if (new RegExp(`\\b${alias}\\b`, "i").test(normalized)) {
        found.add(month.number);
      }
    }
  }
  return [...found].sort((a, b) => a - b);
}
