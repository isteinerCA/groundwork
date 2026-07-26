import { NextResponse } from "next/server";
import { clientIpFromRequest } from "@/lib/contact/rate-limit";
import {
  LlmParserUnavailableError,
  LlmParserValidationError,
  parseSearchMessageWithLlm,
} from "@/lib/search/llm-parser";
import { parseRequestSchema } from "@/lib/search/llm-parse-schema";
import { isSearchParseRateLimited } from "@/lib/search/rate-limit";

export async function POST(request: Request) {
  const clientIp = clientIpFromRequest(request);

  if (isSearchParseRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await parseSearchMessageWithLlm(parsed.data);

    if (process.env.NODE_ENV === "development") {
      console.debug("[search/parse]", {
        messageLength: parsed.data.message.length,
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
