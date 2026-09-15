"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { SaveGateModal } from "@/components/auth/save-gate-modal";
import { queuePendingSaves } from "@/lib/workspace/pending-saves";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export function ProgramSaveButton({
  programId,
  preview = false,
  compact = false,
  onSaved,
}: {
  programId: string;
  preview?: boolean;
  compact?: boolean;
  onSaved?: () => void;
}) {
  const { isSignedIn } = useAuth();
  const { isSavedInActive, activeShortlist, toggleSave, hydrated } = useWorkspace();
  const [gateOpen, setGateOpen] = useState(false);
  const savedInActive = hydrated && isSavedInActive(programId);

  const handleSaveClick = () => {
    if (!isSignedIn) {
      queuePendingSaves([programId]);
      setGateOpen(true);
      return;
    }
    const wasSaved = savedInActive;
    const ok = toggleSave(programId);
    if (ok && !wasSaved) onSaved?.();
  };

  if (preview) return null;

  return (
    <>
      <SaveGateModal open={gateOpen} mode="signin" onClose={() => setGateOpen(false)} />
      <button
        type="button"
        onClick={handleSaveClick}
        aria-pressed={savedInActive}
        aria-label={
          savedInActive
            ? `Remove from ${activeShortlist.name}`
            : `Save to ${activeShortlist.name}`
        }
        title={
          savedInActive
            ? `Saved to ${activeShortlist.name} — open workspace`
            : `Save to ${activeShortlist.name}`
        }
        className={`shrink-0 rounded-full border leading-none transition ${
          compact ? "p-1.5 text-base" : "p-2 text-lg"
        } ${
          savedInActive
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-red-200 hover:text-red-500"
        }`}
      >
        {savedInActive ? "♥" : "♡"}
      </button>
    </>
  );
}
