import type { Program } from "@/lib/types/program";

/** Pick diverse, representative programs for marketing / empty-state previews. */
export function getPreviewPrograms(programs: Program[], limit = 3): Program[] {
  if (programs.length === 0) return [];

  const preferredMatchers: ((p: Program) => boolean)[] = [
    (p) => p.name.includes("Harvard Secondary School Program"),
    (p) => p.slug.startsWith("stanford-ai4all-residential"),
    (p) => p.name === "COSMOS UC Davis",
    (p) => p.name.includes("Telluride Association"),
    (p) => p.slug === "mit-research-science-institute-rsi",
  ];

  const picked: Program[] = [];
  const usedIds = new Set<string>();

  for (const matches of preferredMatchers) {
    if (picked.length >= limit) break;
    const match = programs.find((p) => matches(p) && !usedIds.has(p.id));
    if (match) {
      picked.push(match);
      usedIds.add(match.id);
    }
  }

  const withFlags = programs
    .filter((p) => p.flags.length > 0 && !usedIds.has(p.id))
    .sort((a, b) => b.flags.length - a.flags.length);

  for (const program of withFlags) {
    if (picked.length >= limit) break;
    if (picked.some((p) => p.category === program.category)) continue;
    picked.push(program);
    usedIds.add(program.id);
  }

  for (const program of programs) {
    if (picked.length >= limit) break;
    if (usedIds.has(program.id)) continue;
    picked.push(program);
    usedIds.add(program.id);
  }

  return picked;
}

export function formatProgramCatalogLabel(count: number): string {
  return `${count} curated programs`;
}
