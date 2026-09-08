import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-json-ld";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-muted)]">
      <ol className="flex flex-wrap items-center gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex min-w-0 items-center">
              {index > 0 && (
                <span className="mx-2 shrink-0" aria-hidden>
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-[var(--color-text-muted)]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="font-medium text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
