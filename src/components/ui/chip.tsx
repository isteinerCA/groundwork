"use client";

import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: "default" | "green" | "amber" | "red";
  disabled?: boolean;
  compact?: boolean;
}

const variantClasses = {
  default: "border-[var(--color-border)] text-[var(--color-text)]",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-900",
};

export function Chip({
  label,
  selected,
  onClick,
  variant = "default",
  disabled,
  compact,
}: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border transition-colors",
        compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        selected
          ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
          : variantClasses[variant],
        disabled && "cursor-not-allowed opacity-50",
        !disabled && !selected && "hover:border-[var(--color-navy-light)]",
      )}
    >
      {label}
    </button>
  );
}
