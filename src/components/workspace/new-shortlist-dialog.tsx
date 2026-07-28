"use client";

import { useEffect, useState } from "react";
import { btnPrimary } from "@/components/ui/button-styles";
import {
  defaultArchiveShortlistName,
  uniqueShortlistName,
} from "@/lib/workspace/shortlist-names";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export function NewShortlistDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, activeShortlist, startNewShortlist, canWrite } = useWorkspace();
  const [archiveName, setArchiveName] = useState("");

  useEffect(() => {
    if (!open) return;
    const base = defaultArchiveShortlistName();
    setArchiveName(uniqueShortlistName(state, base));
  }, [open, state]);

  if (!open) return null;

  const hasItems = activeShortlist.items.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal
        aria-labelledby="new-shortlist-title"
        className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-xl"
      >
        <h2 id="new-shortlist-title" className="text-xl text-[var(--color-navy)]">
          Save current shortlist
        </h2>

        {hasItems ? (
          <>
            <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-amber)]/40 bg-[var(--color-amber-soft)]/60 px-4 py-3 text-sm text-[var(--color-navy)]">
              We&apos;ll keep your current list ({activeShortlist.items.length} program
              {activeShortlist.items.length === 1 ? "" : "s"}) under the name below, then open a
              blank shortlist for new picks.
            </p>
            <label className="mt-4 block text-sm font-medium text-[var(--color-navy)]">
              Name for this saved list
              <input
                type="text"
                value={archiveName}
                onChange={(e) => setArchiveName(e.target.value)}
                className="field-input mt-1"
              />
            </label>
          </>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Your current shortlist is empty — nothing to save yet.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {hasItems && (
            <button
              type="button"
              disabled={!canWrite || !archiveName.trim()}
              onClick={() => {
                startNewShortlist(archiveName.trim());
                onClose();
              }}
              className={`${btnPrimary} disabled:opacity-50`}
            >
              Save & start new
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text-muted)]"
          >
            {hasItems ? "Cancel" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
