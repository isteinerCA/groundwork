import { NextResponse } from "next/server";
import { persistChatLog } from "@/lib/search/chat-log";
import { clientIpFromRequest } from "@/lib/contact/rate-limit";
import {
  LlmParserUnavailableError,
  LlmParserValidationError,
  parseSearchMessageWithLlm,
} from "@/lib/search/llm-parser";
import { parseRequestSchema, type LlmParseResponse, type ParseRequest } from "@/lib/search/llm-parse-schema";
import {
  buildProgramNameParseResponse,
  isLikelyProgramNameQuery,
} from "@/lib/search/program-name-query";
import { stripNoOpFilterPatch } from "@/lib/search/filter-patch-delta";
import { isSearchParseRateLimited } from "@/lib/search/rate-limit";

async function recordParse(event: Parameters<typeof persistChatLog>[0]): Promise<void> {
  try {
    await persistChatLog(event);
  } catch (err) {
    console.error("[chat-log] persist failed", err);
  }
}

function logFromParse(parseRequest: ParseRequest, result: LlmParseResponse, extra?: { error?: boolean; errorKind?: string }) {
  return recordParse({
    rawText: parseRequest.message,
    filters: parseRequest.currentFilters,
    resultCount: parseRequest.resultCount,
    clearAll: result.clearAll,
    patchKeys: Object.keys(result.filterPatch),
    applied: result.applied,
    unexpressible: result.unexpressible,
    error: extra?.error,
    errorKind: extra?.errorKind,
  });
}

export async function POST(req: Request) {
  const clientIp = clientIpFromRequest(req);

  if (isSearchParseRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parseRequest = parsed.data as ParseRequest;

  if (isLikelyProgramNameQuery(parseRequest.message)) {
    const result = buildProgramNameParseResponse(parseRequest.message);
    result.filterPatch = stripNoOpFilterPatch(parseRequest.currentFilters, result.filterPatch);
    await logFromParse(parseRequest, result);
    return NextResponse.json(result);
  }

  try {
    const result = await parseSearchMessageWithLlm(parseRequest);

    if (process.env.NODE_ENV === "development") {
      console.debug("[search/parse]", {
        messageLength: parseRequest.message.length,
        clearAll: result.clearAll,
        patchKeys: Object.keys(result.filterPatch),
        latencyMs: "logged",
      });
    }

    await logFromParse(parseRequest, result);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof LlmParserUnavailableError) {
      await recordParse({
        rawText: parseRequest.message,
        filters: parseRequest.currentFilters,
        resultCount: parseRequest.resultCount,
        error: true,
        errorKind: "unavailable",
      });
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof LlmParserValidationError) {
      console.error("Search parse validation error:", err.message);
      await recordParse({
        rawText: parseRequest.message,
        filters: parseRequest.currentFilters,
        resultCount: parseRequest.resultCount,
        error: true,
        errorKind: "validation",
      });
      return NextResponse.json(
        { error: "Search assistant could not process that request." },
        { status: 502 },
      );
    }

    console.error("Search parse error:", err);
    await recordParse({
      rawText: parseRequest.message,
      filters: parseRequest.currentFilters,
      resultCount: parseRequest.resultCount,
      error: true,
      errorKind: "server",
    });
    return NextResponse.json(
      { error: "Search assistant could not process that request." },
      { status: 500 },
    );
  }
}
