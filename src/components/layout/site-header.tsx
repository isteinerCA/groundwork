"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { ExploreSummerLogo } from "@/components/layout/explore-summer-logo";
import { MobileNavMenuButton, MobileNavPanel } from "@/components/layout/mobile-nav-menu";
import { WorkspaceNavLink } from "@/components/layout/workspace-nav-link";
import { ButtonLink } from "@/components/ui/button-link";
import { SITE_NAV_LINKS } from "@/lib/constants/site-nav";

function HeaderAuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="/sign-in"
        className="btn btn-ghost px-3 py-2 text-sm font-medium"
        onClick={onNavigate}
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="btn btn-secondary px-3 py-2 text-sm"
        onClick={onNavigate}
      >
        Sign up
      </Link>
    </>
  );
}

export function SiteHeader({ logoPriority = false }: { logoPriority?: boolean }) {
  const { isSignedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-parchment)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-3">
          <ExploreSummerLogo priority={logoPriority} className="shrink-0" />

          <nav className="hidden items-center gap-5 text-sm lg:flex">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <WorkspaceNavLink />
            {isSignedIn ? <UserButton /> : <HeaderAuthLinks />}
            <ButtonLink href="/search" className="px-3 py-2 text-sm sm:px-4">
              Start your shortlist
            </ButtonLink>
            <MobileNavMenuButton open={menuOpen} panelId={panelId} onToggle={toggleMenu} />
          </div>
        </div>

        <MobileNavPanel open={menuOpen} panelId={panelId} onClose={closeMenu}>
          {!isSignedIn && (
            <div className="mb-3 flex flex-wrap gap-2">
              <HeaderAuthLinks onNavigate={closeMenu} />
            </div>
          )}
        </MobileNavPanel>
      </div>
    </header>
  );
}
