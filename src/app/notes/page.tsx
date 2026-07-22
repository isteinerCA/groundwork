"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DashboardShell } from "@/components/workspace/dashboard-shell";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { getPrograms } from "@/lib/programs";

export default function NotesPage() {
  const { activeShortlist, updateItem } = useWorkspace();
  const programs = useMemo(() => getPrograms(), []);
  const programsById = useMemo(
    () => new Map(programs.map((p) => [p.id, p])),
    [programs],
  );

  const withNotes = activeShortlist.items.filter((item) => item.notes.trim() || true);

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl">Notes</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Research notes for each saved program. Stored locally until sign-in ships.
        </p>

        {activeShortlist.items.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-10 text-center">
            <p className="text-[var(--color-text-muted)]">Save programs to add notes.</p>
            <Link href="/search" className="mt-3 inline-block text-[var(--color-navy-light)]">
              Search programs →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {withNotes.map((item) => {
              const program = programsById.get(item.programId);
              if (!program) return null;
              return (
                <li
                  key={item.programId}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <h2 className="text-lg text-[var(--color-navy)]">{program.name}</h2>
                  <textarea
                    value={item.notes}
                    onChange={(e) => updateItem(item.programId, { notes: e.target.value })}
                    rows={4}
                    placeholder="Info session takeaways, questions for alumni calls…"
                    className="mt-3 w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
