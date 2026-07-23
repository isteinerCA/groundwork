import type { WorkspaceState } from "@/lib/types/workspace";

/** Merge local and server workspace — prefer local when user already has items. */
export function mergeWorkspace(
  local: WorkspaceState,
  remote: WorkspaceState | null,
): WorkspaceState {
  if (!remote) return local;
  if (local.shortlists.every((s) => s.items.length === 0)) return remote;
  return local;
}
