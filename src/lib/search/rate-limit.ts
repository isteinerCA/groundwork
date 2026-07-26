const WINDOW_MS = 60_000;
const MAX_SEARCH_REQUESTS = 10;

const hits = new Map<string, number[]>();

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function isSearchParseRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const recent = prune(hits.get(clientIp) ?? [], now);
  if (recent.length >= MAX_SEARCH_REQUESTS) {
    hits.set(clientIp, recent);
    return true;
  }
  hits.set(clientIp, [...recent, now]);
  return false;
}
