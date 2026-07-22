/**
 * CSV → normalized Program[] import script.
 *
 * Usage (once final CSV is ready):
 *   npm run import:programs -- data/source/summer-programs.csv
 *
 * Output:
 *   data/seed/programs.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { categoryIdFromCsvValue } from "../src/lib/constants/categories";
import { normalizeAdmissionType } from "../src/lib/data/normalize-admission";
import { parsePrice } from "../src/lib/data/parse-price";
import type { Program, ProgramCsvRow, ProgramFlag } from "../src/lib/types/program";
import type { ProgramFormatId } from "../src/lib/constants/filters";

function parseCsv(content: string): ProgramCsvRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row as unknown as ProgramCsvRow;
  });
}

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
      result.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function slugify(name: string, track?: string): string {
  const base = [name, track].filter(Boolean).join(" ");
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function normalizeFormat(raw: string): ProgramFormatId {
  const lower = raw.trim().toLowerCase();
  if (lower === "online") return "online";
  if (lower === "residential") return "residential";
  if (lower.includes("both") || (lower.includes("online") && lower.includes("residential"))) {
    return "both";
  }
  if (lower.includes("online")) return "online";
  return "residential";
}

function parseFlags(raw?: string): ProgramFlag[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as ProgramFlag[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn("Could not parse Flags column as JSON — skipping flags for row");
    return [];
  }
}

function normalizeGrade(raw: string): Pick<
  Program,
  "gradeCompletedMin" | "gradeCompletedMax" | "gradeDisplay" | "gradeSource"
> {
  // TODO Sprint 2: full PRD §4.4 grade normalization
  return {
    gradeDisplay: raw.trim(),
    gradeCompletedMin: 6,
    gradeCompletedMax: 12,
    gradeSource: "grade",
  };
}

function rowToProgram(row: ProgramCsvRow, index: number, verifiedAt: string): Program | null {
  const category = categoryIdFromCsvValue(row["Primary Category"]);
  if (!category) {
    console.warn(`Row ${index + 2}: unknown category "${row["Primary Category"]}"`);
    return null;
  }

  const track = row["Any additional details about specific track"]?.trim();
  const { admissionType, admissionDisplay } = normalizeAdmissionType(row["Admission Type"]);
  const price = parsePrice(row.Price);
  const grades = normalizeGrade(row.Grades);

  return {
    id: `prog-${index + 1}`,
    slug: slugify(row["Program Name"], track),
    name: row["Program Name"].trim(),
    category,
    secondaryTags: (row["Secondary Tags"] ?? "")
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean),
    trackDetail: track || undefined,
    ...grades,
    admissionType,
    admissionDisplay,
    format: normalizeFormat(row.Format ?? ""),
    durationBucket: "two_to_four_weeks", // TODO: parse Length
    lengthDisplay: row.Length?.trim() ?? "",
    datesDisplay: row["Dates 2026"]?.trim() ?? "",
    locationDisplay: row.Location?.trim() ?? "",
    isInternational: !/,\s*[A-Z]{2}\b/.test(row.Location) && /global|china|bahamas|uk|wales/i.test(row.Location),
    hasCollegeCredit: /^yes/i.test(row.Credit),
    creditDisplay: row.Credit?.trim() ?? "",
    ...price,
    financialAidAvailable: /aid|scholar|need-based|subsid/i.test(row.Price),
    websiteUrl: row.URL?.trim() ?? "",
    flags: parseFlags(row.Flags),
    dataVerifiedAt: verifiedAt,
  };
}

function main() {
  const inputArg = process.argv[2] ?? "data/source/summer-programs.csv";
  const inputPath = resolve(process.cwd(), inputArg);
  const outputPath = resolve(process.cwd(), "data/seed/programs.json");
  const verifiedAt = new Date().toISOString().slice(0, 10);

  if (!existsSync(inputPath)) {
    console.error(`Input CSV not found: ${inputPath}`);
    console.error("Place your final CSV at data/source/summer-programs.csv and re-run.");
    process.exit(1);
  }

  const content = readFileSync(inputPath, "utf-8");
  const rows = parseCsv(content);
  const programs = rows
    .map((row, i) => rowToProgram(row, i, verifiedAt))
    .filter((p): p is Program => p !== null);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify({ verifiedAt, count: programs.length, programs }, null, 2));

  console.log(`Imported ${programs.length} programs → ${outputPath}`);
}

main();
