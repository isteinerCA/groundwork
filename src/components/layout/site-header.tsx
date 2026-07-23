import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { GroundworkLogo } from "@/components/layout/groundwork-logo";
import { ShortlistNavLink } from "@/components/layout/shortlist-nav-link";
import { ButtonLink } from "@/components/ui/button-link";

const NAV = [
  { href: "/#categories", label: "Categories" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export function SiteHeader({ logoPriority = false }: { logoPriority?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-parchment)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <GroundworkLogo priority={logoPriority} className="shrink-0" />

        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-[var(--color-navy-dark)] no-underline hover:text-[var(--color-navy)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <UserMenu />
          <ShortlistNavLink />
          <ButtonLink href="/search" className="px-4 py-2 text-sm">
            Start your shortlist
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
