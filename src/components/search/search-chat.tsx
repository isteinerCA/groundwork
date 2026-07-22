"use client";

import { useEffect, useRef, useState } from "react";
import { logChatEvent } from "@/lib/chat-analytics";
import {
  getChatOpeningPrompt,
  mergeFilterPatch,
  parseChatMessage,
  type ChatParserContext,
} from "@/lib/chat-parser";
import type { SearchFilters } from "@/lib/types/program";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

export function SearchChat({
  filters,
  resultCount,
  onApplyFilters,
}: {
  filters: SearchFilters;
  resultCount: number;
  onApplyFilters: (next: SearchFilters) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: "Hi — I can set filters from plain English. Chips above stay in sync.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const context: ChatParserContext = { filters, resultCount };
  const openingHint = getChatOpeningPrompt(context);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    const result = parseChatMessage(text, context);
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: result.message,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");

    if (result.type === "clear" && result.filterPatch) {
      onApplyFilters(result.filterPatch as SearchFilters);
      logChatEvent(text, result.type, result.filterPatch as SearchFilters, 0);
      return;
    }

    if (result.type === "filter" && result.filterPatch) {
      const next = mergeFilterPatch(filters, result.filterPatch);
      onApplyFilters(next);
      logChatEvent(text, result.type, next, resultCount);
    } else {
      logChatEvent(text, result.type, filters, resultCount);
    }
  };

  return (
    <aside className="lg:sticky lg:top-4 lg:self-start">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div>
            <h2 className="text-base text-[var(--color-navy)]">Search assistant</h2>
            <p className="text-xs text-[var(--color-text-muted)]">{openingHint}</p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-muted)] lg:hidden"
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>

        {!collapsed && (
          <>
            <div
              ref={listRef}
              className="max-h-64 space-y-3 overflow-y-auto px-4 py-3 text-sm lg:max-h-[420px]"
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
                send();
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
                  placeholder='e.g. "only fully funded programs"'
                  className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-[var(--radius-md)] bg-[var(--color-navy)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-navy-light)]"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </aside>
  );
}
