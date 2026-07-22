/**
 * CSV → normalized Program[] import script.
 *
 * Usage:
 *   npm run import:programs
 *   npm run import:programs -- path/to/file.csv
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { categoryIdFromCsvValue } from "../src/lib/constants/categories";
import { normalizeAdmissionType } from "../src/lib/data/normalize-admission";
import { normalizeDuration } from "../src/lib/data/normalize-duration";
import { normalizeFormat } from "../src/lib/data/normalize-format";
import { normalizeGrade } from "../src/lib/data/normalize-grade";
import { parsePrice } from "../src/lib/data/parse-price";
import type { Program, ProgramCsvRow, ProgramFlag } from "../src/lib/types/program";

interface FlagRule {
  match: { nameIncludes?: string; slugIncludes?: string };
  flags: ProgramFlag[];
}

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
    .slice(0, 100);
}

function parseFlags(raw?: string): ProgramFlag[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as ProgramFlag[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn("Could not parse Flags column as JSON — skipping inline flags");
    return [];
  }
}

function loadFlagRules(): FlagRule[] {
  const path = resolve(process.cwd(), "data/seed/flags.json");
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf-8")) as FlagRule[];
}

function mergeFlags(
  program: Pick<Program, "name" | "slug">,
  csvFlags: ProgramFlag[],
  rules: FlagRule[],
): ProgramFlag[] {
  const byId = new Map<string, ProgramFlag>();
  for (const rule of rules) {
    const nameHit = rule.match.nameIncludes
      ? program.name.includes(rule.match.nameIncludes)
      : false;
    const slugHit = rule.match.slugIncludes
      ? program.slug.includes(rule.match.slugIncludes)
      : false;
    if (nameHit || slugHit) {
      for (const flag of rule.flags) byId.set(flag.id, flag);
    }
  }
  for (const flag of csvFlags) byId.set(flag.id, flag);
  return [...byId.values()];
}

function detectInternational(location: string): boolean {
  const loc = location.trim();
  if (/,\s*[A-Z]{2}\b/.test(loc) && !/,\s*UK\b/i.test(loc)) {
    if (/,\s*(CA|NY|MA|PA|TX|FL|IL|WA|OR|NC|GA|VA|MD|OH|MI|IN|TN|AZ|CO|UT|NM|HI|AK|AL|SC|LA|MO|WI|MN|IA|KS|NE|OK|KY|CT|RI|NH|VT|ME|DE|NJ|WV|ID|MT|WY|ND|SD|NV|AR|MS|DC)\b/.test(loc)) {
      return false;
    }
  }
  return /global|china|bahamas|wales|uk|bvi|canada|eleuthera|paraguay|panama|costa rica|peru|fiji|alps|chamonix|europe|japan|india|africa|international/i.test(loc);
}

function rowToProgram(
  row: ProgramCsvRow,
  index: number,
  verifiedAt: string,
  flagRules: FlagRule[],
): Program | null {
  const category = categoryIdFromCsvValue(row["Primary Category"]);
  if (!category) {
    console.warn(`Row ${index + 2}: unknown category "${row["Primary Category"]}"`);
    return null;
  }

  const track = row["Track/Session"]?.trim();
  const slug = slugify(row["Program Name"], track);
  const { admissionType, admissionDisplay } = normalizeAdmissionType(row["Admission Type"]);
  const price = parsePrice(row.Price);
  const grades = normalizeGrade(row.Grades);
  const format = normalizeFormat(row.Format ?? "");
  const duration = normalizeDuration(row.Length ?? "");

  const programBase = {
    id: `prog-${index + 1}`,
    slug,
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
    formatDisplay: format.formatDisplay,
    formatTags: format.formatTags,
    ...duration,
    datesDisplay: row["Dates 2026"]?.trim() ?? "",
    locationDisplay: row.Location?.trim() ?? "",
    isInternational: detectInternational(row.Location ?? ""),
    hasCollegeCredit: /^yes/i.test(row.Credit),
    creditDisplay: row.Credit?.trim() ?? "",
    ...price,
    financialAidAvailable: /aid|scholar|need-based|subsid/i.test(row.Price),
    websiteUrl: row.URL?.trim() ?? "",
    dataVerifiedAt: verifiedAt,
  };

  const flags = mergeFlags(
    { name: programBase.name, slug },
    parseFlags(row.Flags),
    flagRules,
  );

  return { ...programBase, flags };
}

function main() {
  const inputArg = process.argv[2] ?? "data/source/summer-programs.csv";
  const inputPath = resolve(process.cwd(), inputArg);
  const outputPath = resolve(process.cwd(), "data/seed/programs.json");
  const verifiedAt = new Date().toISOString().slice(0, 10);

  if (!existsSync(inputPath)) {
    console.error(`Input CSV not found: ${inputPath}`);
    process.exit(1);
  }

  const flagRules = loadFlagRules();
  const content = readFileSync(inputPath, "utf-8");
  const rows = parseCsv(content);
  const programs = rows
    .map((row, i) => rowToProgram(row, i, verifiedAt, flagRules))
    .filter((p): p is Program => p !== null);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    JSON.stringify({ verifiedAt, count: programs.length, programs }, null, 2),
  );

  console.log(`Imported ${programs.length} programs → ${outputPath}`);
}

main();
