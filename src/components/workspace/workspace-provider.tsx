"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { ShortlistItem, WorkspaceState } from "@/lib/types/workspace";
import { trackEvent } from "@/lib/analytics";
import { mergeWorkspace } from "@/lib/workspace/merge";
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
  toggleSave: (programId: string) => boolean;
  updateItem: (
    programId: string,
    patch: Partial<Pick<ShortlistItem, "status" | "deadline" | "notes">>,
  ) => boolean;
  removeItem: (programId: string) => boolean;
  addShortlist: (name: string) => boolean;
  setDisplayName: (name: string) => void;
  acknowledgePrivacy: () => void;
  hydrated: boolean;
  canWrite: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<WorkspaceState>(() => DEFAULT_FALLBACK);
  const [hydrated, setHydrated] = useState(false);
  const syncedRef = useRef(false);

  const canWrite = Boolean(session?.user?.seasonPassActive);

  useEffect(() => {
    setState(loadWorkspace());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWorkspace(state);
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated || !canWrite || syncedRef.current) return;

    void fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.workspace) {
          setState((prev) => mergeWorkspace(prev, data.workspace));
        }
        syncedRef.current = true;
      })
      .catch(() => {
        syncedRef.current = true;
      });
  }, [hydrated, canWrite]);

  useEffect(() => {
    if (!hydrated || !canWrite || !syncedRef.current) return;

    const timer = setTimeout(() => {
      void fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace: state }),
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [state, hydrated, canWrite]);

  const persist = useCallback((updater: (prev: WorkspaceState) => WorkspaceState) => {
    setState(updater);
  }, []);

  const guardWrite = useCallback((): boolean => {
    if (status === "loading") return false;
    return canWrite;
  }, [canWrite, status]);

  const value = useMemo<WorkspaceContextValue>(() => {
    const activeShortlist = getActiveShortlist(state);
    return {
      state,
      activeShortlist,
      hydrated,
      canWrite,
      isSaved: (programId) => isProgramSaved(state, programId),
      toggleSave: (programId) => {
        if (!guardWrite()) return false;
        persist((prev) => {
          const wasSaved = isProgramSaved(prev, programId);
          trackEvent(wasSaved ? "program_unsaved" : "program_saved");
          return toggleSaveProgram(prev, programId);
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
      setDisplayName: (name) => persist((prev) => ({ ...prev, displayName: name })),
      acknowledgePrivacy: () => persist((prev) => acknowledgeNotesPrivacy(prev)),
    };
  }, [state, hydrated, canWrite, guardWrite, persist]);

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
