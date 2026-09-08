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
import { useAuth } from "@clerk/nextjs";
import type { Shortlist, ShortlistItem, WorkspaceState } from "@/lib/types/workspace";
import { DEFAULT_WORKSPACE } from "@/lib/types/workspace";
import { trackEvent } from "@/lib/analytics";
import {
  clearPendingSaves,
  readPendingSaves,
} from "@/lib/workspace/pending-saves";
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
  setActiveShortlist,
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
  setActiveShortlist: (shortlistId: string) => boolean;
  setDisplayName: (name: string) => void;
  acknowledgePrivacy: () => void;
  hydrated: boolean;
  canWrite: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [state, setState] = useState<WorkspaceState>(DEFAULT_WORKSPACE);
  const [hydrated, setHydrated] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const canWrite = Boolean(isSignedIn && userId);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setState(DEFAULT_WORKSPACE);
      setOwnerId(null);
      setHydrated(true);
      return;
    }
    setState(loadWorkspace(userId));
    setOwnerId(userId);
    setHydrated(true);
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    if (!hydrated || !ownerId || ownerId !== userId) return;
    saveWorkspace(userId, state);
  }, [state, hydrated, ownerId, userId]);

  // Apply hearts queued while signed out (e.g. save-gate → sign up).
  useEffect(() => {
    if (!hydrated || !isLoaded || !isSignedIn || !userId) return;
    const pending = readPendingSaves();
    if (pending.length === 0) return;
    clearPendingSaves();
    setState((prev) => {
      const next = saveProgramsToShortlist(prev, pending);
      const added = pending.filter(
        (id) =>
          !isProgramSavedInActiveShortlist(prev, id) &&
          isProgramSavedInActiveShortlist(next, id),
      ).length;
      if (added > 0) trackEvent("programs_bulk_saved", { count: added, source: "pending_auth" });
      return next;
    });
  }, [hydrated, isLoaded, isSignedIn, userId]);

  const persist = useCallback((updater: (prev: WorkspaceState) => WorkspaceState) => {
    setState(updater);
  }, []);

  const guardWrite = useCallback((): boolean => {
    if (!isLoaded) return false;
    return canWrite;
  }, [canWrite, isLoaded]);

  const value = useMemo<WorkspaceContextValue>(() => {
    const activeShortlist = getActiveShortlist(state);
    return {
      state,
      activeShortlist,
      hydrated,
      canWrite,
      isSaved: (programId) => isProgramSaved(state, programId),
      isSavedInActive: (programId) => isProgramSavedInActiveShortlist(state, programId),
      getShortlistsForProgram: (programId) => getShortlistsContainingProgram(state, programId),
      toggleSave: (programId) => {
        if (!guardWrite()) return false;
        persist((prev) => {
          const wasSaved = isProgramSavedInActiveShortlist(prev, programId);
          trackEvent(wasSaved ? "program_unsaved" : "program_saved");
          return toggleSaveProgram(prev, programId);
        });
        return true;
      },
      savePrograms: (programIds) => {
        if (!guardWrite()) return false;
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
        if (!guardWrite()) return false;
        persist((prev) => updateShortlistItem(prev, programId, patch));
        return true;
      },
      removeItem: (programId) => {
        if (!guardWrite()) return false;
        persist((prev) => removeFromShortlist(prev, programId));
        return true;
      },
      addShortlist: (name) => {
        if (!guardWrite()) return false;
        persist((prev) => createShortlist(prev, name));
        return true;
      },
      startNewShortlist: (archiveName) => {
        if (!guardWrite()) return false;
        persist((prev) => {
          const active = getActiveShortlist(prev);
          if (active.items.length === 0) return prev;
          if (!archiveName.trim()) return prev;
          return archiveActiveAndStartNew(prev, archiveName.trim());
        });
        return true;
      },
      renameShortlist: (shortlistId, name) => {
        if (!guardWrite()) return false;
        persist((prev) => renameShortlist(prev, shortlistId, name));
        return true;
      },
      setActiveShortlist: (shortlistId) => {
        if (!guardWrite()) return false;
        persist((prev) => setActiveShortlist(prev, shortlistId));
        return true;
      },
      setDisplayName: (name) => {
        if (!guardWrite()) return;
        persist((prev) => ({ ...prev, displayName: name }));
      },
      acknowledgePrivacy: () => {
        if (!guardWrite()) return;
        persist((prev) => acknowledgeNotesPrivacy(prev));
      },
    };
  }, [state, hydrated, canWrite, guardWrite, persist]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
