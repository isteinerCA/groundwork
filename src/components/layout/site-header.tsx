import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { GroundworkLogo } from "@/components/layout/groundwork-logo";
import { WorkspaceNavLink } from "@/components/layout/workspace-nav-link";
import { ButtonLink } from "@/components/ui/button-link";

const NAV = [
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/pricing", label: "Pricing" },
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
          <WorkspaceNavLink />
          <Show when="signed-out">
            <SignInButton
              forceRedirectUrl="/workspace"
              fallbackRedirectUrl="/workspace"
              signUpForceRedirectUrl="/workspace"
              signUpFallbackRedirectUrl="/workspace"
            >
              <button
                type="button"
                className="btn btn-ghost px-3 py-2 text-sm font-medium"
              >
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
          <ButtonLink href="/search" className="px-4 py-2 text-sm">
            Start your shortlist
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
