import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { ButtonLink } from "@/components/ui/button-link";

const NAV = [
  { href: "/#categories", label: "Categories" },
  { href: "/#fine-print", label: "Fine print" },
  { href: "/#workspace", label: "Workspace" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-parchment)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 no-underline">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-navy)] text-sm font-semibold text-white"
            aria-hidden
          >
            G
          </span>
          <span className="font-serif text-xl text-[var(--color-navy)] group-hover:text-[var(--color-navy-light)]">
            Groundwork
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-[var(--color-text)] no-underline hover:text-[var(--color-navy)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <UserMenu />
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-[var(--color-text-muted)] no-underline hover:text-[var(--color-navy)] md:inline"
          >
            My shortlist
          </Link>
          <ButtonLink href="/search" className="px-4 py-2 text-sm">
            Start your shortlist
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
