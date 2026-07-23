import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { WorkspaceState } from "@/lib/types/workspace";
import { DEFAULT_WORKSPACE } from "@/lib/types/workspace";

function workspacePath(email: string): string {
  const safe = Buffer.from(email.toLowerCase()).toString("base64url");
  return path.join(process.cwd(), "data", "workspaces", `${safe}.json`);
}

export async function loadServerWorkspace(email: string): Promise<WorkspaceState | null> {
  try {
    const raw = await readFile(workspacePath(email), "utf-8");
    return JSON.parse(raw) as WorkspaceState;
  } catch {
    return null;
  }
}

export async function saveServerWorkspace(
  email: string,
  state: WorkspaceState,
): Promise<void> {
  const filePath = workspacePath(email);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(state, null, 2), "utf-8");
}

export function mergeWorkspace(
  local: WorkspaceState,
  remote: WorkspaceState | null,
): WorkspaceState {
  if (!remote) return local;
  if (local.shortlists.every((s) => s.items.length === 0)) return remote;
  return local;
}

export { DEFAULT_WORKSPACE };
