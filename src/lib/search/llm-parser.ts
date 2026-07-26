import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  GRADE_CHIPS,
  PRICE_FILTERS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
import {
  llmParseResponseSchema,
  parseLlmResponse,
  type LlmParseResponse,
  type ParseRequest,
} from "@/lib/search/llm-parse-schema";

const DEFAULT_MODEL = "gpt-4o-mini";

function buildSystemPrompt(): string {
  const categories = PROGRAM_CATEGORIES.map(
    (c) => `- ${c.id}: ${c.label} — ${c.description}`,
  ).join("\n");
  const admission = ADMISSION_TYPES.map((a) => `- ${a.id}: ${a.label}`).join("\n");
  const formats = PROGRAM_FORMATS.map((f) => `- ${f.id}: ${f.label}`).join("\n");
  const durations = DURATION_BUCKETS.map((d) => `- ${d.id}: ${d.label}`).join("\n");
  const prices = PRICE_FILTERS.map((p) => `- ${p.id}: ${p.label}`).join("\n");
  const grades = GRADE_CHIPS.join(", ");

  return `You are Groundwork's search assistant. You translate parent messages into structured summer-program search filters.

## Filter schema
Return a partial filterPatch with ONLY fields that should change. Omit unchanged fields.

- gradesCompleted: number[] — grades the child JUST COMPLETED (not rising grade). Valid: ${grades}. "Rising 10th" means grade completed 9.
- categories: string[] — OR logic. Valid IDs:
${categories}
  When ADDING categories, return the full combined list (current + new).
  When the user says "only X" (without "or"), return ONLY those categories (replace list).
- admissionTypes: string[] — valid IDs:
${admission}
- formats: string[] — valid IDs:
${formats}
- durationBuckets: string[] — valid IDs:
${durations}
- collegeCreditOnly: boolean
- fullyFundedOnly: boolean
- priceFilter: string — valid IDs:
${prices}
- usOnly: boolean — US programs only (exclude international)
- excludeUnknownPrice: boolean — hide programs with unlisted/contact-for-price
- dataQuery: string — free-text for location keywords, program names, gotcha topics (deposit, SEVP, safety), or other constraints not covered above. Use lowercase. Clear with empty string when user removes location/text search.

## clearAll
Set clearAll: true when the user wants to reset all filters ("start over", "clear all", "reset").

## Response fields
- applied: concise summary of filter changes you made (empty string if none)
- unexpressible: constraints the user asked for that CANNOT be mapped to filters (empty string if none). Be honest about limitations.
- assistantMessage: friendly reply shown in chat. Mention what you applied and what you could not filter. Keep under 3 sentences.

## Cannot filter (put in unexpressible)
- Gender or single-sex programs
- Zip code / radius search
- Specific acceptance rates or competitiveness beyond admission type
- Real-time availability or seat counts
- Anything not in our program data

## dataQuery usage
Use dataQuery for: US state/city location text, program name searches, gotcha/flag keywords. Prefer structured filters when possible (categories, price, format, etc.).

## Questions
If the user asks a question without requesting filter changes, leave filterPatch empty (or only fields they explicitly asked to change) and answer in assistantMessage.`;
}

function buildUserPayload(request: ParseRequest): string {
  return JSON.stringify(
    {
      message: request.message,
      currentFilters: request.currentFilters,
      resultCount: request.resultCount,
      history: request.history ?? [],
    },
    null,
    2,
  );
}

export class LlmParserUnavailableError extends Error {
  constructor(message = "Search assistant unavailable") {
    super(message);
    this.name = "LlmParserUnavailableError";
  }
}

export class LlmParserValidationError extends Error {
  constructor(message = "Invalid LLM response") {
    super(message);
    this.name = "LlmParserValidationError";
  }
}

export async function parseSearchMessageWithLlm(
  request: ParseRequest,
): Promise<LlmParseResponse> {
  const apiKey = process.env.OPENAI;
  if (!apiKey) {
    throw new LlmParserUnavailableError();
  }

  const model = process.env.OPENAI_SEARCH_MODEL ?? DEFAULT_MODEL;
  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: buildUserPayload(request),
      },
    ],
    response_format: zodResponseFormat(llmParseResponseSchema, "search_parse"),
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new LlmParserValidationError("Empty LLM response");
  }

  try {
    const raw = JSON.parse(content) as unknown;
    return parseLlmResponse(raw);
  } catch {
    throw new LlmParserValidationError("Failed to parse LLM JSON");
  }
}
