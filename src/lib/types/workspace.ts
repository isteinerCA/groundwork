export const SHORTLIST_STATUSES = [
  { id: "researching", label: "Researching", color: "blue" },
  { id: "deadline_noted", label: "Deadline Noted", color: "amber" },
  { id: "applied", label: "Applied", color: "purple" },
  { id: "waitlisted", label: "Waitlisted", color: "gray" },
  { id: "accepted", label: "Accepted", color: "green" },
  { id: "declined", label: "Declined", color: "red" },
] as const;

export type ShortlistItemStatus = (typeof SHORTLIST_STATUSES)[number]["id"];

export interface ShortlistItem {
  programId: string;
  status: ShortlistItemStatus;
  /** ISO date string (YYYY-MM-DD) or null */
  deadline: string | null;
  notes: string;
  savedAt: string;
}

export interface Shortlist {
  id: string;
  name: string;
  items: ShortlistItem[];
  createdAt: string;
}

export interface WorkspaceState {
  displayName: string;
  activeShortlistId: string;
  shortlists: Shortlist[];
  /** Shown once before first note entry; auth sprint will replace with server flag */
  notesPrivacyAcknowledged: boolean;
}

export const DEFAULT_WORKSPACE: WorkspaceState = {
  displayName: "Isabelle",
  activeShortlistId: "default",
  notesPrivacyAcknowledged: false,
  shortlists: [
    {
      id: "default",
      name: "My Shortlist",
      createdAt: new Date().toISOString(),
      items: [],
    },
  ],
};

export type SharePayload = {
  name: string;
  exportedAt: string;
  items: ShortlistItem[];
};
