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
import { normalizeFormat } from "../src/lib/data/normalize-format";
import {
  csvCell,
  detectInternationalFromCsv,
  parseCreditFromCsv,
  parseDatesFromCsv,
  parseDurationFromCsv,
  parseCatalogOfferingFromCsv,
  parseGradesFromCsv,
  parsePriceFromCsv,
} from "../src/lib/data/parse-csv-program-fields";
import { parseReviewStatus, parseSeasonYear } from "../src/lib/data/normalize-season-review";
import { isDayToDaySourceType } from "../src/lib/constants/day-to-day";
import {
  isParticipantGenderId,
  type ParticipantGenderId,
} from "../src/lib/constants/participant-gender";
import { isValidDayToDay } from "../src/lib/data/day-to-day";
import type { Program, ProgramCsvRow, ProgramFlag, ProgramDayToDay } from "../src/lib/types/program";

interface CuratedMatch {
  nameIncludes?: string;
  slugIncludes?: string;
  programGroupId?: string | string[];
  /** When set, rule applies only to this offering label (2027 Offering Label / 2026 Track/Session). */
  offeringLabel?: string;
}

function matchProgramGroupId(ruleGroupId: string | string[] | undefined, programGroupId?: string): boolean {
  if (!ruleGroupId) return true;
  if (!programGroupId) return false;
  if (Array.isArray(ruleGroupId)) return ruleGroupId.includes(programGroupId);
  return programGroupId === ruleGroupId;
}

interface FlagRule {
  match: CuratedMatch;
  flags: ProgramFlag[];
}

interface DayToDayRule {
  match: CuratedMatch;
  dayToDay: ProgramDayToDay;
}

interface ParticipantGenderRule {
  match: CuratedMatch;
  participantGender: ParticipantGenderId;
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

function loadDayToDayRules(): DayToDayRule[] {
  const path = resolve(process.cwd(), "data/seed/day-to-day.json");
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf-8")) as DayToDayRule[];
}

function loadParticipantGenderRules(): ParticipantGenderRule[] {
  const path = resolve(process.cwd(), "data/seed/participant-gender.json");
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf-8")) as ParticipantGenderRule[];
}

function curatedRuleMatches(
  match: CuratedMatch,
  program: Pick<Program, "name" | "slug" | "programGroupId" | "trackDetail">,
): boolean {
  if (!matchProgramGroupId(match.programGroupId, program.programGroupId)) {
    return false;
  }

  if (!match.programGroupId) {
    const nameHit = match.nameIncludes ? program.name.includes(match.nameIncludes) : false;
    const slugHit = match.slugIncludes ? program.slug.includes(match.slugIncludes) : false;
    if (!nameHit && !slugHit) return false;
  } else {
    if (match.nameIncludes && !program.name.includes(match.nameIncludes)) return false;
    if (match.slugIncludes && !program.slug.includes(match.slugIncludes)) return false;
  }

  if (match.offeringLabel) {
    const label = program.trackDetail?.trim() ?? "";
    if (label !== match.offeringLabel) return false;
  }

  return true;
}

function mergeFlags(
  program: Pick<Program, "name" | "slug" | "programGroupId" | "trackDetail">,
  csvFlags: ProgramFlag[],
  rules: FlagRule[],
): ProgramFlag[] {
  const byId = new Map<string, ProgramFlag>();
  for (const rule of rules) {
    if (curatedRuleMatches(rule.match, program)) {
      for (const flag of rule.flags) byId.set(flag.id, flag);
    }
  }
  for (const flag of csvFlags) byId.set(flag.id, flag);
  return [...byId.values()];
}

function mergeDayToDay(
  program: Pick<Program, "name" | "slug" | "programGroupId" | "trackDetail">,
  rules: DayToDayRule[],
): ProgramDayToDay | undefined {
  const matches = rules.filter((rule) => curatedRuleMatches(rule.match, program));

  const offeringOverride = matches.find(
    (rule) => rule.match.offeringLabel && isValidDayToDay(rule.dayToDay),
  );
  if (offeringOverride) return offeringOverride.dayToDay;

  const groupDefault = matches.find(
    (rule) => !rule.match.offeringLabel && isValidDayToDay(rule.dayToDay),
  );
  return groupDefault?.dayToDay;
}

function mergeParticipantGender(
  program: Pick<Program, "name" | "slug" | "programGroupId" | "trackDetail">,
  rules: ParticipantGenderRule[],
): ParticipantGenderId {
  for (const rule of rules) {
    if (!curatedRuleMatches(rule.match, program)) continue;
    if (isParticipantGenderId(rule.participantGender)) {
      return rule.participantGender;
    }
  }
  return "coed";
}

function validateDayToDayRules(rules: DayToDayRule[]): void {
  for (const [index, rule] of rules.entries()) {
    const { dayToDay } = rule;
    const notes = dayToDay.notes?.trim();
    if (notes && !isDayToDaySourceType(dayToDay.sourceType)) {
      console.warn(
        `day-to-day.json rule ${index + 1}: notes present but sourceType missing or invalid — skipped at merge`,
      );
    }
    if (dayToDay.sourceType && !notes) {
      console.warn(
        `day-to-day.json rule ${index + 1}: sourceType set but notes empty — skipped at merge`,
      );
    }
  }
}

function rowToProgram(
  row: ProgramCsvRow,
  index: number,
  verifiedAt: string,
  flagRules: FlagRule[],
  dayToDayRules: DayToDayRule[],
  participantGenderRules: ParticipantGenderRule[],
): Program | null {
  const category = categoryIdFromCsvValue(row["Primary Category"]);
  if (!category) {
    console.warn(`Row ${index + 2}: unknown category "${row["Primary Category"]}"`);
    return null;
  }

  const reviewStatus = parseReviewStatus(row["Review Status"]);
  if (reviewStatus === "needs_review") {
    return null;
  }

  const track = csvCell(row, "Track/Session", "Offering Label") || undefined;
  const programGroupId = csvCell(row, "Program Group ID", "Program Group Id") || undefined;
  const institution = csvCell(row, "Institution") || undefined;
  const description = csvCell(row, "Description") || undefined;
  const slug = slugify(row["Program Name"], track);
  const seasonYear = parseSeasonYear(row["Season Year"]);
  const { admissionType, admissionDisplay } = normalizeAdmissionType(
    csvCell(row, "Admission Type"),
  );
  const price = parsePriceFromCsv(row);
  const grades = parseGradesFromCsv(row);
  const format = normalizeFormat(csvCell(row, "Format"));
  const duration = parseDurationFromCsv(row);
  const dates = parseDatesFromCsv(row, seasonYear);
  const credit = parseCreditFromCsv(row);
  const locationDisplay = csvCell(row, "Location Display", "Location");
  const catalogOffering = parseCatalogOfferingFromCsv(row);

  const programBase = {
    id: `prog-${index + 1}`,
    slug,
    name: row["Program Name"].trim(),
    ...(institution ? { institution } : {}),
    ...(programGroupId ? { programGroupId } : {}),
    ...(description ? { description } : {}),
    ...(catalogOffering ? { catalogOffering: true } : {}),
    category,
    secondaryTags: csvCell(row, "Secondary Tags")
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean),
    trackDetail: track,
    ...grades,
    admissionType,
    admissionDisplay,
    formatDisplay: format.formatDisplay,
    formatTags: format.formatTags,
    ...duration,
    ...dates,
    seasonYear,
    reviewStatus,
    locationDisplay,
    isInternational: detectInternationalFromCsv(row, locationDisplay),
    ...credit,
    priceDisplay: price.priceDisplay,
    priceMin: price.priceMin,
    priceMax: price.priceMax,
    priceUnknown: price.priceUnknown,
    fullyFunded: price.fullyFunded,
    financialAidAvailable: price.financialAidAvailable,
    websiteUrl: csvCell(row, "URL"),
    dataVerifiedAt: verifiedAt,
  };

