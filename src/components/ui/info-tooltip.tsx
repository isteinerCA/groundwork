"use client";

import { useId, useState } from "react";

export function InfoTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? tooltipId : undefined}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-navy-light)] hover:border-[var(--color-navy-light)] hover:text-[var(--color-navy)]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-xs leading-relaxed text-[var(--color-text)] shadow-[var(--shadow-card)]"
        >
          {children}
        </span>
      )}
    </span>
  );
}
