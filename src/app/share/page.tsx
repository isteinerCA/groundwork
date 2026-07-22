"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StatusBadge } from "@/components/workspace/status-badge";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import { getPrograms } from "@/lib/programs";
import { decodeSharePayload } from "@/lib/workspace/share";

function ShareContent() {
  const params = useSearchParams();
  const token = params.get("d") ?? "";

  const payload = useMemo(() => decodeSharePayload(token), [token]);
  const programs = useMemo(() => getPrograms(), []);
  const programsById = useMemo(
    () => new Map(programs.map((p) => [p.id, p])),
    [programs],
  );

  if (!token || !payload) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl">Link expired or invalid</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Share links are read-only and valid for 30 days from creation.
        </p>
        <Link href="/" className="mt-6 inline-block text-[var(--color-navy-light)]">
          ← Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <p className="text-xs font-semibold tracking-wide text-[var(--color-amber)] uppercase">
        Read-only shortlist
      </p>
      <h1 className="mt-2 text-3xl">{payload.name}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Shared view — editing requires your own Groundwork workspace.
      </p>

      <ul className="mt-8 space-y-4">
        {payload.items.map((item) => {
          const program = programsById.get(item.programId);
          if (!program) return null;
          const category =
            PROGRAM_CATEGORIES.find((c) => c.id === program.category)?.label ?? program.category;
          return (
            <li
              key={item.programId}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">{category}</p>
                  <h2 className="text-lg text-[var(--color-navy)]">{program.name}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {program.locationDisplay} · {program.priceDisplay}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              {item.notes && (
                <p className="mt-3 rounded bg-[var(--color-parchment)] p-3 text-sm text-[var(--color-text-muted)]">
                  {item.notes}
                </p>
              )}
              {item.deadline && (
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  Deadline: {item.deadline}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default function SharePage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<main className="px-6 py-16 text-center">Loading…</main>}>
        <ShareContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}
