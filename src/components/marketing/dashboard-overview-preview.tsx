import Link from "next/link";
import { btnPrimary } from "@/components/ui/button-styles";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import type { Program } from "@/lib/types/program";

const SAMPLE_STATUSES = [
  { label: "Researching", dot: "bg-blue-500" },
  { label: "Applied", dot: "bg-purple-500" },
  { label: "Deadline noted", dot: "bg-amber-500" },
] as const;

function categoryLabel(id: Program["category"]): string {
  return PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Static hero mock of the decision workspace — compact, no auth required. */
export function DashboardOverviewPreview({ programs }: { programs: Program[] }) {
  const rows = programs.slice(0, 4);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-parchment)]/60 px-4 py-2.5">
        <div>
          <p className="text-sm font-semibold text-[var(--color-navy)]">Your shortlist</p>
          <p className="text-xs text-[var(--color-text-muted)]">Summer 2026 · sample overview</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
          Decision workspace
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:gap-3">
        {[
          { label: "Saved", value: rows.length || 4 },
          { label: "Deadlines", value: 2 },
          { label: "Applied", value: 1 },
          { label: "Accepted", value: 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-parchment)]/40 px-2.5 py-2"
          >
            <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
              {stat.label}
            </p>
            <p className="text-xl font-normal text-[var(--color-navy)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.7fr)] gap-2 border-b border-[var(--color-border)] bg-[var(--color-parchment)]/30 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          <span>Program</span>
          <span>Status</span>
          <span className="hidden sm:inline">Deadline</span>
        </div>
        {rows.map((program, index) => {
          const status = SAMPLE_STATUSES[index % SAMPLE_STATUSES.length];
          const title =
            program.trackDetail && program.name
              ? `${program.name} — ${program.trackDetail}`
              : program.name;
          return (
            <div
              key={program.id}
              className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.7fr)] gap-2 border-b border-[var(--color-border)] px-3 py-2.5 text-xs last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--color-navy)]">{title}</p>
                <p className="truncate text-[var(--color-text-muted)]">
                  {categoryLabel(program.category)} · {program.locationDisplay}
                </p>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white px-2 py-0.5 text-[10px] font-medium">
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
                  {status.label}
                </span>
              </div>
              <p className="hidden text-[var(--color-text-muted)] sm:block">
                {index === 1 ? "Sep 15" : index === 2 ? "Oct 1" : "—"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-parchment)]/40 px-4 py-3">
        <Link href="/search" className={`${btnPrimary} w-full justify-center text-sm`}>
          Start your shortlist
        </Link>
        <p className="mt-2 text-center text-[10px] text-[var(--color-text-muted)]">
          Search free · save & track when you&apos;re ready
        </p>
      </div>
    </div>
  );
}
