const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

const hits = new Map<string, number[]>();

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const recent = prune(hits.get(clientIp) ?? [], now);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(clientIp, recent);
    return true;
  }
  hits.set(clientIp, [...recent, now]);
  return false;
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
