import { resolveLocationQuery, US_STATES } from "@/lib/data/matches-location";

/** Human-readable label for a location dataQuery chip. */
export function formatDataQueryLabel(dataQuery: string): string {
  const trimmed = dataQuery.trim();
  if (!trimmed) return "";

  const stateName = resolveLocationQuery(trimmed);
  if (stateName) {
    const state = US_STATES.find((entry) => entry.name === stateName);
    if (state) {
      const cityAlias = state.aliases.find((alias) => trimmed.includes(alias));
      if (cityAlias) {
        return `${cityAlias.replace(/\b\w/g, (c) => c.toUpperCase())}, ${state.abbr}`;
      }
      return state.name.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  return trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
}
