"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn(
        "shrink-0 text-[var(--color-text-muted)] transition-transform",
        open && "rotate-90",
      )}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CollapsibleFilterGroup({
  title,
  activeCount,
  headerExtra,
  children,
}: {
  title: string;
  activeCount: number;
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const isOpen = activeCount > 0 || manualOpen;

  return (
    <div className="border-t border-[var(--color-border)] pt-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-sm)] py-0.5 text-left hover:text-[var(--color-navy)]"
          aria-expanded={isOpen}
          onClick={() => {
            if (activeCount > 0) return;
            setManualOpen((open) => !open);
          }}
        >
          <ChevronIcon open={isOpen} />
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {title}
            {activeCount > 0 && (
              <span className="ml-1.5 font-semibold text-[var(--color-navy)]">· {activeCount}</span>
            )}
          </span>
        </button>
        {headerExtra}
      </div>
      {isOpen && <div className="mt-2 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
