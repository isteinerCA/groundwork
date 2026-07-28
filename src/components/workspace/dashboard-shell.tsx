"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GroundworkLogo } from "@/components/layout/groundwork-logo";
import { ValueBanner } from "@/components/marketing/value-banner";
import { NewShortlistDialog } from "@/components/workspace/new-shortlist-dialog";
import { useWorkspace } from "@/components/workspace/workspace-provider";

const NAV = [
  { href: "/workspace", label: "My shortlist", icon: "♡" },
  { href: "/search", label: "Search Programs", icon: "⌕" },
  { href: "/compare", label: "Compare", icon: "⇔" },
  { href: "/calendar", label: "Calendar", icon: "◷" },
  { href: "/notes", label: "Notes", icon: "✎" },
] as const;

export function DashboardShell({
  children,
  showBanner = false,
}: {
  children: ReactNode;
  showBanner?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setActiveShortlist } = useWorkspace();
  const [newListOpen, setNewListOpen] = useState(false);

  const shortlists = [...state.shortlists].sort((a, b) => {
    if (a.id === state.activeShortlistId) return -1;
    if (b.id === state.activeShortlistId) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      <NewShortlistDialog open={newListOpen} onClose={() => setNewListOpen(false)} />
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 lg:block">
          <GroundworkLogo subtitle="Summer Programs Explorer" imageClassName="h-8" />

          <nav className="mt-8 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm no-underline",
                    active
                      ? "bg-[var(--color-parchment-dark)] font-medium text-[var(--color-navy)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-parchment)] hover:text-[var(--color-navy)]",
                  )}
                >
                  <span aria-hidden className="w-4 text-center opacity-70">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">
            <p className="px-3 text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
              Your shortlists
            </p>
            <div className="mt-2 space-y-1">
              {shortlists.map((list) => {
                const isActive = list.id === state.activeShortlistId;
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      setActiveShortlist(list.id);
                      if (pathname !== "/workspace") router.push("/workspace");
                    }}
                    className={cn(
                      "flex w-full items-start justify-between gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm",
                      isActive
                        ? "bg-[var(--color-parchment-dark)] font-medium text-[var(--color-navy)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-parchment)] hover:text-[var(--color-navy)]",
                    )}
                  >
                    <span className="min-w-0 truncate">{list.name}</span>
                    <span className="shrink-0 text-xs tabular-nums opacity-70">
                      {list.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <p className="px-3 text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
              Shortlist actions
            </p>
            <div className="mt-2 space-y-1">
              <Link
                href="/search"
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-navy)] no-underline hover:bg-[var(--color-parchment)]"
              >
                <span aria-hidden className="w-4 text-center opacity-70">
                  ↺
                </span>
                Refine search
              </Link>
              <button
                type="button"
                onClick={() => setNewListOpen(true)}
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-parchment)] hover:text-[var(--color-navy)]"
              >
                <span aria-hidden className="w-4 text-center opacity-70">
                  +
                </span>
                Save & start new
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {showBanner && <ValueBanner />}
    </div>
  );
}
