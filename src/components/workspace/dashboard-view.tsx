"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { btnPrimary } from "@/components/ui/button-styles";
import { CheckoutSuccessHandler } from "@/components/auth/checkout-success-handler";
import { DashboardShell } from "@/components/workspace/dashboard-shell";
import { StatusBadge, StatusSelect } from "@/components/workspace/status-badge";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import { formatPriceDisplay } from "@/lib/data/format-price-display";
import type { Program } from "@/lib/types/program";
import { exportShortlistCsv } from "@/lib/workspace/export-csv";
import { buildShareUrl } from "@/lib/workspace/share";
import { trackEvent } from "@/lib/analytics";
import {
  computeWorkspaceStats,
  getUpcomingDeadlines,
  greetingForHour,
} from "@/lib/workspace/stats";

function categoryLabel(id: string): string {
  return PROGRAM_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function DashboardView({ programs }: { programs: Program[] }) {
  const {
    state,
    activeShortlist,
    updateItem,
    removeItem,
    acknowledgePrivacy,
    canWrite,
    setActiveShortlist,
  } = useWorkspace();
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  const programsById = useMemo(
    () => new Map(programs.map((p) => [p.id, p])),
    [programs],
  );

  const stats = computeWorkspaceStats(state);
  const deadlines = getUpcomingDeadlines(activeShortlist.items, programsById);
  const hour = typeof window !== "undefined" ? new Date().getHours() : 10;
  const greeting = greetingForHour(hour);

  const rows = activeShortlist.items
    .map((item) => ({ item, program: programsById.get(item.programId) }))
    .filter((row) => row.program);

  const handleExport = () => {
    exportShortlistCsv(activeShortlist.items, programsById, activeShortlist.name);
  };

  const handleShare = async () => {
    const url = buildShareUrl(
      {
        name: activeShortlist.name,
        exportedAt: new Date().toISOString(),
        items: activeShortlist.items,
      },
      window.location.origin,
    );
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Share link copied (valid 30 days). Read-only view — no account required.");
    } catch {
      setShareMessage(url);
    }
    setTimeout(() => setShareMessage(null), 5000);
  };

  return (
    <DashboardShell showBanner>
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal
            className="w-full max-w-sm rounded-[var(--radius-lg)] bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg text-[var(--color-navy)]">Remove program?</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Remove <strong>{removeTarget.name}</strong> from your shortlist? Notes and deadline
              for this program will be deleted.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  removeItem(removeTarget.id);
                  setRemoveTarget(null);
                }}
                className="rounded-[var(--radius-md)] bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Remove program
              </button>
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <CheckoutSuccessHandler />
        </Suspense>

        {!canWrite && (
          <p className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-amber)]/40 bg-[var(--color-amber-soft)]/50 px-4 py-3 text-sm text-[var(--color-navy)]">
            Sign up to save and edit your shortlist.{" "}
            <Link href="/sign-up" className="font-medium text-[var(--color-navy-light)]">
              Create an account
            </Link>{" "}
            or heart a program on search to get started.
          </p>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-3xl">
              {greeting}, {state.displayName}
              <span aria-hidden>☀️</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {state.shortlists.length > 1 ? (
                <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <span className="sr-only">Active shortlist</span>
                  <select
                    value={state.activeShortlistId}
                    onChange={(e) => setActiveShortlist(e.target.value)}
                    className="max-w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 font-medium text-[var(--color-navy)]"
                  >
                    {state.shortlists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.items.length})
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-[var(--color-text-muted)]">
                  {activeShortlist.name} · {rows.length} program
                  {rows.length === 1 ? "" : "s"}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/search"
            className={`${btnPrimary} inline-flex items-center gap-2`}
          >
            + Add Program
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Saved Programs", value: stats.savedCount, sub: "Across your shortlist" },
            {
              label: "Upcoming Deadlines",
              value: stats.upcomingDeadlines,
              sub:
                deadlines[0] != null
                  ? `Next in ${deadlines[0].daysUntil} days`
                  : "Add deadlines as you research",
            },
            {
              label: "Applications Started",
              value: stats.applicationsStarted,
              sub: "Applied or waitlisted",
            },
            {
              label: "Offers Received",
              value: stats.offersReceived,
              sub: stats.offersReceived > 0 ? "Congratulations!" : "Track acceptances here",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
            >
              <p className="text-sm text-[var(--color-text-muted)]">{card.label}</p>
              <p className="mt-2 text-3xl text-[var(--color-navy)]">{card.value}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
              <h2 className="text-xl">My Programs</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "table" ? "board" : "table")}
                  className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]"
                >
                  View as {viewMode === "table" ? "Board" : "Table"}
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-navy-light)]"
                >
                  Share link
                </button>
              </div>
            </div>
            {shareMessage && (
              <p className="border-b border-[var(--color-border)] bg-[var(--color-amber-soft)]/50 px-5 py-2 text-xs text-[var(--color-navy)]">
                {shareMessage}
              </p>
            )}

            {rows.length === 0 ? (
              <div className="p-10 text-center text-[var(--color-text-muted)]">
                <p>No saved programs yet.</p>
                <Link href="/search" className="mt-3 inline-block text-[var(--color-navy-light)]">
                  Search and save programs →
                </Link>
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[8%]" />
                    <col className="w-[10%]" />
                    <col className="w-[9%]" />
                    <col className="w-[8%]" />
                    <col className="w-[11%]" />
                    <col className="w-[9%]" />
                    <col className="w-[24%]" />
                    <col className="w-[6%]" />
                  </colgroup>
                  <thead className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Program</th>
                      <th className="px-3 py-3 font-medium">Category</th>
                      <th className="px-3 py-3 font-medium">Location</th>
                      <th className="px-3 py-3 font-medium">Dates</th>
                      <th className="px-3 py-3 font-medium">Cost</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Deadline</th>
                      <th className="px-3 py-3 font-medium">Notes</th>
                      <th className="px-3 py-3 font-medium"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ item, program }) => (
                      <tr
                        key={item.programId}
                        className="border-b border-[var(--color-border)] last:border-0"
                      >
                        <td className="px-5 py-4 align-top">
                          <p className="font-medium text-[var(--color-navy)]">{program!.name}</p>
                        </td>
                        <td className="px-3 py-4 align-top">
                          <span className="rounded-full bg-[var(--color-parchment-dark)] px-2 py-0.5 text-xs">
                            {categoryLabel(program!.category)}
                          </span>
                        </td>
                        <td className="px-3 py-4 align-top text-[var(--color-text-muted)]">
                          {program!.locationDisplay}
                        </td>
                        <td className="px-3 py-4 align-top text-[var(--color-text-muted)]">
                          {program!.datesDisplay || "—"}
                        </td>
                        <td className="px-3 py-4 align-top">{formatPriceDisplay(program!)}</td>
                        <td className="px-3 py-4 align-top">
                          <StatusSelect
                            value={item.status}
                            onChange={(status) => {
                              updateItem(item.programId, { status });
                              trackEvent("status_changed", { status });
                            }}
                          />
                        </td>
                        <td className="px-3 py-4 align-top">
                          <input
                            type="date"
                            value={item.deadline ?? ""}
                            onChange={(e) =>
                              updateItem(item.programId, {
                                deadline: e.target.value || null,
                              })
                            }
                            aria-label={`Deadline for ${program!.name}`}
                            className="block w-full rounded border border-[var(--color-border)] px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="px-3 py-4 align-top">
                          <textarea
                            value={item.notes}
                            onFocus={() => {
                              if (!state.notesPrivacyAcknowledged) {
                                acknowledgePrivacy();
                              }
                            }}
                            onChange={(e) =>
                              updateItem(item.programId, { notes: e.target.value })
                            }
                            placeholder="Add a note…"
                            rows={3}
                            className="min-h-[4.5rem] w-full resize-y rounded border border-[var(--color-border)] px-2.5 py-2 text-sm leading-relaxed"
                          />
                        </td>
                        <td className="px-3 py-4 align-top">
                          <button
                            type="button"
                            onClick={() =>
                              setRemoveTarget({ id: item.programId, name: program!.name })
                            }
                            className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(["researching", "deadline_noted", "applied", "accepted"] as const).map(
                  (column) => (
                    <div key={column} className="rounded-[var(--radius-md)] bg-[var(--color-parchment)] p-3">
                      <StatusBadge status={column} />
                      <ul className="mt-3 space-y-2">
                        {rows
                          .filter(({ item }) => item.status === column)
                          .map(({ item, program }) => (
                            <li
                              key={item.programId}
                              className="rounded border border-[var(--color-border)] bg-white p-3 text-sm"
                            >
                              <p className="font-medium text-[var(--color-navy)]">
                                {program!.name}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {formatPriceDisplay(program!)}
                              </p>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            )}

            {rows.length > 0 && (
              <p className="border-t border-[var(--color-border)] px-5 py-3 text-sm text-[var(--color-navy-light)]">
                <Link href="/compare">Compare saved programs →</Link>
              </p>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
