import Link from "next/link";
import { SITE_NAV_LINKS } from "@/lib/constants/site-nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {SITE_NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-[var(--color-navy-dark)] no-underline hover:text-[var(--color-navy)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Groundwork · Summer Programs Explorer
        </p>
      </div>
    </footer>
  );
}
