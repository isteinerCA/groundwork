"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useWorkspace } from "@/components/workspace/workspace-provider";

/** Show shortlist nav only when the user has saved programs or is signed in. */
export function ShortlistNavLink() {
  const { data: session } = useSession();
  const { hydrated, state } = useWorkspace();

  if (!hydrated) return null;

  const savedCount = state.shortlists.reduce(
    (total, list) => total + list.items.length,
    0,
  );

  if (!session?.user && savedCount === 0) return null;

  return (
    <Link
      href="/dashboard"
      className="hidden text-sm font-medium text-[var(--color-navy-dark)] no-underline hover:text-[var(--color-navy)] md:inline"
    >
      My shortlist
    </Link>
  );
}
