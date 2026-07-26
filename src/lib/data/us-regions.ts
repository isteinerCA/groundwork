import type { Program } from "@/lib/types/program";
import { matchesLocationQuery } from "@/lib/data/matches-location";

export const US_REGIONS = [
  {
    id: "east-coast",
    label: "East Coast",
    aliases: [
      "east coast",
      "eastern seaboard",
      "atlantic coast",
      "east coast only",
      "the east coast",
    ],
    states: [
      "maine",
      "new hampshire",
      "vermont",
      "massachusetts",
      "rhode island",
      "connecticut",
      "new york",
      "new jersey",
      "pennsylvania",
      "delaware",
      "maryland",
      "district of columbia",
      "virginia",
      "north carolina",
      "south carolina",
      "georgia",
      "florida",
    ],
  },
  {
    id: "west-coast",
    label: "West Coast",
    aliases: ["west coast", "pacific coast", "west coast only", "the west coast"],
    states: ["washington", "oregon", "california"],
  },
  {
    id: "midwest",
    label: "Midwest",
    aliases: ["midwest", "mid west", "mid-west", "midwest only", "the midwest"],
    states: [
      "illinois",
      "indiana",
      "ohio",
      "michigan",
      "wisconsin",
      "minnesota",
      "iowa",
      "missouri",
      "north dakota",
      "south dakota",
      "nebraska",
      "kansas",
    ],
  },
  {
    id: "south",
    label: "South",
    aliases: ["the south", "southern us", "southern states", "south only"],
    states: [
      "texas",
      "oklahoma",
      "arkansas",
      "louisiana",
      "mississippi",
      "alabama",
      "tennessee",
      "kentucky",
      "west virginia",
      "georgia",
      "florida",
      "south carolina",
      "north carolina",
      "virginia",
    ],
  },
  {
    id: "northeast",
    label: "Northeast",
    aliases: ["northeast", "north east", "north-east", "northeast only", "the northeast"],
    states: [
      "maine",
      "new hampshire",
      "vermont",
      "massachusetts",
      "rhode island",
      "connecticut",
      "new york",
      "new jersey",
      "pennsylvania",
    ],
  },
] as const;

export type UsRegionId = (typeof US_REGIONS)[number]["id"];

const REGION_BY_ID = Object.fromEntries(US_REGIONS.map((r) => [r.id, r])) as Record<
  UsRegionId,
  (typeof US_REGIONS)[number]
>;

function normalizeRegionInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+only$/, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resolve regional phrases like "east coast" to a canonical region id. */
export function resolveRegionQuery(input: string): UsRegionId | undefined {
  const normalized = normalizeRegionInput(input);
  if (!normalized) return undefined;

  for (const region of US_REGIONS) {
    if (region.id === normalized || region.id.replace(/-/g, " ") === normalized) {
      return region.id;
    }
    for (const alias of region.aliases) {
      if (normalized === alias || normalized.includes(alias)) {
        return region.id;
      }
    }
  }

  return undefined;
}

export function getRegionLabel(regionId: string): string {
  return REGION_BY_ID[regionId as UsRegionId]?.label ?? regionId;
}

export function programMatchesRegion(program: Program, regionId: UsRegionId): boolean {
  const region = REGION_BY_ID[regionId];
  if (!region) return false;
  return region.states.some((state) => matchesLocationQuery(program, state));
}

export function programMatchesAnyRegion(program: Program, regionIds: UsRegionId[]): boolean {
  if (regionIds.length === 0) return true;
  return regionIds.some((id) => programMatchesRegion(program, id));
}

export const US_REGION_IDS = US_REGIONS.map((r) => r.id) as [UsRegionId, ...UsRegionId[]];
