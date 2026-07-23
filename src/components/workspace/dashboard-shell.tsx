"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ValueBanner } from "@/components/marketing/value-banner";
import { NewShortlistDialog } from "@/components/workspace/new-shortlist-dialog";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/search", label: "Search Programs", icon: "⌕" },
  { href: "/dashboard", label: "My Shortlist", icon: "♡" },
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
  const [newListOpen, setNewListOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      <NewShortlistDialog open={newListOpen} onClose={() => setNewListOpen(false)} />
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 lg:block">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-navy)] text-sm text-white">
              G
            </span>
            <div>
              <p className="font-serif text-lg text-[var(--color-navy)]">Groundwork</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Summer Programs Explorer</p>
            </div>
          </Link>

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
                Start new shortlist
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
