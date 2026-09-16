import seedData from "../../../data/seed/programs.json";
import { searchResultGroupKey } from "@/lib/data/group-search-results";
import { roundMarketingCount } from "@/lib/programs/marketing-count-label";
import type { Program } from "@/lib/types/program";

interface ProgramSeedFile {
  count: number;
  programs: Program[];
}

const seed = seedData as ProgramSeedFile;

/** Individual searchable offerings (CSV rows). */
export const catalogOfferingCount = seed.programs.length;

/** Distinct program families as shown in search (grouped cards + legacy singles). */
export const catalogProgramFamilyCount = new Set(
  seed.programs.map((program) => searchResultGroupKey(program)),
).size;

/** Hero / "options" copy — total offerings, rounded. */
export const MARKETING_OFFERING_COUNT_LABEL = roundMarketingCount(catalogOfferingCount);

/** Filter / "programs" copy — search tile count, rounded. */
export const MARKETING_PROGRAM_COUNT_LABEL = roundMarketingCount(catalogProgramFamilyCount);
