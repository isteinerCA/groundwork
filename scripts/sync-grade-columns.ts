/**
 * Align CSV Grade Completed Min/Max with normalizeGrade(display) rules.
 * Run: npx tsx scripts/sync-grade-columns.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeGrade } from "../src/lib/data/normalize-grade";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
  return { headers, rows };
}

function stringifyCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvField(row[h] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

const csvPath = resolve(process.cwd(), "data/source/summer-programs-2027.csv");
const { headers, rows } = parseCsv(readFileSync(csvPath, "utf8"));

/** Rows with intentional manual grade overrides — do not auto-sync. */
const SKIP_SYNC_GROUPS = new Set([
  "oxford-academia-yale", // min 8 for motivated rising 9th exception
  "nyt-edu-summer-academy-nyc", // graduating seniors extend beyond rising 10-12
  "lasting-adventures-yosemite", // dual age/grade bands — manually curated
  "lasting-adventures-olympic",
  "mtsi-wharton-penn", // rising seniors primary; occasional rising juniors widen band
]);

let updated = 0;
const mismatches: string[] = [];

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const display = (row["Grades Display"] ?? "").trim();
  if (!display) continue;
  if (SKIP_SYNC_GROUPS.has(row["Program Group ID"] ?? "")) continue;

  const parsed = normalizeGrade(display);
  const emin = String(parsed.gradeCompletedMin);
  const emax = String(parsed.gradeCompletedMax);
  const cmin = row["Grade Completed Min"]?.trim() ?? "";
  const cmax = row["Grade Completed Max"]?.trim() ?? "";

  if (cmin !== emin || cmax !== emax) {
    mismatches.push(
      `L${i + 2} ${row["Program Group ID"]}: "${display.slice(0, 55)}" ${cmin}-${cmax} → ${emin}-${emax}`,
    );
    row["Grade Completed Min"] = emin;
    row["Grade Completed Max"] = emax;
    updated++;
  }
}

writeFileSync(csvPath, stringifyCsv(headers, rows));
console.log(`Updated ${updated} grade rows in CSV`);
for (const line of mismatches.slice(0, 30)) console.log(line);
if (mismatches.length > 30) console.log(`… and ${mismatches.length - 30} more`);
