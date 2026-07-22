import type { Program } from "@/lib/types/program";
import type { ShortlistItem, WorkspaceState } from "@/lib/types/workspace";
import { getActiveShortlist } from "@/lib/workspace/storage";

export interface WorkspaceStats {
  savedCount: number;
  upcomingDeadlines: number;
  applicationsStarted: number;
  offersReceived: number;
}

export function computeWorkspaceStats(state: WorkspaceState): WorkspaceStats {
  const items = getActiveShortlist(state).items;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let upcomingDeadlines = 0;
  let applicationsStarted = 0;
  let offersReceived = 0;

  for (const item of items) {
    if (item.deadline) {
      const d = new Date(item.deadline);
      if (!Number.isNaN(d.getTime()) && d >= now) upcomingDeadlines++;
    }
    if (item.status === "applied" || item.status === "waitlisted") applicationsStarted++;
    if (item.status === "accepted") offersReceived++;
  }

  return {
    savedCount: items.length,
    upcomingDeadlines,
    applicationsStarted,
    offersReceived,
  };
}

export interface DeadlineEntry {
  programId: string;
  programName: string;
  deadline: string;
  daysUntil: number;
}

export function getUpcomingDeadlines(
  items: ShortlistItem[],
  programsById: Map<string, Program>,
  limit = 5,
): DeadlineEntry[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return items
    .filter((item) => item.deadline)
    .map((item) => {
      const deadline = item.deadline!;
      const date = new Date(deadline);
      const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        programId: item.programId,
        programName: programsById.get(item.programId)?.name ?? "Unknown program",
        deadline,
        daysUntil,
      };
    })
    .filter((e) => e.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, limit);
}

export interface NoteEntry {
  programId: string;
  programName: string;
  preview: string;
  savedAt: string;
}

export function getRecentNotes(
  items: ShortlistItem[],
  programsById: Map<string, Program>,
  limit = 3,
): NoteEntry[] {
  return items
    .filter((item) => item.notes.trim().length > 0)
    .map((item) => ({
      programId: item.programId,
      programName: programsById.get(item.programId)?.name ?? "Unknown program",
      preview: item.notes.trim().slice(0, 80),
      savedAt: item.savedAt,
    }))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, limit);
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
