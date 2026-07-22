import type { Program } from "@/lib/types/program";
import type { ShortlistItem } from "@/lib/types/workspace";
import { SHORTLIST_STATUSES } from "@/lib/types/workspace";

function statusLabel(status: ShortlistItem["status"]): string {
  return SHORTLIST_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function exportShortlistCsv(
  items: ShortlistItem[],
  programsById: Map<string, Program>,
  listName: string,
): void {
  const headers = [
    "Program",
    "Category",
    "Location",
    "Dates",
    "Cost",
    "Status",
    "Deadline",
    "Notes",
    "Website",
  ];

  const rows = items.map((item) => {
    const program = programsById.get(item.programId);
    return [
      program?.name ?? item.programId,
      program?.category ?? "",
      program?.locationDisplay ?? "",
      program?.datesDisplay ?? "",
      program?.priceDisplay ?? "",
      statusLabel(item.status),
      item.deadline ?? "",
      item.notes.replace(/"/g, '""'),
      program?.websiteUrl ?? "",
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-shortlist.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