  const mergeContext = {
    name: programBase.name,
    slug,
    programGroupId: programBase.programGroupId,
    trackDetail: programBase.trackDetail,
  };

  const flags = mergeFlags(mergeContext, parseFlags(row.Flags), flagRules);

  const dayToDay = mergeDayToDay(mergeContext, dayToDayRules);
  const participantGender = mergeParticipantGender(mergeContext, participantGenderRules);

  return {
    ...programBase,
    flags,
    participantGender,
    ...(dayToDay ? { dayToDay } : {}),
  };
}

const REFRESH_CSV_PATH = "data/source/summer-programs-2027.csv";

function loadSupersededFromRefresh(refreshPath: string): { groups: Set<string>; names: Set<string> } {
  const groups = new Set<string>();
  const names = new Set<string>();
  if (!existsSync(refreshPath)) return { groups, names };

  for (const row of parseCsv(readFileSync(refreshPath, "utf-8"))) {
    if (parseReviewStatus(row["Review Status"]) === "needs_review") continue;
    const groupId = csvCell(row, "Program Group ID", "Program Group Id");
    const name = row["Program Name"]?.trim();
    if (groupId) groups.add(groupId);
    if (name) names.add(name);
  }
  return { groups, names };
}

function isSupersededLegacyRow(
  row: ProgramCsvRow,
  supersededGroups: Set<string>,
  supersededNames: Set<string>,
): boolean {
  const groupId = csvCell(row, "Program Group ID", "Program Group Id");
  const name = row["Program Name"]?.trim();
  if (groupId && supersededGroups.has(groupId)) return true;
  return Boolean(name && supersededNames.has(name));
}

function main() {
  const inputArg = process.argv[2];
  const legacyPath = resolve(process.cwd(), inputArg ?? "data/source/summer-programs.csv");
  const refreshPath = resolve(process.cwd(), REFRESH_CSV_PATH);
  const outputPath = resolve(process.cwd(), "data/seed/programs.json");
  const verifiedAt = new Date().toISOString().slice(0, 10);

  if (!existsSync(legacyPath)) {
    console.error(`Input CSV not found: ${legacyPath}`);
    process.exit(1);
  }

  const flagRules = loadFlagRules();
  const dayToDayRules = loadDayToDayRules();
  const participantGenderRules = loadParticipantGenderRules();
  validateDayToDayRules(dayToDayRules);

  const mergeRefresh = !inputArg;
  const superseded = mergeRefresh
    ? loadSupersededFromRefresh(refreshPath)
    : { groups: new Set<string>(), names: new Set<string>() };

  let rows = parseCsv(readFileSync(legacyPath, "utf-8"));
  if (mergeRefresh) {
    rows = rows.filter((row) => !isSupersededLegacyRow(row, superseded.groups, superseded.names));
    if (existsSync(refreshPath)) {
      rows = rows.concat(parseCsv(readFileSync(refreshPath, "utf-8")));
    }
  }

  const programs = rows
    .map((row, i) =>
      rowToProgram(row, i, verifiedAt, flagRules, dayToDayRules, participantGenderRules),
    )
    .filter((p): p is Program => p !== null);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    JSON.stringify({ verifiedAt, count: programs.length, programs }, null, 2),
  );

  console.log(`Imported ${programs.length} programs → ${outputPath}`);
}

main();
