import type { WorkspaceState } from "@/lib/types/workspace";

/** Default archive name when starting a fresh shortlist, e.g. shortlist-07232026 */
export function defaultArchiveShortlistName(date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `shortlist-${mm}${dd}${yyyy}`;
}

export function uniqueShortlistName(state: WorkspaceState, base: string): string {
  const names = new Set(state.shortlists.map((s) => s.name));
  if (!names.has(base)) return base;
  let i = 2;
  while (names.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
