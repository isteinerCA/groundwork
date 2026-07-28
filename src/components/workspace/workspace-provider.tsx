"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Shortlist, ShortlistItem, WorkspaceState } from "@/lib/types/workspace";
import { trackEvent } from "@/lib/analytics";
import {
  acknowledgeNotesPrivacy,
  archiveActiveAndStartNew,
  createShortlist,
  getActiveShortlist,
  getShortlistsContainingProgram,
  isProgramSaved,
  isProgramSavedInActiveShortlist,
  loadWorkspace,
  removeFromShortlist,
  renameShortlist,
  saveProgramsToShortlist,
  saveWorkspace,
  toggleSaveProgram,
  updateShortlistItem,
} from "@/lib/workspace/storage";

interface WorkspaceContextValue {
  state: WorkspaceState;
  activeShortlist: ReturnType<typeof getActiveShortlist>;
  isSaved: (programId: string) => boolean;
  isSavedInActive: (programId: string) => boolean;
  getShortlistsForProgram: (programId: string) => Shortlist[];
  toggleSave: (programId: string) => boolean;
  savePrograms: (programIds: string[]) => boolean;
  updateItem: (
    programId: string,
    patch: Partial<Pick<ShortlistItem, "status" | "deadline" | "notes">>,
  ) => boolean;
  removeItem: (programId: string) => boolean;
  addShortlist: (name: string) => boolean;
  startNewShortlist: (archiveName: string) => boolean;
  renameShortlist: (shortlistId: string, name: string) => boolean;
  setDisplayName: (name: string) => void;
  acknowledgePrivacy: () => void;
  hydrated: boolean;
  canWrite: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(() => DEFAULT_FALLBACK);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadWorkspace());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWorkspace(state);
  }, [state, hydrated]);

  const persist = useCallback((updater: (prev: WorkspaceState) => WorkspaceState) => {
    setState(updater);
  }, []);

  const value = useMemo<WorkspaceContextValue>(() => {
    const activeShortlist = getActiveShortlist(state);
    return {
      state,
      activeShortlist,
      hydrated,
      canWrite: true,
      isSaved: (programId) => isProgramSaved(state, programId),
      isSavedInActive: (programId) => isProgramSavedInActiveShortlist(state, programId),
      getShortlistsForProgram: (programId) => getShortlistsContainingProgram(state, programId),
      toggleSave: (programId) => {
        persist((prev) => {
          const wasSaved = isProgramSavedInActiveShortlist(prev, programId);
          trackEvent(wasSaved ? "program_unsaved" : "program_saved");
          return toggleSaveProgram(prev, programId);
        });
        return true;
      },
      savePrograms: (programIds) => {
        const unique = [...new Set(programIds)];
        persist((prev) => {
          const before = unique.filter((id) =>
            isProgramSavedInActiveShortlist(prev, id),
          ).length;
          const next = saveProgramsToShortlist(prev, unique);
          const after = unique.filter((id) => isProgramSavedInActiveShortlist(next, id)).length;
          const added = after - before;
          if (added > 0) trackEvent("programs_bulk_saved", { count: added });
          return next;
        });
        return true;
      },
      updateItem: (programId, patch) => {
        persist((prev) => updateShortlistItem(prev, programId, patch));
        return true;
      },
      removeItem: (programId) => {
        persist((prev) => removeFromShortlist(prev, programId));
        return true;
      },
      addShortlist: (name) => {
        persist((prev) => createShortlist(prev, name));
        return true;
      },
      startNewShortlist: (archiveName) => {
        persist((prev) => {
          const active = getActiveShortlist(prev);
          if (active.items.length === 0) return prev;
          if (!archiveName.trim()) return prev;
          return archiveActiveAndStartNew(prev, archiveName.trim());
        });
        return true;
      },
      renameShortlist: (shortlistId, name) => {
        persist((prev) => renameShortlist(prev, shortlistId, name));
        return true;
      },
      setDisplayName: (name) => persist((prev) => ({ ...prev, displayName: name })),
      acknowledgePrivacy: () => persist((prev) => acknowledgeNotesPrivacy(prev)),
    };
  }, [state, hydrated, persist]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

const DEFAULT_FALLBACK = loadWorkspace();

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
