import type { Shortlist, ShortlistItem, WorkspaceState } from "@/lib/types/workspace";
import { DEFAULT_WORKSPACE } from "@/lib/types/workspace";

const STORAGE_KEY = "groundwork_workspace_v1";

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadWorkspace(): WorkspaceState {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORKSPACE;
    const parsed = JSON.parse(raw) as WorkspaceState;
    if (!parsed.shortlists?.length) return DEFAULT_WORKSPACE;
    return parsed;
  } catch {
    return DEFAULT_WORKSPACE;
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private mode — ignore.
  }
}

export function getActiveShortlist(state: WorkspaceState): Shortlist {
  return (
    state.shortlists.find((s) => s.id === state.activeShortlistId) ??
    state.shortlists[0]!
  );
}

export function isProgramSaved(state: WorkspaceState, programId: string): boolean {
  return getShortlistsContainingProgram(state, programId).length > 0;
}

export function isProgramSavedInActiveShortlist(
  state: WorkspaceState,
  programId: string,
): boolean {
  return getActiveShortlist(state).items.some((item) => item.programId === programId);
}

export function getShortlistsContainingProgram(
  state: WorkspaceState,
  programId: string,
): Shortlist[] {
  return state.shortlists.filter((list) =>
    list.items.some((item) => item.programId === programId),
  );
}

export function saveProgramsToShortlist(
  state: WorkspaceState,
  programIds: string[],
): WorkspaceState {
  const list = getActiveShortlist(state);
  const existing = new Set(list.items.map((item) => item.programId));
  const toAdd = programIds.filter((id) => !existing.has(id));
  if (toAdd.length === 0) return state;

  const nextItems = [
    ...list.items,
    ...toAdd.map((programId) => ({
      programId,
      status: "researching" as const,
      deadline: null,
      notes: "",
      savedAt: new Date().toISOString(),
    })),
  ];

  return {
    ...state,
    shortlists: state.shortlists.map((s) =>
      s.id === list.id ? { ...s, items: nextItems } : s,
    ),
  };
}

export function toggleSaveProgram(
  state: WorkspaceState,
  programId: string,
): WorkspaceState {
  const list = getActiveShortlist(state);
  const exists = list.items.some((i) => i.programId === programId);

  const nextItems = exists
    ? list.items.filter((i) => i.programId !== programId)
    : [
        ...list.items,
        {
          programId,
          status: "researching" as const,
          deadline: null,
          notes: "",
          savedAt: new Date().toISOString(),
        },
      ];

  return {
    ...state,
    shortlists: state.shortlists.map((s) =>
      s.id === list.id ? { ...s, items: nextItems } : s,
    ),
  };
}

export function updateShortlistItem(
  state: WorkspaceState,
  programId: string,
  patch: Partial<Pick<ShortlistItem, "status" | "deadline" | "notes">>,
): WorkspaceState {
  const list = getActiveShortlist(state);
  return {
    ...state,
    shortlists: state.shortlists.map((s) =>
      s.id === list.id
        ? {
            ...s,
            items: s.items.map((item) =>
              item.programId === programId ? { ...item, ...patch } : item,
            ),
          }
        : s,
    ),
  };
}

export function removeFromShortlist(
  state: WorkspaceState,
  programId: string,
  shortlistId?: string,
): WorkspaceState {
  const targetId = shortlistId ?? state.activeShortlistId;
  return {
    ...state,
    shortlists: state.shortlists.map((s) =>
      s.id === targetId
        ? { ...s, items: s.items.filter((i) => i.programId !== programId) }
        : s,
    ),
  };
}

export function createShortlist(state: WorkspaceState, name: string): WorkspaceState {
  const id = newId();
  return {
    ...state,
    activeShortlistId: id,
    shortlists: [
      ...state.shortlists,
      { id, name, createdAt: new Date().toISOString(), items: [] },
    ],
  };
}

/** Archive the active shortlist under `archiveName`, then start a fresh empty list. */
export function archiveActiveAndStartNew(
  state: WorkspaceState,
  archiveName: string,
): WorkspaceState {
  const active = getActiveShortlist(state);
  const newActiveId = newId();

  let shortlists = state.shortlists.map((s) =>
    s.id === active.id && active.items.length > 0 ? { ...s, name: archiveName } : s,
  );

  shortlists = [
    ...shortlists,
    {
      id: newActiveId,
      name: "My Shortlist",
      createdAt: new Date().toISOString(),
      items: [],
    },
  ];

  return { ...state, shortlists, activeShortlistId: newActiveId };
}

export function renameShortlist(
  state: WorkspaceState,
  shortlistId: string,
  name: string,
): WorkspaceState {
  const trimmed = name.trim();
  if (!trimmed) return state;
  return {
    ...state,
    shortlists: state.shortlists.map((s) =>
      s.id === shortlistId ? { ...s, name: trimmed } : s,
    ),
  };
}

export function acknowledgeNotesPrivacy(state: WorkspaceState): WorkspaceState {
  return { ...state, notesPrivacyAcknowledged: true };
}
