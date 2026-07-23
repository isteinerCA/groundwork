import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "primary-on-dark";

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-navy)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--color-navy-light)] hover:text-white",
  secondary:
    "border-2 border-[var(--color-navy)] bg-white text-[var(--color-navy)] hover:bg-[var(--color-parchment-dark)] hover:text-[var(--color-navy)]",
  ghost:
    "text-[var(--color-navy-light)] hover:bg-[var(--color-parchment-dark)] hover:text-[var(--color-navy)]",
  "primary-on-dark":
    "bg-white text-[var(--color-navy)] shadow-md hover:bg-[var(--color-parchment)] hover:text-[var(--color-navy)]",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-md)] px-6 py-3 text-sm font-semibold no-underline transition-colors",
        styles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SectionEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold tracking-[0.14em] text-[var(--color-amber)] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
