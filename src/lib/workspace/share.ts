import type { SharePayload } from "@/lib/types/workspace";

const SHARE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  if (typeof btoa !== "undefined") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return Buffer.from(json, "utf-8").toString("base64url");
}

export function decodeSharePayload(token: string): SharePayload | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? padded : padded + "=".repeat(4 - (padded.length % 4));
    const json =
      typeof atob !== "undefined"
        ? atob(pad)
        : Buffer.from(pad, "base64").toString("utf-8");
    const payload = JSON.parse(json) as SharePayload;
    if (!payload.items || !payload.exportedAt) return null;

    const age = Date.now() - new Date(payload.exportedAt).getTime();
    if (age > SHARE_TTL_MS) return null;

    return payload;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload, origin: string): string {
  const token = encodeSharePayload(payload);
  return `${origin}/share?d=${token}`;
}
