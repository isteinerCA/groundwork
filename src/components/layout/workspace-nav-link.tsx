"use client";

import Link from "next/link";
import { useWorkspace } from "@/components/workspace/workspace-provider";

/** Show workspace nav when the user has saved programs. */
export function WorkspaceNavLink() {
  const { hydrated, state } = useWorkspace();

  if (!hydrated) return null;

  const savedCount = state.shortlists.reduce(
    (total, list) => total + list.items.length,
    0,
  );

  if (savedCount === 0) return null;

  return (
    <Link
      href="/workspace"
      className="hidden text-sm font-medium text-[var(--color-navy-dark)] no-underline hover:text-[var(--color-navy)] md:inline"
    >
      Workspace
    </Link>
  );
}
