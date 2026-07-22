"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DashboardShell } from "@/components/workspace/dashboard-shell";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { getPrograms } from "@/lib/programs";
import { getUpcomingDeadlines } from "@/lib/workspace/stats";

export default function CalendarPage() {
  const { activeShortlist } = useWorkspace();
  const programs = useMemo(() => getPrograms(), []);
  const programsById = useMemo(
    () => new Map(programs.map((p) => [p.id, p])),
    [programs],
  );
  const deadlines = getUpcomingDeadlines(activeShortlist.items, programsById, 50);

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl">Calendar</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Deadlines you enter on saved programs appear here.
        </p>

        {deadlines.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-10 text-center">
            <p className="text-[var(--color-text-muted)]">No upcoming deadlines yet.</p>
            <Link href="/dashboard" className="mt-3 inline-block text-[var(--color-navy-light)]">
              Add deadlines on your dashboard →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {deadlines.map((entry) => (
              <li
                key={entry.programId}
                className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4"
              >
                <time
                  dateTime={entry.deadline}
                  className="shrink-0 rounded bg-[var(--color-navy)] px-3 py-2 text-center text-xs font-bold text-white"
                >
                  {new Date(entry.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <div>
                  <p className="font-medium text-[var(--color-navy)]">{entry.programName}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {entry.daysUntil === 0
                      ? "Due today"
                      : `Due in ${entry.daysUntil} day${entry.daysUntil === 1 ? "" : "s"}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
