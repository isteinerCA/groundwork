import seedData from "../../data/seed/programs.json";
import type { Program } from "@/lib/types/program";

export interface ProgramSeedFile {
  verifiedAt: string | null;
  count: number;
  programs: Program[];
}

export function getPrograms(): Program[] {
  return (seedData as ProgramSeedFile).programs;
}

export function getDataVerifiedAt(): string | null {
  return (seedData as ProgramSeedFile).verifiedAt;
}

export function getProgramBySlug(slug: string): Program | undefined {
  return getPrograms().find((p) => p.slug === slug);
}
