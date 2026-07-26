"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { btnPrimary } from "@/components/ui/button-styles";
import { logChatEvent } from "@/lib/chat-analytics";
import { trackEvent } from "@/lib/analytics";
import { formatAssistantMessage } from "@/lib/search/format-assistant-message";
import { getOpeningHint } from "@/lib/search/opening-hint";
import { mergeFilterPatch } from "@/lib/search/merge-filter-patch";
import type { LlmParseResponse } from "@/lib/search/llm-parse-schema";
import { DEFAULT_SEARCH_FILTERS, type Program, type SearchFilters } from "@/lib/types/program";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

export function SearchChat({
  filters,
  resultCount,
  programs,
  onApplyFilters,
  embedded = false,
  inPanel = false,
}: {
  filters: SearchFilters;
  resultCount: number;
  programs: Program[];
  onApplyFilters: (next: SearchFilters) => void;
  embedded?: boolean;
  inPanel?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: 'I refine chip filters and search our program data — locations, gotchas, descriptions. Try "in California only", "fully funded only", or "programs with deposit flags".',
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const openingHint = getOpeningHint({ filters, resultCount });

  const refreshKey = useMemo(
    () =>
      JSON.stringify({
        grades: filters.gradesCompleted,
        categories: filters.categories,
        admissionTypes: filters.admissionTypes,
        formats: filters.formats,
        durationBuckets: filters.durationBuckets,
        minDurationWeeks: filters.minDurationWeeks,
        maxDurationWeeks: filters.maxDurationWeeks,
        priceFilter: filters.priceFilter,
        maxPrice: filters.maxPrice,
        minPrice: filters.minPrice,
        collegeCreditOnly: filters.collegeCreditOnly,
        fullyFundedOnly: filters.fullyFundedOnly,
        usOnly: filters.usOnly,
        excludeUnknownPrice: filters.excludeUnknownPrice,
        dataQuery: filters.dataQuery,
        excludeLocation: filters.excludeLocation,
        includeRegions: filters.includeRegions,
        includeLocations: filters.includeLocations,
        resultCount,
      }),
    [filters, resultCount],
  );

  const [hintPulse, setHintPulse] = useState(false);

  useEffect(() => {
    if (filters.gradesCompleted.length === 0) return;
    setHintPulse(true);
    const timer = window.setTimeout(() => setHintPulse(false), 2600);
    return () => window.clearTimeout(timer);
  }, [refreshKey, filters.gradesCompleted.length]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMessage]
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch("/api/search/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          currentFilters: filters,
          resultCount,
          history,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        const errorText =
          payload?.error ??
          (response.status === 429
            ? "Too many requests — please wait a moment."
            : "I couldn't process that — try again or use the filter chips.");

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: errorText,
          },
        ]);
        logChatEvent({
          rawText: text,
          clearAll: false,
          hadPatch: false,
          filters,
          resultCount,
          error: true,
        });
        trackEvent("chat_sent", { had_unexpressible: false, error: true });
        return;
      }

      const result = (await response.json()) as LlmParseResponse;

      let nextFilters = filters;
      if (result.clearAll) {
        nextFilters = { ...DEFAULT_SEARCH_FILTERS };
        onApplyFilters(nextFilters);
      } else if (Object.keys(result.filterPatch).length > 0) {
        nextFilters = mergeFilterPatch(filters, result.filterPatch, text);
        onApplyFilters(nextFilters);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: formatAssistantMessage(result, nextFilters, programs),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const hadPatch = result.clearAll || Object.keys(result.filterPatch).length > 0;
      logChatEvent({
        rawText: text,
        clearAll: result.clearAll,
        hadPatch,
        filters: nextFilters,
        resultCount,
        applied: result.applied,
        unexpressible: result.unexpressible,
      });
      trackEvent("chat_sent", {
        had_unexpressible: result.unexpressible.length > 0,
        clear_all: result.clearAll,
        had_patch: hadPatch,
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: "I couldn't process that — try again or use the filter chips.",
        },
      ]);
      logChatEvent({
        rawText: text,
        clearAll: false,
        hadPatch: false,
        filters,
        resultCount,
        error: true,
      });
      trackEvent("chat_sent", { had_unexpressible: false, error: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside id="search-assistant" className={embedded && !inPanel ? undefined : inPanel ? undefined : "lg:sticky lg:top-4 lg:self-start"}>
      <div
        className={
          inPanel
            ? undefined
            : "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
        }
      >
        <div
          className={`flex items-center justify-between px-4 py-3 ${
            inPanel
              ? "border-b border-[var(--color-border)] bg-[var(--color-sage-soft)]/35"
              : "border-b border-[var(--color-border)] bg-[var(--color-parchment-dark)]/40"
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-[var(--color-navy)] uppercase">
              Search assistant
            </p>
            <p
              className={`mt-1 rounded-[var(--radius-sm)] border border-transparent px-1 py-0.5 text-sm transition-colors ${
                hintPulse
                  ? "assistant-hint-pulse border-[var(--color-sage)] font-medium text-[var(--color-navy)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {openingHint}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded border border-[var(--color-border)] bg-white px-2 py-1 text-xs text-[var(--color-text-muted)] lg:hidden"
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>

        {!collapsed && (
          <>
            <div
              ref={listRef}
              className={`space-y-3 overflow-y-auto px-4 py-3 text-sm ${
                embedded ? "max-h-48 lg:max-h-56" : "max-h-64 lg:max-h-[420px]"
              }`}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "ml-6 rounded-[var(--radius-md)] bg-[var(--color-navy)] px-3 py-2 text-white"
                      : "mr-4 rounded-[var(--radius-md)] bg-[var(--color-parchment-dark)] px-3 py-2 text-[var(--color-text)]"
                  }
                >
                  {message.text}
                </div>
              ))}
            </div>

            <form
              className="border-t border-[var(--color-border)] p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <label htmlFor="search-chat-input" className="sr-only">
                Refine search
              </label>
              <div className="flex gap-2">
                <input
                  id="search-chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='e.g. "in California only"'
                  disabled={isLoading}
                  className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${btnPrimary} shrink-0 px-3 py-2 disabled:opacity-60`}
                >
                  {isLoading ? "Thinking…" : "Send"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </aside>
  );
}
