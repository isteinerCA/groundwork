import type { Shortlist } from "@/lib/types/workspace";

/** User-facing label when a program appears in one or more shortlists. */
export function formatShortlistMembershipLabel(
  lists: Shortlist[],
  activeShortlistId: string,
): string {
  if (lists.length === 0) return "";
  if (lists.length === 1) return lists[0]!.name;

  const active = lists.find((list) => list.id === activeShortlistId);
  const primary = active ?? lists[0]!;
  return `${primary.name} + ${lists.length - 1} more`;
}
