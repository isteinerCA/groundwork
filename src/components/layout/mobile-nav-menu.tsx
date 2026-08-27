"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SITE_NAV_LINKS } from "@/lib/constants/site-nav";
import { cn } from "@/lib/utils";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="text-[var(--color-navy-dark)]"
    >
      {open ? (
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d="M3 5.5h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M3 10h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M3 14.5h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function MobileNavMenuButton({
  open,
  panelId,
  onToggle,
}: {
  open: boolean;
  panelId: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-navy-dark)] transition hover:bg-[var(--color-parchment-dark)] lg:hidden"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onToggle}
    >
      <MenuIcon open={open} />
    </button>
  );
}

export function MobileNavPanel({
  open,
  panelId,
  onClose,
}: {
  open: boolean;
  panelId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <nav
      id={panelId}
      className={cn(
        "border-t border-[var(--color-border)] bg-[var(--color-parchment)] px-4 py-3 lg:hidden",
        !open && "hidden",
      )}
    >
      <ul className="flex flex-col gap-1">
        {SITE_NAV_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--color-navy-dark)] no-underline hover:bg-[var(--color-parchment-dark)] hover:text-[var(--color-navy)]"
              onClick={onClose}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
