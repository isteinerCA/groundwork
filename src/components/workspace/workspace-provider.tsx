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
import type { ShortlistItem, WorkspaceState } from "@/lib/types/workspace";
import { trackEvent } from "@/lib/analytics";
import {
  acknowledgeNotesPrivacy,
  createShortlist,
  getActiveShortlist,
  isProgramSaved,
  loadWorkspace,
  removeFromShortlist,
  saveWorkspace,
  toggleSaveProgram,
  updateShortlistItem,
} from "@/lib/workspace/storage";

interface WorkspaceContextValue {
  state: WorkspaceState;
  activeShortlist: ReturnType<typeof getActiveShortlist>;
  isSaved: (programId: string) => boolean;
  toggleSave: (programId: string) => void;
  updateItem: (
    programId: string,
    patch: Partial<Pick<ShortlistItem, "status" | "deadline" | "notes">>,
  ) => void;
  removeItem: (programId: string) => void;
  addShortlist: (name: string) => void;
  setDisplayName: (name: string) => void;
  acknowledgePrivacy: () => void;
  hydrated: boolean;
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
      isSaved: (programId) => isProgramSaved(state, programId),
      toggleSave: (programId) =>
        persist((prev) => {
          const wasSaved = isProgramSaved(prev, programId);
          trackEvent(wasSaved ? "program_unsaved" : "program_saved");
          return toggleSaveProgram(prev, programId);
        }),
      updateItem: (programId, patch) =>
        persist((prev) => updateShortlistItem(prev, programId, patch)),
      removeItem: (programId) => persist((prev) => removeFromShortlist(prev, programId)),
      addShortlist: (name) => persist((prev) => createShortlist(prev, name)),
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
