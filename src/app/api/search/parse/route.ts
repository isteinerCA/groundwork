import { NextResponse } from "next/server";
import { clientIpFromRequest } from "@/lib/contact/rate-limit";
import {
  LlmParserUnavailableError,
  LlmParserValidationError,
  parseSearchMessageWithLlm,
} from "@/lib/search/llm-parser";
import { parseRequestSchema, type ParseRequest } from "@/lib/search/llm-parse-schema";
import {
  buildProgramNameParseResponse,
  isLikelyProgramNameQuery,
} from "@/lib/search/program-name-query";
import { stripNoOpFilterPatch } from "@/lib/search/filter-patch-delta";
import { isSearchParseRateLimited } from "@/lib/search/rate-limit";

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

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof LlmParserUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof LlmParserValidationError) {
      console.error("Search parse validation error:", err.message);
      return NextResponse.json(
        { error: "Search assistant could not process that request." },
        { status: 502 },
      );
    }

    console.error("Search parse error:", err);
    return NextResponse.json(
      { error: "Search assistant could not process that request." },
      { status: 500 },
    );
  }
}
