import { SHORTLIST_STATUSES, type ShortlistItemStatus } from "@/lib/types/workspace";
import { cn } from "@/lib/utils";

const dotColors: Record<ShortlistItemStatus, string> = {
  researching: "bg-blue-500",
  deadline_noted: "bg-amber-500",
  applied: "bg-purple-500",
  waitlisted: "bg-gray-400",
  accepted: "bg-emerald-500",
  declined: "bg-red-400",
};

export function StatusBadge({ status }: { status: ShortlistItemStatus }) {
  const label = SHORTLIST_STATUSES.find((s) => s.id === status)?.label ?? status;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-2.5 py-0.5 text-xs font-medium text-[var(--color-navy)]">
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[status])} aria-hidden />
      {label}
    </span>
  );
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: ShortlistItemStatus;
  onChange: (status: ShortlistItemStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ShortlistItemStatus)}
      className="rounded border border-[var(--color-border)] bg-white px-2 py-1 text-xs"
    >
      {SHORTLIST_STATUSES.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
