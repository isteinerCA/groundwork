"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DashboardShell } from "@/components/workspace/dashboard-shell";
import { StatusBadge } from "@/components/workspace/status-badge";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { formatPriceDisplay } from "@/lib/data/format-price-display";
import { getPrograms } from "@/lib/programs";

export default function NotesPage() {
  const { activeShortlist, updateItem } = useWorkspace();
  const programs = useMemo(() => getPrograms(), []);
  const programsById = useMemo(
    () => new Map(programs.map((p) => [p.id, p])),
    [programs],
  );

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl">Notes</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Research notes for each saved program.
        </p>

        {activeShortlist.items.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-10 text-center">
            <p className="text-[var(--color-text-muted)]">Save programs to add notes.</p>
            <Link href="/search" className="mt-3 inline-block text-[var(--color-navy-light)]">
              Search programs →
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
            <ul className="divide-y divide-[var(--color-border)]">
              {activeShortlist.items.map((item) => {
                const program = programsById.get(item.programId);
                if (!program) return null;
                return (
                  <li
                    key={item.programId}
                    className="grid gap-4 p-5 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:gap-8"
                  >
                    <div className="min-w-0">
                      <h2 className="text-lg text-[var(--color-navy)]">{program.name}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} />
                      </div>
                      <dl className="mt-3 space-y-1 text-sm text-[var(--color-text-muted)]">
                        <div>
                          <dt className="sr-only">Location</dt>
                          <dd>{program.locationDisplay}</dd>
                        </div>
                        <div>
                          <dt className="sr-only">Dates</dt>
                          <dd>{program.datesDisplay || "Dates TBD"}</dd>
                        </div>
                        <div>
                          <dt className="sr-only">Cost</dt>
                          <dd>{formatPriceDisplay(program)}</dd>
                        </div>
                        {item.deadline && (
                          <div>
                            <dt className="inline text-xs font-medium uppercase tracking-wide">
                              Deadline{" "}
                            </dt>
                            <dd className="inline">
                              {new Date(item.deadline).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    <textarea
                      value={item.notes}
                      onChange={(e) => updateItem(item.programId, { notes: e.target.value })}
                      rows={5}
                      placeholder="Info session takeaways, questions for alumni calls…"
                      className="min-h-[8rem] w-full resize-y rounded border border-[var(--color-border)] bg-[var(--color-parchment)]/40 px-3 py-2.5 text-sm leading-relaxed"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
