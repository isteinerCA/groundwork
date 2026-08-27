"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { GroundworkLogo } from "@/components/layout/groundwork-logo";
import { MobileNavMenuButton, MobileNavPanel } from "@/components/layout/mobile-nav-menu";
import { WorkspaceNavLink } from "@/components/layout/workspace-nav-link";
import { ButtonLink } from "@/components/ui/button-link";
import { SITE_NAV_LINKS } from "@/lib/constants/site-nav";

export function SiteHeader({ logoPriority = false }: { logoPriority?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-parchment)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-3">
          <GroundworkLogo priority={logoPriority} className="shrink-0" />

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
            <Show when="signed-out">
              <SignInButton
                forceRedirectUrl="/workspace"
                fallbackRedirectUrl="/workspace"
                signUpForceRedirectUrl="/workspace"
                signUpFallbackRedirectUrl="/workspace"
              >
                <button type="button" className="btn btn-ghost px-3 py-2 text-sm font-medium">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton
                forceRedirectUrl="/workspace"
                fallbackRedirectUrl="/workspace"
                signInForceRedirectUrl="/workspace"
                signInFallbackRedirectUrl="/workspace"
              >
                <button type="button" className="btn btn-secondary px-3 py-2 text-sm">
                  Sign up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <ButtonLink href="/search" className="px-3 py-2 text-sm sm:px-4">
              Start your shortlist
            </ButtonLink>
            <MobileNavMenuButton open={menuOpen} panelId={panelId} onToggle={toggleMenu} />
          </div>
        </div>

        <MobileNavPanel open={menuOpen} panelId={panelId} onClose={closeMenu} />
      </div>
    </header>
  );
}
