import { timingSafeEqual } from "node:crypto";
import { notFound } from "next/navigation";
import { readRecentChatLogs, type ChatLogRecord } from "@/lib/search/chat-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Search insights",
  robots: { index: false, follow: false },
};

function secretMatches(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function formatSummary(record: ChatLogRecord): string {
  const summary = record.filterSummary;
  return [
    summary.grades && `grades ${summary.grades}`,
    summary.categories && `categories ${summary.categories}`,
    summary.formats && `formats ${summary.formats}`,
    summary.locations && `locations ${summary.locations}`,
    summary.price_filter && summary.price_filter !== "any" && `price ${summary.price_filter}`,
    summary.fully_funded === true && "fully funded",
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function SearchInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const expected = process.env.ANALYTICS_ADMIN_SECRET?.trim();
  if (!expected) notFound();

  const params = await searchParams;
  if (!secretMatches(params.key, expected)) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl text-[var(--color-navy)]">Search insights</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Enter the admin password to view redacted chat questions from this machine.
        </p>
        <form className="mt-6" method="get">
          <label className="block text-sm font-medium text-[var(--color-navy)]" htmlFor="key">
            Password
          </label>
          <input
            id="key"
            name="key"
            type="password"
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-white px-3 py-2"
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-navy)] px-4 py-2 text-sm font-medium text-white"
          >
            View logs
          </button>
        </form>
      </main>
    );
  }

  const logs = await readRecentChatLogs(200);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl text-[var(--color-navy)]">Search insights</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Latest {logs.length} redacted chatbot questions from this environment. Production GA still
        holds filter events and 100-character question previews.
      </p>
      {logs.length === 0 ? (
        <p className="mt-8 rounded border border-dashed border-[var(--color-border)] bg-[var(--color-parchment)] p-6 text-[var(--color-text-muted)]">
          No chat logs yet. Ask the search assistant a question locally, or set{" "}
          <code>CHAT_LOG_WEBHOOK_URL</code> so production questions are stored.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="py-2 pr-4 font-medium">When</th>
                <th className="py-2 pr-4 font-medium">Question</th>
                <th className="py-2 pr-4 font-medium">Filters applied</th>
                <th className="py-2 font-medium">Context</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={`${log.timestamp}-${log.messageHash}`} className="border-b border-[var(--color-border)] align-top">
                  <td className="whitespace-nowrap py-3 pr-4 text-[var(--color-text-muted)]">
                    {log.timestamp.replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="py-3 pr-4">
                    {log.error ? (
                      <span className="text-red-700">[error{log.errorKind ? `: ${log.errorKind}` : ""}] </span>
                    ) : null}
                    {log.message || <span className="text-[var(--color-text-muted)]">(empty)</span>}
                    {log.unexpressible ? (
                      <p className="mt-1 text-xs text-[var(--color-amber)]">Couldn’t express: {log.unexpressible}</p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                    {log.clearAll
                      ? "cleared all"
                      : log.patchKeys.length > 0
                        ? log.patchKeys.join(", ")
                        : "none"}
                    {log.applied ? <p className="mt-1 text-xs">{log.applied}</p> : null}
                  </td>
                  <td className="py-3 text-[var(--color-text-muted)]">
                    {log.resultCount} results
                    {formatSummary(log) ? <p className="mt-1 text-xs">{formatSummary(log)}</p> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
