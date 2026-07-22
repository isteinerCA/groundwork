"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/workspace/dashboard-shell";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ADMISSION_TYPE_BY_ID } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import type { Program } from "@/lib/types/program";

const MAX_COMPARE = 4;

export function CompareView({ programs }: { programs: Program[] }) {
  const { activeShortlist } = useWorkspace();
  const [selected, setSelected] = useState<string[]>([]);

  const programsById = useMemo(
    () => new Map(programs.map((p) => [p.id, p])),
    [programs],
  );

  const savedPrograms = activeShortlist.items
    .map((item) => programsById.get(item.programId))
    .filter(Boolean) as Program[];

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const compared = selected
    .map((id) => programsById.get(id))
    .filter(Boolean) as Program[];

  const categoryLabel = (id: string) =>
    PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id;

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8 print:px-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl">Compare programs</h1>
            <p className="mt-1 text-[var(--color-text-muted)]">
              Select up to {MAX_COMPARE} saved programs for a side-by-side view.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-[var(--color-border)] px-4 py-2 text-sm print:hidden"
          >
            Print / Save PDF
          </button>
        </div>

        {savedPrograms.length === 0 ? (
          <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-10 text-center">
            <p className="text-[var(--color-text-muted)]">Save programs from search first.</p>
            <Link href="/search" className="mt-3 inline-block text-[var(--color-navy-light)]">
              Go to search →
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2 print:hidden">
              {savedPrograms.map((program) => (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => toggle(program.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    selected.includes(program.id)
                      ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
                      : "border-[var(--color-border)] bg-white"
                  }`}
                >
                  {program.name}
                </button>
              ))}
            </div>

            {compared.length >= 2 ? (
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border border-[var(--color-border)] bg-[var(--color-parchment-dark)] px-4 py-3 text-left font-medium">
                        Field
                      </th>
                      {compared.map((p) => (
                        <th
                          key={p.id}
                          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left font-medium text-[var(--color-navy)]"
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Category", (p: Program) => categoryLabel(p.category)],
                      ["Grades", (p: Program) => p.gradeDisplay],
                      ["Admission", (p: Program) => ADMISSION_TYPE_BY_ID[p.admissionType].label],
                      ["Format", (p: Program) => p.formatDisplay],
                      ["Location", (p: Program) => p.locationDisplay],
                      ["Dates", (p: Program) => p.datesDisplay || "—"],
                      ["Length", (p: Program) => p.lengthDisplay],
                      ["Cost", (p: Program) => p.priceDisplay],
                      ["College credit", (p: Program) => (p.hasCollegeCredit ? "Yes" : "No")],
                      [
                        "Hidden details",
                        (p: Program) =>
                          p.flags.length > 0
                            ? p.flags.map((f) => f.title).join("; ")
                            : "None listed",
                      ],
                    ].map(([label, getter]) => (
                      <tr key={label as string}>
                        <td className="border border-[var(--color-border)] bg-[var(--color-parchment-dark)] px-4 py-3 font-medium text-[var(--color-text-muted)]">
                          {label as string}
                        </td>
                        {compared.map((p) => (
                          <td
                            key={p.id}
                            className="border border-[var(--color-border)] bg-white px-4 py-3 align-top"
                          >
                            {(getter as (p: Program) => string)(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-8 text-[var(--color-text-muted)]">
                Select at least 2 programs above to compare.
              </p>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
