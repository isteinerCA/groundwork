import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { summarizeSearchFilters, type EventProps } from "@/lib/analytics";
import { redactPii } from "@/lib/search/redact-pii";
import type { SearchFilters } from "@/lib/types/program";

const LOG_DIR = path.join(process.cwd(), "data", "chat-logs");
const LOG_FILE = path.join(LOG_DIR, "chat.jsonl");
const MAX_MESSAGE = 500;
const MAX_NOTE = 200;
const DEFAULT_READ_LIMIT = 200;

export interface ChatLogRecord {
  timestamp: string;
  message: string;
  messageHash: string;
  clearAll: boolean;
  hadPatch: boolean;
  patchKeys: string[];
  applied: string;
  unexpressible: string;
  error: boolean;
  errorKind: string;
  resultCount: number;
  filterSummary: EventProps;
}

function hashMessage(message: string): string {
  return createHash("sha256").update(message.toLowerCase()).digest("hex").slice(0, 16);
}

export function buildChatLogRecord(event: {
  rawText: string;
  filters: SearchFilters;
  resultCount: number;
  clearAll?: boolean;
  patchKeys?: string[];
  applied?: string;
  unexpressible?: string;
  error?: boolean;
  errorKind?: string;
}): ChatLogRecord {
  const message = redactPii(event.rawText).slice(0, MAX_MESSAGE);
  const patchKeys = event.patchKeys ?? [];
  return {
    timestamp: new Date().toISOString(),
    message,
    messageHash: hashMessage(message),
    clearAll: event.clearAll ?? false,
    hadPatch: (event.clearAll ?? false) || patchKeys.length > 0,
    patchKeys,
    applied: (event.applied ?? "").slice(0, MAX_NOTE),
    unexpressible: (event.unexpressible ?? "").slice(0, MAX_NOTE),
    error: event.error ?? false,
    errorKind: event.errorKind ?? "",
    resultCount: event.resultCount,
    filterSummary: summarizeSearchFilters(event.filters),
  };
}

async function writeDevJsonl(record: ChatLogRecord): Promise<void> {
  if (process.env.NODE_ENV !== "development") return;
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(record)}\n`, "utf-8");
}

async function postWebhook(record: ChatLogRecord): Promise<void> {
  const url = process.env.CHAT_LOG_WEBHOOK_URL?.trim();
  if (!url) return;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
    signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) {
    throw new Error(`Chat log webhook ${response.status}`);
  }
}

export async function persistChatLog(event: {
  rawText: string;
  filters: SearchFilters;
  resultCount: number;
  clearAll?: boolean;
  patchKeys?: string[];
  applied?: string;
  unexpressible?: string;
  error?: boolean;
  errorKind?: string;
}): Promise<void> {
  const record = buildChatLogRecord(event);
  console.info("[chat-log]", JSON.stringify(record));
  await writeDevJsonl(record);
  await postWebhook(record);
}

export async function readRecentChatLogs(limit = DEFAULT_READ_LIMIT): Promise<ChatLogRecord[]> {
  try {
    const raw = await readFile(LOG_FILE, "utf-8");
    const rows = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ChatLogRecord);
    return rows.slice(-limit).reverse();
  } catch {
    return [];
  }
}
