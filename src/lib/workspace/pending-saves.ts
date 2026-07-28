const PENDING_SAVE_KEY = "groundwork_pending_saves_v1";

export function queuePendingSaves(programIds: string[]): void {
  if (typeof window === "undefined" || programIds.length === 0) return;
  try {
    const existing = readPendingSaves();
    const merged = [...new Set([...existing, ...programIds])];
    localStorage.setItem(PENDING_SAVE_KEY, JSON.stringify(merged));
  } catch {
    // Quota or private mode — ignore.
  }
}

export function readPendingSaves(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_SAVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function clearPendingSaves(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_SAVE_KEY);
  } catch {
    // ignore
  }
}
